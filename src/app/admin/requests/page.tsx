import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { getAdminRequests } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Switch Requests | Admin" };
export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { value: undefined, label: "All" },
  { value: "submitted", label: "New" },
  { value: "under_review", label: "Reviewing" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "denied", label: "Denied" },
] as const;

const STATUS_BADGE: Record<string, { label: string; variant: "warning" | "success" | "secondary" | "destructive" | "default" }> = {
  submitted:    { label: "New", variant: "warning" },
  under_review: { label: "Reviewing", variant: "default" },
  accepted:     { label: "Accepted", variant: "success" },
  completed:    { label: "Done", variant: "secondary" },
  denied:       { label: "Denied", variant: "destructive" },
  cancelled:    { label: "Cancelled", variant: "secondary" },
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status;

  const { requests, total } = await getAdminRequests({ status, limit: 100 });

  return (
    <div className="px-8 py-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-gray-800">Switch Requests</h1>
        <p className="text-gray-500 mt-0.5">{total} total requests</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-0 overflow-x-auto">
        {STATUS_TABS.map(({ value, label }) => {
          const active = (status ?? undefined) === value;
          return (
            <Link
              key={label}
              href={value ? `/admin/requests?status=${value}` : "/admin/requests"}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                active
                  ? "border-forest-600 text-forest-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        {requests.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <ArrowLeftRight className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agency</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Care Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r) => {
                  const badge = STATUS_BADGE[r.status] ?? { label: r.status, variant: "secondary" as const };
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">{r.patient_name ?? <span className="text-gray-400 italic">Unknown</span>}</p>
                        <p className="text-xs text-gray-400 font-mono">{r.id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-gray-700 truncate max-w-[180px]">{r.agency_name ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 capitalize">
                        {r.care_type?.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 uppercase text-xs">
                        {r.payer_type}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
