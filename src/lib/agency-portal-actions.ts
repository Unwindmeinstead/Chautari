"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgencyRow {
  id: string;
  name: string;
  dba_name: string | null;
  address_city: string | null;
  address_state: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  care_types: string[];
  payers_accepted: string[];
  services_offered: string[];
  languages_spoken: string[];
  service_counties: string[];
  is_verified_partner: boolean;
  is_accepting_patients: boolean;
  average_response_time_hours: number | null;
  medicare_quality_score: number | null;
  pa_license_number: string | null;
}

export interface SwitchRequestWithPatient {
  id: string;
  patient_id: string;
  status: string;
  care_type: string;
  switch_reason: string;
  services_requested: string[];
  requested_start_date: string | null;
  special_instructions: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  patient: {
    id: string;
    full_name: string | null;
    phone: string | null;
    preferred_lang: string | null;
  } | null;
  patient_details: {
    address_city: string | null;
    address_county: string | null;
    payer_type: string | null;
    care_type: string | null;
    services_needed: string[] | null;
  } | null;
  e_signatures: { id: string; signed_at: string; consent_hipaa: boolean }[];
}

export interface AgencyPortalData {
  agency: AgencyRow | null;
  member: { id: string; role: string; title: string | null } | null;
  requests: SwitchRequestWithPatient[];
  stats: { total: number; pending: number; accepted: number; completed: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getMembership(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("agency_members")
    .select("agency_id, role, title")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();
  return data;
}

function normalizePatientDetails(raw: any) {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

// ─── Get dashboard data ───────────────────────────────────────────────────────

export async function getAgencyPortalData(statusFilter?: string): Promise<AgencyPortalData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const empty: AgencyPortalData = {
    agency: null, member: null, requests: [],
    stats: { total: 0, pending: 0, accepted: 0, completed: 0 },
  };
  if (!user) return empty;

  const membership = await getMembership(supabase, user.id);
  if (!membership) return empty;

  const agencyId = membership.agency_id;

  // Parallel: agency info + switch requests (no profile join — FK is to auth.users)
  const [agencyRes, requestsRes] = await Promise.all([
    supabase.from("agencies").select("*").eq("id", agencyId).single(),
    supabase
      .from("switch_requests")
      .select(`
        id, patient_id, status, care_type, switch_reason, services_requested,
        requested_start_date, special_instructions, submitted_at, created_at, updated_at,
        patient_details (address_city, address_county, payer_type, care_type, services_needed),
        e_signatures (id, signed_at, consent_hipaa)
      `)
      .eq("new_agency_id", agencyId)
      .order("submitted_at", { ascending: false }),
  ]);

  const rawRequests: any[] = requestsRes.data ?? [];

  // Fetch profiles separately
  const patientIds = [...new Set(rawRequests.map((r) => r.patient_id as string))];
  const profileMap: Record<string, any> = {};
  if (patientIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone, preferred_lang")
      .in("id", patientIds);
    for (const p of profiles ?? []) profileMap[p.id] = p;
  }

  const allRequests: SwitchRequestWithPatient[] = rawRequests.map((r) => ({
    ...r,
    patient: profileMap[r.patient_id] ?? null,
    patient_details: normalizePatientDetails(r.patient_details),
  }));

  const filtered = statusFilter && statusFilter !== "all"
    ? allRequests.filter((r) => r.status === statusFilter)
    : allRequests;

  return {
    agency: agencyRes.data ?? null,
    member: { id: user.id, role: membership.role, title: membership.title },
    requests: filtered,
    stats: {
      total: allRequests.length,
      pending: allRequests.filter((r) => ["submitted", "under_review"].includes(r.status)).length,
      accepted: allRequests.filter((r) => r.status === "accepted").length,
      completed: allRequests.filter((r) => r.status === "completed").length,
    },
  };
}

// ─── Get single request ───────────────────────────────────────────────────────

export async function getSwitchRequestForAgency(requestId: string): Promise<SwitchRequestWithPatient | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const membership = await getMembership(supabase, user.id);
  if (!membership) return null;

  const { data: req } = await supabase
    .from("switch_requests")
    .select(`
      id, patient_id, status, care_type, switch_reason, services_requested,
      requested_start_date, special_instructions, submitted_at, created_at, updated_at,
      patient_details (address_city, address_county, payer_type, care_type, services_needed),
      e_signatures (id, signed_at, consent_hipaa)
    `)
    .eq("id", requestId)
    .eq("new_agency_id", membership.agency_id)
    .single();

  if (!req) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, preferred_lang")
    .eq("id", (req as any).patient_id)
    .single();

  return {
    ...(req as any),
    patient: profile ?? null,
    patient_details: normalizePatientDetails((req as any).patient_details),
  } as SwitchRequestWithPatient;
}

// ─── Accept ───────────────────────────────────────────────────────────────────

export async function acceptSwitchRequest(
  requestId: string,
  note?: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const membership = await getMembership(supabase, user.id);
  if (!membership) return { error: "No agency membership" };

  const { data: req } = await supabase
    .from("switch_requests")
    .select("id, patient_id, status")
    .eq("id", requestId)
    .eq("new_agency_id", membership.agency_id)
    .in("status", ["submitted", "under_review"])
    .single();

  if (!req) return { error: "Request not found or already processed." };

  const { error } = await supabase
    .from("switch_requests")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) return { error: error.message };

