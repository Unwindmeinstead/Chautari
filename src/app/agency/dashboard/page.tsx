import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { getAgencyConversations } from "@/lib/messaging-actions";
import { AgencyPortalClient } from "@/components/agency/agency-portal-client";
import { AdminPreviewBanner } from "@/components/admin/admin-preview-banner";
import { Building2 } from "lucide-react";

export const metadata = { title: "Agency Portal | SwitchMyCare" };
export const dynamic = "force-dynamic";

export default async function AgencyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const viewAs = cookieStore.get("chautari_view_as")?.value;

  let { agency, member, requests, stats } = await getAgencyPortalData();

  if (!agency && viewAs === "agency") {
    agency = {
      id: "preview-agency",
      name: "Evergreen Home Health",
      dba_name: "dba Evergreen",
      address_city: "Philadelphia",
      address_state: "PA",
      phone: "(555) 123-4567",
      email: "hello@evergreen.com",
      website: "evergreen.com",
      care_types: ["home_health"],
      payers_accepted: ["medicaid", "medicare"],
      services_offered: ["skilled_nursing", "physical_therapy", "home_health_aide"],
      languages_spoken: ["English", "Spanish", "Nepali"],
      service_counties: ["Philadelphia", "Bucks", "Montgomery"],
      is_verified_partner: true,
      is_accepting_patients: true,
      average_response_time_hours: 1,
      medicare_quality_score: 4.8,
      pa_license_number: "PA-HH-99201",
    };
    member = {
      id: "preview-member",
      role: "admin",
      title: "Agency Director"
    };
    requests = [
      {
        id: "prev-req-1",
        patient_id: "p1",
        status: "submitted",
        care_type: "skilled_nursing",
        switch_reason: "Seeking better communication and faster response times.",
        services_requested: ["skilled_nursing"],
        requested_start_date: new Date().toISOString(),
        special_instructions: "Patient prefers morning visits.",
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        patient: {
          id: "p1",
          full_name: "Sarah Miller (Demo)",
          phone: "(555) 998-0012",
          preferred_lang: "en",
        },
        patient_details: {
          address_city: "Philadelphia",
          address_county: "Philadelphia",
          payer_type: "medicare",
          care_type: "skilled_nursing",
          services_needed: ["skilled_nursing"],
        },
        e_signatures: [{ id: "sig-1", signed_at: new Date().toISOString(), consent_hipaa: true }],
      },
      {
        id: "prev-req-2",
        patient_id: "p2",
        status: "under_review",
        care_type: "physical_therapy",
        switch_reason: "Current agency has staffing issues.",
        services_requested: ["physical_therapy"],
        requested_start_date: new Date().toISOString(),
        special_instructions: null,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        patient: {
          id: "p2",
          full_name: "Marcus Thompson (Demo)",
          phone: "(555) 776-8833",
          preferred_lang: "en",
        },
        patient_details: {
          address_city: "Lower Merion",
          address_county: "Montgomery",
          payer_type: "private_insurance",
          care_type: "physical_therapy",
          services_needed: ["physical_therapy"],
        },
        e_signatures: [{ id: "sig-2", signed_at: new Date().toISOString(), consent_hipaa: true }],
      }
    ];
    stats = { total: 2, pending: 2, accepted: 0, completed: 0 };
  }

  if (!agency || !member) {
    return (
      <div className="min-h-screen bg-[#0F2419] p-6 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="size-6 text-white/40" />
          </div>
          <h1 className="text-lg font-semibold text-[#FFF8E7]">No Agency Linked</h1>
          <p className="text-sm text-[#FFF8E7]/40 mt-2">Your account isn't associated with an agency yet.</p>
          <a href="/api/auth/signout" className="inline-flex mt-6 h-10 px-6 rounded-xl bg-[#E8933A] text-[#0F2419] text-sm font-bold items-center gap-2">
            Sign out
          </a>
        </div>
      </div>
    );
  }

  // Fetch real notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const staff = {
    full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0],
    email: user?.email,
    role: member.role,
    title: member.title
  };

  const { conversations } = await getAgencyConversations();

  return (
    <>
      {viewAs && <AdminPreviewBanner viewingAs={viewAs} />}
      <AgencyPortalClient
        agency={agency}
        member={member}
        requests={requests}
        notifications={notifications || []}
        conversations={conversations || []}
        staff={staff}
      />
    </>
  );
}
