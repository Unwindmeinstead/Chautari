"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface DashboardData {
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    preferred_lang: string | null;
    role: string | null;
  } | null;
  patientDetails: {
    address_line1: string | null;
    address_city: string | null;
    address_state: string | null;
    address_zip: string | null;
    address_county: string | null;
    payer_type: string | null;
    care_type: string | null;
    services_needed: string[] | null;
  } | null;
  switchRequests: Array<{
    id: string;
    status: string;
    care_type: string;
    switch_reason: string;
    requested_start_date: string | null;
    submitted_at: string | null;
    created_at: string;
    updated_at: string;
    new_agency: {
      id: string;
      name: string;
      address_city: string;
      phone: string | null;
    } | null;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    read_at: string | null;
    created_at: string;
    reference_id: string | null;
    reference_type: string | null;
  }>;
  unreadCount: number;
  onboardingComplete: boolean;
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      profile: null,
      patientDetails: null,
      switchRequests: [],
      notifications: [],
      unreadCount: 0,
      onboardingComplete: false,
    };
  }

  const [profileRes, detailsRes, requestsRes, notificationsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, preferred_lang, role")
      .eq("id", user.id)
      .single(),

    supabase
      .from("patient_details")
      .select(
        "address_line1, address_city, address_state, address_zip, address_county, payer_type, care_type, services_needed"
      )
      .eq("patient_id", user.id)
      .single(),

    supabase
      .from("switch_requests")
      .select(`
        id, status, care_type, switch_reason,
        requested_start_date, submitted_at, created_at, updated_at,
        new_agency:agencies!switch_requests_new_agency_id_fkey (
          id, name, address_city, phone
        )
      `)
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("notifications")
      .select(
        "id, type, title, body, read_at, created_at, reference_id, reference_type"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const notifications = notificationsRes.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const onboardingComplete = !!(detailsRes.data?.payer_type);

  return {
    profile: profileRes.data
      ? { ...profileRes.data, email: user.email ?? null }
      : null,
    patientDetails: detailsRes.data ?? null,
    switchRequests: (requestsRes.data ?? []) as DashboardData["switchRequests"],
    notifications,
    unreadCount,
    onboardingComplete,
  };
}

export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  revalidatePath("/dashboard");
  revalidatePath("/notifications");
}

export async function updateProfile(data: {
  full_name?: string;
  phone?: string;
  preferred_lang?: string;
}): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}
