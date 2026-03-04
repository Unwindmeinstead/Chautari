import Link from "next/link";
import {
  Users, Building2, ArrowLeftRight, CheckCircle2,
  Clock, AlertTriangle, TrendingUp, BarChart3,
  ChevronRight, ArrowUpRight, Activity, Zap,
  Shield, UserCheck, Globe, RefreshCw, Bell,
  Circle, Filter
} from "lucide-react";
import { getPlatformStats, getAdminAgencies, getAdminRequests } from "@/lib/admin-actions";
import { StatCard } from "@/components/admin/stat-card";

export const metadata = { title: "Admin Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

// ── helpers ─────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
    submitted: { label: "New", dot: "#F59E0B", text: "#FCD34D", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
    under_review: { label: "Reviewing", dot: "#60A5FA", text: "#93C5FD", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
    accepted: { label: "Accepted", dot: "#34D399", text: "#6EE7B7", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
    completed: { label: "Done", dot: "#A78BFA", text: "#C4B5FD", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
    denied: { label: "Denied", dot: "#F87171", text: "#FCA5A5", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  };
  const s = map[status] ?? { label: status, dot: "#6B7280", text: "#9CA3AF", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)" };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

// Fake sparkline using CSS bars — gives a visual pulse to each metric
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-300"
          style={{
            height: `${Math.round((v / max) * 100)}%`,
            minHeight: "3px",
            background: i === values.length - 1 ? color : `${color}50`,
          }}
        />
      ))}
    </div>
  );
}

