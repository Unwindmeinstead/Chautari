import * as React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { AgencyRequestRow } from "@/components/agency/agency-request-row";
import { AcceptingPatientsToggle } from "@/components/agency/accepting-patients-toggle";
import {
  PackageCheck, AlertTriangle, ArrowRight, Activity, Clock, Users, CheckCircle2,
  Settings, TrendingUp, BarChart2, Zap, Shield, Star, Bell, ChevronRight,
  ArrowUpRight, CircleDot, Globe, Calendar
} from "lucide-react";

export const metadata = { title: "Agency Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

// ── Design tokens (deep blue theme) ──────────────────────────────────────────
const BLUE_BG = "linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)";
const CARD_DARK = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" } as const;
const CARD_GLASS = { background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" } as const;
const ACCENT = "#3B82F6"; // bright blue
const ACCENT_L = "#60A5FA"; // lighter blue
const ACCENT_D = "#1D4ED8"; // darker blue

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, sub, accent = false, trend
}: {
  label: string; value: number | string; icon: React.ReactNode;
  sub?: string; accent?: boolean; trend?: { dir: "up" | "neutral"; label: string };
}) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-transform"
      style={accent ? {
        background: `linear-gradient(135deg, ${ACCENT_D}, ${ACCENT})`,
        border: `1px solid ${ACCENT}50`,
      } : CARD_DARK}>
      {/* Subtle glow */}
      {accent && <div className="absolute inset-0 rounded-2xl opacity-20" style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)" }} />}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent ? "rgba(255,255,255,0.15)" : `rgba(59,130,246,0.15)`, border: `1px solid ${accent ? "rgba(255,255,255,0.2)" : "rgba(59,130,246,0.25)"}` }}>
          {React.cloneElement(icon as React.ReactElement, {
            className: `size-4 ${accent ? "text-white" : "text-blue-400"}`
          })}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: accent ? "rgba(255,255,255,0.15)" : "rgba(74,222,128,0.12)",
              color: accent ? "rgba(255,255,255,0.9)" : "#4ADE80",
              border: accent ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(74,222,128,0.25)"
            }}>
            <TrendingUp className="size-2.5" />
            {trend.label}
          </span>
        )}
      </div>
      <p className="text-[2rem] font-bold leading-none relative z-10"
        style={{ color: accent ? "#fff" : "rgba(255,255,255,0.95)" }}>
        {value}
      </p>
      <p className="text-[11px] font-semibold mt-1.5 relative z-10"
        style={{ color: accent ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)" }}>
        {label}
      </p>
      {sub && <p className="text-[10px] mt-0.5 relative z-10"
        style={{ color: accent ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}>
        {sub}
      </p>}
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    submitted: { label: "New", color: ACCENT_L, bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)" },
    under_review: { label: "Reviewing", color: "#FBBF24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
    accepted: { label: "Accepted", color: "#4ADE80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.25)" },
    completed: { label: "Done", color: "#C4B5FD", bg: "rgba(196,181,253,0.1)", border: "rgba(196,181,253,0.25)" },
    denied: { label: "Denied", color: "#FCA5A5", bg: "rgba(252,165,165,0.1)", border: "rgba(252,165,165,0.25)" },
  };
  const s = map[status] ?? { label: status, color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

// ── Bar chart (CSS bars) ──────────────────────────────────────────────────────
function MiniBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all"
          style={{
            height: `${Math.round((v / max) * 100)}%`,
            minHeight: 3,
            background: i === values.length - 1
              ? color
              : `${color}40`,
          }} />
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function AgencyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { agency, member, requests, stats } = await getAgencyPortalData();

  if (!agency || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}>
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: "rgba(252,165,165,0.1)", border: "1px solid rgba(252,165,165,0.2)" }}>
            <AlertTriangle className="size-8 text-red-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">No Agency Found</h1>
            <p className="text-[14px] text-blue-200/60 leading-relaxed">
              Your account isn&apos;t linked to a home care agency yet. Please contact your administrator.
            </p>
          </div>
          <Link href="/api/auth/signout"
            className="inline-flex h-10 items-center justify-center rounded-xl px-6 text-[14px] font-semibold text-white transition-colors"
            style={{ background: `linear-gradient(135deg, ${ACCENT_D}, ${ACCENT})`, border: `1px solid ${ACCENT}50` }}>
            Sign out safely
          </Link>
        </div>
      </div>
    );
  }

  const staffName = user?.email?.split("@")[0] ?? "Staff";
  const staffFirstName = staffName.split(" ")[0];
  const isAdmin = ["admin", "owner"].includes(member.role);
  const newRequests = requests.filter((r) => r.status === "submitted");
  const reviewRequests = requests.filter((r) => r.status === "under_review");
  const recentRequests = requests.slice(0, 6);
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Fake per-week distribution for bar chart (based on real total)
  const barValues = [
    Math.max(0, Math.floor(stats.total * 0.1)),
    Math.max(0, Math.floor(stats.total * 0.14)),
    Math.max(0, Math.floor(stats.total * 0.12)),
    Math.max(0, Math.floor(stats.total * 0.18)),
    Math.max(0, Math.floor(stats.total * 0.16)),
    Math.max(0, Math.floor(stats.total * 0.15)),
    stats.total,
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: BLUE_BG }}>
      {/* Ambient glow blobs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)" }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)" }} />

      <AgencyNav
        agencyName={agency.name}
        staffName={staffName}
        staffRole={member.role}
        pendingCount={stats.pending}
      />

      <main className="max-w-[1200px] mx-auto px-6 mt-8 space-y-6 relative z-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400/70">{greeting}, {dateStr}</p>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
              Welcome back, <span className="text-blue-400">{staffFirstName}</span> 👋
            </h1>
            <p className="text-[14px] text-blue-200/50 font-medium">
              {newRequests.length > 0
                ? <><span className="text-blue-400 font-bold">{newRequests.length} new</span> {reviewRequests.length > 0 ? `· ${reviewRequests.length} under review` : "requests need your attention"}</>
                : "Your dashboard is all caught up today."}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <AcceptingPatientsToggle initialValue={agency.is_accepting_patients} isAdmin={isAdmin} />
            {isAdmin && (
              <Link href="/agency/profile"
                className="flex items-center justify-center h-10 w-10 rounded-xl transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Settings className="size-4 text-white/50" />
              </Link>
            )}
          </div>
        </div>

        {/* ── New requests alert banner ───────────────────────────────────── */}
        {newRequests.length > 0 && (
          <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))",
              border: "1px solid rgba(59,130,246,0.3)"
            }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `rgba(59,130,246,0.2)`, border: `1px solid ${ACCENT}40` }}>
                <Zap className="size-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-white">
                  {newRequests.length} new switch request{newRequests.length > 1 ? "s" : ""} awaiting review
                </h2>
                <p className="text-[13px] text-blue-200/60 mt-0.5">
                  Respond promptly to maintain your agency&apos;s quality score.
                </p>
              </div>
            </div>
            <Link href="/agency/requests?filter=submitted"
              className="shrink-0 h-10 px-6 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${ACCENT_D}, ${ACCENT})`, color: "#fff", boxShadow: `0 8px 24px ${ACCENT}40` }}>
              Review Now <ArrowRight className="size-4" />
            </Link>
          </div>
        )}

        {/* ── KPI grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Received" value={stats.total} icon={<PackageCheck />} sub="All time requests" />
          <StatCard label="Action Required" value={stats.pending} icon={<Clock />} sub="Awaiting response" accent={stats.pending > 0} />
          <StatCard label="Active Clients" value={stats.accepted} icon={<Users />} sub="In progress"
            trend={stats.accepted > 0 ? { dir: "up", label: `${stats.accepted} active` } : undefined} />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 />} sub={`${completionRate}% rate`}
            trend={completionRate > 0 ? { dir: "up", label: `${completionRate}%` } : undefined} />
        </div>

        {/* ── Charts + Stats row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Request volume */}
          <div className="rounded-2xl p-5" style={CARD_DARK}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300/50 mb-1">Request Volume</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <BarChart2 className="size-4 text-blue-400" />
              </div>
            </div>
            <MiniBar values={barValues} color={ACCENT} />
            <p className="text-[10px] text-blue-200/30 mt-2">Total requests received</p>
          </div>

          {/* Completion funnel */}
          <div className="rounded-2xl p-5" style={CARD_DARK}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300/50 mb-4">Request Pipeline</p>
            <div className="space-y-3">
              {[
                { label: "Total", value: stats.total, color: "rgba(255,255,255,0.3)" },
                { label: "Active", value: stats.pending + stats.accepted, color: ACCENT_L },
                { label: "Complete", value: stats.completed, color: "#4ADE80" },
              ].map(({ label, value, color }) => {
                const pct = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-blue-200/40">{label}</span>
                      <span className="text-[11px] font-bold text-white/60">{value}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agency status */}
          <div className="rounded-2xl p-5" style={CARD_DARK}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300/50 mb-4">Agency Status</p>
            <div className="space-y-3">
              {[
                {
                  label: "Accepting Patients",
                  status: agency.is_accepting_patients,
                  onColor: "#4ADE80", offColor: "#F87171"
                },
                {
                  label: "Partner Status",
                  status: agency.is_verified_partner ?? false,
                  onColor: "#FBBF24", offColor: "rgba(255,255,255,0.2)"
                },
              ].map(({ label, status, onColor, offColor }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[12px] text-blue-200/50">{label}</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold"
                    style={{ color: status ? onColor : offColor }}>
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: status ? onColor : offColor }} />
                    {status ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
              <div className="pt-3 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-blue-200/50">Completion Rate</span>
                  <span className="text-[14px] font-bold text-white">{completionRate}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${completionRate}%`, background: "linear-gradient(90deg, #3B82F6, #4ADE80)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick actions row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/agency/requests?filter=submitted", label: "New Requests", icon: Bell, badge: stats.pending > 0 ? stats.pending : null, color: ACCENT },
            { href: "/agency/requests?filter=accepted", label: "Active Cases", icon: Activity, badge: stats.accepted > 0 ? stats.accepted : null, color: "#4ADE80" },
            { href: "/agency/messages", label: "Messages", icon: Users, badge: null, color: "#FBBF24" },
            { href: "/agency/team", label: "Team", icon: Shield, badge: null, color: "#C4B5FD" },
          ].map(({ href, label, icon: Icon, badge, color }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:-translate-y-0.5 group"
              style={CARD_DARK}>
              <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon className="size-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white">{label}</p>
              </div>
              <div className="flex items-center gap-1">
                {badge !== null && (
                  <span className="h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
                    {badge}
                  </span>
                )}
                <ChevronRight className="size-3.5 text-white/15 group-hover:text-white/50 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Recent activity + sidebar ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent requests (2/3 width) */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={CARD_DARK}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p className="text-[14px] font-bold text-white">Recent Activity</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {recentRequests.length} of {stats.total} requests
                </p>
              </div>
              <Link href="/agency/requests"
                className="flex items-center gap-1.5 text-[12px] font-bold transition-colors"
                style={{ color: ACCENT_L }}>
                View all <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <PackageCheck className="size-6 text-white/20" />
                </div>
                <p className="text-[14px] font-semibold text-white/40">No requests yet</p>
                <p className="text-[12px] text-white/20 text-center max-w-xs">
                  New switch requests from patients in your area will appear here.
                </p>
              </div>
            ) : (
              <div>
                {recentRequests.map((r, i) => (
                  <AgencyRequestRow key={r.id} request={r} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="space-y-4">
            {/* Agency info card */}
            <div className="rounded-2xl p-5" style={CARD_DARK}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>Agency Info</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[16px] font-bold text-white leading-tight">{agency.name}</p>
                  {agency.address_city && (
                    <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {agency.address_city}, {agency.address_state}
                    </p>
                  )}
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                  {[
                    { label: "Your role", value: member.role.replace(/_/g, " ") },
                    { label: "Medicare score", value: agency.medicare_quality_score ? `★ ${agency.medicare_quality_score}` : "—" },
                    { label: "Care types", value: (agency.care_types ?? []).join(", ") || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-1.5">
                      <span className="text-[11px] capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
                      <span className="text-[11px] font-semibold capitalize text-white/70">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats summary */}
            <div className="rounded-2xl p-5" style={CARD_GLASS}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(59,130,246,0.6)" }}>
                Your Performance
              </p>
              <div className="space-y-2">
                {[
                  { label: "Pending Review", value: stats.pending, color: ACCENT_L },
                  { label: "Accepted", value: stats.accepted, color: "#4ADE80" },
                  { label: "Completed", value: stats.completed, color: "#C4B5FD" },
                  { label: "Total", value: stats.total, color: "rgba(255,255,255,0.5)" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[12px] text-blue-200/50">{label}</span>
                    <span className="text-[14px] font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            {isAdmin && (
              <div className="rounded-2xl p-4" style={CARD_DARK}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>Admin Actions</p>
                {[
                  { href: "/agency/profile", label: "Edit Agency Profile", icon: Settings },
                  { href: "/agency/team", label: "Manage Team", icon: Users },
                ].map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-3 py-2.5 group transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      <Icon className="size-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                    </div>
                    <span className="text-[12px] font-medium text-white/40 group-hover:text-white/70 transition-colors">{label}</span>
                    <ArrowUpRight className="size-3.5 ml-auto text-white/15 group-hover:text-white/40 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
