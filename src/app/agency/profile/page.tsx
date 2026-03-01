import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Phone, Globe, Star, ShieldCheck, Award,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { AgencyProfileForm } from "@/components/agency/agency-profile-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { payerLabel, careTypeLabel } from "@/lib/utils";

export const metadata = { title: "Agency Profile | Chautari" };
export const dynamic = "force-dynamic";

export default async function AgencyProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const data = await getAgencyPortalData();
  if (!data.agency || !data.member) redirect("/agency/dashboard");

  const { agency, member, stats } = data;
  const isAdmin = ["admin", "owner"].includes(member.role);
  const staffName = user.email?.split("@")[0] ?? "Staff";

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyNav
        agencyName={agency.name}
        staffName={staffName}
        staffRole={member.role}
        pendingCount={stats.pending}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/agency/dashboard"><ArrowLeft className="size-4 mr-1" />Dashboard</Link>
        </Button>

        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-gray-800">Agency Profile</h1>
          <p className="text-gray-500 mt-1">How your agency appears to patients on Chautari.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Left: editable fields */}
          <div className="lg:col-span-2 space-y-5">

            {/* Editable contact */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-6 space-y-5">
              <h2 className="font-fraunces text-lg font-semibold text-gray-800">Contact & Languages</h2>
              <AgencyProfileForm
                initialData={{
                  phone: agency.phone ?? "",
                  email: agency.email ?? "",
                  website: agency.website ?? "",
                  languages_spoken: agency.languages_spoken,
                }}
                isAdmin={isAdmin}
              />
            </div>

            {/* Read-only licensure */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-fraunces text-lg font-semibold text-gray-800">Licensure & Services</h2>
                <Badge variant="secondary" className="text-xs">Set by Chautari admin</Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Care types</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agency.care_types.map((t) => <Badge key={t} variant="default">{careTypeLabel(t)}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Payers accepted</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agency.payers_accepted.map((p) => <Badge key={p} variant="info">{payerLabel(p)}</Badge>)}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Services offered</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agency.services_offered.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Counties served</p>
                  <p className="text-gray-700">{agency.service_counties.join(", ")}</p>
                </div>
                {agency.pa_license_number && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">PA License</p>
                    <p className="text-gray-700 font-mono">{agency.pa_license_number}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 italic">
                To update licensure or service area, email{" "}
                <a href="mailto:agencies@chautari.com" className="text-forest-600 hover:underline">
                  agencies@chautari.com
                </a>
              </p>
            </div>
          </div>

          {/* Right: preview + stats */}
          <div className="space-y-5">

            {/* Public listing preview */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card overflow-hidden">
              <div className="h-10 bg-gradient-to-r from-forest-800 to-forest-600" />
              <div className="p-5 -mt-2 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-fraunces text-sm font-semibold text-gray-800 leading-snug">{agency.name}</p>
                    {agency.dba_name && <p className="text-xs text-gray-400">dba {agency.dba_name}</p>}
                  </div>
                  {agency.is_verified_partner && (
                    <Badge variant="verified" className="gap-1 shrink-0">
                      <ShieldCheck className="size-3" /> Verified
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  {agency.address_city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3 text-gray-400" />
                      {agency.address_city}, {agency.address_state}
                    </div>
                  )}
                  {agency.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3 text-gray-400" />
                      {agency.phone}
                    </div>
                  )}
                  {agency.website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="size-3 text-gray-400" />
                      <span className="truncate max-w-[160px]">{agency.website.replace(/^https?:\/\//, "")}</span>
                    </div>
                  )}
                </div>
                {agency.medicare_quality_score && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="size-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-gray-700">{agency.medicare_quality_score.toFixed(1)}</span>
                    <span className="text-gray-400">quality score</span>
                  </div>
                )}
                <div className="pt-1 border-t border-gray-100 text-xs flex justify-between">
                  <span className={agency.is_accepting_patients ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                    {agency.is_accepting_patients ? "✓ Accepting" : "✗ Not accepting"}
                  </span>
                  <span className="text-gray-400">{stats.total} requests</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Award className="size-4 text-amber-500" /> Performance
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Total requests",   value: stats.total },
                  { label: "Currently active", value: stats.accepted },
                  { label: "Completed",        value: stats.completed },
                  { label: "Avg response",     value: agency.average_response_time_hours ? `${agency.average_response_time_hours}h` : "Not tracked" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
