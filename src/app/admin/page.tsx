import Link from "next/link";
import {
  Users, Building2, ArrowLeftRight, CheckCircle2,
  Clock, AlertTriangle, TrendingUp, BarChart3
} from "lucide-react";
import { getPlatformStats, getAdminAgencies, getAdminRequests } from "@/lib/admin-actions";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Admin Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; variant: "warning" | "success" | "secondary" | "destructive" | "default" }> = {
  submitted: { label: "New", variant: "warning" },
  under_review: { label: "Reviewing", variant: "default" },
  accepted: { label: "Accepted", variant: "success" },
  completed: { label: "Done", variant: "secondary" },
  denied: { label: "Denied", variant: "destructive" },
};

export default async function AdminDashboardPage() {
  const [stats, pendingAgencies, recentRequests] = await Promise.all([
    getPlatformStats(),
    getAdminAgencies({ status: "pending", limit: 5 }),
    getAdminRequests({ limit: 8 }),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] relative font-sans">
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[150px] left-[100px] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] mix-blend-multiply" />
        <div className="absolute top-[50px] -right-[100px] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[100px] mix-blend-multiply" />
      </div>

      <div className="px-6 sm:px-10 py-10 space-y-12 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
          <div className="space-y-2">
            <h1 className="font-fraunces text-4xl md:text-5xl font-semibold text-forest-900 tracking-tight leading-tight">
              Platform Overview
            </h1>
            <p className="text-forest-500 text-lg font-medium">SwitchMyCare admin console — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        {/* Pending approvals alert */}
        {stats.pendingAgencyApprovals > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <div className="group relative overflow-hidden rounded-[24px] bg-gradient-to-r from-amber-500 to-amber-600 p-[1px] shadow-lg shadow-amber-500/10 transition-all duration-500 hover:shadow-amber-500/20">
              <div className="relative flex items-center justify-between gap-6 p-6 sm:px-8 bg-white/95 backdrop-blur-3xl rounded-[23px] flex-col sm:flex-row text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <AlertTriangle className="size-6 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-fraunces text-xl font-bold text-forest-900">
                      {stats.pendingAgencyApprovals} {stats.pendingAgencyApprovals === 1 ? "agency" : "agencies"} pending approval
                    </h2>
                    <p className="text-forest-500 font-medium mt-0.5">
                      Review their applications to allow them into the network.
                    </p>
                  </div>
                </div>
                <Button variant="amber" size="lg" className="shrink-0 rounded-xl shadow-md font-semibold transition-all hover:scale-105" asChild>
                  <Link href="/admin/agencies?status=pending">Review now</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats upper grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <StatCard label="Total Users" value={stats.totalUsers} sub={`${stats.totalPatients} patients`} icon={<Users className="size-6" />} />
          <StatCard label="Active Agencies" value={stats.totalAgencies} sub={stats.pendingAgencyApprovals > 0 ? `${stats.pendingAgencyApprovals} pending` : "All approved"} icon={<Building2 className="size-6" />} alert={stats.pendingAgencyApprovals > 0} />
          <StatCard label="Total Requests" value={stats.totalRequests} sub={`${stats.requestsThisMonth} this month`} icon={<ArrowLeftRight className="size-6" />} highlight />
          <StatCard label="Completed Switches" value={stats.completedRequests} sub={`${stats.activeRequests} in progress`} icon={<CheckCircle2 className="size-6" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <StatCard label="Active Cases" value={stats.activeRequests} icon={<Clock className="size-6" />} />
          <StatCard label="This Month" value={stats.requestsThisMonth} sub="Switch requests" icon={<TrendingUp className="size-6" />} />
          <StatCard label="Avg Response" value={stats.avgResponseHours ? `${stats.avgResponseHours}h` : "—"} sub="Agency response time" icon={<BarChart3 className="size-6" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
          {/* Pending agency approvals */}
          <div className="rounded-[32px] bg-white border border-forest-900/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-forest-100 flex items-center justify-between bg-cream/60">
              <h2 className="font-fraunces text-xl font-semibold text-forest-900 tracking-tight">Pending Approvals</h2>
              <Button variant="outline" size="sm" asChild className="text-xs font-semibold rounded-xl hover:bg-white hover:text-forest-900">
                <Link href="/admin/agencies?status=pending">View all</Link>
              </Button>
            </div>
            {pendingAgencies.agencies.length === 0 ? (
              <div className="py-16 text-center text-sm text-forest-500 flex-1 flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="size-8 text-green-500" />
                </div>
                <p className="font-semibold text-forest-900 text-lg mb-1">All Caught Up</p>
                <p>There are no agencies waiting for approval.</p>
              </div>
            ) : (
              <div className="divide-y divide-forest-100">
                {pendingAgencies.agencies.map((a) => (
                  <Link
                    key={a.id}
                    href={`/admin/agencies/${a.id}`}
                    className="flex items-center gap-4 px-8 py-5 hover:bg-cream/40 transition-colors group cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-105 transition-transform duration-300">
                      <Building2 className="size-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-forest-900 truncate">{a.name}</p>
                      <p className="text-sm font-medium text-forest-500">{a.address_city}, {a.address_state}</p>
                    </div>
                    <Badge variant="warning" className="text-xs font-bold shadow-sm px-2.5 py-1">Pending</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent switch requests */}
          <div className="rounded-[32px] bg-white border border-forest-900/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-forest-100 flex items-center justify-between bg-cream/60">
              <h2 className="font-fraunces text-xl font-semibold text-forest-900 tracking-tight">Recent Requests</h2>
              <Button variant="outline" size="sm" asChild className="text-xs font-semibold rounded-xl hover:bg-white hover:text-forest-900">
                <Link href="/admin/requests">View all</Link>
              </Button>
            </div>
            <div className="divide-y divide-forest-100">
              {recentRequests.requests.map((r) => {
                const badge = STATUS_BADGE[r.status] ?? { label: r.status, variant: "secondary" as const };
                return (
                  <Link
                    key={r.id}
                    href={`/admin/requests/${r.id}`}
                    className="flex items-center gap-4 px-8 py-5 hover:bg-cream/40 transition-colors group cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 text-indigo-600 font-bold text-sm">
                      {(r.patient_name ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-forest-900 truncate line-clamp-1">
                        {r.patient_name ?? "Unknown patient"}
                      </p>
                      <p className="text-xs font-medium text-forest-500 truncate mt-0.5 flex items-center gap-1">
                        <ArrowLeftRight className="size-3" /> {r.agency_name ?? "Unknown agency"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={badge.variant} className="text-[11px] font-bold px-2 py-0.5">{badge.label}</Badge>
                      <span className="text-xs font-medium text-forest-400">
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
    </div>
  );
}
