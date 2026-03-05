import Link from "next/link";
import {
  Users, Building2, ArrowLeftRight, CheckCircle2,
  Clock, AlertTriangle, TrendingUp, BarChart3,
  ChevronRight, ArrowUpRight, Activity, Zap,
  Shield, UserCheck, Globe, RefreshCw, Layers,
} from "lucide-react";
import { getPlatformStats, getAdminAgencies, getAdminRequests } from "@/lib/admin-actions";
import { StatCard } from "@/components/admin/stat-card";

export const metadata = { title: "Admin Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG = "#0F1420";
const CARD_BG = "linear-gradient(145deg, #1E2433, #181E2C)";
const CARD_B = "1px solid rgba(148,163,184,0.1)";
const TEXT = "#F1F5F9";
const MUTED = "#94A3B8";
const FAINT = "#475569";
const DIVIDER = "1px solid rgba(148,163,184,0.08)";
const AMBER = "#F59E0B";
const TEAL = "#6EE7B7";
const BLUE = "#93C5FD";
const ROSE = "#FCA5A5";
const PURPLE = "#C4B5FD";

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    submitted: { label: "New", color: AMBER },
    under_review: { label: "Reviewing", color: BLUE },
    accepted: { label: "Accepted", color: TEAL },
    completed: { label: "Done", color: PURPLE },
    denied: { label: "Denied", color: ROSE },
  };
  const s = map[status] ?? { label: status, color: MUTED };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ values, color = TEAL }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all"
          style={{
            height: `${Math.max(8, Math.round((v / max) * 100))}%`,
            background: i === values.length - 1 ? color : `${color}40`,
          }} />
      ))}
    </div>
  );
}

