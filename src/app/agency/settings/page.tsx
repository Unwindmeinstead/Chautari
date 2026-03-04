import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";

export const metadata = { title: "Settings | Agency Portal" };

export default async function AgencySettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { agency, member, stats } = await getAgencyPortalData();
  if (!agency || !member) return null;

  const cards = [
    { title: "Portal access / team", href: "/agency/team", status: "Built" },
    { title: "Notification preferences", href: "/agency/notifications", status: "Missing" },
    { title: "Business hours", href: "/agency/profile", status: "Missing" },
    { title: "Subscription + billing", href: "/agency/profile", status: "Missing" },
    { title: "Account security", href: "/profile", status: "Missing" },
    { title: "Data export", href: "/agency/reports", status: "Missing" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 pb-28 md:pb-8">
      <AgencyNav agencyName={agency.name} staffName={user?.email?.split("@")[0] ?? "Staff"} staffRole={member.role} pendingCount={stats.pending} />
      <main className="max-w-[1000px] mx-auto px-4 md:px-6 py-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 mb-4">
          <h1 className="text-2xl font-semibold text-zinc-900">Agency settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Operational and account configuration shortcuts.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {cards.map((c) => (
            <Link key={c.title} href={c.href} className="rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50">
              <p className="text-sm font-semibold text-zinc-900">{c.title}</p>
              <p className="text-xs text-zinc-500 mt-1">Status: {c.status}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
