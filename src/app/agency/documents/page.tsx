import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";

export const metadata = { title: "Documents | Agency Portal" };

export default async function AgencyDocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { agency, member, stats } = await getAgencyPortalData();
  if (!agency || !member) return null;

  return (
    <div className="min-h-screen bg-zinc-50 pb-28 md:pb-8">
      <AgencyNav agencyName={agency.name} staffName={user?.email?.split("@")[0] ?? "Staff"} staffRole={member.role} pendingCount={stats.pending} />
      <main className="max-w-[1000px] mx-auto px-4 md:px-6 py-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h1 className="text-2xl font-semibold text-zinc-900">Documents</h1>
          <p className="text-sm text-zinc-500 mt-1">Inline previews, upload-back, and expiry tracking are next steps. Current document management is available from request details.</p>
        </div>
      </main>
    </div>
  );
}
