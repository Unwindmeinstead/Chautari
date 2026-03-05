import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard-actions";
import { DashboardNav, RequestCard } from "@/components/dashboard/dashboard-nav";
import {
  ArrowRight,
  Bell,
  Calendar,
  ClipboardList,
  MessageSquare,
  Upload,
} from "lucide-react";

export const metadata = { title: "Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

function statusCopy(status: string) {
  switch (status) {
    case "submitted":
      return {
        title: "Your request has been sent to agencies.",
        detail: "We sent your request to agencies that match your care needs.",
        next: "Next: Agencies will review your request. Most people hear back within 2 business days.",
        step: 1,
      };
    case "under_review":
      return {
        title: "An agency is reviewing your request.",
        detail: "A coordinator is checking your care needs and insurance details.",
        next: "Next: You should receive an acceptance or update soon.",
        step: 2,
      };
    case "accepted":
      return {
        title: "Great news — an agency accepted your request.",
        detail: "You can now message the agency directly to coordinate intake.",
        next: "Next: Message the agency to confirm timeline and first visit details.",
        step: 3,
      };
    case "completed":
      return {
        title: "Your switch is complete.",
        detail: "Your request has been successfully completed.",
        next: "Next: Keep your profile updated for future care changes.",
        step: 4,
      };
    case "denied":
      return {
        title: "This request was not accepted.",
        detail: "Don’t worry — you can submit a new request to other agencies.",
        next: "Next: Start a new request and choose different agencies.",
        step: 1,
      };
    default:
      return {
        title: "Your request is in progress.",
        detail: "We are processing your request.",
        next: "Next: We’ll notify you as soon as there is an update.",
        step: 2,
      };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const firstName = data.profile?.full_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeRequests = data.switchRequests.filter((r) => ["submitted", "under_review", "accepted"].includes(r.status));
  const pastRequests = data.switchRequests.filter((r) => ["completed", "denied", "cancelled"].includes(r.status));
  const currentRequest = activeRequests[0] ?? data.switchRequests[0] ?? null;
  const hasActiveRequest = activeRequests.length > 0;

  const copy = currentRequest ? statusCopy(currentRequest.status) : null;
  const timelineLabels = ["Submitted", "Agency review", "Accepted", "Start of care"];

  return (
    <div className="min-h-screen bg-cream text-forest-800 font-sans pb-20">
      <DashboardNav userName={data.profile?.full_name ?? null} unreadCount={data.unreadCount} />

      <main className="max-w-[1100px] mx-auto px-4 md:px-6 mt-6 md:mt-10 space-y-6 md:space-y-8">
        <section className="rounded-2xl border border-[rgba(26,61,43,0.1)] bg-white p-4 md:p-6" style={{ boxShadow: "0 2px 8px rgba(26,61,43,0.08)" }}>
          <p className="text-[12px] font-bold uppercase tracking-widest text-amber-500">{greeting}</p>
          <h1 className="font-fraunces text-2xl md:text-3xl font-bold tracking-tight text-forest-700 mt-2">Hi {firstName} 👋</h1>
          <p className="text-sm text-[#6B7B6E] mt-1">
            {hasActiveRequest ? "Here is your latest switch progress." : "You can start a new switch request any time."}
          </p>

          {copy && currentRequest ? (
            <div className="mt-5 rounded-2xl border border-[rgba(26,61,43,0.1)] bg-[rgba(26,61,43,0.02)] p-4 md:p-5 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500">Current request status</p>
                <h2 className="text-lg md:text-xl font-bold text-forest-700 mt-1">{copy.title}</h2>
                <p className="text-sm text-[#6B7B6E] mt-1">{copy.detail}</p>
                <p className="text-sm text-forest-600 mt-2 font-medium">{copy.next}</p>
              </div>

              <div>
                <div className="h-2 rounded-full bg-[rgba(26,61,43,0.1)] overflow-hidden">
                  <div className="h-full bg-forest-600" style={{ width: `${Math.max(25, Math.min(100, copy.step * 25))}%` }} />
                </div>
                <div className="grid grid-cols-4 mt-2 gap-2">
                  {timelineLabels.map((label, i) => (
                    <p key={label} className={`text-[11px] ${i + 1 <= copy.step ? "text-forest-700 font-semibold" : "text-[#6B7B6E]"}`}>{label}</p>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/switch/${currentRequest.id}`} className="h-9 px-4 rounded-full bg-forest-600 text-cream text-xs font-bold inline-flex items-center gap-1.5 transition-all hover:bg-forest-700 hover:-translate-y-0.5" style={{ boxShadow: "0 4px 12px rgba(26,61,43,0.2)" }}>
                  View my request <ArrowRight className="size-3.5" />
                </Link>
                {currentRequest.status === "accepted" && (
                  <Link href={`/switch/${currentRequest.id}/messages`} className="h-9 px-4 rounded-full border border-[rgba(26,61,43,0.2)] text-xs font-bold text-forest-600 inline-flex items-center gap-1.5 hover:bg-forest-50">
                    Message agency <MessageSquare className="size-3.5" />
                  </Link>
                )}
                <Link href={`/switch/${currentRequest.id}`} className="h-9 px-4 rounded-full border border-[rgba(26,61,43,0.2)] text-xs font-bold text-forest-600 inline-flex items-center gap-1.5 hover:bg-forest-50">
                  Upload document <Upload className="size-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[rgba(26,61,43,0.2)] bg-[rgba(26,61,43,0.02)] p-6 text-center">
              <p className="text-sm font-semibold text-forest-700">No active request yet</p>
              <p className="text-xs text-[#6B7B6E] mt-1">When you start a switch request, your status and next steps appear here.</p>
              <Link href="/switch/new" className="mt-4 inline-flex h-10 px-5 rounded-full bg-amber-500 text-[#0F2419] text-sm font-bold items-center gap-1.5 transition-all hover:bg-amber-400 hover:-translate-y-0.5" style={{ boxShadow: "0 8px 24px rgba(232,147,58,0.3)" }}>
                Start new request <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-xl border border-[rgba(26,61,43,0.1)] bg-white p-4" style={{ boxShadow: "0 2px 8px rgba(26,61,43,0.06)" }}>
            <p className="text-xs text-[#6B7B6E]">Unread notifications</p>
            <p className="text-2xl font-bold mt-1 text-forest-700">{data.unreadCount}</p>
          </div>
          <div className="rounded-xl border border-[rgba(26,61,43,0.1)] bg-white p-4" style={{ boxShadow: "0 2px 8px rgba(26,61,43,0.06)" }}>
            <p className="text-xs text-[#6B7B6E]">Active requests</p>
            <p className="text-2xl font-bold mt-1 text-forest-700">{activeRequests.length}</p>
          </div>
          <div className="rounded-xl border border-[rgba(26,61,43,0.1)] bg-white p-4" style={{ boxShadow: "0 2px 8px rgba(26,61,43,0.06)" }}>
            <p className="text-xs text-[#6B7B6E]">Total requests</p>
            <p className="text-2xl font-bold mt-1 text-forest-700">{data.switchRequests.length}</p>
          </div>
          <div className="rounded-xl border border-[rgba(26,61,43,0.1)] bg-white p-4" style={{ boxShadow: "0 2px 8px rgba(26,61,43,0.06)" }}>
            <p className="text-xs text-[#6B7B6E]">Completed requests</p>
            <p className="text-2xl font-bold mt-1 text-forest-700">{data.switchRequests.filter((r) => r.status === "completed").length}</p>
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          <Link href="/switch/new" className="h-10 px-5 rounded-full bg-forest-600 text-cream text-sm font-bold inline-flex items-center gap-1.5 transition-all hover:bg-forest-700 hover:-translate-y-0.5" style={{ boxShadow: "0 8px 24px rgba(26,61,43,0.2)" }}>
            Start new request <ClipboardList className="size-4" />
          </Link>
          <Link href="/agencies" className="h-10 px-5 rounded-full border border-[rgba(26,61,43,0.2)] text-sm font-bold text-forest-600 inline-flex items-center gap-1.5 hover:bg-forest-50">
            Find agencies <ArrowRight className="size-4" />
          </Link>
          <Link href="/notifications" className="h-10 px-5 rounded-full border border-[rgba(26,61,43,0.2)] text-sm font-bold text-forest-600 inline-flex items-center gap-1.5 hover:bg-forest-50">
            Notifications <Bell className="size-4" />
          </Link>
          <Link href="/profile" className="h-10 px-5 rounded-full border border-[rgba(26,61,43,0.2)] text-sm font-bold text-forest-600 inline-flex items-center gap-1.5 hover:bg-forest-50">
            Update profile <Calendar className="size-4" />
          </Link>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-forest-700">Active requests</h2>
            {activeRequests.length > 0 && <span className="text-xs text-[#6B7B6E]">{activeRequests.length} in progress</span>}
          </div>

          {activeRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(26,61,43,0.2)] bg-[rgba(26,61,43,0.02)] p-8 text-center">
              <p className="text-sm font-semibold text-forest-700">You have no active requests</p>
              <p className="text-xs text-[#6B7B6E] mt-1">Start a new request when you're ready.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {activeRequests.map((r) => <RequestCard key={r.id} request={r} />)}
            </div>
          )}
        </section>

        {pastRequests.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-forest-700">Past requests</h2>
            <div className="space-y-2.5">
              {pastRequests.slice(0, 4).map((r) => <RequestCard key={r.id} request={r} compact />)}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-[rgba(26,61,43,0.1)] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(26,61,43,0.06)" }}>
          <div className="px-4 md:px-5 py-3.5 border-b border-[rgba(26,61,43,0.08)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-forest-700">Recent notifications</h3>
            <Link href="/notifications" className="text-xs font-semibold text-forest-500">View all</Link>
          </div>
          {data.notifications.length === 0 ? (
            <div className="p-6 text-sm text-[#6B7B6E] text-center">No notifications yet.</div>
          ) : (
            <div>
              {data.notifications.slice(0, 5).map((n) => (
                <Link key={n.id} href={n.reference_type === "switch_request" ? `/switch/${n.reference_id}` : "/notifications"} className="block px-4 md:px-5 py-3 border-b last:border-0 border-[rgba(26,61,43,0.06)] hover:bg-[rgba(26,61,43,0.02)]">
                  <p className="text-sm font-semibold text-forest-700">{n.title}</p>
                  <p className="text-xs text-[#6B7B6E] mt-1">{n.body}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
