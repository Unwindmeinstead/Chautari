import { getAgencyClaims, sendAgencyInvite } from "@/lib/agency-claims-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Agency Claims | Admin" };

export default async function AdminClaimsPage() {
  async function handleInvite(formData: FormData) {
    "use server";
    await sendAgencyInvite(formData);
  }
  const { claims, error } = await getAgencyClaims();
  const supabase = await createClient();
  const { data: agencies } = await supabase.from("agencies").select("id,name").order("name", { ascending: true }).limit(500);

  return (
    <div className="px-4 md:px-8 py-6 text-white">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h1 className="text-2xl font-semibold">Agency Claims</h1>
          <p className="text-sm text-white/50 mt-1">Review incoming claims and send invite-only agency access.</p>
        </div>

        {error && <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}

        <div className="space-y-3">
          {(claims as any[]).map((c) => (
            <div key={c.id} className="rounded-xl border border-white/10 bg-[#111116] p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{c.contact_name} · {c.agency_name}</p>
                  <p className="text-xs text-white/60 mt-1">{c.email} {c.phone ? `· ${c.phone}` : ""} · status: {c.status}</p>
                  {c.notes ? <p className="text-xs text-white/50 mt-2">{c.notes}</p> : null}
                </div>
                <form action={handleInvite} className="flex items-center gap-2">
                  <input type="hidden" name="claim_id" value={c.id} />
                  <select name="agency_id" className="h-9 rounded-lg bg-black/30 border border-white/15 px-2 text-xs" required>
                    <option value="">Link agency…</option>
                    {(agencies ?? []).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <select name="role" className="h-9 rounded-lg bg-black/30 border border-white/15 px-2 text-xs" defaultValue="staff">
                    <option value="owner">owner</option>
                    <option value="admin">admin</option>
                    <option value="staff">staff</option>
                  </select>
                  <button className="h-9 px-3 rounded-lg bg-white text-zinc-900 text-xs font-semibold">Send invite</button>
                </form>
              </div>
            </div>
          ))}
          {(claims as any[]).length === 0 && <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/60">No claims yet.</div>}
        </div>
      </div>
    </div>
  );
}
