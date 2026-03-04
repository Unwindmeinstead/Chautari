import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { AgencyRequestRow } from "@/components/agency/agency-request-row";
import { cn } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

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
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "all";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const data = await getAgencyPortalData(filter);
  if (!data.agency || !data.member) redirect("/agency/dashboard");

  const staffName = user.email?.split("@")[0] ?? "Staff";

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-zinc-900 font-sans pb-20">
      <AgencyNav
        agencyName={data.agency.name}
        staffName={staffName}
        staffRole={data.member.role}
        pendingCount={data.stats.pending}
      />

      <main className="max-w-[1000px] mx-auto px-5 py-10 space-y-6">
        {/* Header */}
        <div className="space-y-1 my-4">
          <h1 className="text-[28px] font-bold tracking-tight">Switch Requests</h1>
          <p className="text-[14px] font-medium text-zinc-500">
            {data.stats.total} total cases · <span className="text-zinc-800 font-semibold">{data.stats.pending} pending action</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide border-b border-zinc-200/60">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <Link
                key={f.value}
                href={f.value === "all" ? "/agency/requests" : `/agency/requests?filter=${f.value}`}
                className={cn(
                  "px-4 py-2 text-[13px] font-bold rounded-t-xl transition-all border-b-2 -mb-[3px] whitespace-nowrap",
                  active
                    ? "text-zinc-900 border-zinc-900 bg-zinc-100/50"
                    : "text-zinc-500 border-transparent hover:text-zinc-800 hover:bg-zinc-50"
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* List */}
        {data.requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-14 text-center mt-8 shadow-sm">
            <div className="h-12 w-12 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="size-5 text-zinc-400" />
            </div>
            <p className="text-[16px] font-bold text-zinc-800">No requests found</p>
            <p className="text-[13px] font-medium text-zinc-500 mt-1 max-w-sm mx-auto">
              {filter !== "all" ? `You don't have any requests in the "${filter.replace("_", " ")}" status.` : "No patients have requested a switch to your agency yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-6">
            {data.requests.map((r) => <AgencyRequestRow key={r.id} request={r} />)}
          </div>
        )}
      </main>
    </div>
  );
}
