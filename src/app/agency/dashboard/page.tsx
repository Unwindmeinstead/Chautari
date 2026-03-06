import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData, acceptSwitchRequest, denySwitchRequest } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { AdminPreviewBanner } from "@/components/admin/admin-preview-banner";
import { AcceptingPatientsToggle } from "@/components/agency/accepting-patients-toggle";
import {
  Activity, AlertTriangle, ArrowRight, Bell, CheckCircle2,
  Clock, ClipboardCheck, MessageSquare, Settings, Users,
  Building2, TrendingUp, Zap, ChevronRight,
} from "lucide-react";

export const metadata = { title: "Agency Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

// ── Design tokens ──────────────────────────────────────────────────────────
const BG = "bg-slate-50";
const CARD = "rounded-2xl border border-zinc-200 bg-white shadow-sm";

// ── Helpers ────────────────────────────────────────────────────────────────
function hoursSince(ts?: string | null) {
  if (!ts) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 3_600_000));
}

// ── Metric card ────────────────────────────────────────────────────────────
interface MetricProps {
  label: string; value: string | number; sub: string;
  icon: ReactNode; accent?: string; alert?: boolean;
}
function MetricCard({ label, value, sub, icon, accent = "#3F3F46", alert }: MetricProps) {
  return (
    <div className={`${CARD} p-4 lg:p-5 relative overflow-hidden`}>
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
          <p className="mt-2 text-[2rem] leading-none font-bold text-zinc-900 tracking-tight">{value}</p>
          <p className="mt-1.5 text-[11px] text-zinc-400">{sub}</p>
        </div>
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
          {icon}
        </div>
      </div>
      {alert && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
      )}
    </div>
  );
}

