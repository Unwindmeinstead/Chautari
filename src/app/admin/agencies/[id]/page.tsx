import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, CheckCircle2, XCircle, Star, Users,
  ArrowLeftRight, Phone, Mail, Globe, MapPin, Shield
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { approveAgency, deactivateAgency, toggleVerifiedPartner } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; variant: "warning" | "success" | "secondary" | "destructive" | "default" }> = {
  submitted:    { label: "New", variant: "warning" },
  under_review: { label: "Reviewing", variant: "default" },
  accepted:     { label: "Accepted", variant: "success" },
  completed:    { label: "Done", variant: "secondary" },
  denied:       { label: "Denied", variant: "destructive" },
};

export default async function AdminAgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const agencyRes = await supabase.from("agencies").select("*").eq("id", id).single();
  if (agencyRes.error || !agencyRes.data) return notFound();
  const agency = agencyRes.data;

  const [membersRes, requestsRes] = await Promise.all([
    supabase
      .from("agency_members")
      .select("id, user_id, role, title, is_active, joined_at")
      .eq("agency_id", id)
      .order("joined_at", { ascending: false }),
    supabase
      .from("switch_requests")
      .select("id, patient_id, status, care_type, created_at")
      .eq("new_agency_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const members = membersRes.data ?? [];
  const requests = requestsRes.data ?? [];

  // Fetch member profile names
  const memberIds = members.map((m: any) => m.user_id);
  const { data: memberProfiles } = memberIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", memberIds)
    : { data: [] };
  const profileMap = Object.fromEntries((memberProfiles ?? []).map((p: any) => [p.id, p.full_name]));

  // Fetch patient names for requests
  const patientIds = requests.map((r: any) => r.patient_id);
  const { data: patientProfiles } = patientIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", patientIds)
    : { data: [] };
  const patientMap = Object.fromEntries((patientProfiles ?? []).map((p: any) => [p.id, p.full_name]));

  const isApproved = agency.is_approved && agency.is_active;
  const isPending = agency.is_active && !agency.is_approved;

  return (
    <div className="px-8 py-8 max-w-5xl space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/admin/agencies">
          <ArrowLeft className="size-4" /> Back to agencies
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4 justify-between flex-wrap">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-forest-100 flex items-center justify-center shrink-0">
            <Building2 className="size-7 text-forest-600" />
          </div>
          <div>
            <h1 className="font-fraunces text-2xl font-semibold text-gray-800 flex items-center gap-2">
              {agency.name}
              {agency.is_verified_partner && <Star className="size-5 text-amber-500 fill-amber-500" />}
            </h1>
            <p className="text-gray-400 text-sm">NPI: {agency.npi}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {!agency.is_active ? (
                <Badge variant="secondary"><XCircle className="size-3 mr-1" />Inactive</Badge>
              ) : isPending ? (
                <Badge variant="warning">Pending approval</Badge>
              ) : (
                <Badge variant="success"><CheckCircle2 className="size-3 mr-1" />Approved</Badge>
              )}
              {agency.is_verified_partner && (
                <Badge variant="amber" className="gap-1"><Star className="size-3" />Verified Partner</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Admin actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isPending && (
            <form action={async () => { "use server"; await approveAgency(id); }}>
              <Button type="submit" className="gap-1.5">
                <CheckCircle2 className="size-4" /> Approve Agency
              </Button>
            </form>
          )}
          {isApproved && (
            <form action={async () => { "use server"; await deactivateAgency(id); }}>
              <Button type="submit" variant="outline" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                <XCircle className="size-4" /> Deactivate
              </Button>
            </form>
          )}
          <form action={async () => {
            "use server";
            await toggleVerifiedPartner(id, !agency.is_verified_partner);
          }}>
            <Button type="submit" variant="outline" className={cn("gap-1.5", agency.is_verified_partner && "text-amber-600 border-amber-200")}>
              <Star className="size-4" />
              {agency.is_verified_partner ? "Remove Verified" : "Mark Verified"}
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact */}
          <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="font-fraunces text-base font-semibold text-gray-800">Contact & Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2.5 text-gray-600">
                <MapPin className="size-4 text-gray-400 shrink-0" />
                <span>{agency.address_line1}, {agency.address_city}, {agency.address_state} {agency.address_zip}</span>
              </div>
              {agency.phone && (
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Phone className="size-4 text-gray-400 shrink-0" />
                  {agency.phone}
                </div>
              )}
              {agency.email && (
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Mail className="size-4 text-gray-400 shrink-0" />
                  {agency.email}
                </div>
              )}
              {agency.website && (
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Globe className="size-4 text-gray-400 shrink-0" />
                  <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-forest-600 hover:underline truncate">
                    {agency.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Care info */}
          <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3">
            <h2 className="font-fraunces text-base font-semibold text-gray-800">Services & Payers</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Care types</p>
                <div className="flex flex-wrap gap-1">
                  {(agency.care_types ?? []).map((t: string) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t.replace("_", " ")}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Payers accepted</p>
                <div className="flex flex-wrap gap-1">
                  {(agency.payers_accepted ?? []).map((p: string) => (
                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Languages</p>
                <p className="text-sm text-gray-600">{(agency.languages_spoken ?? []).join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Quality score</p>
                <p className="text-sm text-gray-600">{agency.medicare_quality_score ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Recent requests */}
          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <ArrowLeftRight className="size-4 text-gray-400" />
              <h2 className="font-fraunces text-base font-semibold text-gray-800">
                Recent Switch Requests ({requests.length})
              </h2>
            </div>
            {requests.length === 0 ? (
              <p className="text-sm text-gray-400 p-5 text-center">No requests yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.map((r: any) => {
                  const badge = STATUS_BADGE[r.status] ?? { label: r.status, variant: "secondary" as const };
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{patientMap[r.patient_id] ?? "Unknown patient"}</p>
                        <p className="text-xs text-gray-400">{r.care_type?.replace("_", " ")} ·{" "}
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <Badge variant={badge.variant} className="text-[10px] shrink-0">{badge.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Meta */}
          <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3">
            <h2 className="font-fraunces text-sm font-semibold text-gray-800">Record Info</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400">Created</dt>
                <dd className="text-gray-700">{new Date(agency.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">PA License</dt>
                <dd className="text-gray-700 font-mono text-xs">{agency.pa_license_number ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Avg response</dt>
                <dd className="text-gray-700">{agency.avg_response_hours ? `${agency.avg_response_hours}h` : "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Staff members */}
          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <Users className="size-4 text-gray-400" />
              <h2 className="font-fraunces text-sm font-semibold text-gray-800">
                Staff ({members.length})
              </h2>
            </div>
            {members.length === 0 ? (
              <p className="text-xs text-gray-400 p-4 text-center">No members</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {members.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2.5 px-4 py-3">
                    <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
                      {profileMap[m.user_id]?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {profileMap[m.user_id] ?? "Unknown"}
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize">{m.role}{m.title ? ` · ${m.title}` : ""}</p>
                    </div>
                    {!m.is_active && (
                      <span className="text-[10px] text-gray-400">Inactive</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
