"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BYPASS_AUTH = false;

async function requireAdmin() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !BYPASS_AUTH) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user?.id ?? "")
    .single();

  if (!BYPASS_AUTH && profile?.role !== "switchmycare_admin") redirect("/dashboard");

  const safeUser = user ?? { id: "bypass-admin-user", email: "admin@local.test" } as any;
  const safeProfile = profile ?? { role: "switchmycare_admin", full_name: "Bypass Admin" } as any;

  return { supabase, user: safeUser, profile: safeProfile };
}

// ─── Audit log helper ─────────────────────────────────────────────────────────

async function writeAudit(
  supabase: any,
  actorId: string,
  action: string,
  resource: string,
  resourceId: string,
  oldData?: Record<string, unknown>,
  newData?: Record<string, unknown>
) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    actor_role: "switchmycare_admin",
    action,
    resource,
    resource_id: resourceId,
    old_data: oldData ?? null,
    new_data: newData ?? null,
  });
}

// ─── Platform stats ───────────────────────────────────────────────────────────

export interface PlatformStats {
  totalUsers: number;
  totalPatients: number;
  totalAgencies: number;
  pendingAgencyApprovals: number;
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  requestsThisMonth: number;
  avgResponseHours: number | null;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const { supabase } = await requireAdmin();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    usersRes, patientsRes, agenciesRes, pendingRes,
    requestsRes, activeRes, completedRes, monthRes, avgRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "patient"),
    supabase.from("agencies").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("agencies").select("id", { count: "exact", head: true }).eq("is_approved", false).eq("is_active", true),
    supabase.from("switch_requests").select("id", { count: "exact", head: true }),
    supabase.from("switch_requests").select("id", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "accepted"]),
    supabase.from("switch_requests").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("switch_requests").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("agencies").select("avg_response_hours").not("avg_response_hours", "is", null),
  ]);

  const avgHours = avgRes.data?.length
    ? avgRes.data.reduce((s: number, a: any) => s + (a.avg_response_hours ?? 0), 0) / avgRes.data.length
    : null;

  return {
    totalUsers: usersRes.count ?? 0,
    totalPatients: patientsRes.count ?? 0,
    totalAgencies: agenciesRes.count ?? 0,
    pendingAgencyApprovals: pendingRes.count ?? 0,
    totalRequests: requestsRes.count ?? 0,
    activeRequests: activeRes.count ?? 0,
    completedRequests: completedRes.count ?? 0,
    requestsThisMonth: monthRes.count ?? 0,
    avgResponseHours: avgHours ? Math.round(avgHours * 10) / 10 : null,
  };
}

// ─── List users ───────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  phone: string | null;
  preferred_lang: string;
  created_at: string;
  is_suspended?: boolean;
}

export async function getAdminUsers(options?: {
  role?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: AdminUser[]; total: number }> {
  const { supabase } = await requireAdmin();
  const { role, search, limit = 200, offset = 0 } = options ?? {};

  // Fetch profiles first
  let q = supabase
    .from("profiles")
    .select("id, full_name, role, phone, preferred_lang, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (role) q = q.eq("role", role);
  if (search) q = q.ilike("full_name", `%${search}%`);

  const { data: profiles, count } = await q;

  // Try to enrich with emails from auth.users via admin API
  // (works when service_role key is available)
  let emailMap: Record<string, { email: string; banned: boolean }> = {};
  try {
    const ids = (profiles ?? []).map((p: any) => p.id);
    if (ids.length > 0) {
      // Supabase admin.listUsers returns all users — paginate up to 1000
      const { data: authData } = await (supabase as any).auth.admin.listUsers({ perPage: 1000 });
      for (const u of authData?.users ?? []) {
        emailMap[u.id] = { email: u.email ?? "", banned: u.banned ?? false };
      }
    }
  } catch {
    // service_role not available — emails will be null
  }

  const users: AdminUser[] = (profiles ?? []).map((p: any) => ({
    ...p,
    email: emailMap[p.id]?.email ?? null,
    is_suspended: emailMap[p.id]?.banned ?? false,
  }));

  return { users, total: count ?? 0 };
}

// ─── Update user role ─────────────────────────────────────────────────────────

export async function setUserRole(
  userId: string,
  newRole: string
): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();

  const { data: old } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!old) return { error: "User not found" };

  const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
  if (error) return { error: error.message };

  await writeAudit(supabase, user.id, "update_role", "profiles", userId,
    { role: old.role }, { role: newRole });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return {};
}

