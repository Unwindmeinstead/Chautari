import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { getAdminRequests } from "@/lib/admin-actions";

export const metadata = { title: "Switch Requests | Admin" };
export const dynamic = "force-dynamic";

const CARD = { background: "#111113", border: "1px solid rgba(255,255,255,0.08)" } as const;

const STATUS_TABS = [
  { value: undefined, label: "All" },
  { value: "submitted", label: "New" },
  { value: "under_review", label: "Reviewing" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "denied", label: "Denied" },
] as const;

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  submitted: { label: "New", color: "#FBBF24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
  under_review: { label: "Reviewing", color: "rgba(147,197,253,0.9)", bg: "rgba(147,197,253,0.08)", border: "rgba(147,197,253,0.2)" },
  accepted: { label: "Accepted", color: "#86EFAC", bg: "rgba(134,239,172,0.08)", border: "rgba(134,239,172,0.2)" },
  completed: { label: "Done", color: "rgba(196,181,253,0.9)", bg: "rgba(196,181,253,0.08)", border: "rgba(196,181,253,0.2)" },
  denied: { label: "Denied", color: "#FCA5A5", bg: "rgba(252,165,165,0.08)", border: "rgba(252,165,165,0.2)" },
  cancelled: { label: "Cancelled", color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
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
    <div className="min-h-screen" style={{ background: "#09090B" }}>

      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(9,9,11,0.9)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
        <div>
          <p className="text-[13px] font-semibold text-white">Switch Requests</p>
          <p className="text-[11px] text-white/30 mt-0.5">{total} total requests</p>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {STATUS_TABS.map(({ value, label }) => {
            const active = (status ?? undefined) === value;
            return (
              <Link key={label}
                href={value ? `/admin/requests?status=${value}` : "/admin/requests"}
                className="px-4 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors"
                style={{
                  borderBottomColor: active ? "rgba(255,255,255,0.7)" : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.3)",
                }}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {requests.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <ArrowLeftRight className="size-7 text-white/15" />
              <p className="text-sm text-white/30">No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Patient", "Agency", "Care Type", "Payer", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-white/25 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => {
                    const s = STATUS_STYLE[r.status] ?? STATUS_STYLE.cancelled;
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors"
                        style={{ borderBottom: i < requests.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <td className="px-5 py-3.5">
                          <p className="text-[13px] font-semibold text-white">{r.patient_name ?? <span className="text-white/25 italic font-normal">Unknown</span>}</p>
                          <p className="text-[10px] font-mono text-white/20">{r.id.slice(0, 8)}…</p>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-white/50 max-w-[160px] truncate">{r.agency_name ?? "—"}</td>
                        <td className="px-5 py-3.5 text-[12px] text-white/40 capitalize">{r.care_type?.replace("_", " ")}</td>
                        <td className="px-5 py-3.5 text-[11px] text-white/30 uppercase font-mono">{r.payer_type}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-0.5"
                            style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                            {s.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-white/25">
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
    </div>
  );
}