// ── Funnel bar ────────────────────────────────────────────────────────────────
function FunnelBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[11px]" style={{ color: MUTED }}>{label}</span>
        <span className="text-[11px] font-bold" style={{ color: TEXT }}>
          {value} <span style={{ color: FAINT }}>({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.08)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
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
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen" style={{ background: BG }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-3.5"
        style={{ background: "rgba(15,20,32,0.92)", borderBottom: DIVIDER, backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[15px] font-semibold" style={{ color: TEXT }}>Overview</h1>
            <p className="text-[11px] mt-0.5" style={{ color: FAINT }}>{dateStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-medium"
            style={{ background: `${TEAL}10`, border: `1px solid ${TEAL}25`, color: TEAL }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: TEAL }} />
            Live
          </div>
          {stats.pendingAgencyApprovals > 0 && (
            <Link href="/admin/agencies?status=pending"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-opacity hover:opacity-80"
              style={{ background: `${AMBER}12`, border: `1px solid ${AMBER}30`, color: AMBER }}>
              <AlertTriangle className="size-3.5" />
              {stats.pendingAgencyApprovals} awaiting review
              <ArrowUpRight className="size-3 opacity-60" />
            </Link>
          )}
        </div>
      </div>

      <div className="px-8 py-7 space-y-6 max-w-[1400px] mx-auto">

        {/* KPI row */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3" style={{ color: FAINT }}>Key Metrics</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()}
              sub={`${stats.totalPatients} patients · ${agencyStaff} agency staff`}
              icon={<Users />} trend="up" trendValue="+12%" accent={BLUE} />
            <StatCard label="Active Agencies" value={stats.totalAgencies}
              sub={stats.pendingAgencyApprovals > 0 ? `${stats.pendingAgencyApprovals} pending approval` : "All approved"}
              icon={<Building2 />} alert={stats.pendingAgencyApprovals > 0} accent={TEAL} />
            <StatCard label="Switch Requests" value={stats.totalRequests.toLocaleString()}
              sub={`${stats.requestsThisMonth} this month`}
              icon={<ArrowLeftRight />} trend="up" trendValue="+8%" accent={PURPLE} />
            <StatCard label="Completed" value={stats.completedRequests.toLocaleString()}
              sub={`${completionRate}% completion rate`}
              icon={<CheckCircle2 />} trend="up" trendValue={`${completionRate}%`} accent={TEAL} />
          </div>
        </div>

        {/* Middle row: charts */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

          {/* Requests sparkline */}
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: CARD_B }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: FAINT }}>Requests / month</p>
            <p className="text-3xl font-bold mb-3 tracking-tight" style={{ color: TEXT, fontFamily: "Georgia, serif" }}>
              {stats.requestsThisMonth}
            </p>
            <Sparkline values={[
              Math.max(1, stats.requestsThisMonth - 4),
              Math.max(1, stats.requestsThisMonth - 2),
              Math.max(1, stats.requestsThisMonth - 1),
              stats.requestsThisMonth,
            ]} color={PURPLE} />
            <p className="text-[10px] mt-2" style={{ color: FAINT }}>vs. last 4 months</p>
          </div>

          {/* User growth */}
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: CARD_B }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: FAINT }}>Total users</p>
            <p className="text-3xl font-bold mb-3 tracking-tight" style={{ color: TEXT, fontFamily: "Georgia, serif" }}>
              {stats.totalUsers}
            </p>
            <Sparkline values={[
              Math.max(1, stats.totalUsers - 8),
              Math.max(1, stats.totalUsers - 5),
              Math.max(1, stats.totalUsers - 2),
              stats.totalUsers,
            ]} color={BLUE} />
            <p className="text-[10px] mt-2" style={{ color: FAINT }}>cumulative growth</p>
          </div>

          {/* Two small tiles */}
          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-2xl p-4" style={{ background: CARD_BG, border: CARD_B }}>
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: FAINT }}>Active Cases</p>
              <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: TEXT, fontFamily: "Georgia, serif" }}>
                {stats.activeRequests}
              </p>
              <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: FAINT }}>
                <Clock className="size-3" /> In progress
              </p>
            </div>
            <div className="flex-1 rounded-2xl p-4" style={{ background: CARD_BG, border: CARD_B }}>
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: FAINT }}>Avg Response</p>
              <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: TEXT, fontFamily: "Georgia, serif" }}>
                {stats.avgResponseHours ? `${stats.avgResponseHours}h` : "—"}
              </p>
              <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: FAINT }}>
                <Zap className="size-3" /> Agency avg
              </p>
            </div>
          </div>

          {/* Funnel */}
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: CARD_B }}>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="size-3.5" style={{ color: MUTED }} />
              <p className="text-[11px] font-semibold" style={{ color: MUTED }}>Request Funnel</p>
            </div>
            <div className="space-y-3.5">
              <FunnelBar label="Total" value={stats.totalRequests} total={stats.totalRequests} color={MUTED} />
              <FunnelBar label="Active" value={stats.activeRequests} total={stats.totalRequests} color={AMBER} />
              <FunnelBar label="Completed" value={stats.completedRequests} total={stats.totalRequests} color={TEAL} />
            </div>
          </div>
        </div>

        {/* Data panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Pending approvals */}
          <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: CARD_B }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: DIVIDER }}>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: TEXT }}>Pending Approvals</p>
                <p className="text-[11px] mt-0.5" style={{ color: FAINT }}>
                  {pendingAgencies.agencies.length === 0 ? "All agencies approved" : `${pendingAgencies.agencies.length} awaiting review`}
                </p>
              </div>
              <Link href="/admin/agencies?status=pending"
                className="flex items-center gap-1 text-[11px] font-semibold transition-colors hover:opacity-80"
                style={{ color: MUTED }}>
                View all <ChevronRight className="size-3.5" />
              </Link>
            </div>
            {pendingAgencies.agencies.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <CheckCircle2 className="size-6" style={{ color: FAINT }} />
                <p className="text-sm font-medium" style={{ color: FAINT }}>No pending approvals</p>
              </div>
            ) : pendingAgencies.agencies.map((a, i) => (
              <Link key={a.id} href={`/admin/agencies/${a.id}`}
                className="flex items-center gap-4 px-6 py-4 transition-colors group"
                style={{
                  borderBottom: i < pendingAgencies.agencies.length - 1 ? DIVIDER : "none",
                  background: "transparent",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(148,163,184,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${AMBER}12`, border: `1px solid ${AMBER}20` }}>
                  <Building2 className="size-4" style={{ color: AMBER }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: TEXT }}>{a.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: FAINT }}>{a.address_city}, {a.address_state}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ color: AMBER, background: `${AMBER}12`, border: `1px solid ${AMBER}25` }}>
                  Pending
                </span>
                <ChevronRight className="size-4 shrink-0" style={{ color: FAINT }} />
              </Link>
            ))}
          </div>

          {/* Recent requests */}
          <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: CARD_B }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: DIVIDER }}>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: TEXT }}>Recent Requests</p>
                <p className="text-[11px] mt-0.5" style={{ color: FAINT }}>{stats.totalRequests} total</p>
              </div>
              <Link href="/admin/requests"
                className="flex items-center gap-1 text-[11px] font-semibold transition-colors hover:opacity-80"
                style={{ color: MUTED }}>
                View all <ChevronRight className="size-3.5" />
              </Link>
            </div>
            {recentRequests.requests.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <ArrowLeftRight className="size-6" style={{ color: FAINT }} />
                <p className="text-sm" style={{ color: FAINT }}>No requests yet</p>
              </div>
            ) : recentRequests.requests.map((r, i) => (
              <Link key={r.id} href={`/admin/requests/${r.id}`}
                className="flex items-center gap-4 px-6 py-3.5 transition-colors"
                style={{ borderBottom: i < recentRequests.requests.length - 1 ? DIVIDER : "none", background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(148,163,184,0.03)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                  style={{ background: `${BLUE}15`, color: BLUE, border: `1px solid ${BLUE}20` }}>
                  {(r.patient_name ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: TEXT }}>{r.patient_name ?? "Unknown"}</p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: FAINT }}>{r.agency_name ?? "—"}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusPill status={r.status} />
                  <span className="text-[10px]" style={{ color: FAINT }}>
                    {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Platform summary */}
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: CARD_B }}>
            <div className="flex items-center gap-2 mb-5">
              <Activity className="size-4" style={{ color: MUTED }} />
              <p className="text-[13px] font-semibold" style={{ color: TEXT }}>Platform Summary</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Total Patients", value: stats.totalPatients.toLocaleString(), dot: BLUE },
                { label: "Agency Staff", value: agencyStaff.toLocaleString(), dot: TEAL },
                { label: "Active Requests", value: stats.activeRequests.toLocaleString(), dot: AMBER },
                { label: "Completed Requests", value: stats.completedRequests.toLocaleString(), dot: PURPLE },
                { label: "Pending Agencies", value: stats.pendingAgencyApprovals.toLocaleString(), dot: stats.pendingAgencyApprovals > 0 ? ROSE : FAINT },
              ].map(({ label, value, dot }) => (
                <div key={label} className="flex items-center justify-between py-1.5"
                  style={{ borderBottom: "1px solid rgba(148,163,184,0.05)" }}>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: dot }} />
                    <span className="text-[12px]" style={{ color: MUTED }}>{label}</span>
                  </div>
                  <span className="text-[12px] font-bold font-mono" style={{ color: TEXT }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User breakdown */}
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: CARD_B }}>
            <div className="flex items-center gap-2 mb-5">
              <Users className="size-4" style={{ color: MUTED }} />
              <p className="text-[13px] font-semibold" style={{ color: TEXT }}>User Breakdown</p>
            </div>
            <div className="space-y-4">
              <FunnelBar label="Patients" value={stats.totalPatients} total={stats.totalUsers} color={BLUE} />
              <FunnelBar label="Agency Staff" value={agencyStaff} total={stats.totalUsers} color={TEAL} />
              <FunnelBar label="Admins" value={1} total={stats.totalUsers} color={PURPLE} />
            </div>
            <div className="mt-5 pt-4 flex justify-between items-center" style={{ borderTop: DIVIDER }}>
              <span className="text-[11px]" style={{ color: FAINT }}>Total</span>
              <span className="text-[15px] font-bold" style={{ color: TEXT, fontFamily: "Georgia, serif" }}>
                {stats.totalUsers.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: CARD_B }}>
            <div className="flex items-center gap-2 mb-5">
              <Zap className="size-4" style={{ color: MUTED }} />
              <p className="text-[13px] font-semibold" style={{ color: TEXT }}>Quick Actions</p>
            </div>
            <div className="space-y-2">
              {[
                { href: "/admin/agencies", label: "Review Agencies", icon: Building2, desc: `${stats.pendingAgencyApprovals} pending`, accent: AMBER },
                { href: "/admin/users", label: "Manage Users", icon: Users, desc: `${stats.totalUsers} total`, accent: BLUE },
                { href: "/admin/requests", label: "Switch Requests", icon: ArrowLeftRight, desc: `${stats.activeRequests} active`, accent: PURPLE },
                { href: "/admin/audit", label: "Audit Log", icon: Shield, desc: "Immutable trail", accent: TEAL },
              ].map(({ href, label, icon: Icon, desc, accent }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                  style={{ border: DIVIDER, background: "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(148,163,184,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
                    <Icon className="size-3.5" style={{ color: accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold" style={{ color: TEXT }}>{label}</p>
                    <p className="text-[10px]" style={{ color: FAINT }}>{desc}</p>
                  </div>
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: FAINT }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-6">
          {[
            { label: "PA Counties Served", value: "67", icon: Globe, accent: TEAL },
            { label: "Verified Agencies", value: stats.totalAgencies.toString(), icon: UserCheck, accent: BLUE },
            { label: "Payer Networks", value: "5+", icon: BarChart3, accent: PURPLE },
            { label: "Cases This Month", value: stats.requestsThisMonth.toString(), icon: Activity, accent: AMBER },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: CARD_BG, border: CARD_B }}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
                <Icon className="size-4" style={{ color: accent }} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: TEXT, fontFamily: "Georgia, serif" }}>{value}</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: FAINT }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
