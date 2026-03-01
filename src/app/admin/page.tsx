import Link from "next/link";
import {
  Users, Building2, ArrowLeftRight, CheckCircle2,
  Clock, AlertTriangle, TrendingUp, BarChart3
} from "lucide-react";
import { getPlatformStats, getAdminAgencies, getAdminRequests } from "@/lib/admin-actions";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Admin Dashboard | Chautari" };
export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; variant: "warning" | "success" | "secondary" | "destructive" | "default" }> = {
  submitted:    { label: "New", variant: "warning" },
  under_review: { label: "Reviewing", variant: "default" },
  accepted:     { label: "Accepted", variant: "success" },
  completed:    { label: "Done", variant: "secondary" },
  denied:       { label: "Denied", variant: "destructive" },
};

export default async function AdminDashboardPage() {
  const [stats, pendingAgencies, recentRequests] = await Promise.all([
    getPlatformStats(),
    getAdminAgencies({ status: "pending", limit: 5 }),
    getAdminRequests({ limit: 8 }),
  ]);

  return (
    <div className="px-8 py-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-fraunces text-3xl font-semibold text-gray-800">Platform Overview</h1>
        <p className="text-gray-500">Chautari admin console — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      {/* Pending approvals alert */}
      {stats.pendingAgencyApprovals > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-amber-500 shrink-0" />
            <p className="text-sm font-medium text-amber-800">
              <span className="font-bold">{stats.pendingAgencyApprovals} {stats.pendingAgencyApprovals === 1 ? "agency" : "agencies"}</span>
              {" "}pending approval
            </p>
          </div>
          <Button variant="amber" size="sm" asChild>
            <Link href="/admin/agencies?status=pending">Review now</Link>
          </Button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers}
          sub={`${stats.totalPatients} patients`} icon={<Users className="size-5" />} />
        <StatCard label="Active Agencies" value={stats.totalAgencies}
          sub={stats.pendingAgencyApprovals > 0 ? `${stats.pendingAgencyApprovals} pending` : "All approved"}
          icon={<Building2 className="size-5" />}
          alert={stats.pendingAgencyApprovals > 0} />
        <StatCard label="Total Requests" value={stats.totalRequests}
          sub={`${stats.requestsThisMonth} this month`} icon={<ArrowLeftRight className="size-5" />} highlight />
        <StatCard label="Completed Switches" value={stats.completedRequests}
          sub={`${stats.activeRequests} in progress`} icon={<CheckCircle2 className="size-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard label="Active Cases" value={stats.activeRequests}
          icon={<Clock className="size-5" />} />
        <StatCard label="This Month" value={stats.requestsThisMonth}
          sub="Switch requests" icon={<TrendingUp className="size-5" />} />
        <StatCard label="Avg Response" value={stats.avgResponseHours ? `${stats.avgResponseHours}h` : "—"}
          sub="Agency response time" icon={<BarChart3 className="size-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending agency approvals */}
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-fraunces text-base font-semibold text-gray-800">Pending Approvals</h2>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/admin/agencies?status=pending">View all</Link>
            </Button>
          </div>
          {pendingAgencies.agencies.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              <CheckCircle2 className="size-6 mx-auto mb-2 text-green-400" />
              All agencies approved
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingAgencies.agencies.map((a) => (
                <Link
                  key={a.id}
                  href={`/admin/agencies/${a.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Building2 className="size-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.address_city}, {a.address_state}</p>
                  </div>
                  <Badge variant="warning" className="text-[10px] shrink-0">Pending</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent switch requests */}
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-fraunces text-base font-semibold text-gray-800">Recent Requests</h2>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/admin/requests">View all</Link>
            </Button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentRequests.requests.map((r) => {
              const badge = STATUS_BADGE[r.status] ?? { label: r.status, variant: "secondary" as const };
              return (
                <Link
                  key={r.id}
                  href={`/admin/requests/${r.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {r.patient_name ?? "Unknown patient"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">→ {r.agency_name ?? "Unknown agency"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                    <span className="text-[11px] text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
