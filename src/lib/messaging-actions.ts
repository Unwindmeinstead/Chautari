"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "patient" | "agency_staff";
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  request_id: string;
  patient_id: string;
  agency_id: string;
  last_message_at: string | null;
  patient_unread: number;
  agency_unread: number;
  created_at: string;
}

export interface ConversationWithContext extends Conversation {
  messages: Message[];
  request_status: string;
  request_care_type: string;
  agency_name: string;
  patient_name: string | null;
}

// ─── Get or create conversation for a switch request ─────────────────────────

export async function getOrCreateConversation(
  requestId: string
): Promise<{ conversation: ConversationWithContext | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { conversation: null, error: "Not authenticated" };

  // Try to get existing conversation
  let { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("request_id", requestId)
    .single();

  // If no conversation yet, create it (happens if trigger didn't fire)
  if (!conv) {
    const { data: req } = await supabase
      .from("switch_requests")
      .select("id, patient_id, new_agency_id, status")
      .eq("id", requestId)
      .single();

    if (!req) return { conversation: null, error: "Request not found" };

    const { data: newConv, error: createErr } = await supabase
      .from("conversations")
      .insert({
        request_id: requestId,
        patient_id: req.patient_id,
        agency_id: req.new_agency_id,
      })
      .select("*")
      .single();

    if (createErr) return { conversation: null, error: createErr.message };
    conv = newConv;
  }

  if (!conv) return { conversation: null, error: "Could not load conversation" };

  // Fetch messages, request info, agency name, patient name in parallel
  const [messagesRes, requestRes, agencyRes, profileRes] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("switch_requests")
      .select("status, care_type")
      .eq("id", requestId)
      .single(),

    supabase
      .from("agencies")
      .select("name")
      .eq("id", conv.agency_id)
      .single(),

    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", conv.patient_id)
      .single(),
  ]);

  return {
    conversation: {
      ...conv,
      messages: (messagesRes.data ?? []) as Message[],
      request_status: requestRes.data?.status ?? "unknown",
      request_care_type: requestRes.data?.care_type ?? "",
      agency_name: agencyRes.data?.name ?? "Agency",
      patient_name: profileRes.data?.full_name ?? null,
    },
  };
}

// ─── Send a message ───────────────────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<{ message?: Message; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!body.trim()) return { error: "Message cannot be empty" };
  if (body.trim().length > 4000) return { error: "Message too long (max 4000 characters)" };

  // Determine if this user is patient or agency staff
  const { data: conv } = await supabase
    .from("conversations")
    .select("patient_id, agency_id")
    .eq("id", conversationId)
    .single();

  if (!conv) return { error: "Conversation not found" };

  let senderRole: "patient" | "agency_staff";
  if (conv.patient_id === user.id) {
    senderRole = "patient";
  } else {
    // Check agency membership
    const { data: membership } = await supabase
      .from("agency_members")
      .select("id")
      .eq("agency_id", conv.agency_id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!membership) return { error: "Not authorized to message in this conversation" };
    senderRole = "agency_staff";
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      sender_role: senderRole,
      body: body.trim(),
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  // Send notification to the other party
  const notifyUserId =
    senderRole === "patient"
      ? null // would need to notify agency - get a staff member; skip for now
      : conv.patient_id;

  if (senderRole === "agency_staff" && notifyUserId) {
    await supabase.from("notifications").insert({
      user_id: notifyUserId,
      type: "new_message",
      title: "New message from your agency",
      body: body.trim().slice(0, 100) + (body.trim().length > 100 ? "…" : ""),
      reference_id: conversationId,
      reference_type: "conversation",
    });
  }

  revalidatePath(`/switch/${conv.agency_id}`);

  return { message: message as Message };
}

// ─── Mark messages as read ────────────────────────────────────────────────────

export async function markMessagesRead(
  conversationId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: conv } = await supabase
    .from("conversations")
    .select("patient_id, agency_id")
    .eq("id", conversationId)
    .single();

  if (!conv) return { error: "Not found" };

  const isPatient = conv.patient_id === user.id;

  // Mark unread messages from the OTHER party as read
  const unreadSenderRole = isPatient ? "agency_staff" : "patient";

  await supabase
    .from("messages")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("sender_role", unreadSenderRole)
    .eq("is_read", false);

  // Reset unread count for this party
  const unreadField = isPatient ? "patient_unread" : "agency_unread";
  await supabase
    .from("conversations")
    .update({ [unreadField]: 0 })
    .eq("id", conversationId);

  return {};
}

// ─── Get all conversations for agency ────────────────────────────────────────

export async function getAgencyConversations(): Promise<{
  conversations: (Conversation & {
    agency_name: string;
    patient_name: string | null;
    request_status: string;
    last_message_preview: string | null;
  })[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { conversations: [], error: "Not authenticated" };

  const { data: membership } = await supabase
    .from("agency_members")
    .select("agency_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership) return { conversations: [], error: "No agency membership" };

  const { data: convs } = await supabase
    .from("conversations")
    .select("*")
    .eq("agency_id", membership.agency_id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (!convs?.length) return { conversations: [] };

  // Fetch request statuses + patient profiles
  const requestIds = convs.map((c) => c.request_id);
  const patientIds = [...new Set(convs.map((c) => c.patient_id))];

  const [requestsRes, profilesRes, lastMsgsRes] = await Promise.all([
    supabase
      .from("switch_requests")
      .select("id, status, care_type")
      .in("id", requestIds),
    supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", patientIds),
    // Get the last message for each conversation preview
    supabase
      .from("messages")
      .select("conversation_id, body, created_at")
      .in("conversation_id", convs.map((c) => c.id))
      .order("created_at", { ascending: false })
      .limit(convs.length * 1), // rough limit; we'll dedupe in JS
  ]);

  const requestMap = Object.fromEntries(
    (requestsRes.data ?? []).map((r) => [r.id, r])
  );
  const profileMap = Object.fromEntries(
    (profilesRes.data ?? []).map((p) => [p.id, p])
  );
  // Build last-message map: first occurrence per conversation_id (already sorted desc)
  const lastMsgMap: Record<string, string> = {};
  for (const msg of lastMsgsRes.data ?? []) {
    if (!lastMsgMap[msg.conversation_id]) {
      lastMsgMap[msg.conversation_id] = msg.body;
    }
  }

  return {
    conversations: convs.map((c) => ({
      ...c,
      agency_name: "",
      patient_name: profileMap[c.patient_id]?.full_name ?? null,
      request_status: requestMap[c.request_id]?.status ?? "unknown",
      last_message_preview: lastMsgMap[c.id]
        ? lastMsgMap[c.id].slice(0, 80) + (lastMsgMap[c.id].length > 80 ? "…" : "")
        : null,
    })),
  };
}