export async function suspendUser(
  userId: string,
  suspend: boolean
): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();
  try {
    const { error } = await (supabase as any).auth.admin.updateUserById(userId, { ban_duration: suspend ? "87600h" : "none" });
    if (error) return { error: error.message };
    await writeAudit(supabase, user.id, suspend ? "suspend_user" : "unsuspend_user", "profiles", userId);
    revalidatePath("/admin/users");
    return {};
  } catch (e: any) {
    return { error: e?.message ?? "Failed to update user" };
  }
}

export async function deleteUserAccount(
  userId: string
): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();
  try {
    // Delete profile row first
    await supabase.from("profiles").delete().eq("id", userId);
    // Then remove auth user
    const { error } = await (supabase as any).auth.admin.deleteUser(userId);
    if (error) return { error: error.message };
    await writeAudit(supabase, user.id, "delete_user", "profiles", userId);
    revalidatePath("/admin/users");
    return {};
  } catch (e: any) {
    return { error: e?.message ?? "Failed to delete user" };
  }
}

// ─── List agencies ────────────────────────────────────────────────────────────

export interface AdminAgency {
  id: string;
  npi: string;
  name: string;
  address_city: string;
  address_state: string;
  is_active: boolean;
  is_approved: boolean;
  is_verified_partner: boolean;
  care_types: string[];
  medicare_quality_score: number | null;
  created_at: string;
  member_count?: number;
  request_count?: number;
}

export async function getAdminAgencies(options?: {
  search?: string;
  status?: "pending" | "approved" | "inactive";
  limit?: number;
  offset?: number;
}): Promise<{ agencies: AdminAgency[]; total: number }> {
  const { supabase } = await requireAdmin();
  const { search, status, limit = 50, offset = 0 } = options ?? {};

  let q = supabase
    .from("agencies")
    .select("id, npi, name, address_city, address_state, is_active, is_approved, is_verified_partner, care_types, medicare_quality_score, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) q = q.ilike("name", `%${search}%`);
  if (status === "pending") q = q.eq("is_active", true).eq("is_approved", false);
  else if (status === "approved") q = q.eq("is_approved", true).eq("is_active", true);
  else if (status === "inactive") q = q.eq("is_active", false);

  const { data, count } = await q;
  if (!data?.length) return { agencies: [], total: count ?? 0 };

  // Get member + request counts
  const ids = data.map((a: any) => a.id);
  const [membersRes, reqsRes] = await Promise.all([
    supabase.from("agency_members").select("agency_id").in("agency_id", ids).eq("is_active", true),
    supabase.from("switch_requests").select("new_agency_id").in("new_agency_id", ids),
  ]);

  const memberCounts: Record<string, number> = {};
  const reqCounts: Record<string, number> = {};
  for (const m of membersRes.data ?? []) memberCounts[m.agency_id] = (memberCounts[m.agency_id] ?? 0) + 1;
  for (const r of reqsRes.data ?? []) reqCounts[r.new_agency_id] = (reqCounts[r.new_agency_id] ?? 0) + 1;

  return {
    agencies: data.map((a: any) => ({
      ...a,
      member_count: memberCounts[a.id] ?? 0,
      request_count: reqCounts[a.id] ?? 0,
    })),
    total: count ?? 0,
  };
}

// ─── Approve / deactivate agency ─────────────────────────────────────────────

export async function approveAgency(agencyId: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("agencies")
    .update({ is_approved: true, is_active: true })
    .eq("id", agencyId);

  if (error) return { error: error.message };

  await writeAudit(supabase, user.id, "approve_agency", "agencies", agencyId,
    { is_approved: false }, { is_approved: true });

  revalidatePath("/admin/agencies");
  return {};
}

export async function deactivateAgency(agencyId: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();

  const { data: old } = await supabase.from("agencies").select("is_active, is_approved").eq("id", agencyId).single();

  const { error } = await supabase
    .from("agencies")
    .update({ is_active: false, is_approved: false })
    .eq("id", agencyId);

  if (error) return { error: error.message };

  await writeAudit(supabase, user.id, "deactivate_agency", "agencies", agencyId,
    old ?? {}, { is_active: false });

  revalidatePath("/admin/agencies");
  return {};
}

export async function toggleVerifiedPartner(
  agencyId: string,
  isVerified: boolean
): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("agencies")
    .update({ is_verified_partner: isVerified })
    .eq("id", agencyId);

  if (error) return { error: error.message };

  await writeAudit(supabase, user.id, "toggle_verified_partner", "agencies", agencyId,
    { is_verified_partner: !isVerified }, { is_verified_partner: isVerified });

  revalidatePath("/admin/agencies");
  revalidatePath(`/admin/agencies/${agencyId}`);
  return {};
}