  await supabase.from("notifications").insert({
    user_id: req.patient_id,
    type: "request_accepted",
    title: "Your switch request was accepted! 🎉",
    body: note
      ? `Your new agency has accepted your request. Note: ${note}`
      : "Your new agency accepted your switch request. The transition process will begin shortly.",
    reference_id: requestId,
    reference_type: "switch_request",
  });

  revalidatePath("/agency/dashboard");
  revalidatePath(`/agency/requests/${requestId}`);
  return { success: true };
}

// ─── Deny ─────────────────────────────────────────────────────────────────────

export async function denySwitchRequest(
  requestId: string,
  reason: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const membership = await getMembership(supabase, user.id);
  if (!membership) return { error: "No agency membership" };

  const { data: req } = await supabase
    .from("switch_requests")
    .select("id, patient_id")
    .eq("id", requestId)
    .eq("new_agency_id", membership.agency_id)
    .in("status", ["submitted", "under_review"])
    .single();

  if (!req) return { error: "Request not found or already processed." };

  const { error } = await supabase
    .from("switch_requests")
    .update({ status: "denied", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) return { error: error.message };

  await supabase.from("notifications").insert({
    user_id: req.patient_id,
    type: "request_denied",
    title: "Switch request update",
    body: `Your switch request could not be accepted. Reason: ${reason}`,
    reference_id: requestId,
    reference_type: "switch_request",
  });

  revalidatePath("/agency/dashboard");
  revalidatePath(`/agency/requests/${requestId}`);
  return { success: true };
}

// ─── Mark under review ────────────────────────────────────────────────────────

export async function markUnderReview(requestId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const membership = await getMembership(supabase, user.id);
  if (!membership) return { error: "No agency membership" };

  const { error } = await supabase
    .from("switch_requests")
    .update({ status: "under_review", updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("new_agency_id", membership.agency_id)
    .eq("status", "submitted");

  if (error) return { error: error.message };

  revalidatePath("/agency/dashboard");
  revalidatePath(`/agency/requests/${requestId}`);
  return { success: true };
}

// ─── Mark completed ───────────────────────────────────────────────────────────

export async function markRequestCompleted(requestId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const membership = await getMembership(supabase, user.id);
  if (!membership) return { error: "No agency membership" };

  const { data: req } = await supabase
    .from("switch_requests")
    .select("id, patient_id")
    .eq("id", requestId)
    .eq("new_agency_id", membership.agency_id)
    .eq("status", "accepted")
    .single();

  if (!req) return { error: "Request not found or not in accepted state." };

  const { error } = await supabase
    .from("switch_requests")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) return { error: error.message };

  await supabase.from("notifications").insert({
    user_id: req.patient_id,
    type: "request_completed",
    title: "Your switch is complete! 🎉",
    body: "Your home care agency switch has been successfully completed. Welcome to your new agency!",
    reference_id: requestId,
    reference_type: "switch_request",
  });

  revalidatePath("/agency/dashboard");
  revalidatePath(`/agency/requests/${requestId}`);
  return { success: true };
}

// ─── Update agency profile ────────────────────────────────────────────────────

export async function updateAgencyProfile(data: {
  phone?: string;
  email?: string;
  website?: string;
  is_accepting_patients?: boolean;
  languages_spoken?: string[];
}): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const membership = await getMembership(supabase, user.id);
  if (!membership || !["admin", "owner"].includes(membership.role)) {
    return { error: "Only agency admins can update the profile." };
  }

  const { error } = await supabase
    .from("agencies")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", membership.agency_id);

  if (error) return { error: error.message };

  revalidatePath("/agency/profile");
  revalidatePath("/agency/dashboard");
  return { success: true };
}
