import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { AgencyRequestRow } from "@/components/agency/agency-request-row";
import { cn } from "@/lib/utils";

export const metadata = { title: "Requests | Agency Portal" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "submitted", label: "New" },
  { value: "under_review", label: "Reviewing" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "denied", label: "Denied" },
];

export default async function AgencyRequestsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const filter = searchParams.filter ?? "all";
  const data = await getAgencyPortalData(filter);
  if (!data.agency || !data.member) redirect("/agency/dashboard");

  const staffName = user.email?.split("@")[0] ?? "Staff";

  return (
    <div className="min-h-screen bg-cream">
      <AgencyNav
        agencyName={data.agency.name}
        staffName={staffName}
        staffRole={data.member.role}
        pendingCount={data.stats.pending}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="font-fraunces text-3xl font-semibold text-forest-800">Switch Requests</h1>
          <p className="text-forest-500 mt-1">
            {data.stats.total} total · {data.stats.pending} pending action
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === "all" ? "/agency/requests" : `/agency/requests?filter=${f.value}`}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                filter === f.value
                  ? "bg-forest-700 text-white border-forest-700"
                  : "bg-white border-forest-100 text-forest-600 hover:border-forest-300 hover:text-forest-700"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {data.requests.length === 0 ? (
          <div className="rounded-3xl bg-white border border-forest-100 shadow-card p-12 text-center">
            <p className="font-fraunces text-lg font-semibold text-forest-700">No requests</p>
            <p className="text-sm text-forest-400 mt-1">
              {filter !== "all" ? `No "${filter.replace("_", " ")}" requests.` : "No requests yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.requests.map((r) => <AgencyRequestRow key={r.id} request={r} />)}
          </div>
        )}
      </main>
    </div>
  );
}
