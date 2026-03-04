import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Globe, Star, ShieldCheck, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { AgencyProfileForm } from "@/components/agency/agency-profile-form";
import { payerLabel, careTypeLabel, cn } from "@/lib/utils";

export const metadata = { title: "Agency Profile | SwitchMyCare" };
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
    <div className="min-h-screen bg-[#FAFAFB] text-zinc-900 font-sans pb-20">
      <AgencyNav
        agencyName={agency.name}
        staffName={staffName}
        staffRole={member.role}
        pendingCount={stats.pending}
      />

      <main className="max-w-[1240px] mx-auto px-5 py-10 space-y-6">
        <Link href="/agency/dashboard" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="size-3.5" /> Dashboard
        </Link>

        <div className="space-y-1 mb-8">
          <h1 className="text-[28px] font-bold tracking-tight">Agency Profile</h1>
          <p className="text-[14px] font-medium text-zinc-500">How your agency appears publicly on SwitchMyCare.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6">

            {/* Editable Card */}
            <div className="rounded-2xl bg-white border border-zinc-200/80 shadow-sm p-6 space-y-5">
              <h2 className="text-[16px] font-bold text-zinc-900 border-b border-zinc-100 pb-3">Contact & Languages</h2>
              <form className="space-y-4">
                <AgencyProfileForm
                  initialData={{
                    phone: agency.phone ?? "",
                    email: agency.email ?? "",
                    website: agency.website ?? "",
                    languages_spoken: agency.languages_spoken,
                  }}
                  isAdmin={isAdmin}
                />
              </form>
            </div>

            {/* Read-only system data */}
            <div className="rounded-2xl bg-white border border-zinc-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h2 className="text-[16px] font-bold text-zinc-900">Licensure & Services</h2>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">System Only</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Care Types</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agency.care_types.map(t => <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700">{careTypeLabel(t)}</span>)}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Payers Accepted</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agency.payers_accepted.map(p => <span key={p} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700">{payerLabel(p)}</span>)}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Services Offered</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agency.services_offered.map(s => <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-50 border border-zinc-200 text-zinc-600">{s.replace(/_/g, " ")}</span>)}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Counties Served</p>
                  <p className="text-[13px] font-semibold text-zinc-800">{agency.service_counties.join(", ")}</p>
                </div>
                {agency.pa_license_number && (
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">PA License No.</p>
                    <p className="text-[13px] font-mono text-zinc-800 bg-zinc-50 px-2 py-0.5 rounded-md w-fit border border-zinc-200">{agency.pa_license_number}</p>
                  </div>
                )}
              </div>

              <p className="text-[12px] font-medium text-zinc-500 italic pt-4 mt-2 border-t border-zinc-50">
                To update licensure or service area boundaries, please contact <a href="mailto:support@switchmycare.com" className="text-zinc-900 font-bold hover:underline">support@switchmycare.com</a>.
              </p>
            </div>
          </div>

          {/* Right: Preview Panels */}
          <div className="space-y-6">

            {/* Public Listing Card (How patients see it) */}
            <div className="rounded-2xl bg-white border border-zinc-200 shadow-xl overflow-hidden shadow-zinc-900/5">
              <div className="h-14 bg-gradient-to-r from-zinc-800 to-zinc-600" />
              <div className="p-5 -mt-4 space-y-3 relative z-10">
                <div className="flex items-start justify-between gap-2">
                  <div className="bg-white rounded-xl p-1 shadow-sm border border-zinc-100">
                    <div className="h-10 w-10 bg-zinc-50 rounded-lg flex items-center justify-center">
                      <span className="text-[16px] font-bold text-zinc-800">{agency.name[0]?.toUpperCase()}</span>
                    </div>
                  </div>
                  {agency.is_verified_partner && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-bold border border-emerald-200 mt-3">
                      <ShieldCheck className="size-3" /> Verified
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-zinc-900 leading-snug tracking-tight">{agency.name}</p>
                  {agency.dba_name && <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5">DBA {agency.dba_name}</p>}
                </div>

                <div className="space-y-1.5 text-[12px] font-medium text-zinc-600 pt-2">
                  {agency.address_city && (
                    <div className="flex items-center gap-2"><MapPin className="size-3.5 text-zinc-400" /> {agency.address_city}, {agency.address_state}</div>
                  )}
                  {agency.phone && (
                    <div className="flex items-center gap-2"><Phone className="size-3.5 text-zinc-400" /> {agency.phone}</div>
                  )}
                  {agency.website && (
                    <div className="flex items-center gap-2"><Globe className="size-3.5 text-zinc-400" /> <span className="truncate">{agency.website.replace(/^https?:\/\//, "")}</span></div>
                  )}
                </div>

                {agency.medicare_quality_score && (
                  <div className="flex items-center gap-2 text-[12px] bg-amber-50 rounded-lg px-2.5 py-1.5 border border-amber-100/50 w-fit mt-1">
                    <Star className="size-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-amber-900">{agency.medicare_quality_score.toFixed(1)} <span className="text-amber-700 font-medium ml-0.5">Quality rating</span></span>
                  </div>
                )}

                <div className="pt-3 mt-1 border-t border-zinc-100 text-[11px] flex justify-between font-bold">
                  <span className={agency.is_accepting_patients ? "text-emerald-600" : "text-red-500"}>
                    {agency.is_accepting_patients ? "● Accepting Patients" : "○ Not Accepting"}
                  </span>
                  <span className="text-zinc-400 font-medium">{stats.total} cases done</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="rounded-2xl bg-white border border-zinc-200/80 shadow-sm p-5 space-y-3">
              <h3 className="text-[14px] font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
                <Award className="size-4 text-amber-500" /> Performance metrics
              </h3>
              <div className="space-y-2.5 text-[12px] font-medium text-zinc-600 pt-1">
                {[
                  { label: "Total requests", value: stats.total },
                  { label: "Currently active", value: stats.accepted },
                  { label: "Completed", value: stats.completed },
                  { label: "Avg response", value: agency.average_response_time_hours ? `${agency.average_response_time_hours}h` : "Not tracked", hl: true },
                ].map(({ label, value, hl }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-zinc-500">{label}</span>
                    <span className={cn("font-bold", hl ? "text-zinc-900" : "text-zinc-700")}>{value}</span>
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
