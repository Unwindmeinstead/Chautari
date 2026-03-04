import { Settings, SlidersHorizontal, ShieldCheck } from "lucide-react";

export const metadata = { title: "Admin Settings | SwitchMyCare" };
export const dynamic = "force-dynamic";

const sections = [
  { title: "Platform Governance", desc: "Approval thresholds, role policies, and escalation rules." },
  { title: "Alerts & Routing", desc: "Notification channels for requests, outages, and quality alerts." },
  { title: "Security & Audit", desc: "Session controls, access logs, and compliance defaults." },
];

export default function AdminSettingsPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 font-semibold">Workspace</p>
            <h1 className="text-2xl md:text-3xl font-semibold mt-2">Settings</h1>
            <p className="text-sm text-white/50 mt-1">Central controls for the admin dashboard experience.</p>
          </div>
          <Settings className="size-5 text-white/40" />
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-white/10 bg-[#0f0f13] p-4 space-y-2">
              <div className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center">
                <SlidersHorizontal className="size-4 text-violet-300" />
              </div>
              <h2 className="text-sm font-semibold">{section.title}</h2>
              <p className="text-xs text-white/50 leading-relaxed">{section.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3 text-sm text-white/60">
          <ShieldCheck className="size-4 text-sky-300" />
          More settings controls can be wired to server actions as next step.
        </div>
      </div>
    </div>
  );
}
