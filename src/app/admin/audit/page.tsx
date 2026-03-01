import { getAuditLogs } from "@/lib/admin-actions";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata = { title: "Audit Log | Admin" };
export const dynamic = "force-dynamic";

const RESOURCE_TABS = [
  { value: undefined, label: "All" },
  { value: "profiles", label: "Users" },
  { value: "agencies", label: "Agencies" },
  { value: "switch_requests", label: "Requests" },
] as const;

const ACTION_COLORS: Record<string, string> = {
  approve_agency:        "bg-green-100 text-green-700",
  deactivate_agency:     "bg-red-100 text-red-600",
  toggle_verified_partner: "bg-amber-100 text-amber-700",
  update_role:           "bg-blue-100 text-blue-700",
  assign_case_manager:   "bg-purple-100 text-purple-700",
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
    <div className="px-8 py-8 space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <Shield className="size-5 text-gray-500" />
        </div>
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-gray-800">Audit Log</h1>
          <p className="text-gray-500 mt-0.5">{total} total entries — admin actions are immutable</p>
        </div>
      </div>

      {/* Resource tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-0">
        {RESOURCE_TABS.map(({ value, label }) => {
          const active = (resource ?? undefined) === value;
          return (
            <Link
              key={label}
              href={value ? `/admin/audit?resource=${value}` : "/admin/audit"}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
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
        {logs.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Shield className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No audit entries yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => {
              const actionColor = ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600";
              return (
                <div key={log.id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-gray-50">
                  {/* Action badge */}
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg shrink-0 mt-0.5 ${actionColor}`}>
                    {log.action.replace(/_/g, " ")}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-700">
                        <span className="font-medium">{log.resource}</span>
                        {log.resource_id && (
                          <span className="text-gray-400 font-mono text-xs ml-1.5">
                            #{log.resource_id.slice(0, 8)}
                          </span>
                        )}
                      </span>
                      {log.old_data && log.new_data && (
                        <span className="text-xs text-gray-400">
                          {Object.keys(log.new_data).map((k) => (
                            <span key={k}>
                              {k}: {String((log.old_data as any)[k])} → {String((log.new_data as any)[k])}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span>{log.actor_role ?? "system"}</span>
                      <span>·</span>
                      <span>{new Date(log.created_at).toLocaleString("en-US", {
                        month: "short", day: "numeric",
                        hour: "numeric", minute: "2-digit"
                      })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
