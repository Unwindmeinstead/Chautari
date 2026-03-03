import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard-actions";
import { DashboardNav, ProfileCard, StatsGrid, QuickActions, RequestCard, NotificationsPanel } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardList } from "lucide-react";

export const metadata = { title: "Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // MOCK DATA PREVIEW
  // if (!user) redirect("/auth/login");

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
  const recentNotifications = data.notifications.slice(0, 5);
  const hasActiveRequest = activeRequests.length > 0;

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav userName={data.profile?.full_name ?? null} unreadCount={data.unreadCount} />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-10">
        {/* Hero Greeting */}
        <div className="relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,147,58,0.06), transparent 70%)" }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-amber-500 mb-4">
              <span className="w-6 h-px bg-amber-500" />Your dashboard
            </div>
            <h1 className="font-fraunces text-[clamp(36px,5vw,52px)] font-bold tracking-tight text-forest-600 leading-[1.05]">
              {greeting},<br />
              <span className="text-forest-800">{firstName} 👋</span>
            </h1>
            <p className="text-[17px] font-light text-[#6B7B6E] leading-relaxed mt-4 max-w-xl">
              {data.onboardingComplete 
                ? "Here's everything happening with your home care switch journey."
                : "Let's get your profile set up so we can find you the perfect agency."}
            </p>
          </div>
        </div>

        {/* Onboarding CTA */}
        {!data.onboardingComplete && (
          <div className="relative overflow-hidden rounded-[28px] bg-[#0F2419] p-8 lg:p-10">
            <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,147,58,0.12), transparent 70%)" }} />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-forest-700/40" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="h-18 w-18 rounded-2xl bg-forest-700/60 flex items-center justify-center shrink-0">
                <ClipboardList className="size-9 text-amber-500" />
              </div>
              <div className="flex-1 space-y-3">
                <p className="font-fraunces text-[24px] font-semibold text-cream">
                  Complete your profile to get started
                </p>
                <p className="text-[15px] font-light text-cream/55 leading-relaxed max-w-lg">
                  Tell us about your care needs, insurance, and location. Takes about 5 minutes and unlocks agency search.
                </p>
              </div>
              <Button variant="amber" size="lg" asChild className="shrink-0 w-full lg:w-auto">
                <Link href="/onboarding">
                  Complete profile <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        {data.onboardingComplete && data.switchRequests.length > 0 && (
          <StatsGrid requests={data.switchRequests} />
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Active Requests */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-fraunces text-xl font-semibold text-forest-800">Active Requests</h2>
                {activeRequests.length > 0 && (
                  <span className="text-xs text-[#6B7B6E] font-medium">{activeRequests.length} in progress</span>
                )}
              </div>

              {activeRequests.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[rgba(26,61,43,0.04)] flex items-center justify-center mx-auto mb-5">
                    <ClipboardList className="size-7 text-forest-400" />
                  </div>
                  <p className="font-fraunces text-lg font-semibold text-forest-700 mb-2">No active requests</p>
                  <p className="text-sm text-[#6B7B6E] mb-6 max-w-sm mx-auto">
                    {data.onboardingComplete 
                      ? "Browse agencies and start a switch request when you're ready."
                      : "Complete your profile first to unlock agency search."}
                  </p>
                  {data.onboardingComplete && (
                    <Button variant="outline" asChild>
                      <Link href="/agencies">Find agencies</Link>
                    </Button>
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
              <section>
                <h2 className="font-fraunces text-xl font-semibold text-forest-800 mb-5">Past Requests</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {pastRequests.slice(0, 4).map((r) => <RequestCard key={r.id} request={r} compact />)}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileCard profile={data.profile} details={data.patientDetails} />
            <QuickActions complete={data.onboardingComplete} hasActive={hasActiveRequest} />
            <NotificationsPanel notifications={recentNotifications} unread={data.unreadCount} />
          </div>
        </div>
      </main>
    </div>
  );
}
