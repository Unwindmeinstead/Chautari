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
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = { title: "Agency Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

const CARD = "rounded-2xl border border-zinc-200 bg-white";

function hoursSince(ts?: string | null) {
  if (!ts) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 3_600_000));
}

function MetricCard({ label, value, sub, tone = "zinc", icon }: { label: string; value: number | string; sub: string; tone?: "zinc" | "amber" | "emerald" | "sky" | "rose"; icon: ReactNode }) {
  const toneClasses: Record<string, string> = {
    zinc: "bg-zinc-100 text-zinc-700 border-zinc-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    sky: "bg-sky-100 text-sky-700 border-sky-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <div className={`${CARD} p-4 md:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 font-semibold">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 leading-none">{value}</p>
          <p className="mt-2 text-xs text-zinc-500">{sub}</p>
        </div>
        <div className={`h-10 w-10 rounded-xl border inline-flex items-center justify-center ${toneClasses[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

export default async function AgencyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const viewAs = cookieStore.get("chautari_view_as")?.value;

  let { agency, member, requests, stats } = await getAgencyPortalData();

  // Admin preview mode — inject demo data so the UI renders fully
  if (!agency && viewAs === "agency") {
    agency = {
      id: "preview",
      name: "Demo Home Care Agency",
      dba_name: "Demo Care",
      address_city: "Pittsburgh",
      address_state: "PA",
      phone: "(412) 555-0100",
      email: "demo@agency.com",
      website: null,
      care_types: ["home_health", "home_care"],
      payers_accepted: ["medicaid", "medicare"],
      services_offered: ["skilled_nursing", "home_health_aide", "personal_care"],
      languages_spoken: ["English"],
      service_counties: ["Allegheny"],
      is_verified_partner: true,
      is_accepting_patients: true,
      average_response_time_hours: 4,
      medicare_quality_score: 4.2,
      pa_license_number: "PA-DEMO-001",
    };
    member = { id: "preview-member", role: "admin", title: "Agency Admin" };
  }

  if (!agency || !member) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6 md:p-8">
        <div className="max-w-lg mx-auto mt-10 rounded-2xl border border-zinc-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">No Agency Linked</h1>
          <p className="text-sm text-zinc-500 mt-2">Your user is not associated with an agency yet.</p>
          <Link href="/api/auth/signout" className="inline-flex mt-5 h-10 px-4 rounded-xl bg-zinc-900 text-white text-sm font-medium items-center">Sign out</Link>
        </div>
      </div>
    );
  }

  const staffName = user?.email?.split("@")[0] ?? "Staff";
  const isAdmin = ["admin", "owner"].includes(member.role);

  const submitted = requests.filter((r) => r.status === "submitted");
  const pending = requests.filter((r) => ["submitted", "under_review"].includes(r.status));
  const active = requests.filter((r) => r.status === "accepted");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const completedThisMonth = requests.filter((r) => r.status === "completed" && new Date(r.updated_at) >= monthStart).length;

  const last30 = Date.now() - 30 * 24 * 3600000;
  const responded = requests.filter((r) => ["under_review", "accepted", "denied", "completed"].includes(r.status) && new Date(r.updated_at).getTime() >= last30);
  const avgResponseHours = responded.length
    ? Math.round((responded.reduce((acc, r) => acc + hoursSince(r.submitted_at ?? r.created_at) - hoursSince(r.updated_at), 0) / responded.length) * 10) / 10
    : null;

  const last90 = Date.now() - 90 * 24 * 3600000;
  const decisionPool = requests.filter((r) => ["accepted", "denied"].includes(r.status) && new Date(r.updated_at).getTime() >= last90);
  const acceptanceRate = decisionPool.length ? Math.round((decisionPool.filter((r) => r.status === "accepted").length / decisionPool.length) * 100) : null;

  const unreadNotifications = user
    ? (await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null)).count ?? 0
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

  async function quickAccept(formData: FormData) {
    "use server";
    const id = String(formData.get("request_id") || "");
    if (!id) return;
    await acceptSwitchRequest(id, "Accepted via dashboard quick action.");
    revalidatePath("/agency/dashboard");
  }

  async function quickDecline(formData: FormData) {
    "use server";
    const id = String(formData.get("request_id") || "");
    if (!id) return;
    await denySwitchRequest(id, "Currently unable to accept this request.");
    revalidatePath("/agency/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-28 md:pb-8">
      {viewAs && <AdminPreviewBanner viewingAs={viewAs} />}
      <AgencyNav
        agencyName={agency.name}
        staffName={staffName}
        staffRole={member.role}
        pendingCount={stats.pending}
        unreadNotifications={unreadNotifications}
      />

      <main className="max-w-[1240px] mx-auto px-4 md:px-6 py-5 md:py-7 space-y-5 md:space-y-6">
        <section className={`${CARD} p-4 md:p-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-100 border border-violet-200 rounded-full px-2.5 py-1"><Sparkles className="size-3.5" /> SwitchMyCare Agency Portal</p>
              <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 mt-3">{agency.name}</h1>
              <p className="text-sm text-zinc-500 mt-1.5">{staffName} · {member.role} · {pending.length} items currently need action.</p>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <AcceptingPatientsToggle initialValue={agency.is_accepting_patients} isAdmin={isAdmin} />
              <Link href="/agency/notifications" className="h-10 px-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-700 inline-flex items-center gap-2">
                <Bell className="size-4" /> Alerts {unreadNotifications > 0 ? <span className="text-xs rounded-full px-1.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-200">{unreadNotifications}</span> : null}
              </Link>
              <Link href="/agency/requests?filter=submitted" className="h-10 px-4 rounded-xl bg-zinc-900 text-white text-sm font-medium inline-flex items-center gap-2">Review Queue <ArrowRight className="size-4" /></Link>
              {isAdmin && <Link href="/agency/profile" className="h-10 w-10 rounded-xl border border-zinc-200 bg-white inline-flex items-center justify-center text-zinc-700"><Settings className="size-4" /></Link>}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
          <MetricCard label="New requests" value={submitted.length} sub="Unread queue" tone={submitted.length > 0 ? "rose" : "zinc"} icon={<ClipboardCheck className="size-4" />} />
          <MetricCard label="Pending response" value={pending.length} sub={pending.length > 3 ? "Urgent queue" : "Healthy backlog"} tone={pending.length > 3 ? "amber" : "zinc"} icon={<Clock3 className="size-4" />} />
          <MetricCard label="Active patients" value={active.length} sub="Accepted / in-progress" tone="sky" icon={<Activity className="size-4" />} />
          <MetricCard label="Completed month" value={completedThisMonth} sub="Throughput this month" tone="emerald" icon={<CheckCircle2 className="size-4" />} />
          <MetricCard label="Avg response" value={avgResponseHours !== null ? `${avgResponseHours}h` : "—"} sub="Rolling 30 days" tone="zinc" icon={<Clock3 className="size-4" />} />
          <MetricCard label="Acceptance rate" value={acceptanceRate !== null ? `${acceptanceRate}%` : "—"} sub="Last 90 days" tone="zinc" icon={<Users className="size-4" />} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${CARD} p-4 md:p-5 lg:col-span-2`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Request pipeline preview</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Urgency sorted: oldest first, then nearest requested start date.</p>
              </div>
              <Link href="/agency/requests" className="text-xs font-medium text-zinc-600 hover:text-zinc-900">View all requests</Link>
            </div>

            {sortedUrgent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
                <p className="text-sm font-medium text-zinc-700">No pending requests 🎉</p>
                <p className="text-xs text-zinc-500 mt-1">You&apos;re caught up. Keep your profile complete to receive more matches.</p>
                <Link href="/agency/profile" className="inline-flex mt-4 text-xs font-medium text-zinc-700 underline">Review agency profile</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedUrgent.map((r) => {
                  const hrs = hoursSince(r.submitted_at ?? r.created_at);
                  const urgency = hrs >= 48 ? "critical" : hrs >= 24 ? "warning" : "normal";
                  return (
                    <div key={r.id} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 md:p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{(r.patient?.full_name ?? "Patient").split(" ")[0]} · {r.care_type}</p>
                          <p className="text-xs text-zinc-500 mt-1">{r.patient_details?.payer_type ?? "Unknown payer"} · {r.patient_details?.address_county ?? "Unknown county"} · {hrs}h waiting</p>
                          {r.requested_start_date ? <p className="text-xs text-zinc-500">Requested start: {new Date(r.requested_start_date).toLocaleDateString()}</p> : null}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full border ${urgency === "critical" ? "bg-rose-100 text-rose-700 border-rose-200" : urgency === "warning" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>{urgency === "critical" ? "48h+" : urgency === "warning" ? "24h+" : "Fresh"}</span>
                          <form action={quickAccept}><input type="hidden" name="request_id" value={r.id} /><button className="h-8 px-2.5 rounded-lg text-xs font-medium bg-emerald-600 text-white">Accept</button></form>
                          <form action={quickDecline}><input type="hidden" name="request_id" value={r.id} /><button className="h-8 px-2.5 rounded-lg text-xs font-medium border border-zinc-300 text-zinc-700 bg-white">Decline</button></form>
                          <Link href={`/agency/requests/${r.id}`} className="h-8 px-2.5 rounded-lg text-xs font-medium border border-zinc-300 text-zinc-700 bg-white inline-flex items-center">Details</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className={`${CARD} p-4 md:p-5`}>
              <h3 className="text-sm font-semibold text-zinc-900">Agency profile health</h3>
              {(() => {
                const checks = [
                  { label: "Description", ok: !!agency.dba_name },
                  { label: "Phone", ok: !!agency.phone },
                  { label: "Website", ok: !!agency.website },
                  { label: "Service counties", ok: (agency.service_counties ?? []).length > 0 },
                  { label: "Services offered", ok: (agency.services_offered ?? []).length > 0 },
                  { label: "Languages", ok: (agency.languages_spoken ?? []).length > 0 },
                ];
                const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
                return (
                  <>
                    <p className="text-2xl font-semibold text-zinc-900 mt-2">{score}%</p>
                    <div className="h-2 rounded-full bg-zinc-100 mt-2 overflow-hidden"><div className="h-full bg-zinc-900" style={{ width: `${score}%` }} /></div>
                    <div className="mt-3 space-y-2">
                      {checks.filter((c) => !c.ok).slice(0, 3).map((c) => (
                        <p key={c.label} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 inline-flex items-center gap-1.5"><AlertTriangle className="size-3.5" /> Missing: {c.label}</p>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Verification: {agency.is_verified_partner ? "Verified partner" : "Not verified"}</span>
                      <Link href="/agency/profile" className="text-xs font-medium text-zinc-700">Improve profile</Link>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className={`${CARD} p-4 md:p-5`}>
              <h3 className="text-sm font-semibold text-zinc-900">Feature hub</h3>
              <div className="grid grid-cols-1 gap-2 mt-3">
                <Link href="/agency/messages" className="h-10 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-sm text-zinc-700 inline-flex items-center justify-between">Messaging <MessageSquare className="size-4 text-zinc-400" /></Link>
                <Link href="/agency/documents" className="h-10 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-sm text-zinc-700 inline-flex items-center justify-between">Documents <ArrowRight className="size-4 text-zinc-400" /></Link>
                <Link href="/agency/team" className="h-10 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-sm text-zinc-700 inline-flex items-center justify-between">Team management <Users className="size-4 text-zinc-400" /></Link>
                <Link href="/agency/settings" className="h-10 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-sm text-zinc-700 inline-flex items-center justify-between">Settings <Settings className="size-4 text-zinc-400" /></Link>
                <Link href="/agency/reports" className="h-10 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-sm text-zinc-700 inline-flex items-center justify-between">Reports (Phase 2) <ArrowRight className="size-4 text-zinc-400" /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
