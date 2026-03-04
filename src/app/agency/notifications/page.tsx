import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";

export const metadata = { title: "Notifications | Agency Portal" };

export default async function AgencyNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { agency, member, stats } = await getAgencyPortalData();
  if (!agency || !member) return null;

  const { data: notifications } = user
    ? await supabase.from("notifications").select("id,type,title,body,read_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30)
    : { data: [] as any[] };

  return (
    <div className="min-h-screen bg-zinc-50 pb-28 md:pb-8">
      <AgencyNav agencyName={agency.name} staffName={user?.email?.split("@")[0] ?? "Staff"} staffRole={member.role} pendingCount={stats.pending} unreadNotifications={(notifications ?? []).filter((n:any)=>!n.read_at).length} />
      <main className="max-w-[1000px] mx-auto px-4 md:px-6 py-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h1 className="text-2xl font-semibold text-zinc-900">Notifications</h1>
          <p className="text-sm text-zinc-500 mt-1">Request, message, and operational alerts.</p>
        </div>
        <div className="mt-4 space-y-2">
          {(notifications ?? []).map((n:any) => (
            <div key={n.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-sm font-semibold text-zinc-900">{n.title}</p>
              <p className="text-xs text-zinc-500 mt-1">{n.body}</p>
              <p className="text-[11px] text-zinc-400 mt-2">{n.type} · {new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
          {(notifications ?? []).length === 0 && <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-sm text-zinc-500 text-center">No notifications yet.</div>}
        </div>
      </main>
    </div>
  );
}
