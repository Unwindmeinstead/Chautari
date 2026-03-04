import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard-actions";
import {
  DashboardNav, ProfileCard, StatsGrid, QuickActions, RequestCard, NotificationsPanel
} from "@/components/dashboard/dashboard-nav";
import { ClipboardList, ArrowRight, ArrowUpRight } from "lucide-react";

export const metadata = { title: "Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Auth check removed temporarily — getDashboardData returns mock data when no session
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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100 pb-20">
      <DashboardNav userName={data.profile?.full_name ?? null} unreadCount={data.unreadCount} />

      <main className="max-w-[1100px] mx-auto px-6 mt-10 space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="space-y-1.5">
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900 leading-none">
              {greeting}, <span className="capitalize">{firstName}</span> 👋
            </h1>
            <p className="text-[14px] font-medium text-gray-500">
              {data.onboardingComplete
                ? `You have ${activeRequests.length > 0 ? `${activeRequests.length} active request${activeRequests.length > 1 ? "s" : ""}` : "no active requests"} right now.`
                : "Let's get your profile set up so we can find you the right agency."}
            </p>
          </div>
          {data.onboardingComplete && (
            <Link href="/agencies"
              className="shrink-0 h-10 px-6 rounded-full bg-gray-900 text-white text-[13px] font-bold flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm shadow-gray-900/10 w-fit">
              Find Agencies <ArrowRight className="size-4 ml-2" />
            </Link>
          )}
        </div>

        {/* Onboarding CTA */}
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

        {/* Stats — only when there are requests */}
        {data.switchRequests.length > 0 && (
          <StatsGrid requests={data.switchRequests} />
        )}

        {/* Main 2-col grid */}
        <div className="grid lg:grid-cols-3 gap-10 items-start pt-2">

          {/* Left: Requests (takes 2/3 width) */}
          <div className="lg:col-span-2 space-y-10">

            {/* Active Requests */}
            <section className="space-y-5">
              <div className="flex items-end justify-between">
                <h2 className="text-[18px] font-bold text-gray-900">Active Requests</h2>
                {activeRequests.length > 0 && (
                  <span className="text-[12px] font-semibold text-gray-500">{activeRequests.length} in progress</span>
                )}
              </div>

              {activeRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
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

            {/* Past Requests */}
            {pastRequests.length > 0 && (
              <section className="space-y-5">
                <h2 className="text-[18px] font-bold text-gray-900">Past Requests</h2>
                <div className="space-y-2.5">
                  {pastRequests.slice(0, 4).map((r) => <RequestCard key={r.id} request={r} compact />)}
                </div>
              </section>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-8">
            <ProfileCard profile={data.profile} details={data.patientDetails} />

            <div className="space-y-2">
              <h3 className="text-[14px] font-bold text-gray-900 px-1">Quick Actions</h3>
              <QuickActions complete={data.onboardingComplete} hasActive={hasActiveRequest} />
            </div>

            <NotificationsPanel notifications={data.notifications.slice(0, 5)} unread={data.unreadCount} />
          </div>
        </div>

      </main>
    </div>
  );
}
