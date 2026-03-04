import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard-actions";
import {
  DashboardNav, RequestCard, NotificationsPanel
} from "@/components/dashboard/dashboard-nav";
import {
  ClipboardList, ArrowRight, ArrowUpRight, Search, User, Bell, MapPin, Shield, Heart
} from "lucide-react";

export const metadata = { title: "Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const firstName = data.profile?.full_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeRequests = data.switchRequests.filter((r) =>
    ["submitted", "under_review", "accepted"].includes(r.status)
  );
  const pastRequests = data.switchRequests.filter((r) =>
    ["completed", "denied", "cancelled"].includes(r.status)
  );
  const hasActiveRequest = activeRequests.length > 0;
  const details = data.patientDetails;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100 pb-20">
      <DashboardNav userName={data.profile?.full_name ?? null} unreadCount={data.unreadCount} />

      <main className="max-w-[1100px] mx-auto px-6 mt-10 space-y-10">

        {/* ── Header + compact profile strip ── */}
        <div className="pb-8 border-b border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">{greeting}</p>
              <h1 className="text-[26px] font-extrabold tracking-tight text-gray-900 leading-tight capitalize">
                {firstName} 👋
              </h1>
              <p className="text-[14px] font-medium text-gray-500">
                {data.onboardingComplete
                  ? `${activeRequests.length > 0 ? `${activeRequests.length} active request${activeRequests.length > 1 ? "s" : ""}` : "No active requests"} · ${data.switchRequests.length} total`
                  : "Complete your profile to unlock agency search."}
              </p>
            </div>
            {data.onboardingComplete && (
              <Link href="/agencies"
                className="shrink-0 h-10 px-6 rounded-full bg-gray-900 text-white text-[13px] font-bold flex items-center w-fit hover:bg-gray-800 transition-colors shadow-sm shadow-gray-900/10">
                Find Agencies <ArrowRight className="size-4 ml-2" />
              </Link>
            )}
          </div>

          {/* Compact profile metadata row */}
          {data.onboardingComplete && (
            <div className="flex items-center gap-2 flex-wrap">
              {details?.address_city && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                  <MapPin className="size-3.5 text-gray-400" />
                  {details.address_city}, {details.address_county} Co.
                </span>
              )}
              {details?.payer_type && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                  <Shield className="size-3.5 text-gray-400" />
                  {details.payer_type === "medicaid" ? "Medicaid" : details.payer_type === "medicare" ? "Medicare" : "Private Pay"}
                </span>
              )}
              {details?.care_type && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                  <Heart className="size-3.5 text-gray-400" />
                  {details.care_type === "home_health" ? "Home Health" : "Home Care"}
                </span>
              )}
              <Link href="/profile"
                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 hover:text-blue-800 ml-1 transition-colors">
                <User className="size-3.5" /> Edit Profile
              </Link>
            </div>
          )}
        </div>

        {/* ── Onboarding CTA ── */}
        {!data.onboardingComplete && (
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                <ClipboardList className="size-5 text-gray-900" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">Complete your profile to get started</h2>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                  About 5 minutes. Unlocks agency search and switch requests.
                </p>
              </div>
            </div>
            <Link href="/onboarding"
              className="shrink-0 h-10 px-6 rounded-full bg-gray-900 text-white text-[13px] font-bold flex items-center hover:bg-gray-800 transition-colors">
              Get started <ArrowRight className="size-4 ml-2" />
            </Link>
          </div>
        )}

        {/* ── Stats row ── */}
        {data.switchRequests.length > 0 && (
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: "Total Requests", value: data.switchRequests.length },
              { label: "Active", value: activeRequests.length, highlight: activeRequests.length > 0 },
              { label: "Completed", value: data.switchRequests.filter(r => r.status === "completed").length },
            ].map(s => (
              <div key={s.label} className="flex flex-col border-l-2 pl-5" style={{ borderColor: s.highlight ? "#2563eb" : "#e5e7eb" }}>
                <p className={`text-3xl font-extrabold tracking-tight leading-none mb-1 ${s.highlight ? "text-blue-600" : "text-gray-900"}`}>{s.value}</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Quick Actions (horizontal pill row) ── */}
        {data.onboardingComplete && (
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/agencies"
              className="group inline-flex items-center gap-2 h-10 px-5 rounded-full border border-gray-200 text-[13px] font-bold text-gray-700 bg-white hover:border-gray-900 hover:text-gray-900 transition-all">
              <Search className="size-3.5 text-gray-400 group-hover:text-gray-900" />
              Browse Agencies
            </Link>
            {hasActiveRequest ? (
              <Link href={`/switch/${activeRequests[0].id}`}
                className="group inline-flex items-center gap-2 h-10 px-5 rounded-full border border-gray-200 text-[13px] font-bold text-gray-700 bg-white hover:border-gray-900 hover:text-gray-900 transition-all">
                <ClipboardList className="size-3.5 text-gray-400 group-hover:text-gray-900" />
                View My Request
              </Link>
            ) : null}
            <Link href="/notifications"
              className="group inline-flex items-center gap-2 h-10 px-5 rounded-full border border-gray-200 text-[13px] font-bold text-gray-700 bg-white hover:border-gray-900 hover:text-gray-900 transition-all">
              <Bell className="size-3.5 text-gray-400 group-hover:text-gray-900" />
              Notifications
              {data.unreadCount > 0 && (
                <span className="h-5 px-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">{data.unreadCount}</span>
              )}
            </Link>
          </div>
        )}

        {/* ── Active Requests ── */}
        <section className="space-y-5 pt-2 border-t border-gray-100">
          <div className="flex items-end justify-between">
            <h2 className="text-[18px] font-bold text-gray-900">Active Requests</h2>
            {activeRequests.length > 0 && (
              <span className="text-[12px] font-semibold text-gray-500">{activeRequests.length} in progress</span>
            )}
          </div>

          {activeRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
              <div className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="size-5 text-gray-400" />
              </div>
              <p className="text-[15px] font-bold text-gray-900">No active requests</p>
              <p className="text-[13px] font-medium text-gray-500 mt-1 max-w-xs mx-auto">
                {data.onboardingComplete
                  ? "Browse agencies and start a switch request when you're ready."
                  : "Complete your profile first to unlock agency search."}
              </p>
              {data.onboardingComplete && (
                <Link href="/agencies"
                  className="mt-5 inline-flex items-center gap-2 h-10 px-6 rounded-full bg-gray-900 text-white text-[13px] font-bold hover:bg-gray-800 transition-colors">
                  Find agencies <ArrowUpRight className="size-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {activeRequests.map((r) => <RequestCard key={r.id} request={r} />)}
            </div>
          )}
        </section>

        {/* ── Past Requests ── */}
        {pastRequests.length > 0 && (
          <section className="space-y-5 pt-6 border-t border-gray-100">
            <h2 className="text-[18px] font-bold text-gray-900">Past Requests</h2>
            <div className="space-y-2.5">
              {pastRequests.slice(0, 4).map((r) => <RequestCard key={r.id} request={r} compact />)}
            </div>
          </section>
        )}

        {/* ── Notifications (inline at bottom, compact) ── */}
        {data.notifications.length > 0 && (
          <section className="pt-6 border-t border-gray-100">
            <NotificationsPanel notifications={data.notifications.slice(0, 3)} unread={data.unreadCount} />
          </section>
        )}

      </main>
    </div>
  );
}