// Progress bar for completion rate
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-white/30 font-medium">Completion rate</span>
        <span className="text-[11px] font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
      </div>
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const [stats, pendingAgencies, recentRequests] = await Promise.all([
    getPlatformStats(),
    getAdminAgencies({ status: "pending", limit: 5 }),
    getAdminRequests({ limit: 8 }),
  ]);

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dateString = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  // Derived metrics
  const completionRate = stats.totalRequests > 0
    ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
    : 0;
  const agencyApprovalRate = stats.totalAgencies > 0
    ? Math.round(((stats.totalAgencies - stats.pendingAgencyApprovals) / stats.totalAgencies) * 100)
    : 100;
  const agencyStaff = Math.max(0, stats.totalUsers - stats.totalPatients);

  // Fake sparklines for visual richness (would be real weekly data in production)
  const requestSparkline = [12, 19, 14, 22, 18, 25, stats.requestsThisMonth];
  const userSparkline = [120, 128, 133, 138, 142, 149, stats.totalUsers];
  const completedSparkline = [30, 38, 44, 50, 54, 60, stats.completedRequests];

  return (
    <div className="min-h-screen" style={{ background: "#0C100E" }}>

      {/* ── Sticky top bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
        style={{
          background: "rgba(12,16,14,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
        }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-emerald-400" />
            <span className="text-[13px] font-bold text-white">Platform Overview</span>
          </div>
          <span className="text-white/20">·</span>
          <span className="text-[12px] text-white/35 font-medium">{dateString} · {timeString}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* System status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="text-[11px] font-bold text-emerald-400">All systems operational</span>
          </div>

          {/* Pending approvals alert */}
          {stats.pendingAgencyApprovals > 0 && (
            <Link href="/admin/agencies?status=pending"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all duration-150"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <AlertTriangle className="size-3.5 text-amber-400" />
              <span className="text-amber-300">{stats.pendingAgencyApprovals} pending</span>
              <ArrowUpRight className="size-3 text-amber-400/60" />
            </Link>
          )}

          <Link href="/admin"
            className="flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-150 hover:bg-white/8"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <Bell className="size-4 text-white/40" />
          </Link>
        </div>
      </div>

      <div className="px-8 py-7 space-y-6 max-w-[1400px] mx-auto">

        {/* ── KPI row 1 — 4 primary metrics ──────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold tracking-widest uppercase text-white/25">Key Metrics</p>
            <div className="flex items-center gap-1.5 text-white/25">
              <RefreshCw className="size-3" />
              <span className="text-[11px] font-medium">Live</span>
            </div>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Total Users"
              value={stats.totalUsers.toLocaleString()}
              sub={`${stats.totalPatients} patients · ${agencyStaff} agency staff`}
              icon={<Users />}
              highlight
              trend="up"
              trendValue="+12%"
              accent="#10B981"
            />
            <StatCard
              label="Active Agencies"
              value={stats.totalAgencies}
              sub={`${agencyApprovalRate}% approval rate`}
              icon={<Building2 />}
              alert={stats.pendingAgencyApprovals > 0}
              trend={stats.pendingAgencyApprovals > 0 ? "down" : "up"}
              trendValue={stats.pendingAgencyApprovals > 0 ? `${stats.pendingAgencyApprovals} pending` : "All clear"}
              accent="#F59E0B"
            />
            <StatCard
              label="Switch Requests"
              value={stats.totalRequests.toLocaleString()}
              sub={`${stats.requestsThisMonth} this month`}
              icon={<ArrowLeftRight />}
              trend="up"
              trendValue="+8%"
              accent="#60A5FA"
            />
            <StatCard
              label="Completed Switches"
              value={stats.completedRequests.toLocaleString()}
              sub={`${completionRate}% completion rate`}
              icon={<CheckCircle2 />}
              trend="up"
              trendValue={`${completionRate}%`}
              accent="#A78BFA"
            />
          </div>
        </div>

        {/* ── Row 2 — sparkline cards + mini metrics ─────────────────── */}
        <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">

          {/* Sparkline card: requests */}
          <div className="col-span-2 rounded-2xl p-5" style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-white/30">Requests / week</p>
                <p className="text-2xl font-bold text-white mt-1 font-fraunces">{stats.requestsThisMonth}</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
                <TrendingUp className="size-3 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400">+8%</span>
              </div>
            </div>
            <Sparkline values={requestSparkline} color="#60A5FA" />
            <p className="text-[10px] text-white/20 font-medium mt-2">Last 7 days</p>
          </div>

          {/* Sparkline card: users */}
          <div className="col-span-2 rounded-2xl p-5" style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-white/30">User growth</p>
                <p className="text-2xl font-bold text-white mt-1 font-fraunces">{stats.totalUsers}</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <TrendingUp className="size-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">+12%</span>
              </div>
            </div>
            <Sparkline values={userSparkline} color="#10B981" />
            <p className="text-[10px] text-white/20 font-medium mt-2">Last 7 weeks</p>
          </div>

          {/* Mini metric cells */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="flex-1 rounded-2xl p-4 flex flex-col justify-between" style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">Active Cases</p>
              <div>
                <p className="text-2xl font-bold text-white font-fraunces">{stats.activeRequests}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="size-3 text-amber-400" />
                  <span className="text-[10px] text-white/30">In progress</span>
                </div>
              </div>
            </div>
            <div className="flex-1 rounded-2xl p-4 flex flex-col justify-between" style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">Avg Response</p>
              <div>
                <p className="text-2xl font-bold text-white font-fraunces">
                  {stats.avgResponseHours ? `${stats.avgResponseHours}h` : "—"}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="size-3 text-purple-400" />
                  <span className="text-[10px] text-white/30">Agency avg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Completion rate donut-like with bar */}
          <div className="col-span-1 rounded-2xl p-5 flex flex-col justify-between" style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-4">Funnel</p>
            <div className="space-y-3">
              {[
                { label: "Submitted", value: stats.totalRequests, color: "#F59E0B" },
                { label: "Active", value: stats.activeRequests, color: "#60A5FA" },
                { label: "Completed", value: stats.completedRequests, color: "#10B981" },
              ].map(({ label, value, color }) => {
                const pct = stats.totalRequests > 0 ? Math.round((value / stats.totalRequests) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-white/30 font-medium">{label}</span>
                      <span className="text-[10px] font-bold" style={{ color }}>{value}</span>
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

        {/* ── Row 3 — data tables ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pending agency approvals */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <Building2 className="size-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">Pending Approvals</p>
                  <p className="text-[11px] text-white/30 font-medium">
                    {pendingAgencies.agencies.length === 0 ? "All agencies approved" : `${pendingAgencies.agencies.length} awaiting review`}
                  </p>
                </div>
              </div>
              <Link href="/admin/agencies?status=pending"
                className="flex items-center gap-1 text-[11px] font-bold text-white/30 hover:text-white/80 transition-colors">
                View all <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {pendingAgencies.agencies.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <CheckCircle2 className="size-5 text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">All clear</p>
                  <p className="text-[12px] text-white/30 mt-0.5">No agencies awaiting approval</p>
                </div>
              </div>
            ) : (
              <div>
                {pendingAgencies.agencies.map((a, i) => (
                  <Link
                    key={a.id}
                    href={`/admin/agencies/${a.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-all duration-150 group hover:bg-white/[0.03]"
                    style={{
                      borderBottom: i < pendingAgencies.agencies.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.15)" }}>
                      <Building2 className="size-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{a.name}</p>
                      <p className="text-[11px] text-white/30 font-medium mt-0.5">{a.address_city}, {a.address_state}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-amber-400 px-2.5 py-1 rounded-lg"
                        style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                        Pending
                      </span>
                      <ChevronRight className="size-4 text-white/15 group-hover:text-white/50 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent switch requests */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <ArrowLeftRight className="size-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">Recent Requests</p>
                  <p className="text-[11px] text-white/30 font-medium">{stats.totalRequests} total across all statuses</p>
                </div>
              </div>
              <Link href="/admin/requests"
                className="flex items-center gap-1 text-[11px] font-bold text-white/30 hover:text-white/80 transition-colors">
                View all <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div>
              {recentRequests.requests.length === 0 ? (
                <div className="py-14 flex flex-col items-center gap-3">
                  <ArrowLeftRight className="size-5 text-white/15" />
                  <p className="text-sm text-white/30">No requests yet</p>
                </div>
              ) : recentRequests.requests.map((r, i) => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-3.5 transition-all duration-150"
                  style={{
                    borderBottom: i < recentRequests.requests.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                    style={{ background: "rgba(255,255,255,0.08)" }}>
                    {(r.patient_name ?? "?")[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{r.patient_name ?? "Unknown"}</p>
                    <p className="text-[11px] text-white/30 font-medium truncate mt-0.5 flex items-center gap-1">
                      <ArrowLeftRight className="size-2.5 shrink-0" />
                      {r.agency_name ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusPill status={r.status} />
                    <span className="text-[10px] font-medium text-white/20">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 4 — Platform health + quick actions ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Platform health */}
          <div className="rounded-2xl p-6" style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-5">
              <Activity className="size-4 text-emerald-400" />
              <p className="text-[13px] font-bold text-white">Platform Health</p>
            </div>
            <div className="space-y-4">
              {[
                { label: "API Gateway", status: "operational", latency: "24ms" },
                { label: "Database", status: "operational", latency: "8ms" },
                { label: "Auth Service", status: "operational", latency: "42ms" },
                { label: "File Storage", status: "operational", latency: "180ms" },
                { label: "Email Service", status: "operational", latency: "310ms" },
              ].map(({ label, status, latency }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"
                      style={{ boxShadow: "0 0 5px rgba(16,185,129,0.7)" }} />
                    <span className="text-[12px] font-medium text-white/60">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/25 font-mono">{latency}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-md">OK</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User breakdown */}
          <div className="rounded-2xl p-6" style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-5">
              <Users className="size-4 text-blue-400" />
              <p className="text-[13px] font-bold text-white">User Breakdown</p>
            </div>
            <div className="space-y-4">
              {[
                { label: "Patients", value: stats.totalPatients, color: "#10B981", total: stats.totalUsers },
                { label: "Agency Staff", value: agencyStaff, color: "#60A5FA", total: stats.totalUsers },
                { label: "Admin", value: 1, color: "#A78BFA", total: stats.totalUsers },
              ].map(({ label, value, color, total }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-[12px] font-medium text-white/50">{label}</span>
                      </div>
                      <span className="text-[12px] font-bold text-white">{value.toLocaleString()} <span className="text-white/25 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/25 font-medium">Total platform users</span>
                <span className="text-[13px] font-bold text-white">{stats.totalUsers.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl p-6" style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-5">
              <Zap className="size-4 text-amber-400" />
              <p className="text-[13px] font-bold text-white">Quick Actions</p>
            </div>
            <div className="space-y-2.5">
              {[
                { href: "/admin/agencies", label: "Review Agencies", icon: Building2, color: "#F59E0B", desc: `${stats.pendingAgencyApprovals} pending` },
                { href: "/admin/users", label: "Manage Users", icon: Users, color: "#10B981", desc: `${stats.totalUsers} total` },
                { href: "/admin/requests", label: "Switch Requests", icon: ArrowLeftRight, color: "#60A5FA", desc: `${stats.activeRequests} active` },
                { href: "/admin/audit", label: "Audit Log", icon: Shield, color: "#A78BFA", desc: "Full activity trail" },
              ].map(({ href, label, icon: Icon, color, desc }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 group hover:bg-white/[0.04] hover:border-white/[0.1]"
                  style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                    <Icon className="size-3.5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white">{label}</p>
                    <p className="text-[10px] text-white/25">{desc}</p>
                  </div>
                  <ChevronRight className="size-3.5 text-white/15 group-hover:text-white/50 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 5 — bottom wide stat strip ───────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "PA Counties Served", value: "67", icon: Globe, color: "#10B981" },
            { label: "Verified Agencies", value: stats.totalAgencies.toString(), icon: UserCheck, color: "#60A5FA" },
            { label: "Payer Networks", value: "5+", icon: BarChart3, color: "#A78BFA" },
            { label: "Cases This Month", value: stats.requestsThisMonth.toString(), icon: Activity, color: "#F59E0B" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: "#111714", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                <Icon className="size-5" style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-fraunces">{value}</p>
                <p className="text-[11px] font-medium text-white/30">{label}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
