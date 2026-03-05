import { getAuditLogs } from "@/lib/admin-actions";
import { Shield } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Audit Log | Admin" };
export const dynamic = "force-dynamic";

const CARD = { background: "#111113", border: "1px solid rgba(255,255,255,0.08)" } as const;

const RESOURCE_TABS = [
  { value: undefined, label: "All" },
  { value: "profiles", label: "Users" },
  { value: "agencies", label: "Agencies" },
  { value: "switch_requests", label: "Requests" },
] as const;

const ACTION_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  approve_agency: { color: "#86EFAC", bg: "rgba(134,239,172,0.08)", border: "rgba(134,239,172,0.2)" },
  deactivate_agency: { color: "#FCA5A5", bg: "rgba(252,165,165,0.08)", border: "rgba(252,165,165,0.2)" },
  toggle_verified_partner: { color: "#FBBF24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
  update_role: { color: "rgba(147,197,253,0.9)", bg: "rgba(147,197,253,0.08)", border: "rgba(147,197,253,0.2)" },
  assign_case_manager: { color: "rgba(196,181,253,0.9)", bg: "rgba(196,181,253,0.08)", border: "rgba(196,181,253,0.2)" },
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ resource?: string }>;
}) {
  const sp = await searchParams;
  const resource = sp.resource;
  const { logs, total } = await getAuditLogs({ resource, limit: 100 });

  return (
    <div className="min-h-screen" style={{ background: "#09090B" }}>

      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(9,9,11,0.9)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
        <div>
          <p className="text-[13px] font-semibold text-white">Audit Log</p>
          <p className="text-[11px] text-white/30 mt-0.5">{total} total entries — immutable admin trail</p>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {RESOURCE_TABS.map(({ value, label }) => {
            const active = (resource ?? undefined) === value;
            return (
              <Link key={label}
                href={value ? `/admin/audit?resource=${value}` : "/admin/audit"}
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

        {/* List */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {logs.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <Shield className="size-7 text-white/15" />
              <p className="text-sm text-white/30">No audit entries yet</p>
            </div>
          ) : (
            <div>
              {logs.map((log, i) => {
                const s = ACTION_STYLE[log.action] ?? { color: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" };
                return (
                  <div key={log.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: i < logs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>

                    {/* Action badge */}
                    <span className="inline-flex items-center text-[10px] font-bold rounded-full px-2.5 py-1 shrink-0 uppercase tracking-widest mt-0.5"
                      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                      {log.action.replace(/_/g, " ")}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[13px] font-semibold text-white">
                          {log.resource}
                          {log.resource_id && (
                            <span className="text-[11px] text-white/30 font-mono ml-2 font-normal">
                              #{log.resource_id.slice(0, 8)}
                            </span>
                          )}
                        </span>
                      </div>

                      {log.old_data && log.new_data && (
                        <div className="mt-1.5 mb-2.5 flex flex-wrap gap-x-4 gap-y-1">
                          {Object.keys(log.new_data).map((k) => (
                            <span key={k} className="text-[11px] font-mono px-2 py-0.5 rounded-md"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              <span className="text-white/30 mr-1">{k}:</span>
                              <span className="text-red-400/80 mr-1 line-through">{String((log.old_data as any)[k])}</span>
                              <span className="text-white/20 mr-1">→</span>
                              <span className="text-emerald-400">{String((log.new_data as any)[k])}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-white/25">
                        <span className="uppercase tracking-widest">By: {log.actor_role ?? "SYSTEM"}</span>
                        <span>·</span>
                        <span>{new Date(log.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                        <span>·</span>
                        <span className="font-mono">{log.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
