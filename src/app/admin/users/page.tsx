import { getAdminUsers, setUserRole, suspendUser, deleteUserAccount } from "@/lib/admin-actions";
import { Users, User, Search, ShieldAlert, ShieldCheck, Ban, CheckCircle2 } from "lucide-react";
import { DeleteUserButton, RoleSelect } from "@/components/admin/user-actions";
import Link from "next/link";

export const metadata = { title: "Users | Admin" };
export const dynamic = "force-dynamic";

const CARD = { background: "#111113", border: "1px solid rgba(255,255,255,0.08)" } as const;

const ROLE_TABS = ["all", "patient", "agency_staff", "agency_admin", "chautari_admin"] as const;

const ROLE_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  patient: { label: "Patient", color: "rgba(255,255,255,0.6)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" },
  agency_staff: { label: "Agency Staff", color: "rgba(147,197,253,0.9)", bg: "rgba(147,197,253,0.08)", border: "rgba(147,197,253,0.2)" },
  agency_admin: { label: "Agency Admin", color: "#FBBF24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
  chautari_admin: { label: "Chautari Admin", color: "#FCA5A5", bg: "rgba(252,165,165,0.08)", border: "rgba(252,165,165,0.2)" },
};

const ROLE_OPTIONS = [
  { v: "patient", l: "Patient" },
  { v: "agency_staff", l: "Agency Staff" },
  { v: "agency_admin", l: "Agency Admin" },
  { v: "chautari_admin", l: "Chautari Admin" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const role = sp.role && sp.role !== "all" ? sp.role : undefined;
  const query = sp.q ?? undefined;

  const { users, total } = await getAdminUsers({ role, search: query, limit: 200 });

  return (
    <div className="min-h-screen" style={{ background: "#09090B" }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 gap-6"
        style={{ background: "rgba(9,9,11,0.92)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
        <div>
          <p className="text-[14px] font-bold text-white">Users</p>
          <p className="text-[11px] text-white/30 mt-0.5">{total.toLocaleString()} total accounts</p>
        </div>

        {/* Search */}
        <form method="GET" action="/admin/users" className="hidden md:flex items-center flex-1 max-w-sm">
          {role && <input type="hidden" name="role" value={role} />}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/25 pointer-events-none" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search by name…"
              className="w-full h-8 pl-9 pr-3 rounded-xl text-[12px] font-medium placeholder:text-white/20 focus:outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
            />
          </div>
        </form>
      </div>

      <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">

        {/* Role filter tabs */}
        <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {ROLE_TABS.map((r) => {
            const isActive = (role ?? "all") === r;
            const params = new URLSearchParams();
            if (r !== "all") params.set("role", r);
            if (query) params.set("q", query);
            return (
              <Link
                key={r}
                href={`/admin/users${params.toString() ? `?${params}` : ""}`}
                className="px-4 py-2.5 text-[12px] font-semibold transition-colors whitespace-nowrap border-b-2 -mb-px capitalize"
                style={{
                  borderBottomColor: isActive ? "rgba(255,255,255,0.7)" : "transparent",
                  color: isActive ? "white" : "rgba(255,255,255,0.3)",
                }}
              >
                {r === "all" ? "All Users" : r.replace(/_/g, " ")}
              </Link>
            );
          })}
        </div>

        {/* User table */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {users.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                <Users className="size-7 text-white/15" />
              </div>
              <p className="text-[13px] text-white/30">No users found</p>
              {query && (
                <Link href="/admin/users" className="text-[12px] font-semibold text-white/40 hover:text-white/70 transition-colors">
                  Clear search
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["User", "Email", "Role", "Phone", "Joined", "Status", "Actions"].map((h, i) => (
                      <th key={h}
                        className={`px-5 py-3 text-[10px] font-bold text-white/25 uppercase tracking-widest ${i >= 5 ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.patient;
                    const isSuperAdmin = u.role === "chautari_admin";
                    return (
                      <tr key={u.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                        style={{ borderBottom: i < users.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>

                        {/* Avatar + name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 font-bold text-[13px] text-white/50"
                              style={{ background: "rgba(255,255,255,0.07)" }}>
                              {u.full_name?.[0]?.toUpperCase() ?? <User className="size-4 text-white/30" />}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-white leading-none">
                                {u.full_name ?? <span className="text-white/25 italic font-normal">No name</span>}
                              </p>
                              <p className="text-[10px] font-mono text-white/20 mt-0.5">{u.id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-3.5">
                          <p className="text-[12px] font-medium text-white/50 max-w-[200px] truncate">{u.email ?? "—"}</p>
                        </td>

                        {/* Role badge */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-2.5 py-1"
                            style={{ color: rs.color, background: rs.bg, border: `1px solid ${rs.border}` }}>
                            {rs.label}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-3.5 text-[12px] text-white/30 font-mono">
                          {u.phone ?? <span className="italic text-white/15">—</span>}
                        </td>

                        {/* Joined */}
                        <td className="px-5 py-3.5 text-[11px] text-white/25 whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 text-right">
                          {u.is_suspended ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                              <Ban className="size-3" /> Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400/80 bg-emerald-400/8 border border-emerald-400/15 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="size-3" /> Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          {isSuperAdmin ? (
                            <span className="text-[11px] text-white/20 italic">Protected</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {/* Role change — client component with instant update */}
                              <RoleSelect
                                userId={u.id}
                                currentRole={u.role}
                                roleOptions={ROLE_OPTIONS}
                                setRoleAction={setUserRole}
                              />

                              {/* Suspend / Unsuspend */}
                              <form action={async () => {
                                "use server";
                                await suspendUser(u.id, !u.is_suspended);
                              }}>
                                <button type="submit"
                                  title={u.is_suspended ? "Unsuspend user" : "Suspend user"}
                                  className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors"
                                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                  {u.is_suspended
                                    ? <ShieldCheck className="size-3.5 text-emerald-400/70 hover:text-emerald-400" />
                                    : <ShieldAlert className="size-3.5 text-yellow-400/50 hover:text-yellow-400" />}
                                </button>
                              </form>

                              {/* Delete */}
                              <DeleteUserButton
                                userId={u.id}
                                userName={u.full_name}
                                deleteAction={deleteUserAccount}
                              />
                            </div>
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

        <p className="text-[11px] text-white/20 text-center pb-4">
          Showing {users.length} of {total.toLocaleString()} users · All actions are logged to the audit trail
        </p>
      </div>
    </div>
  );
}
