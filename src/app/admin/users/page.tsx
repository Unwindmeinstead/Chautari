import { getAdminUsers, setUserRole } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Users | Admin" };
export const dynamic = "force-dynamic";

const ROLE_TABS = ["all", "patient", "agency_staff", "agency_admin", "switchmycare_admin"] as const;

const ROLE_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  patient: { label: "Patient", variant: "secondary" },
  agency_staff: { label: "Agency Staff", variant: "default" },
  agency_admin: { label: "Agency Admin", variant: "warning" },
  switchmycare_admin: { label: "SwitchMyCare Admin", variant: "destructive" },
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
    <div className="px-6 md:px-8 py-8 space-y-6 max-w-6xl">
      <div className="space-y-1">
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">Users</h1>
        <p className="text-forest-500 mt-0.5">{total} total users</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {ROLE_TABS.map((r) => {
          const active = (role ?? "all") === r;
          return (
            <Link
              key={r}
              href={r === "all" ? "/admin/users" : `/admin/users?role=${r}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize whitespace-nowrap border ${
                active
                  ? "bg-forest-600 text-cream border-forest-600"
                  : "bg-white text-forest-600 border-forest-100 hover:border-forest-300"
              }`}
            >
              {r === "all" ? "All" : r.replace(/_/g, " ")}
            </Link>
          );
        })}
      </div>

      <div className="rounded-3xl bg-white border border-forest-100 overflow-hidden shadow-card">
        {users.length === 0 ? (
          <div className="py-16 text-center text-forest-400">
            <Users className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-forest-100 bg-cream/60">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider">Language</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100">
                {users.map((u) => {
                  const roleBadge = ROLE_BADGE[u.role] ?? { label: u.role, variant: "secondary" as const };
                  return (
                    <tr key={u.id} className="hover:bg-cream/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-forest-50 flex items-center justify-center shrink-0">
                            <User className="size-4 text-forest-400" />
                          </div>
                          <div>
                            <p className="font-medium text-forest-800">{u.full_name ?? <span className="text-forest-400 italic">No name</span>}</p>
                            <p className="text-xs text-forest-400 font-mono">{u.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={roleBadge.variant} className="text-xs">{roleBadge.label}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-forest-600 uppercase text-xs">{u.preferred_lang}</td>
                      <td className="px-4 py-3.5 text-xs text-forest-400">
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {u.role !== "switchmycare_admin" && (
                          <form
                            action={async (fd: FormData) => {
                              "use server";
                              const newRole = fd.get("role") as string;
                              await setUserRole(u.id, newRole);
                            }}
                          >
                            <select
                              name="role"
                              defaultValue={u.role}
                              onChange={undefined}
                              className="text-xs border border-forest-200 rounded-lg px-2 py-1.5 bg-white text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-500 mr-2"
                            >
                              <option value="patient">Patient</option>
                              <option value="agency_staff">Agency Staff</option>
                              <option value="agency_admin">Agency Admin</option>
                              <option value="switchmycare_admin">SwitchMyCare Admin</option>
                            </select>
                            <button type="submit" className="text-xs text-forest-600 hover:text-forest-800 underline">
                              Save
                            </button>
                          </form>
                        )}
                        {u.role === "switchmycare_admin" && (
                          <span className="text-xs text-forest-400 italic">Admin</span>
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
  );
}
