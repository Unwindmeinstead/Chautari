import * as React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { AgencyRequestRow } from "@/components/agency/agency-request-row";
import { AcceptingPatientsToggle } from "@/components/agency/accepting-patients-toggle";
import { payerLabel, careTypeLabel } from "@/lib/utils";
import {
  ClipboardList, PackageCheck, AlertTriangle, ArrowRight, Activity, ArrowUpRight
} from "lucide-react";

export const metadata = { title: "Agency Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

export default async function AgencyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { agency, member, requests, stats } = await getAgencyPortalData();

  if (!agency || !member) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-red-50 mx-auto flex items-center justify-center">
            <AlertTriangle className="size-10 text-red-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">No Agency Found</h1>
            <p className="text-[15px] text-gray-500 leading-relaxed font-medium">
              Your account isn't linked to a home care agency yet. Please wait for an administrator to set up your access.
            </p>
          </div>
          <Link href="/api/auth/signout" className="inline-flex h-12 items-center justify-center rounded-full bg-gray-900 px-8 text-[15px] font-bold text-white hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10">
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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 pb-24">
      <AgencyNav agencyName={agency.name} staffName={staffName} staffRole={member.role} pendingCount={stats.pending} />

      <main className="max-w-[1400px] mx-auto px-6 mt-16 space-y-16">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-gray-100">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-none">
              Welcome back, <span className="capitalize">{staffName}</span>.
            </h1>
            <p className="text-[18px] font-medium text-gray-500 max-w-2xl leading-relaxed">
              Here is your daily overview. You have <strong className="text-gray-900 font-bold">{stats.pending} requests</strong> waiting for review.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <AcceptingPatientsToggle initialValue={agency.is_accepting_patients} isAdmin={isAdmin} />
          </div>
        </div>

        {/* Actionable Banner (Clean White + Bold typography) */}
        {newRequests.length > 0 && (
          <div className="relative overflow-hidden rounded-[32px] bg-white border border-gray-200 shadow-xl shadow-gray-900/5 group pt-1">
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="h-20 w-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Activity className="size-8 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {newRequests.length} new switch request{newRequests.length > 1 ? "s" : ""}
                  </h2>
                  <p className="text-[15px] font-medium text-gray-500 max-w-lg">
                    Patients are waiting for your response. Review them now to maintain your quality scores and grow your agency.
                  </p>
                </div>
              </div>
              <Link href="/agency/requests?filter=submitted"
                className="shrink-0 h-14 px-8 rounded-full bg-gray-900 text-white text-[15px] font-bold flex items-center justify-center shadow-lg shadow-gray-900/10 hover:bg-gray-800 hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-gray-200">
                Review Requests <ArrowUpRight className="size-5 ml-2" strokeWidth={3} />
              </Link>
            </div>
          </div>
        )}

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 px-4">
          {[
            { label: "Total Received", value: stats.total },
            { label: "Action Required", value: stats.pending, highlight: stats.pending > 0 },
            { label: "Active Clients", value: stats.accepted },
            { label: "Completed", value: stats.completed },
          ].map((s, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-end gap-3 mb-2">
                <p className={`text-6xl md:text-7xl font-extrabold tracking-tighter leading-none ${s.highlight ? 'text-blue-600' : 'text-gray-900'}`}>{s.value}</p>
                {s.highlight && <div className="h-3 w-3 rounded-full bg-blue-500 mb-3 animate-pulse" />}
              </div>
              <p className="text-[15px] font-bold text-gray-400 tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Lower Section (Requests & Snapshot side by side) */}
        <div className="grid lg:grid-cols-3 gap-12 items-start mt-8 pt-12 border-t border-gray-100">

          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Recent Activity</h2>
              <Link href="/agency/requests" className="text-[15px] font-bold text-blue-600 hover:text-blue-800 flex items-center transition-colors">
                View all <ArrowRight className="size-4 ml-1" />
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="rounded-[32px] bg-gray-50 border border-gray-100 p-16 text-center">
                <div className="h-16 w-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-6">
                  <PackageCheck className="size-6 text-gray-400" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900">No recent requests</h3>
                <p className="text-[15px] text-gray-500 mt-2 max-w-sm mx-auto font-medium leading-relaxed">
                  New switch requests from patients within your service area will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map(r => <AgencyRequestRow key={r.id} request={r} />)}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-10">
            {/* Quick Actions Panel - Modern typography list */}
            <div className="space-y-6">
              <h3 className="text-2xl font-extrabold text-gray-900">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link href="/agency/requests?filter=submitted" className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <span className="text-[16px] font-bold text-gray-600 group-hover:text-gray-900">Pending requests</span>
                  <div className="flex items-center gap-3">
                    {stats.pending > 0 && <span className="h-6 px-2.5 rounded-full bg-blue-100 text-blue-700 text-[12px] font-bold flex items-center justify-center">{stats.pending}</span>}
                    <ArrowUpRight className="size-5 text-gray-300 group-hover:text-gray-900 transition-colors" strokeWidth={2.5} />
                  </div>
                </Link>
                <div className="h-px bg-gray-100 mx-4" />
                <Link href="/agency/requests?filter=accepted" className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <span className="text-[16px] font-bold text-gray-600 group-hover:text-gray-900">Accepted cases</span>
                  <ArrowUpRight className="size-5 text-gray-300 group-hover:text-gray-900 transition-colors" strokeWidth={2.5} />
                </Link>
                <div className="h-px bg-gray-100 mx-4" />
                <Link href="/agency/team" className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <span className="text-[16px] font-bold text-gray-600 group-hover:text-gray-900">Manage Team</span>
                  <ArrowUpRight className="size-5 text-gray-300 group-hover:text-gray-900 transition-colors" strokeWidth={2.5} />
                </Link>
              </div>
            </div>

            {/* Profile Snapshot - Very clean key/value pairs */}
            <div className="rounded-[32px] bg-gray-50 border border-gray-100 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-gray-900">Public Profile</h3>
                {isAdmin && (
                  <Link href="/agency/profile" className="text-[13px] font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-full bg-blue-50">Edit</Link>
                )}
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-[12px] font-bold text-gray-400 mb-1 tracking-wide">SERVICE AREAS</p>
                  <p className="text-[15px] font-bold text-gray-900 leading-snug">{agency.service_counties.slice(0, 3).join(", ")} {agency.service_counties.length > 3 && `+${agency.service_counties.length - 3}`}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-400 mb-1 tracking-wide">ACCEPTED PAYERS</p>
                  <p className="text-[15px] font-bold text-gray-900 leading-snug">{agency.payers_accepted.map(payerLabel).slice(0, 3).join(", ")}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-400 mb-1 tracking-wide">LANGUAGES</p>
                  <p className="text-[15px] font-bold text-gray-900 leading-snug">{agency.languages_spoken.slice(0, 3).join(", ")}</p>
                </div>
                <div className="pt-2 border-t border-gray-200/50">
                  <p className="text-[12px] font-bold text-gray-400 mb-1 tracking-wide">MEDICARE SCORE</p>
                  <p className="text-[18px] font-extrabold text-gray-900">{agency.medicare_quality_score ? `${agency.medicare_quality_score.toFixed(1)} / 5.0` : "Not rated"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
