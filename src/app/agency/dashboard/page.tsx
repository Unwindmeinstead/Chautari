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

export const metadata = { title: "Agency Dashboard | Chautari" };
export const dynamic = "force-dynamic";

export default async function AgencyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { agency, member, requests, stats } = await getAgencyPortalData();

  // Not linked to any agency
  if (!agency || !member) {
    return (
      <div className="min-h-screen bg-forest-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-forest-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="size-8 text-amber-400" />
          </div>
          <div>
            <h1 className="font-fraunces text-2xl font-semibold text-white mb-2">No Agency Found</h1>
            <p className="text-forest-300">
              Your account isn&apos;t linked to a home care agency yet.
              Contact your Chautari administrator to get set up.
            </p>
          </div>
          <p className="text-xs text-forest-500">
            Wrong account?{" "}
            <Link href="/api/auth/signout" className="underline text-forest-400 hover:text-white">
              Sign out
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const staffName = user.email?.split("@")[0] ?? "Staff";
  const isAdmin = ["admin", "owner"].includes(member.role);
  const newRequests = requests.filter((r) => r.status === "submitted");
  const recentRequests = requests.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyNav
        agencyName={agency.name}
        staffName={staffName}
        staffRole={member.role}
        pendingCount={stats.pending}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-gray-400 mb-1">Agency Portal</p>
            <h1 className="font-fraunces text-3xl font-semibold text-gray-800">{agency.name}</h1>
            {agency.dba_name && <p className="text-sm text-gray-400 mt-0.5">dba {agency.dba_name}</p>}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {agency.is_verified_partner && (
              <Badge variant="verified" className="gap-1">
                <CheckCircle2 className="size-3" /> Verified Partner
              </Badge>
            )}
            <AcceptingPatientsToggle
              initialValue={agency.is_accepting_patients}
              isAdmin={isAdmin}
            />
          </div>
        </div>

        {/* New request alert */}
        {newRequests.length > 0 && (
          <div className="rounded-2xl bg-amber-50 border border-amber-300 p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <ClipboardList className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-800">
                  {newRequests.length} new switch request{newRequests.length > 1 ? "s" : ""} awaiting review
                </p>
                <p className="text-sm text-amber-600">
                  Patients are waiting. You have 5 business days to respond to each.
                </p>
              </div>
            </div>
            <Button variant="amber" asChild className="shrink-0">
              <Link href="/agency/requests?filter=submitted">
                Review now <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total requests",  value: stats.total,    icon: <ClipboardList className="size-5 text-gray-400" />,  color: "text-gray-800", urgent: false },
            { label: "Pending action",  value: stats.pending,  icon: <Clock className="size-5 text-amber-500" />,         color: "text-amber-600",  urgent: stats.pending > 0 },
            { label: "Accepted",        value: stats.accepted, icon: <CheckCircle2 className="size-5 text-green-500" />,  color: "text-green-600",  urgent: false },
            { label: "Completed",       value: stats.completed,icon: <PackageCheck className="size-5 text-forest-500" />, color: "text-forest-600", urgent: false },
          ].map((s) => (
            <div key={s.label} className={cn(
              "rounded-2xl border border-gray-200 bg-white shadow-card p-5 space-y-3",
              s.urgent && "ring-1 ring-amber-400/50 bg-amber-50"
            )}>
              <div className="flex items-center justify-between">
                {s.icon}
                {s.urgent && <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <div>
                <p className={cn("font-fraunces text-3xl font-semibold", s.color)}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Requests list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-fraunces text-xl font-semibold text-gray-800">Recent Requests</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/agency/requests">View all <ArrowRight className="size-3.5 ml-1" /></Link>
              </Button>
            </div>

            {recentRequests.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-10 text-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                  <ClipboardList className="size-7 text-gray-400" />
                </div>
                <p className="font-fraunces text-base font-semibold text-gray-500">No requests yet</p>
                <p className="text-sm text-gray-400">
                  Switch requests from patients will appear here once submitted.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((r) => <AgencyRequestRow key={r.id} request={r} />)}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Agency info card */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-5 space-y-4">
              <h2 className="font-fraunces text-lg font-semibold text-gray-800">Agency Info</h2>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: "Counties", value: agency.service_counties.slice(0, 3).join(", ") + (agency.service_counties.length > 3 ? ` +${agency.service_counties.length - 3}` : "") },
                  { label: "Payers",   value: agency.payers_accepted.map(payerLabel).slice(0, 2).join(", ") },
                  { label: "Languages",value: agency.languages_spoken.slice(0, 3).join(", ") },
                  { label: "Quality",  value: agency.medicare_quality_score ? `${agency.medicare_quality_score.toFixed(1)} / 5.0` : "Not rated" },
                  { label: "PA License", value: agency.pa_license_number ?? "Not set" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-gray-400 shrink-0">{label}</span>
                    <span className="text-gray-700 font-medium text-right truncate">{value || "—"}</span>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/agency/profile">Edit profile</Link>
                </Button>
              )}
            </div>

            {/* Quick links */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-5">
              <h2 className="font-fraunces text-base font-semibold text-gray-800 mb-3">Quick Links</h2>
              <div className="space-y-1">
                {[
                  { label: "Pending requests",       href: "/agency/requests?filter=submitted",    count: stats.pending },
                  { label: "Accepted — in progress", href: "/agency/requests?filter=accepted",     count: stats.accepted },
                  { label: "Completed switches",     href: "/agency/requests?filter=completed",    count: stats.completed },
                  { label: "Team",                   href: "/agency/team" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-600 hover:text-gray-800 group transition-colors"
                  >
                    {l.label}
                    <div className="flex items-center gap-2">
                      {l.count !== undefined && l.count > 0 && (
                        <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                          {l.count}
                        </span>
                      )}
                      <ArrowRight className="size-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
