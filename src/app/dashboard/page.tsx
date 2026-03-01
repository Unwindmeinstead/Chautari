import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard-actions";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { RequestCard } from "@/components/dashboard/request-card";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import {
  ProfileSummaryCard,
  StatsRow,
  QuickActions,
} from "@/components/dashboard/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, ClipboardList } from "lucide-react";

export const metadata = { title: "Dashboard | Chautari" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const data = await getDashboardData();

  const firstName = data.profile?.full_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeRequests = data.switchRequests.filter((r) =>
    ["submitted", "under_review", "accepted"].includes(r.status)
  );
  const pastRequests = data.switchRequests.filter((r) =>
    ["completed", "denied", "cancelled"].includes(r.status)
  );
  const recentNotifications = data.notifications.slice(0, 5);
  const hasActiveRequest = activeRequests.length > 0;

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav
        userName={data.profile?.full_name ?? null}
        unreadCount={data.unreadCount}
      />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Greeting */}
        <div className="space-y-1">
          <p className="text-sm text-forest-400">{greeting},</p>
          <h1 className="font-fraunces text-3xl sm:text-4xl font-semibold text-forest-800">
            {firstName} 👋
          </h1>
          {data.onboardingComplete ? (
            <p className="text-forest-500">
              Here&apos;s everything happening with your home care switch.
            </p>
          ) : (
            <p className="text-forest-500">
              Let&apos;s get your profile set up so we can find you the right agency.
            </p>
          )}
        </div>

        {/* Onboarding CTA banner */}
        {!data.onboardingComplete && (
          <div className="rounded-2xl bg-forest-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-forest-500 flex items-center justify-center shrink-0">
              <ClipboardList className="size-7 text-cream" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-fraunces text-xl font-semibold">
                Complete your profile to get started
              </p>
              <p className="text-forest-200 text-sm leading-relaxed">
                Tell us about your care needs, insurance, and location. It takes about 5 minutes
                and unlocks agency search and switch requests.
              </p>
            </div>
            <Button variant="amber" size="lg" asChild className="shrink-0 w-full sm:w-auto">
              <Link href="/onboarding">
                Complete profile <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Stats row */}
        {data.onboardingComplete && data.switchRequests.length > 0 && (
          <StatsRow requests={data.switchRequests} />
        )}

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left — requests + notifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active requests */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-fraunces text-xl font-semibold text-forest-800">
                  Active Requests
                </h2>
                {activeRequests.length > 0 && (
                  <span className="text-xs text-forest-400">
                    {activeRequests.length} in progress
                  </span>
                )}
              </div>

              {activeRequests.length === 0 ? (
                <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-8 text-center space-y-3">
                  <div className="h-14 w-14 rounded-full bg-forest-100 flex items-center justify-center mx-auto">
                    <ClipboardList className="size-7 text-forest-400" />
                  </div>
                  <div>
                    <p className="font-fraunces text-base font-semibold text-forest-700">
                      No active requests
                    </p>
                    <p className="text-sm text-forest-400 mt-1">
                      {data.onboardingComplete
                        ? "Browse agencies and start a switch request when you're ready."
                        : "Complete your profile first to unlock agency search."}
                    </p>
                  </div>
                  {data.onboardingComplete && (
                    <Button variant="outline" asChild>
                      <Link href="/agencies">Find agencies</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRequests.map((r) => (
                    <RequestCard key={r.id} request={r} />
                  ))}
                </div>
              )}
            </section>

            {/* Notifications panel */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-fraunces text-xl font-semibold text-forest-800 flex items-center gap-2">
                  <Bell className="size-5 text-forest-500" />
                  Notifications
                  {data.unreadCount > 0 && (
                    <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                      {data.unreadCount}
                    </span>
                  )}
                </h2>
                {data.notifications.length > 5 && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/notifications">View all</Link>
                  </Button>
                )}
              </div>

              <div className="rounded-2xl bg-white border border-forest-100 shadow-card overflow-hidden">
                <NotificationsList
                  notifications={recentNotifications}
                  showMarkAll={data.unreadCount > 0}
                />
              </div>
            </section>

            {/* Past requests */}
            {pastRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-fraunces text-xl font-semibold text-forest-800">
                  Past Requests
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {pastRequests.slice(0, 4).map((r) => (
                    <RequestCard key={r.id} request={r} compact />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right — profile + quick actions */}
          <div className="space-y-5">
            <ProfileSummaryCard profile={data.profile} details={data.patientDetails} />
            <QuickActions
              onboardingComplete={data.onboardingComplete}
              hasActiveRequest={hasActiveRequest}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
