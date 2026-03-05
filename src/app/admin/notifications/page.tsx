import Link from "next/link";
import { Bell, CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";

export const metadata = { title: "Admin Notifications | SwitchMyCare" };
export const dynamic = "force-dynamic";

const items = [
  { title: "3 new agencies pending verification", time: "2m ago", type: "Approvals" },
  { title: "Spike in switch requests in Allegheny county", time: "14m ago", type: "Demand" },
  { title: "Daily sync completed successfully", time: "1h ago", type: "System" },
];

export default function AdminNotificationsPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 font-semibold">Control Center</p>
            <h1 className="text-2xl md:text-3xl font-semibold mt-2">Notifications</h1>
            <p className="text-sm text-white/50 mt-1">Live operational updates from the admin system.</p>
          </div>
          <Bell className="size-5 text-white/40" />
        </header>

        <div className="grid gap-3">
          {items.map((n) => (
            <div key={n.title} className="rounded-xl border border-white/10 bg-[#0f0f13] p-4 flex items-center gap-4">
              <div className="h-9 w-9 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center">
                <CheckCircle2 className="size-4 text-emerald-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-white/45 mt-0.5">{n.type} · {n.time}</p>
              </div>
              <Link href="/admin" className="text-xs text-white/60 hover:text-white inline-flex items-center gap-1">
                View <ChevronRight className="size-3" />
              </Link>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3 text-sm text-white/60">
          <ShieldCheck className="size-4 text-sky-300" />
          Notifications are shown in-app and can be expanded into push/email channels in settings.
        </div>
      </div>
    </div>
  );
}
