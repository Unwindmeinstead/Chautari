import { getAdminUsers, setUserRole } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Users | Admin" };
export const dynamic = "force-dynamic";

const ROLE_TABS = ["all", "patient", "agency_staff", "agency_admin", "chautari_admin"] as const;

const ROLE_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  patient:        { label: "Patient", variant: "secondary" },
  agency_staff:   { label: "Agency Staff", variant: "default" },
  agency_admin:   { label: "Agency Admin", variant: "warning" },
  chautari_admin: { label: "Chautari Admin", variant: "destructive" },
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
    <div className="px-8 py-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-gray-800">Users</h1>
        <p className="text-gray-500 mt-0.5">{total} total users</p>
      </div>

      {/* Role tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-0">
        {ROLE_TABS.map((r) => {
          const active = (role ?? "all") === r;
          return (
            <Link
              key={r}
              href={r === "all" ? "/admin/users" : `/admin/users?role=${r}`}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize whitespace-nowrap ${
                active
                  ? "border-forest-600 text-forest-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {r === "all" ? "All" : r.replace(/_/g, " ")}
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Language</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const roleBadge = ROLE_BADGE[u.role] ?? { label: u.role, variant: "secondary" as const };
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <User className="size-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{u.full_name ?? <span className="text-gray-400 italic">No name</span>}</p>
                            <p className="text-xs text-gray-400 font-mono">{u.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={roleBadge.variant} className="text-xs">{roleBadge.label}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 uppercase text-xs">{u.preferred_lang}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {u.role !== "chautari_admin" && (
                          <form action={async (fd: FormData) => {
                            "use server";
                            const newRole = fd.get("role") as string;
                            await setUserRole(u.id, newRole);
                          }}>
                            <select
                              name="role"
                              defaultValue={u.role}
                              onChange={undefined}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-forest-500 mr-2"
                            >
                              <option value="patient">Patient</option>
                              <option value="agency_staff">Agency Staff</option>
                              <option value="agency_admin">Agency Admin</option>
                              <option value="chautari_admin">Chautari Admin</option>
                            </select>
                            <button
                              type="submit"
                              className="text-xs text-forest-600 hover:text-forest-800 underline"
                            >
                              Save
                            </button>
                          </form>
                        )}
                        {u.role === "chautari_admin" && (
                          <span className="text-xs text-gray-400 italic">Admin</span>
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
