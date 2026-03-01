import Link from "next/link";
import { Building2, CheckCircle2, XCircle, Clock, Star } from "lucide-react";
import { getAdminAgencies, approveAgency, deactivateAgency } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Agencies | Admin" };
export const dynamic = "force-dynamic";

const TABS = [
  { value: undefined, label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "inactive", label: "Inactive" },
] as const;

export default async function AdminAgenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status as "pending" | "approved" | "inactive" | undefined;
  const search = sp.q;

  const { agencies, total } = await getAdminAgencies({ status, search, limit: 100 });

  return (
    <div className="px-8 py-8 space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-gray-800">Agencies</h1>
          <p className="text-gray-500 mt-0.5">{total} total agencies on the platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-0">
        {TABS.map(({ value, label }) => {
          const active = status === value;
          return (
            <Link
              key={label}
              href={value ? `/admin/agencies?status=${value}` : "/admin/agencies"}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? "border-forest-600 text-forest-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        {agencies.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Building2 className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No agencies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agency</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">NPI</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requests</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agencies.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-forest-100 flex items-center justify-center shrink-0">
                          <Building2 className="size-4 text-forest-600" />
                        </div>
                        <div>
                          <Link href={`/admin/agencies/${a.id}`} className="font-medium text-gray-800 hover:text-forest-700 flex items-center gap-1.5">
                            {a.name}
                            {a.is_verified_partner && <Star className="size-3 text-amber-500 fill-amber-500" />}
                          </Link>
                          <p className="text-xs text-gray-400">{a.address_city}, {a.address_state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-gray-500">{a.npi}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {!a.is_active ? (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="size-3" /> Inactive
                        </Badge>
                      ) : !a.is_approved ? (
                        <Badge variant="warning" className="gap-1">
                          <Clock className="size-3" /> Pending
                        </Badge>
                      ) : (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="size-3" /> Approved
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{a.member_count ?? 0}</td>
                    <td className="px-4 py-3.5 text-gray-600">{a.request_count ?? 0}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="outline" size="sm" asChild className="text-xs h-7">
                          <Link href={`/admin/agencies/${a.id}`}>View</Link>
                        </Button>
                        {a.is_active && !a.is_approved && (
                          <form action={async () => {
                            "use server";
                            await approveAgency(a.id);
                          }}>
                            <Button type="submit" size="sm" className="text-xs h-7 gap-1">
                              <CheckCircle2 className="size-3" /> Approve
                            </Button>
                          </form>
                        )}
                        {a.is_active && a.is_approved && (
                          <form action={async () => {
                            "use server";
                            await deactivateAgency(a.id);
                          }}>
                            <Button type="submit" variant="ghost" size="sm" className="text-xs h-7 text-red-500 hover:text-red-600 hover:bg-red-50">
                              Deactivate
                            </Button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
