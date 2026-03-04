import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";

export const metadata = { title: "Team | Agency Portal" };

export default async function AgencyTeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { agency, member, stats } = await getAgencyPortalData();

  if (!agency || !member) return null;

  const { data: members } = await supabase
    .from("agency_members")
    .select("id, role, title, created_at, user_id")
    .eq("agency_id", agency.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const ids = (members ?? []).map((m: any) => m.user_id);
  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, full_name").in("id", ids)
    : { data: [] as any[] };
  const profileMap: Record<string, string> = {};
  for (const p of profiles ?? []) profileMap[p.id] = p.full_name ?? "Team member";

  return (
    <div className="min-h-screen bg-zinc-50 pb-28 md:pb-8">
      <AgencyNav agencyName={agency.name} staffName={user?.email?.split("@")[0] ?? "Staff"} staffRole={member.role} pendingCount={stats.pending} />
      <main className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h1 className="text-2xl font-semibold text-zinc-900">Team management</h1>
          <p className="text-sm text-zinc-500 mt-1">Current active members and role visibility.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3">Title</th><th className="text-left px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(members ?? []).map((m: any) => (
                <tr key={m.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">{profileMap[m.user_id] ?? "Member"}</td>
                  <td className="px-4 py-3 capitalize">{m.role}</td>
                  <td className="px-4 py-3">{m.title ?? "—"}</td>
                  <td className="px-4 py-3">{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-zinc-500">Invite/remove/change-role actions are next implementation step. <Link href="/agency/settings" className="underline">Go to settings</Link>.</div>
      </main>
    </div>
  );
}
