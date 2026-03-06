import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
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
      id: "preview", name: "AHN Healthcare@Home", dba_name: "dba AHN",
      address_city: "Pittsburgh", address_state: "PA",
      phone: "800-555-0109", email: "homehealth@ahn.org", website: "ahn.org",
      care_types: ["home_health"], payers_accepted: ["medicaid", "medicare"],
      services_offered: ["skilled_nursing", "home_health_aide"],
      languages_spoken: ["English", "Nepali", "Hindi"], service_counties: ["Allegheny"],
      is_verified_partner: true, is_accepting_patients: true,
      average_response_time_hours: 1, medicare_quality_score: 4.7,
      pa_license_number: "PA-HH-00421",
    };
    member = { id: "preview-member", role: "admin", title: "Agency Director" };
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

  return (
    <>
      {viewAs && <AdminPreviewBanner viewingAs={viewAs} />}
      <AgencyPortalClient
        agency={agency}
        member={member}
        requests={requests}
        notifications={notifications || []}
        staff={staff}
      />
    </>
  );
}
