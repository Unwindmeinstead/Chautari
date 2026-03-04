import Link from "next/link";
import {
  Users, Building2, ArrowLeftRight, CheckCircle2,
  Clock, AlertTriangle, TrendingUp, BarChart3,
  ChevronRight, ArrowUpRight, Activity, Zap,
  Shield, UserCheck, Globe, RefreshCw,
} from "lucide-react";
import { getPlatformStats, getAdminAgencies, getAdminRequests } from "@/lib/admin-actions";
import { StatCard } from "@/components/admin/stat-card";

export const metadata = { title: "Admin Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

// ── shared design tokens ────────────────────────────────────────────────────
const CARD = { background: "#111113", border: "1px solid rgba(255,255,255,0.08)" } as const;
const DIVIDER = { borderTop: "1px solid rgba(255,255,255,0.06)" } as const;
const PILL_BASE = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold";

// ── status pill ─────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    submitted: { label: "New", color: "#FBBF24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
    under_review: { label: "Reviewing", color: "#93C5FD", bg: "rgba(147,197,253,0.1)", border: "rgba(147,197,253,0.2)" },
    accepted: { label: "Accepted", color: "#86EFAC", bg: "rgba(134,239,172,0.1)", border: "rgba(134,239,172,0.2)" },
    completed: { label: "Done", color: "#C4B5FD", bg: "rgba(196,181,253,0.1)", border: "rgba(196,181,253,0.2)" },
    denied: { label: "Denied", color: "#FCA5A5", bg: "rgba(252,165,165,0.1)", border: "rgba(252,165,165,0.2)" },
  };
  const s = map[status] ?? { label: status, color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" };
  return (
    <span className={PILL_BASE} style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

// ── sparkline (CSS bars) ─────────────────────────────────────────────────────
function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-7">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm"
          style={{
            height: `${Math.round((v / max) * 100)}%`,
            minHeight: 2,
            background: i === values.length - 1 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)",
          }} />
      ))}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
