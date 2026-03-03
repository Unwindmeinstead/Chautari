import * as React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { AgencyRequestRow } from "@/components/agency/agency-request-row";
import { AcceptingPatientsToggle } from "@/components/agency/accepting-patients-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, payerLabel } from "@/lib/utils";
import {
  ClipboardList, Clock, CheckCircle2, PackageCheck,
  ArrowRight, AlertTriangle,
} from "lucide-react";

export const metadata = { title: "Agency Dashboard | SwitchMyCare" };
export const dynamic = "force-dynamic";

export default async function AgencyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { agency, member, requests, stats } = await getAgencyPortalData();

  // Not linked to any agency
  if (!agency || !member) {
    return (
      <div className="min-h-screen bg-forest-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-forest-800/50 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full text-center space-y-8 relative z-10 animate-slide-up">
          <div className="h-20 w-20 rounded-[2rem] bg-forest-800 border border-forest-700 flex items-center justify-center mx-auto shadow-2xl">
            <AlertTriangle className="size-10 text-amber-400" />
          </div>
          <div className="space-y-3">
            <h1 className="font-fraunces text-3xl font-semibold text-white tracking-tight">No Agency Found</h1>
            <p className="text-forest-200/80 text-lg leading-relaxed">
              Your account isn&apos;t linked to a home care agency yet. Please wait for an administrator to set up your access.
            </p>
          </div>
          <Button variant="outline" size="lg" asChild className="rounded-xl border-forest-700 text-forest-300 hover:text-white hover:bg-forest-800 transition-all">
            <Link href="/api/auth/signout">Sign out safely</Link>
          </Button>
        </div>
      </div>
    );
  }

  const staffName = user?.email?.split("@")[0] ?? "Staff";
  const isAdmin = ["admin", "owner"].includes(member.role);
  const newRequests = requests.filter((r) => r.status === "submitted");
  const recentRequests = requests.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FDFCFB] relative selection:bg-amber-100 selection:text-amber-900 font-sans">
      {/* Ambient background gradients for premium feel */}
      <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[200px] -right-[100px] w-[800px] h-[800px] rounded-full bg-amber-400/5 blur-[120px] mix-blend-multiply" />
        <div className="absolute top-[100px] -left-[200px] w-[600px] h-[600px] rounded-full bg-forest-600/5 blur-[100px] mix-blend-multiply" />
      </div>

      <AgencyNav
        agencyName={agency.name}
        staffName={staffName}
        staffRole={member.role}
        pendingCount={stats.pending}
      />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up" style={{ animationDelay: "0ms" }}>
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Badge className="bg-white text-forest-800 border-forest-900/10 px-3 py-1 font-medium shadow-sm hover:bg-forest-50/50">
                {agency.dba_name ? agency.dba_name : agency.name}
              </Badge>
              {agency.is_verified_partner && (
                <Badge className="bg-green-50 text-green-700 border-green-200/50 px-3 py-1 font-medium flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="size-3.5" /> Verified Partner
                </Badge>
              )}
            </div>
            <h1 className="font-fraunces text-4xl md:text-5xl font-semibold text-forest-900 tracking-[-0.03em] leading-tight">
              Welcome back, <span className="text-amber-600 capitalize">{staffName}</span>.
            </h1>
            <p className="text-forest-600/80 text-lg max-w-2xl leading-relaxed font-medium">
              Here's what's happening at your agency today. You have {stats.pending} requests requiring attention.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 bg-white p-1.5 rounded-2xl shadow-sm border border-forest-900/5">
            <AcceptingPatientsToggle
              initialValue={agency.is_accepting_patients}
              isAdmin={isAdmin}
            />
          </div>
        </div>

        {/* Actionable Banner for New Requests */}
        {newRequests.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <div className="group relative overflow-hidden rounded-[28px] bg-gradient-to-r from-amber-500 to-amber-600 p-[1px] shadow-xl shadow-amber-500/10 transition-all duration-500 hover:shadow-amber-500/20">
              <div className="relative flex items-center justify-between gap-6 p-6 md:p-8 bg-white/95 backdrop-blur-3xl rounded-[27px] sm:flex-row flex-col text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 shadow-inner group-hover:scale-110 transition-transform duration-500 ease-out">
                    <ClipboardList className="size-7 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-fraunces text-2xl font-bold text-forest-900 tracking-tight">
                      {newRequests.length} new switch request{newRequests.length > 1 ? "s" : ""} awaiting review
                    </h2>
                    <p className="text-forest-500 font-medium mt-1">
                      Patients are waiting for your response. Keep your quality scores up by responding within 5 business days.
                    </p>
                  </div>
                </div>
                <Button variant="amber" size="lg" className="shrink-0 rounded-2xl shadow-md h-12 px-8 font-semibold text-base transition-all hover:scale-105" asChild>
                  <Link href="/agency/requests?filter=submitted">
                    Review Requests <ArrowRight className="size-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* High-Fidelity Stats Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
          {[
            { label: "Total requests", value: stats.total, icon: <PackageCheck className="size-6 text-forest-500" />, color: "text-forest-900", urgent: false },
            { label: "Pending action", value: stats.pending, icon: <Clock className="size-6 text-amber-600" />, color: "text-amber-600", urgent: stats.pending > 0 },
            { label: "Accepted (Active)", value: stats.accepted, icon: <CheckCircle2 className="size-6 text-emerald-600" />, color: "text-emerald-700", urgent: false },
            { label: "Completed", value: stats.completed, icon: <CheckCircle2 className="size-6 text-forest-500" />, color: "text-forest-600", urgent: false },
          ].map((s, i) => (
            <div key={s.label} className={cn(
              "relative overflow-hidden rounded-[32px] border bg-white p-7 shadow-[0_4px_24px_rgba(26,61,43,0.02)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(26,61,43,0.06)] group",
              s.urgent ? "border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-white" : "border-forest-900/5"
            )}>
              <div className="flex items-start justify-between mb-6">
                <div className={cn(
                  "p-3.5 rounded-2xl shadow-sm transition-colors duration-500",
                  s.urgent ? "bg-amber-100/80 text-amber-700 group-hover:bg-amber-100" : "bg-forest-50 text-forest-600 group-hover:bg-forest-100"
                )}>
                  {s.icon}
                </div>
                {s.urgent && (
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white"></span>
                  </div>
                )}
              </div>
              <div className="mt-4 relative z-10">
                <h3 className={cn("font-fraunces text-[2.75rem] leading-none font-semibold tracking-tight transition-transform duration-500 group-hover:scale-105 origin-left", s.color)}>
                  {s.value}
                </h3>
                <p className="text-[15px] font-semibold text-forest-500/80 mt-2">{s.label}</p>
              </div>

              {/* Decorative subtle icon in background */}
              <div className={cn(
                "absolute -right-8 -bottom-8 opacity-[0.03] transition-all duration-700 pointer-events-none transform group-hover:scale-[1.2] group-hover:-rotate-12",
                s.urgent ? "text-amber-900" : "text-forest-900"
              )}>
                {React.cloneElement(s.icon as React.ReactElement, { className: "size-40" })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-start animate-slide-up" style={{ animationDelay: "150ms" }}>

          {/* Recent Requests Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-2">
              <h2 className="font-fraunces text-2xl font-semibold text-forest-900 tracking-tight">Recent Activity</h2>
              <Button variant="ghost" className="text-forest-600 hover:text-forest-900 hover:bg-forest-100/50 rounded-xl font-semibold transition-all h-10 px-4" asChild>
                <Link href="/agency/requests">View all requests <ArrowRight className="size-4 ml-2" /></Link>
              </Button>
            </div>

            {recentRequests.length === 0 ? (
              <div className="rounded-[32px] bg-white border border-forest-900/5 shadow-[0_4px_24px_rgba(26,61,43,0.02)] p-12 text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-2">
                  <PackageCheck className="size-10 text-forest-300" />
                </div>
                <h3 className="font-fraunces text-2xl font-semibold text-forest-800">No requests yet</h3>
                <p className="text-forest-500 font-medium max-w-md mx-auto">
                  When patients in your service area submit a switch request, they will appear right here. Ensure your profile is up to date to attract more patients.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((r, i) => (
                  <div key={r.id} className="animate-slide-up" style={{ animationDelay: `${200 + i * 50}ms` }}>
                    <AgencyRequestRow request={r} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Sticky capability for large screens */}
          <div className="space-y-6 lg:sticky lg:top-24">

            {/* Dark premium quick actions card */}
            <div className="rounded-[32px] bg-forest-900 text-white shadow-2xl shadow-forest-900/20 p-8 space-y-6 animate-slide-up relative overflow-hidden group" style={{ animationDelay: "200ms" }}>
              {/* Subtle background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-[40px] transition-all duration-700 group-hover:bg-amber-500/30" />

              <h3 className="font-fraunces text-2xl font-semibold relative z-10">Quick Actions</h3>

              <div className="space-y-2 relative z-10">
                {[
                  { label: "Pending requests", href: "/agency/requests?filter=submitted", count: stats.pending, icon: <ClipboardList className="size-4" /> },
                  { label: "Accepted tracking", href: "/agency/requests?filter=accepted", count: stats.accepted, icon: <CheckCircle2 className="size-4" /> },
                  { label: "Manage Team", href: "/agency/team", icon: <PackageCheck className="size-4" /> },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/10 text-forest-100 hover:text-white group/link transition-all duration-300 border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <div className="p-2 rounded-lg bg-white/5 text-forest-300 group-hover/link:text-white group-hover/link:bg-white/20 transition-all">
                        {l.icon}
                      </div>
                      {l.label}
                    </div>
                    <div className="flex items-center gap-3">
                      {l.count !== undefined && l.count > 0 && (
                        <span className="h-6 w-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-amber-500/20">
                          {l.count}
                        </span>
                      )}
                      <ArrowRight className="size-4 text-forest-400 group-hover/link:translate-x-1 group-hover/link:text-white transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Agency Snapshot Card */}
            <div className="rounded-[32px] bg-white border border-forest-900/5 shadow-[0_4px_24px_rgba(26,61,43,0.02)] p-8 space-y-6 animate-slide-up" style={{ animationDelay: "250ms" }}>
              <div className="flex flex-col gap-1">
                <h3 className="font-fraunces text-2xl font-semibold text-forest-900">Agency Snapshot</h3>
                <p className="text-sm font-medium text-forest-500">Your public profile breakdown.</p>
              </div>

              <div className="space-y-5">
                {[
                  { label: "Service Counties", value: agency.service_counties.slice(0, 3).join(", ") + (agency.service_counties.length > 3 ? ` +${agency.service_counties.length - 3}` : "") },
                  { label: "Accepted Insurance", value: agency.payers_accepted.map(payerLabel).slice(0, 2).join(", ") + (agency.payers_accepted.length > 2 ? '...' : '') },
                  { label: "Languages Spoken", value: agency.languages_spoken.slice(0, 3).join(", ") },
                  { label: "Medicare Quality", value: agency.medicare_quality_score ? `${agency.medicare_quality_score.toFixed(1)} / 5.0` : "Not rated", highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex flex-col gap-1.5 pb-5 border-b border-forest-50 last:border-0 last:pb-0">
                    <span className="text-forest-400 text-xs font-bold uppercase tracking-wider">{label}</span>
                    <span className={cn(
                      "text-forest-800 font-medium truncate",
                      highlight && "text-amber-600 font-semibold"
                    )}>{value || "—"}</span>
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <Button variant="outline" size="lg" asChild className="w-full rounded-2xl border-forest-200 text-forest-700 hover:bg-forest-50 hover:text-forest-900 font-semibold h-12">
                    <Link href="/agency/profile">Edit Public Profile</Link>
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
