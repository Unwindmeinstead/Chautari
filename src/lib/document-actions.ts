"use server";
import { DOC_TYPE_LABELS } from "@/lib/constants";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentRecord {
  id: string;
  request_id: string;
  uploaded_by: string;
  uploader_role: "patient" | "agency_staff";
  doc_type: string;
  display_name: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  requires_signature: boolean;
  is_signed: boolean;
  signed_at: string | null;
  signed_by: string | null;
  typed_name: string | null;
  created_at: string;
}



// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getUserRole(supabase: any, userId: string, requestId: string) {
  // Check if patient
  const { data: req } = await supabase
    .from("switch_requests")
    .select("patient_id, new_agency_id")
    .eq("id", requestId)
    .single();

  if (!req) return null;
  if (req.patient_id === userId) return { role: "patient" as const, req };

  // Check if agency staff
  const { data: member } = await supabase
    .from("agency_members")
    .select("id")
    .eq("agency_id", req.new_agency_id)
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (member) return { role: "agency_staff" as const, req };
  return null;
}

// ─── List documents for a request ─────────────────────────────────────────────

export async function getDocuments(requestId: string): Promise<{
  documents: DocumentRecord[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { documents: [], error: "Not authenticated" };

  const access = await getUserRole(supabase, user.id, requestId);
  if (!access) return { documents: [], error: "Access denied" };

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });

  if (error) return { documents: [], error: error.message };
  return { documents: (data ?? []) as DocumentRecord[] };
}

// ─── Upload a document ────────────────────────────────────────────────────────

export async function uploadDocument(formData: FormData): Promise<{
  document?: DocumentRecord;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const requestId = formData.get("request_id") as string;
  const docType = formData.get("doc_type") as string;
  const displayName = formData.get("display_name") as string;
  const requiresSignature = formData.get("requires_signature") === "true";
  const file = formData.get("file") as File;

  if (!requestId || !docType || !file) return { error: "Missing required fields" };
  if (file.size > 10 * 1024 * 1024) return { error: "File too large (max 10MB)" };

  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowed.includes(file.type)) return { error: "Unsupported file type. Use PDF, JPG, PNG, or WebP." };

  const access = await getUserRole(supabase, user.id, requestId);
  if (!access) return { error: "Access denied" };

  // Build storage path: {user_id}/{request_id}/{timestamp}_{filename}
  const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.id}/${requestId}/${Date.now()}_${safeFilename}`;

  // Upload to Supabase Storage
  const { error: storageErr } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (storageErr) return { error: `Upload failed: ${storageErr.message}` };

  // Save record in DB
  const { data: doc, error: dbErr } = await supabase
    .from("documents")
    .insert({
      request_id: requestId,
      uploaded_by: user.id,
      uploader_role: access.role,
      doc_type: docType,
      display_name: displayName || DOC_TYPE_LABELS[docType] || "Document",
      file_name: file.name,
      file_path: storagePath,
      file_size_bytes: file.size,
      mime_type: file.type,
      requires_signature: requiresSignature,
    })
    .select("*")
    .single();

  if (dbErr) {
    // Try to clean up storage on DB failure
    await supabase.storage.from("documents").remove([storagePath]);
    return { error: dbErr.message };
  }

  // Notify the other party
  if (access.role === "agency_staff") {
    await supabase.from("notifications").insert({
      user_id: access.req.patient_id,
      type: "document_uploaded",
      title: requiresSignature ? "Document requires your signature" : "New document from your agency",
      body: `${DOC_TYPE_LABELS[docType] ?? "A document"} has been ${requiresSignature ? "sent to you for signature" : "uploaded to your switch request"}.`,
      reference_id: requestId,
      reference_type: "switch_request",
    });
  }

  revalidatePath(`/switch/${requestId}`);
  revalidatePath(`/agency/requests/${requestId}`);
  return { document: doc as DocumentRecord };
}

// ─── Get a signed download URL ────────────────────────────────────────────────

export async function getDocumentUrl(documentId: string): Promise<{
  url?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path, request_id")
    .eq("id", documentId)
    .single();

  if (!doc) return { error: "Document not found" };

  const access = await getUserRole(supabase, user.id, doc.request_id);
  if (!access) return { error: "Access denied" };

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.file_path, 300); // 5 min expiry

  if (error) return { error: error.message };
  return { url: data.signedUrl };
}

// ─── E-sign a document ────────────────────────────────────────────────────────

export async function signDocument(
  documentId: string,
  typedName: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!typedName.trim() || typedName.trim().length < 2) {
    return { error: "Please enter your full legal name" };
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("id, request_id, requires_signature, is_signed, file_path")
    .eq("id", documentId)
    .single();

  if (!doc) return { error: "Document not found" };
  if (!doc.requires_signature) return { error: "This document does not require a signature" };
  if (doc.is_signed) return { error: "Document already signed" };

  const access = await getUserRole(supabase, user.id, doc.request_id);
  if (!access) return { error: "Access denied" };

  // Create a simple checksum: doc_id + signer_id + typed_name + timestamp
  const timestamp = new Date().toISOString();
  const checksumInput = `${documentId}|${user.id}|${typedName.trim()}|${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(checksumInput);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const checksum = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const { error } = await supabase
    .from("documents")
    .update({
      is_signed: true,
      signed_at: timestamp,
      signed_by: user.id,
      typed_name: typedName.trim(),
      signature_checksum: checksum,
    })
    .eq("id", documentId);

  if (error) return { error: error.message };

  // Notify agency that patient signed
  if (access.role === "patient") {
    const { data: req } = await supabase
      .from("switch_requests")
      .select("new_agency_id")
      .eq("id", doc.request_id)
      .single();

    if (req) {
      await supabase.from("notifications").insert({
        user_id: req.new_agency_id, // agency gets notified via their inbox
        type: "document_signed",
        title: "Document signed by patient",
        body: `${typedName.trim()} has signed a required document.`,
        reference_id: doc.request_id,
        reference_type: "switch_request",
      });
    }
  }

  revalidatePath(`/switch/${doc.request_id}`);
  revalidatePath(`/agency/requests/${doc.request_id}`);
  return { success: true };
}

// ─── Delete a document ────────────────────────────────────────────────────────

export async function deleteDocument(documentId: string): Promise<{
  success?: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: doc } = await supabase
    .from("documents")
    .select("id, request_id, uploaded_by, file_path, is_signed")
    .eq("id", documentId)
    .single();

  if (!doc) return { error: "Document not found" };

  // Only the uploader can delete, and only if not yet signed
  if (doc.uploaded_by !== user.id) return { error: "You can only delete documents you uploaded" };
  if (doc.is_signed) return { error: "Cannot delete a signed document" };

  // Remove from storage
  await supabase.storage.from("documents").remove([doc.file_path]);

  // Remove from DB
  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) return { error: error.message };

  revalidatePath(`/switch/${doc.request_id}`);
  revalidatePath(`/agency/requests/${doc.request_id}`);
  return { success: true };
}
