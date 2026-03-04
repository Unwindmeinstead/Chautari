import * as React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { AgencyRequestRow } from "@/components/agency/agency-request-row";
import { AcceptingPatientsToggle } from "@/components/agency/accepting-patients-toggle";
import { cn, payerLabel } from "@/lib/utils";
import {
  ClipboardList, Clock, CheckCircle2, PackageCheck,
  ArrowRight, AlertTriangle, Users, MapPin, Globe, Star, ShieldCheck
} from "lucide-react";

export const metadata = { title: "Agency Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

export default async function AgencyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { agency, member, requests, stats } = await getAgencyPortalData();

  if (!agency || !member) {
    return (
      <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-6 bg-dots-zinc-200">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-zinc-200 shadow-xl text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-amber-50 mx-auto flex items-center justify-center">
            <AlertTriangle className="size-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">No Agency Found</h1>
            <p className="text-[13px] text-zinc-500 leading-relaxed font-medium">
              Your account isn't linked to a home care agency yet. Please wait for an administrator to set up your access.
            </p>
          </div>
          <Link href="/api/auth/signout" className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-6 text-[13px] font-semibold text-white hover:bg-zinc-800 transition-colors">
            Sign out safely
          </Link>
        </div>
      </div>
    );
  }

  const staffName = user?.email?.split("@")[0] ?? "Staff";
  const isAdmin = ["admin", "owner"].includes(member.role);
  const newRequests = requests.filter((r) => r.status === "submitted");
  const recentRequests = requests.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-zinc-900 font-sans selection:bg-zinc-200 pb-20">
      <AgencyNav agencyName={agency.name} staffName={staffName} staffRole={member.role} pendingCount={stats.pending} />

      <main className="max-w-[1400px] mx-auto px-5 mt-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-1">
            <h1 className="text-[28px] font-bold tracking-tight">
              Welcome back, <span className="capitalize">{staffName}</span>.
            </h1>
            <p className="text-[14px] font-medium text-zinc-500">
              You have <strong className="text-zinc-800">{stats.pending} pending requests</strong> awaiting review.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 bg-white px-1.5 py-1.5 rounded-2xl border border-zinc-200 shadow-sm">
            <AcceptingPatientsToggle initialValue={agency.is_accepting_patients} isAdmin={isAdmin} />
          </div>
        </div>

        {/* Actionable Banner */}
        {newRequests.length > 0 && (
          <div className="relative overflow-hidden rounded-[24px] bg-white border border-amber-200/60 shadow-lg shadow-amber-900/5 group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-amber-100/40 to-transparent -translate-y-1/2 translate-x-1/3 blur-3xl rounded-full" />
            <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <ClipboardList className="size-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-amber-950 tracking-tight">
                    {newRequests.length} new switch request{newRequests.length > 1 ? "s" : ""} awaiting review
                  </h2>
                  <p className="text-[13px] font-medium text-amber-900/70 mt-0.5">
                    Patients are waiting for your response. Review them now to maintain your quality scores.
                  </p>
                </div>
              </div>
              <Link href="/agency/requests?filter=submitted"
                className="shrink-0 h-11 px-6 rounded-xl bg-amber-500 text-white text-[13px] font-bold flex items-center justify-center shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-colors">
                Review Requests <ArrowRight className="size-4 ml-2" />
              </Link>
            </div>
          </div>
        )}

        {/* Bento Board: KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Received", value: stats.total, icon: <PackageCheck />, bg: "bg-white", text: "text-zinc-900" },
            { label: "Action Required", value: stats.pending, icon: <Clock />, bg: "bg-white", text: "text-amber-600", urgent: stats.pending > 0 },
            { label: "Active Clients", value: stats.accepted, icon: <Users />, bg: "bg-white", text: "text-emerald-600" },
            { label: "Completed", value: stats.completed, icon: <CheckCircle2 />, bg: "bg-white", text: "text-blue-600" },
          ].map((s, i) => (
            <div key={i} className={`relative p-6 rounded-2xl border ${s.urgent ? 'border-amber-200 ring-1 ring-amber-100' : 'border-zinc-200/80'} ${s.bg} shadow-sm group hover:shadow-md transition-shadow`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-zinc-50 border border-zinc-100 group-hover:bg-zinc-100 transition-colors ${s.text}`}>
                  {React.cloneElement(s.icon as React.ReactElement, { className: "size-5" })}
                </div>
              </div>
              <p className={`text-[32px] font-bold leading-none tracking-tight mb-1 hidden lg:block`}>{s.value}</p>
              <p className={`text-[24px] font-bold leading-none tracking-tight mb-1 lg:hidden`}>{s.value}</p>
              <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Lower Section (Requests & Snapshot side by side) */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-[18px] font-bold tracking-tight text-zinc-900">Recent Activity</h2>
              <Link href="/agency/requests" className="text-[12px] font-bold text-zinc-500 hover:text-zinc-900 flex items-center transition-colors">
                View all <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center">
                <div className="h-12 w-12 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="size-5 text-zinc-400" />
                </div>
                <h3 className="text-[15px] font-bold text-zinc-800">No recent requests</h3>
                <p className="text-[13px] text-zinc-500 mt-1 max-w-sm mx-auto font-medium">New switch requests from patients within your service area will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map(r => <AgencyRequestRow key={r.id} request={r} />)}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions Panel */}
            <div className="rounded-2xl bg-zinc-900 text-white p-6 shadow-xl relative overflow-hidden">
              <h3 className="text-[15px] font-bold mb-4">Quick Links</h3>
              <div className="grid gap-2 relative z-10">
                <Link href="/agency/requests?filter=submitted" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <div className="flex items-center gap-3 text-[13px] font-medium">
                    <ClipboardList className="size-4 text-zinc-400" /> Pending requests
                  </div>
                  {stats.pending > 0 && <span className="h-5 px-1.5 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">{stats.pending}</span>}
                </Link>
                <Link href="/agency/requests?filter=accepted" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <div className="flex items-center gap-3 text-[13px] font-medium">
                    <CheckCircle2 className="size-4 text-zinc-400" /> Accepted cases
                  </div>
                </Link>
                <Link href="/agency/team" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <div className="flex items-center gap-3 text-[13px] font-medium">
                    <Users className="size-4 text-zinc-400" /> Manage Team
                  </div>
                </Link>
              </div>
            </div>

            {/* Profile Snapshot */}
            <div className="rounded-2xl bg-white border border-zinc-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-bold text-zinc-900">Current Profile</h3>
                {isAdmin && (
                  <Link href="/agency/profile" className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900">Edit</Link>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Service Areas</p>
                    <p className="text-[13px] font-medium text-zinc-800 leading-snug">{agency.service_counties.slice(0, 3).join(", ")} {agency.service_counties.length > 3 && `+${agency.service_counties.length - 3}`}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="size-4 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Payers</p>
                    <p className="text-[13px] font-medium text-zinc-800 leading-snug">{agency.payers_accepted.map(payerLabel).slice(0, 3).join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="size-4 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Languages</p>
                    <p className="text-[13px] font-medium text-zinc-800 leading-snug">{agency.languages_spoken.slice(0, 3).join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-3 border-t border-zinc-100">
                  <Star className="size-4 text-amber-500 mt-0.5 shrink-0 fill-amber-500" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Medicare Score</p>
                    <p className="text-[13px] font-bold text-zinc-900">{agency.medicare_quality_score ? `${agency.medicare_quality_score.toFixed(1)} / 5.0` : "Not rated"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
