"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SwitchRequestData } from "@/lib/switch-schema";

export interface CreateSwitchRequestResult {
  success?: boolean;
  requestId?: string;
  error?: string;
}

export async function createSwitchRequest(
  data: SwitchRequestData
): Promise<CreateSwitchRequestResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be signed in to submit a switch request." };
  }

  // Check for duplicate active request for same agency
  const { data: existing } = await supabase
    .from("switch_requests")
    .select("id, status")
    .eq("patient_id", user.id)
    .eq("new_agency_id", data.new_agency_id)
    .not("status", "in", '("cancelled","denied")')
    .single();

  if (existing) {
    return {
      error: `You already have an active switch request for this agency (status: ${existing.status}).`,
    };
  }

  try {
    // 1. Create the switch request record
    const { data: request, error: requestError } = await supabase
      .from("switch_requests")
      .insert({
        patient_id: user.id,
        new_agency_id: data.new_agency_id,
        current_agency_name: data.current_agency_name || null,
        switch_reason: data.switch_reason,
        care_type: data.care_type,
        services_requested: data.services_requested,
        requested_start_date: data.requested_start_date,
        special_instructions: data.special_instructions || null,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (requestError) throw requestError;

    const requestId = request.id;

    // 2. Save e-signature record
    const { error: sigError } = await supabase.from("e_signatures").insert({
      request_id: requestId,
      signer_id: user.id,
      signer_role: "patient",
      full_name: data.signature_name,
      signed_at: new Date().toISOString(),
      signature_method: data.signature_method,
      signature_data: data.signature_data || null,
      consent_hipaa: data.consent_hipaa,
      consent_current_agency_notification: data.consent_current_agency_notification,
      consent_terms: data.consent_terms,
      ip_address: null, // Would be set by middleware in production
    });

    if (sigError) throw sigError;

    // 3. Create initial notification for patient
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "request_submitted",
      title: "Switch request submitted",
      body: "Your agency switch request has been submitted. We'll notify you when the agency responds.",
      reference_id: requestId,
      reference_type: "switch_request",
    });

    // 4. Audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_role: "patient",
      action: "switch_request_submitted",
      resource: "switch_requests",
      resource_id: requestId,
      new_data: {
        new_agency_id: data.new_agency_id,
        care_type: data.care_type,
        switch_reason: data.switch_reason,
        requested_start_date: data.requested_start_date,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/switch");

    return { success: true, requestId };
  } catch (err) {
    console.error("Switch request creation error:", err);
    return {
      error: "Something went wrong submitting your request. Please try again.",
    };
  }
}

export async function getPatientSwitchRequests() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("switch_requests")
    .select(`
      *,
      new_agency:agencies!switch_requests_new_agency_id_fkey (
        id, name, phone, address_city, address_zip
      )
    `)
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching switch requests:", error);
    return [];
  }

  return data ?? [];
}

export async function getSwitchRequestById(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("switch_requests")
    .select(`
      *,
      new_agency:agencies!switch_requests_new_agency_id_fkey (
        id, name, phone, email, address_city, address_zip, website
      ),
      e_signatures (
        id, signed_at, signature_method, signer_role
      )
    `)
    .eq("id", id)
    .eq("patient_id", user.id)
    .single();

  if (error) return null;
  return data;
}

export async function cancelSwitchRequest(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("switch_requests")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("patient_id", user.id)
    .in("status", ["submitted", "under_review"]);

  if (error) return { error: "Could not cancel request." };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_role: "patient",
    action: "switch_request_cancelled",
    resource: "switch_requests",
    resource_id: id,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/switch/${id}`);

  return { success: true };
}