// ─── List all switch requests ─────────────────────────────────────────────────

export interface AdminRequest {
  id: string;
  patient_id: string;
  new_agency_id: string;
  care_type: string;
  payer_type: string;
  status: string;
  created_at: string;
  submitted_at: string | null;
  patient_name: string | null;
  agency_name: string | null;
}

export async function getAdminRequests(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ requests: AdminRequest[]; total: number }> {
  const { supabase } = await requireAdmin();
  const { status, limit = 50, offset = 0 } = options ?? {};

  let q = supabase
    .from("switch_requests")
    .select("id, patient_id, new_agency_id, care_type, payer_type, status, created_at, submitted_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) q = q.eq("status", status);

  const { data, count } = await q;
  if (!data?.length) return { requests: [], total: count ?? 0 };

  const patientIds = Array.from(new Set(data.map((r: any) => r.patient_id)));
  const agencyIds = Array.from(new Set(data.map((r: any) => r.new_agency_id)));

  const [profilesRes, agenciesRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", patientIds),
    supabase.from("agencies").select("id, name").in("id", agencyIds),
  ]);

  const profileMap = Object.fromEntries((profilesRes.data ?? []).map((p: any) => [p.id, p.full_name]));
  const agencyMap = Object.fromEntries((agenciesRes.data ?? []).map((a: any) => [a.id, a.name]));

  return {
    requests: data.map((r: any) => ({
      ...r,
      patient_name: profileMap[r.patient_id] ?? null,
      agency_name: agencyMap[r.new_agency_id] ?? null,
    })),
    total: count ?? 0,
  };
}

// ─── Assign case manager ──────────────────────────────────────────────────────

export async function assignCaseManager(
  requestId: string
): Promise<{ error?: string }> {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("switch_requests")
    .update({ chautari_case_manager_id: user.id })
    .eq("id", requestId);

  if (error) return { error: error.message };

  await writeAudit(supabase, user.id, "assign_case_manager", "switch_requests", requestId);
  revalidatePath("/admin/requests");
  return {};
}

// ─── Audit logs ───────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export async function getAuditLogs(options?: {
  resource?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  const { supabase } = await requireAdmin();
  const { resource, limit = 50, offset = 0 } = options ?? {};

  let q = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (resource) q = q.eq("resource", resource);

  const { data, count } = await q;
  return { logs: (data ?? []) as AuditLogEntry[], total: count ?? 0 };
}