// ── Urgency badge ──────────────────────────────────────────────────────────
function UrgencyBadge({ hrs }: { hrs: number }) {
  if (hrs >= 48) return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />48h+</span>;
  if (hrs >= 24) return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />24h+</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />New</span>;
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function AgencyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const viewAs = cookieStore.get("chautari_view_as")?.value;

  let { agency, member, requests, stats } = await getAgencyPortalData();

  if (!agency && viewAs === "agency") {
    agency = {
      id: "preview", name: "Demo Home Care Agency", dba_name: "Demo Care",
      address_city: "Pittsburgh", address_state: "PA",
      phone: "(412) 555-0100", email: "demo@agency.com", website: null,
      care_types: ["home_health", "home_care"], payers_accepted: ["medicaid", "medicare"],
      services_offered: ["skilled_nursing", "home_health_aide", "personal_care"],
      languages_spoken: ["English"], service_counties: ["Allegheny"],
      is_verified_partner: true, is_accepting_patients: true,
      average_response_time_hours: 4, medicare_quality_score: 4.2,
      pa_license_number: "PA-DEMO-001",
    };
    member = { id: "preview-member", role: "admin", title: "Agency Admin" };
  }

  if (!agency || !member) {
    return (
      <div className={`min-h-screen ${BG} p-6`}>
        <div className="max-w-md mx-auto mt-16 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <Building2 className="size-6 text-zinc-400" />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900">No Agency Linked</h1>
          <p className="text-sm text-zinc-500 mt-2">Your account isn&apos;t associated with an agency yet.</p>
          <a href="/api/auth/signout" className="inline-flex mt-6 h-10 px-5 rounded-xl bg-zinc-900 text-white text-sm font-medium items-center gap-2">
            Sign out
          </a>
        </div>
      </div>
    );
  }

  const staffName = user?.email?.split("@")[0] ?? "Staff";
  const isAdmin = ["admin", "owner"].includes(member.role);

  const submitted = requests.filter((r) => r.status === "submitted");
  const pending = requests.filter((r) => ["submitted", "under_review"].includes(r.status));
  const active = requests.filter((r) => r.status === "accepted");

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const completedThisMonth = requests.filter((r) =>
    r.status === "completed" && new Date(r.updated_at) >= monthStart
  ).length;

  const last30 = Date.now() - 30 * 24 * 3600000;
  const responded = requests.filter((r) =>
    ["under_review", "accepted", "denied", "completed"].includes(r.status) &&
    new Date(r.updated_at).getTime() >= last30
  );
  const avgResponseHours = responded.length
    ? Math.round(responded.reduce((acc, r) =>
      acc + hoursSince(r.submitted_at ?? r.created_at), 0) / responded.length)
    : null;

  const last90 = Date.now() - 90 * 24 * 3600000;
  const decisionPool = requests.filter((r) =>
    ["accepted", "denied"].includes(r.status) && new Date(r.updated_at).getTime() >= last90
  );
  const acceptanceRate = decisionPool.length
    ? Math.round((decisionPool.filter((r) => r.status === "accepted").length / decisionPool.length) * 100)
    : null;

  const unreadNotifications = user
    ? ((await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null)).count ?? 0)
    : 0;

  const sortedUrgent = pending
    .slice()
    .sort((a, b) => {
      const ah = hoursSince(a.submitted_at ?? a.created_at);
      const bh = hoursSince(b.submitted_at ?? b.created_at);
      if (ah !== bh) return bh - ah;
      const ad = a.requested_start_date ? new Date(a.requested_start_date).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.requested_start_date ? new Date(b.requested_start_date).getTime() : Number.MAX_SAFE_INTEGER;
      return ad - bd;
    })
    .slice(0, 8);

  const profileChecks = [
    { label: "Phone number", ok: !!agency.phone },
    { label: "Website", ok: !!agency.website },
    { label: "Service counties", ok: (agency.service_counties ?? []).length > 0 },
    { label: "Services offered", ok: (agency.services_offered ?? []).length > 0 },
    { label: "Languages", ok: (agency.languages_spoken ?? []).length > 0 },
    { label: "Email", ok: !!agency.email },
  ];
  const profileScore = Math.round((profileChecks.filter(c => c.ok).length / profileChecks.length) * 100);

  async function quickAccept(formData: FormData) {
    "use server";
    const id = String(formData.get("request_id") || "");
    if (id) { await acceptSwitchRequest(id, "Accepted via dashboard."); revalidatePath("/agency/dashboard"); }
  }
  async function quickDecline(formData: FormData) {
    "use server";
    const id = String(formData.get("request_id") || "");
    if (id) { await denySwitchRequest(id, "Currently unable to accept."); revalidatePath("/agency/dashboard"); }
  }

  return (
    <div className={`min-h-screen ${BG} pb-20 sm:pb-10`}>
      {viewAs && <AdminPreviewBanner viewingAs={viewAs} />}

      <AgencyNav
        agencyName={agency.name}
        staffName={staffName}
        staffRole={member.role}
        pendingCount={stats.pending}
        unreadNotifications={unreadNotifications}
      />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <section className={`${CARD} p-5 lg:p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1">
                  Agency Portal
                </span>
                {agency.is_verified_partner && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Verified Partner
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-2.5 truncate">{agency.name}</h1>
              <p className="text-sm text-zinc-500 mt-1">
                {staffName} · <span className="capitalize">{member.role}</span>
                {pending.length > 0 && (
                  <> · <span className="text-amber-600 font-medium">{pending.length} action{pending.length !== 1 ? "s" : ""} needed</span></>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
              <AcceptingPatientsToggle initialValue={agency.is_accepting_patients} isAdmin={isAdmin} />
              <Link href="/agency/notifications" className="h-9 px-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-700 inline-flex items-center gap-2 hover:bg-zinc-50 transition-colors">
                <Bell className="size-4" />
                <span className="hidden sm:inline">Alerts</span>
                {unreadNotifications > 0 && (
                  <span className="text-[10px] rounded-full px-1.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 font-bold">{unreadNotifications}</span>
                )}
              </Link>
              <Link href="/agency/requests?filter=submitted" className="h-9 px-4 rounded-xl bg-zinc-900 text-white text-sm font-medium inline-flex items-center gap-2 hover:bg-zinc-800 transition-colors">
                <span className="hidden sm:inline">Review Queue</span>
                <span className="sm:hidden">Queue</span>
                <ArrowRight className="size-4" />
              </Link>
              {isAdmin && (
                <Link href="/agency/profile" className="h-9 w-9 rounded-xl border border-zinc-200 bg-white inline-flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors">
                  <Settings className="size-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── Metrics ────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="New" value={submitted.length}
            sub="Unread queue" icon={<ClipboardCheck className="size-4" style={{ color: "#E11D48" }} />}
            accent="#E11D48" alert={submitted.length > 0} />
          <MetricCard label="Pending" value={pending.length}
            sub={pending.length > 3 ? "Needs attention" : "On track"}
            icon={<Clock className="size-4" style={{ color: "#D97706" }} />} accent="#D97706" alert={pending.length > 3} />
          <MetricCard label="Active" value={active.length}
            sub="In progress" icon={<Activity className="size-4" style={{ color: "#0EA5E9" }} />} accent="#0EA5E9" />
          <MetricCard label="Completed" value={completedThisMonth}
            sub="This month" icon={<CheckCircle2 className="size-4" style={{ color: "#10B981" }} />} accent="#10B981" />
          <MetricCard label="Avg Response" value={avgResponseHours !== null ? `${avgResponseHours}h` : "—"}
            sub="Rolling 30 days" icon={<Zap className="size-4" style={{ color: "#8B5CF6" }} />} accent="#8B5CF6" />
          <MetricCard label="Acceptance" value={acceptanceRate !== null ? `${acceptanceRate}%` : "—"}
            sub="Last 90 days" icon={<TrendingUp className="size-4" style={{ color: "#10B981" }} />} accent="#10B981" />
        </section>

        {/* ── Main panels ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Request pipeline */}
          <section className={`${CARD} lg:col-span-2`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div>
                <h2 className="text-[14px] font-semibold text-zinc-900">Request Pipeline</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Sorted by urgency — oldest first</p>
              </div>
              <Link href="/agency/requests" className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors">
                All requests <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {sortedUrgent.length === 0 ? (
              <div className="p-10 text-center">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="size-6 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-900">All caught up!</p>
                <p className="text-xs text-zinc-400 mt-1">No pending requests. Keep your profile complete to receive more matches.</p>
                <Link href="/agency/profile" className="inline-flex mt-4 text-xs font-medium text-zinc-600 underline">Review agency profile</Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {sortedUrgent.map((r) => {
                  const hrs = hoursSince(r.submitted_at ?? r.created_at);
                  return (
                    <div key={r.id} className="px-5 py-4 hover:bg-zinc-50/70 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-semibold text-zinc-900">
                              {(r.patient?.full_name ?? "Patient").split(" ")[0]}
                            </p>
                            <span className="text-[11px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full capitalize">
                              {r.care_type?.replace("_", " ")}
                            </span>
                            <UrgencyBadge hrs={hrs} />
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-[11px] text-zinc-400">
                              {r.patient_details?.payer_type?.toUpperCase() ?? "Unknown payer"}
                            </span>
                            {r.patient_details?.address_county && (
                              <span className="text-[11px] text-zinc-400">{r.patient_details.address_county}</span>
                            )}
                            {r.requested_start_date && (
                              <span className="text-[11px] text-zinc-400">
                                Starts {new Date(r.requested_start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
                          <form action={quickAccept}>
                            <input type="hidden" name="request_id" value={r.id} />
                            <button className="h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                              Accept
                            </button>
                          </form>
                          <form action={quickDecline}>
                            <input type="hidden" name="request_id" value={r.id} />
                            <button className="h-8 px-3 rounded-lg text-xs font-semibold border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 transition-colors">
                              Decline
                            </button>
                          </form>
                          <Link href={`/agency/requests/${r.id}`} className="h-8 px-3 rounded-lg text-xs font-semibold border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 transition-colors inline-flex items-center">
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right column */}
          <div className="space-y-4">

            {/* Profile health */}
            <section className={CARD}>
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-zinc-900">Profile Health</h3>
                <Link href="/agency/profile" className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                  Improve
                </Link>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold text-zinc-900 tracking-tight">{profileScore}%</span>
                  {profileScore === 100 && <span className="text-[11px] font-semibold text-emerald-600 mb-1">Complete</span>}
                </div>
                <div className="h-2 rounded-full bg-zinc-100 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${profileScore}%`,
                      background: profileScore >= 80 ? "#10B981" : profileScore >= 50 ? "#F59E0B" : "#EF4444",
                    }}
                  />
                </div>
                {profileChecks.filter(c => !c.ok).length > 0 ? (
                  <div className="space-y-1.5">
                    {profileChecks.filter(c => !c.ok).slice(0, 3).map(c => (
                      <div key={c.label} className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                        <AlertTriangle className="size-3 shrink-0" /> Missing: {c.label}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-600 font-medium">All fields complete ✓</p>
                )}
                <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    {agency.is_verified_partner ? "✓ Verified partner" : "Not yet verified"}
                  </span>
                  {agency.medicare_quality_score && (
                    <span className="text-[11px] font-medium text-zinc-600">★ {agency.medicare_quality_score}</span>
                  )}
                </div>
              </div>
            </section>

            {/* Quick links */}
            <section className={CARD}>
              <div className="px-5 py-4 border-b border-zinc-100">
                <h3 className="text-[14px] font-semibold text-zinc-900">Quick Links</h3>
              </div>
              <div className="p-3 space-y-1">
                {[
                  { href: "/agency/messages", label: "Messaging", icon: MessageSquare, count: 0 },
                  { href: "/agency/team", label: "Team Management", icon: Users, count: 0 },
                  { href: "/agency/settings", label: "Settings", icon: Settings, count: 0 },
                  { href: "/agency/requests", label: "All Requests", icon: ClipboardCheck, count: requests.length },
                ].map(({ href, label, icon: Icon, count }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
                  >
                    <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                      <Icon className="size-3.5 text-zinc-500" />
                    </div>
                    <span className="text-[13px] text-zinc-700 flex-1">{label}</span>
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-full">{count}</span>
                    )}
                    <ChevronRight className="size-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
