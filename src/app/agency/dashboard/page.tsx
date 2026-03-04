import * as React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { AgencyRequestRow } from "@/components/agency/agency-request-row";
import { AcceptingPatientsToggle } from "@/components/agency/accepting-patients-toggle";
import { payerLabel, cn } from "@/lib/utils";
import {
  PackageCheck, AlertTriangle, ArrowRight, Activity, ArrowUpRight, Clock, Users, CheckCircle2,
  Settings
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
          <div className="h-16 w-16 rounded-full bg-red-50 mx-auto flex items-center justify-center">
            <AlertTriangle className="size-8 text-red-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">No Agency Found</h1>
            <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
              Your account isn't linked to a home care agency yet. Please wait for an administrator to set up your access.
            </p>
          </div>
          <Link href="/api/auth/signout" className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-900 px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors">
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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 pb-20">
      <AgencyNav agencyName={agency.name} staffName={staffName} staffRole={member.role} pendingCount={stats.pending} />

      <main className="max-w-[1100px] mx-auto px-6 mt-10 space-y-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100/60">
          <div className="space-y-1.5">
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900 leading-none">
              Overview
            </h1>
            <p className="text-[14px] font-medium text-gray-500 max-w-xl">
              Good morning, <span className="capitalize">{staffName}</span>. You have <strong className="text-gray-900 font-bold">{stats.pending} requests</strong> waiting for review.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <AcceptingPatientsToggle initialValue={agency.is_accepting_patients} isAdmin={isAdmin} />
            {isAdmin && (
              <Link href="/agency/profile" className="flex items-center justify-center h-9 w-9 bg-gray-50 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <Settings className="size-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Actionable Banner (Compact) */}
        {newRequests.length > 0 && (
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5 flex flex-col md:flex-row items-center justify-between gap-6 group">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                <Activity className="size-5 text-gray-900" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">
                  {newRequests.length} new switch request{newRequests.length > 1 ? "s" : ""}
                </h2>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                  Review waiting patients to maintain your agency's quality score.
                </p>
              </div>
            </div>
            <Link href="/agency/requests?filter=submitted"
              className="shrink-0 h-10 px-6 rounded-lg bg-gray-900 text-white text-[13px] font-bold flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm">
              Review Now <ArrowRight className="size-4 ml-2" />
            </Link>
          </div>
        )}

        {/* Compact KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Received", value: stats.total, icon: <PackageCheck className="size-4" /> },
            { label: "Action Required", value: stats.pending, icon: <Clock className="size-4" />, highlight: stats.pending > 0 },
            { label: "Active Clients", value: stats.accepted, icon: <Users className="size-4" /> },
            { label: "Completed", value: stats.completed, icon: <CheckCircle2 className="size-4" /> },
          ].map((s, i) => (
            <div key={i} className="flex flex-col py-2 border-l-2 pl-5" style={{ borderColor: s.highlight ? '#2563eb' : '#f3f4f6' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className={cn("flex items-center justify-center", s.highlight ? "text-blue-600" : "text-gray-400")}>
                  {s.icon}
                </div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
              </div>
              <p className={cn("text-3xl font-extrabold tracking-tight mt-1", s.highlight ? 'text-blue-600' : 'text-gray-900')}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Activity List */}
        <div className="space-y-5 pt-6 border-t border-gray-100/60">
          <div className="flex items-end justify-between">
            <h2 className="text-[18px] font-bold tracking-tight text-gray-900">Recent Activity</h2>
            <div className="flex items-center gap-3">
              <Link href="/agency/requests?filter=accepted" className="text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
                View Accepted
              </Link>
              <Link href="/agency/team" className="text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
                Manage Team
              </Link>
              <div className="w-px h-3 bg-gray-200 hidden sm:block" />
              <Link href="/agency/requests" className="text-[13px] font-bold text-blue-600 hover:text-blue-800 flex items-center transition-colors">
                All requests <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {recentRequests.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-10 text-center">
              <div className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4">
                <PackageCheck className="size-5 text-gray-400" />
              </div>
              <p className="text-[15px] font-bold text-gray-900">No recent requests</p>
              <p className="text-[13px] text-gray-500 mt-1 max-w-sm mx-auto font-medium">
                New switch requests from patients within your service area will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map(r => <AgencyRequestRow key={r.id} request={r} />)}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
