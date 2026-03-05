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
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-20">
      <DashboardNav userName={data.profile?.full_name ?? null} unreadCount={data.unreadCount} />

      <main className="max-w-[1100px] mx-auto px-4 md:px-6 mt-6 md:mt-10 space-y-6 md:space-y-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">{greeting}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mt-2">Hi {firstName} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">
            {hasActiveRequest ? "Here is your latest switch progress." : "You can start a new switch request any time."}
          </p>

          {copy && currentRequest ? (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Current request status</p>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mt-1">{copy.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{copy.detail}</p>
                <p className="text-sm text-gray-700 mt-2 font-medium">{copy.next}</p>
              </div>

              <div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-gray-900" style={{ width: `${Math.max(25, Math.min(100, copy.step * 25))}%` }} />
                </div>
                <div className="grid grid-cols-4 mt-2 gap-2">
                  {timelineLabels.map((label, i) => (
                    <p key={label} className={`text-[11px] ${i + 1 <= copy.step ? "text-gray-800 font-semibold" : "text-gray-400"}`}>{label}</p>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/switch/${currentRequest.id}`} className="h-9 px-4 rounded-xl bg-gray-900 text-white text-xs font-bold inline-flex items-center gap-1.5">
                  View my request <ArrowRight className="size-3.5" />
                </Link>
                {currentRequest.status === "accepted" && (
                  <Link href={`/switch/${currentRequest.id}/messages`} className="h-9 px-4 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 inline-flex items-center gap-1.5 hover:bg-white">
                    Message agency <MessageSquare className="size-3.5" />
                  </Link>
                )}
                <Link href={`/switch/${currentRequest.id}`} className="h-9 px-4 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 inline-flex items-center gap-1.5 hover:bg-white">
                  Upload document <Upload className="size-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm font-semibold text-gray-900">No active request yet</p>
              <p className="text-xs text-gray-500 mt-1">When you start a switch request, your status and next steps appear here.</p>
              <Link href="/switch/new" className="mt-4 inline-flex h-10 px-5 rounded-full bg-gray-900 text-white text-sm font-bold items-center gap-1.5">
                Start new request <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Unread notifications</p>
            <p className="text-2xl font-bold mt-1">{data.unreadCount}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Active requests</p>
            <p className="text-2xl font-bold mt-1">{activeRequests.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total requests</p>
            <p className="text-2xl font-bold mt-1">{data.switchRequests.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Completed requests</p>
            <p className="text-2xl font-bold mt-1">{data.switchRequests.filter((r) => r.status === "completed").length}</p>
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          <Link href="/switch/new" className="h-10 px-5 rounded-full bg-gray-900 text-white text-sm font-bold inline-flex items-center gap-1.5">
            Start new request <ClipboardList className="size-4" />
          </Link>
          <Link href="/agencies" className="h-10 px-5 rounded-full border border-gray-300 text-sm font-bold text-gray-700 inline-flex items-center gap-1.5">
            Find agencies <ArrowRight className="size-4" />
          </Link>
          <Link href="/notifications" className="h-10 px-5 rounded-full border border-gray-300 text-sm font-bold text-gray-700 inline-flex items-center gap-1.5">
            Notifications <Bell className="size-4" />
          </Link>
          <Link href="/profile" className="h-10 px-5 rounded-full border border-gray-300 text-sm font-bold text-gray-700 inline-flex items-center gap-1.5">
            Update profile <Calendar className="size-4" />
          </Link>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Active requests</h2>
            {activeRequests.length > 0 && <span className="text-xs text-gray-500">{activeRequests.length} in progress</span>}
          </div>

          {activeRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-sm font-semibold text-gray-900">You have no active requests</p>
              <p className="text-xs text-gray-500 mt-1">Start a new request when you're ready.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {activeRequests.map((r) => <RequestCard key={r.id} request={r} />)}
            </div>
          )}
        </section>

        {pastRequests.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Past requests</h2>
            <div className="space-y-2.5">
              {pastRequests.slice(0, 4).map((r) => <RequestCard key={r.id} request={r} compact />)}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Recent notifications</h3>
            <Link href="/notifications" className="text-xs font-semibold text-gray-600">View all</Link>
          </div>
          {data.notifications.length === 0 ? (
            <div className="p-6 text-sm text-gray-500 text-center">No notifications yet.</div>
          ) : (
            <div>
              {data.notifications.slice(0, 5).map((n) => (
                <Link key={n.id} href={n.reference_type === "switch_request" ? `/switch/${n.reference_id}` : "/notifications"} className="block px-4 md:px-5 py-3 border-b last:border-0 border-gray-100 hover:bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{n.body}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