export default async function AdminDashboardPage() {
  const [stats, pendingAgencies, recentRequests] = await Promise.all([
    getPlatformStats(),
    getAdminAgencies({ status: "pending", limit: 5 }),
    getAdminRequests({ limit: 8 }),
  ]);

  const agencyStaff = Math.max(0, stats.totalUsers - stats.totalPatients);
  const completionRate = stats.totalRequests > 0
    ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const reqSparkline = [12, 19, 14, 22, 18, 25, stats.requestsThisMonth];
  const userSparkline = [120, 128, 133, 138, 142, 149, stats.totalUsers];

  return (
    <div className="min-h-screen" style={{ background: "#09090B" }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(9,9,11,0.9)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-white">Overview</span>
          <span className="text-white/15">·</span>
          <span className="text-[12px] text-white/30 font-medium">{dateStr} · {timeStr}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white/40"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-white/30 inline-block" />
            Live
            <RefreshCw className="size-3 ml-1 text-white/20" />
          </div>
          {stats.pendingAgencyApprovals > 0 && (
            <Link href="/admin/agencies?status=pending"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#FBBF24" }}>
              <AlertTriangle className="size-3.5" />
              {stats.pendingAgencyApprovals} pending
              <ArrowUpRight className="size-3 opacity-60" />
            </Link>
          )}
        </div>
      </div>

      <div className="px-8 py-7 space-y-5 max-w-[1400px] mx-auto">

        {/* KPI row */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-3">Key Metrics</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()}
              sub={`${stats.totalPatients} patients · ${agencyStaff} agency staff`}
              icon={<Users />} trend="up" trendValue="+12%" />
            <StatCard label="Active Agencies" value={stats.totalAgencies}
              sub={`${stats.pendingAgencyApprovals > 0 ? stats.pendingAgencyApprovals + " pending" : "All approved"}`}
              icon={<Building2 />} alert={stats.pendingAgencyApprovals > 0} />
            <StatCard label="Switch Requests" value={stats.totalRequests.toLocaleString()}
              sub={`${stats.requestsThisMonth} this month`}
              icon={<ArrowLeftRight />} trend="up" trendValue="+8%" />
            <StatCard label="Completed" value={stats.completedRequests.toLocaleString()}
              sub={`${completionRate}% completion rate`}
              icon={<CheckCircle2 />} trend="up" trendValue={`${completionRate}%`} />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Sparkline: requests */}
          <div className="rounded-2xl p-5" style={CARD}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-1">Requests / week</p>
            <p className="text-2xl font-bold text-white font-fraunces mb-3">{stats.requestsThisMonth}</p>
            <Sparkline values={reqSparkline} />
            <p className="text-[10px] text-white/20 mt-2">Last 7 days</p>
          </div>
          {/* Sparkline: users */}
          <div className="rounded-2xl p-5" style={CARD}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-1">User growth</p>
            <p className="text-2xl font-bold text-white font-fraunces mb-3">{stats.totalUsers}</p>
            <Sparkline values={userSparkline} />
            <p className="text-[10px] text-white/20 mt-2">Last 7 weeks</p>
          </div>
          {/* Active + Response */}
          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-2xl p-4" style={CARD}>
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">Active Cases</p>
              <p className="text-2xl font-bold text-white font-fraunces mt-1">{stats.activeRequests}</p>
              <p className="text-[10px] text-white/25 mt-1 flex items-center gap-1"><Clock className="size-3" />In progress</p>
            </div>
            <div className="flex-1 rounded-2xl p-4" style={CARD}>
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">Avg Response</p>
              <p className="text-2xl font-bold text-white font-fraunces mt-1">{stats.avgResponseHours ? `${stats.avgResponseHours}h` : "—"}</p>
              <p className="text-[10px] text-white/25 mt-1 flex items-center gap-1"><Zap className="size-3" />Agency avg</p>
            </div>
          </div>
          {/* Funnel */}
          <div className="rounded-2xl p-5" style={CARD}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-4">Request Funnel</p>
            <div className="space-y-3">
              {[
                { label: "Total", value: stats.totalRequests, color: "rgba(255,255,255,0.4)" },
                { label: "Active", value: stats.activeRequests, color: "rgba(251,191,36,0.8)" },
                { label: "Completed", value: stats.completedRequests, color: "rgba(134,239,172,0.8)" },
              ].map(({ label, value, color }) => {
                const pct = stats.totalRequests > 0 ? Math.round((value / stats.totalRequests) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-white/30">{label}</span>
                      <span className="text-[10px] font-bold text-white/60">{value}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pending approvals */}
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            <div className="flex items-center justify-between px-6 py-4" style={DIVIDER}>
              <div>
                <p className="text-[13px] font-semibold text-white">Pending Approvals</p>
                <p className="text-[11px] text-white/30 mt-0.5">
                  {pendingAgencies.agencies.length === 0 ? "All agencies approved" : `${pendingAgencies.agencies.length} awaiting review`}
                </p>
              </div>
              <Link href="/admin/agencies?status=pending"
                className="flex items-center gap-1 text-[11px] font-semibold text-white/30 hover:text-white/70 transition-colors">
                View all <ChevronRight className="size-3.5" />
              </Link>
            </div>
            {pendingAgencies.agencies.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <CheckCircle2 className="size-6 text-white/15" />
                <p className="text-sm text-white/30 font-medium">No pending approvals</p>
              </div>
            ) : (
              <div>
                {pendingAgencies.agencies.map((a, i) => (
                  <Link key={a.id} href={`/admin/agencies/${a.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors group"
                    style={{ borderBottom: i < pendingAgencies.agencies.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)" }}>
                      <Building2 className="size-4 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{a.name}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{a.address_city}, {a.address_state}</p>
                    </div>
                    <span className={PILL_BASE} style={{ color: "#FBBF24", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                      Pending
                    </span>
                    <ChevronRight className="size-4 text-white/15 group-hover:text-white/50 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent requests */}
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            <div className="flex items-center justify-between px-6 py-4" style={DIVIDER}>
              <div>
                <p className="text-[13px] font-semibold text-white">Recent Requests</p>
                <p className="text-[11px] text-white/30 mt-0.5">{stats.totalRequests} total</p>
              </div>
              <Link href="/admin/requests"
                className="flex items-center gap-1 text-[11px] font-semibold text-white/30 hover:text-white/70 transition-colors">
                View all <ChevronRight className="size-3.5" />
              </Link>
            </div>
            {recentRequests.requests.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <ArrowLeftRight className="size-6 text-white/15" />
                <p className="text-sm text-white/30">No requests yet</p>
              </div>
            ) : recentRequests.requests.map((r, i) => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                style={{ borderBottom: i < recentRequests.requests.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white/60"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  {(r.patient_name ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white truncate">{r.patient_name ?? "Unknown"}</p>
                  <p className="text-[11px] text-white/30 truncate mt-0.5">{r.agency_name ?? "—"}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusPill status={r.status} />
                  <span className="text-[10px] text-white/20">
                    {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: Health + Breakdown + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Platform health */}
          <div className="rounded-2xl p-5" style={CARD}>
            <div className="flex items-center gap-2 mb-5">
              <Activity className="size-4 text-white/40" />
              <p className="text-[13px] font-semibold text-white">Platform Health</p>
            </div>
            <div className="space-y-3.5">
              {[
                { label: "API Gateway", latency: "24ms" },
                { label: "Database", latency: "8ms" },
                { label: "Auth Service", latency: "42ms" },
                { label: "File Storage", latency: "180ms" },
                { label: "Email Service", latency: "310ms" },
              ].map(({ label, latency }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/30 shrink-0" />
                    <span className="text-[12px] text-white/50">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/20 font-mono">{latency}</span>
                    <span className="text-[10px] font-bold text-white/50 px-1.5 py-0.5 rounded-md"
                      style={{ background: "rgba(255,255,255,0.05)" }}>OK</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User breakdown */}
          <div className="rounded-2xl p-5" style={CARD}>
            <div className="flex items-center gap-2 mb-5">
              <Users className="size-4 text-white/40" />
              <p className="text-[13px] font-semibold text-white">User Breakdown</p>
            </div>
            <div className="space-y-4">
              {[
                { label: "Patients", value: stats.totalPatients, color: "rgba(255,255,255,0.6)" },
                { label: "Agency Staff", value: agencyStaff, color: "rgba(255,255,255,0.35)" },
                { label: "Admin", value: 1, color: "rgba(255,255,255,0.2)" },
              ].map(({ label, value, color }) => {
                const pct = stats.totalUsers > 0 ? Math.round((value / stats.totalUsers) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] text-white/40">{label}</span>
                      <span className="text-[11px] font-bold text-white/60">{value.toLocaleString()} <span className="text-white/20 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4" style={DIVIDER}>
              <div className="flex justify-between">
                <span className="text-[11px] text-white/25">Total users</span>
                <span className="text-[12px] font-bold text-white">{stats.totalUsers.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl p-5" style={CARD}>
            <div className="flex items-center gap-2 mb-5">
              <Zap className="size-4 text-white/40" />
              <p className="text-[13px] font-semibold text-white">Quick Actions</p>
            </div>
            <div className="space-y-2">
              {[
                { href: "/admin/agencies", label: "Review Agencies", icon: Building2, desc: `${stats.pendingAgencyApprovals} pending` },
                { href: "/admin/users", label: "Manage Users", icon: Users, desc: `${stats.totalUsers} total` },
                { href: "/admin/requests", label: "Switch Requests", icon: ArrowLeftRight, desc: `${stats.activeRequests} active` },
                { href: "/admin/audit", label: "Audit Log", icon: Shield, desc: "Immutable trail" },
              ].map(({ href, label, icon: Icon, desc }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <Icon className="size-3.5 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white">{label}</p>
                    <p className="text-[10px] text-white/25">{desc}</p>
                  </div>
                  <ChevronRight className="size-3.5 text-white/15 group-hover:text-white/50 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-6">
          {[
            { label: "PA Counties Served", value: "67", icon: Globe },
            { label: "Verified Agencies", value: stats.totalAgencies.toString(), icon: UserCheck },
            { label: "Payer Networks", value: "5+", icon: BarChart3 },
            { label: "Cases This Month", value: stats.requestsThisMonth.toString(), icon: Activity },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl p-5 flex items-center gap-3"
              style={CARD}>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <Icon className="size-4 text-white/40" />
              </div>
              <div>
                <p className="text-xl font-bold text-white font-fraunces">{value}</p>
                <p className="text-[10px] font-medium text-white/30">{label}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
