import { getAdminUsers, setUserRole } from "@/lib/admin-actions";
import { Users, User } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Users | Admin" };
export const dynamic = "force-dynamic";

const CARD = { background: "#111113", border: "1px solid rgba(255,255,255,0.08)" } as const;

const ROLE_TABS = ["all", "patient", "agency_staff", "agency_admin", "switchmycare_admin"] as const;

const ROLE_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  patient: { label: "Patient", color: "rgba(255,255,255,0.6)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" },
  agency_staff: { label: "Agency Staff", color: "rgba(147,197,253,0.9)", bg: "rgba(147,197,253,0.08)", border: "rgba(147,197,253,0.2)" },
  agency_admin: { label: "Agency Admin", color: "#FBBF24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
  switchmycare_admin: { label: "SwitchMyCare Admin", color: "#FCA5A5", bg: "rgba(252,165,165,0.08)", border: "rgba(252,165,165,0.2)" },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = sp.role && sp.role !== "all" ? sp.role : undefined;

  const { users, total } = await getAdminUsers({ role, limit: 200 });

  return (
    <div className="min-h-screen" style={{ background: "#09090B" }}>

      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(9,9,11,0.9)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
        <div>
          <p className="text-[13px] font-semibold text-white">Users</p>
          <p className="text-[11px] text-white/30 mt-0.5">{total} total users</p>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">

        {/* Role tabs */}
        <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {ROLE_TABS.map((r) => {
            const active = (role ?? "all") === r;
            return (
              <Link
                key={r}
                href={r === "all" ? "/admin/users" : `/admin/users?role=${r}`}
                className="px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap border-b-2 -mb-px capitalize"
                style={{
                  borderBottomColor: active ? "rgba(255,255,255,0.7)" : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.3)",
                }}
              >
                {r === "all" ? "All" : r.replace(/_/g, " ")}
              </Link>
            );
          })}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {users.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <Users className="size-7 text-white/15" />
              <p className="text-sm text-white/30">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["User", "Role", "Language", "Joined", "Change Role"].map((h, i) => (
                      <th key={h}
                        className={`px-5 py-3 text-[10px] font-bold text-white/25 uppercase tracking-widest ${i === 4 ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.patient;
                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors"
                        style={{ borderBottom: i < users.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: "rgba(255,255,255,0.07)" }}>
                              <User className="size-4 text-white/30" />
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-white">{u.full_name ?? <span className="text-white/25 italic font-normal">No name</span>}</p>
                              <p className="text-[10px] font-mono text-white/20">{u.id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-0.5"
                            style={{ color: rs.color, background: rs.bg, border: `1px solid ${rs.border}` }}>
                            {rs.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-white/30 uppercase font-mono">{u.preferred_lang}</td>
                        <td className="px-5 py-3.5 text-[11px] text-white/25">
                          {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {u.role !== "switchmycare_admin" ? (
                            <form action={async (fd: FormData) => {
                              "use server";
                              const newRole = fd.get("role") as string;
                              await setUserRole(u.id, newRole);
                            }} className="inline-flex items-center gap-2">
                              <select name="role" defaultValue={u.role}
                                className="text-[11px] px-2 py-1.5 rounded-xl font-medium"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", outline: "none" }}>
                                <option value="patient">Patient</option>
                                <option value="agency_staff">Agency Staff</option>
                                <option value="agency_admin">Agency Admin</option>
                                <option value="switchmycare_admin">Admin</option>
                              </select>
                              <button type="submit"
                                className="text-[11px] font-semibold text-white/50 hover:text-white transition-colors px-2.5 py-1.5 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                Save
                              </button>
                            </form>
                          ) : (
                            <span className="text-[11px] text-white/20 italic">Super Admin</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
