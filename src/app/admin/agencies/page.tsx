import Link from "next/link";
import { Building2, CheckCircle2, XCircle, Clock, Star, ChevronRight } from "lucide-react";
import { getAdminAgencies, approveAgency, deactivateAgency } from "@/lib/admin-actions";

export const metadata = { title: "Agencies | Admin" };
export const dynamic = "force-dynamic";

const CARD = { background: "#111113", border: "1px solid rgba(255,255,255,0.08)" } as const;

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
    <div className="min-h-screen" style={{ background: "#09090B" }}>

      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(9,9,11,0.9)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
        <div>
          <p className="text-[13px] font-semibold text-white">Agencies</p>
          <p className="text-[11px] text-white/30 mt-0.5">{total} total on the platform</p>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">

        {/* Tabs */}
        <div className="flex gap-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {TABS.map(({ value, label }) => {
            const active = status === value;
            return (
              <Link
                key={label}
                href={value ? `/admin/agencies?status=${value}` : "/admin/agencies"}
                className="px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px"
                style={{
                  borderBottomColor: active ? "rgba(255,255,255,0.7)" : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.3)",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {agencies.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <Building2 className="size-7 text-white/15" />
              <p className="text-sm text-white/30">No agencies found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Agency", "NPI", "Status", "Members", "Requests", "Joined", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-white/25 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((a, i) => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: i < agencies.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "rgba(255,255,255,0.06)" }}>
                            <Building2 className="size-4 text-white/40" />
                          </div>
                          <div>
                            <Link href={`/admin/agencies/${a.id}`}
                              className="text-[13px] font-semibold text-white hover:text-white/80 transition-colors flex items-center gap-1.5">
                              {a.name}
                              {a.is_verified_partner && <Star className="size-3 text-amber-400 fill-amber-400" />}
                            </Link>
                            <p className="text-[11px] text-white/30">{a.address_city}, {a.address_state}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] text-white/30">{a.npi}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {!a.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-0.5"
                            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <XCircle className="size-3" /> Inactive
                          </span>
                        ) : !a.is_approved ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-0.5"
                            style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.2)" }}>
                            <Clock className="size-3" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-0.5"
                            style={{ background: "rgba(134,239,172,0.08)", color: "#86EFAC", border: "1px solid rgba(134,239,172,0.2)" }}>
                            <CheckCircle2 className="size-3" /> Approved
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-white/50">{a.member_count ?? 0}</td>
                      <td className="px-5 py-3.5 text-[13px] text-white/50">{a.request_count ?? 0}</td>
                      <td className="px-5 py-3.5 text-[11px] text-white/25">
                        {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/admin/agencies/${a.id}`}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white/50 hover:text-white hover:bg-white/8 transition-all"
                            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                            View
                          </Link>
                          {a.is_active && !a.is_approved && (
                            <form action={async () => { "use server"; await approveAgency(a.id); }}>
                              <button type="submit"
                                className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all"
                                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                                Approve
                              </button>
                            </form>
                          )}
                          {a.is_active && a.is_approved && (
                            <form action={async () => { "use server"; await deactivateAgency(a.id); }}>
                              <button type="submit"
                                className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors">
                                Deactivate
                              </button>
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
    </div>
  );
}
