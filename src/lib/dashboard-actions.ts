"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const BYPASS_AUTH = false;

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
    care_needs: string[] | null;
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
  const cookieStore = await cookies();
  const viewAs = cookieStore.get("chautari_view_as")?.value;

  const { data: { user } } = await supabase.auth.getUser();

  // If admin is previewing as patient, return mock data
  if (viewAs === "patient") {
    return {
      profile: {
        id: "preview-patient-id",
        full_name: "John Doe (Admin Preview)",
        email: "patient-preview@switchmycare.com",
        phone: "(555) 123-4567",
        preferred_lang: "en",
        role: "patient",
      },
      patientDetails: {
        address_line1: "123 Healing Way",
        address_city: "Philadelphia",
        address_state: "PA",
        address_zip: "19104",
        address_county: "Philadelphia",
        payer_type: "medicare",
        care_needs: ["skilled_nursing", "physical_therapy"],
      },
      switchRequests: [
        {
          id: "req-1",
          status: "under_review",
          care_type: "skilled_nursing",
          switch_reason: "Moving to a new area and need local support.",
          requested_start_date: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          new_agency: {
            id: "agency-1",
            name: "Evergreen Home Health",
            address_city: "Philadelphia",
            phone: "(555) 987-6543",
          },
        },
      ],
      notifications: [
        {
          id: "n-1",
          type: "status_change",
          title: "Request Updated",
          body: "Evergreen Home Health is reviewing your switch request.",
          read_at: null,
          created_at: new Date().toISOString(),
          reference_id: "req-1",
          reference_type: "switch_request",
        },
      ],
      unreadCount: 1,
      onboardingComplete: true,
    };
  }

  if (!user && !BYPASS_AUTH) {
    redirect("/auth/login?redirectedFrom=/dashboard");
  }

  if (!user && BYPASS_AUTH) {
    return {
      profile: {
        id: "bypass-patient-user",
        full_name: "Demo Patient",
        email: "patient@local.test",
        phone: null,
        preferred_lang: "en",
        role: "patient",
      },
      patientDetails: null,
      switchRequests: [],
      notifications: [],
      unreadCount: 0,
      onboardingComplete: true,
    };
  }

  const effectiveUser = user!;

  const [profileRes, detailsRes, requestsRes, notificationsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, preferred_lang, role")
      .eq("id", effectiveUser.id)
      .single(),

    supabase
      .from("patient_details")
      .select(
        "address_line1, address_city, address_state, address_zip, address_county, payer_type, care_needs"
      )
      .eq("patient_id", effectiveUser.id)
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
      .eq("patient_id", effectiveUser.id)
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("notifications")
      .select(
        "id, type, title, body, read_at, created_at, reference_id, reference_type"
      )
      .eq("user_id", effectiveUser.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (!profileRes.data) {
    return {
      profile: {
        id: effectiveUser.id, full_name: effectiveUser.user_metadata?.full_name || "", email: effectiveUser.email ?? "", phone: "", preferred_lang: "en", role: "patient"
      },
      patientDetails: null,
      switchRequests: [],
      notifications: [],
      unreadCount: 0,
      onboardingComplete: false,
    };
  }

  const notifications = notificationsRes.data ?? [];
  const unreadCount = notifications.filter((n: any) => !n.read_at).length;
  const onboardingComplete = !!(detailsRes.data?.payer_type && detailsRes.data?.care_needs?.length);

  return {
    profile: { ...profileRes.data, email: effectiveUser.email ?? null },
    patientDetails: detailsRes.data ?? null,
    switchRequests: (requestsRes.data ?? []) as unknown as DashboardData["switchRequests"],
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
