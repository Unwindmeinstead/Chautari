"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, Bell, User, LogOut, Menu, X, ArrowRight, ClipboardList, Shield, Heart, MapPin, Phone, Languages
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import type { DashboardData } from "@/lib/dashboard-actions";

interface DashboardNavProps {
  userName: string | null;
  unreadCount: number;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agencies", label: "Find Agencies", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function DashboardNav({ userName, unreadCount }: DashboardNavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const firstName = userName?.split(" ")[0] ?? "Account";

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-cream/95 backdrop-blur-md border-b border-[rgba(26,61,43,0.06)] shadow-sm" 
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-1 flex-1 ml-10">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all relative",
                  pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                    ? "bg-forest-600 text-cream shadow-md"
                    : "text-[#6B7B6E] hover:text-forest-600 hover:bg-[rgba(26,61,43,0.04)]"
                )}
              >
                <Icon className="size-4" />
                {label}
                {href === "/notifications" && unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex-1 md:flex-none" />

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <div className="flex items-center gap-3 pl-3 border-l border-[rgba(26,61,43,0.1)]">
              <div className="text-[14px] font-medium text-forest-600">{firstName}</div>
              <Button variant="ghost" size="sm" asChild className="text-forest-400 hover:text-red-600 hover:bg-red-50">
                <Link href="/api/auth/signout">
                  <LogOut className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher compact />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-[rgba(26,61,43,0.04)] text-forest-500">
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-16 left-0 right-0 bg-cream border-b border-[rgba(26,61,43,0.06)] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 space-y-2">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-medium",
                    pathname === href ? "bg-forest-600 text-cream shadow-md" : "text-forest-600 hover:bg-[rgba(26,61,43,0.04)]"
                  )}
                >
                  <Icon className="size-5" />
                  {label}
                </Link>
              ))}
              <div className="border-t border-[rgba(26,61,43,0.08)] pt-4 mt-4">
                <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] text-red-500 hover:bg-red-50">
                  <LogOut className="size-5" />
                  Sign out
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProfileCard({ profile, details }: { profile: DashboardData["profile"]; details: DashboardData["patientDetails"] }) {
  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-6 hover:border-[rgba(26,61,43,0.12)] transition-all">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-700 flex items-center justify-center shadow-lg">
          <span className="font-fraunces text-lg font-semibold text-cream">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-fraunces text-lg font-semibold text-forest-800 truncate">{profile?.full_name ?? "Your name"}</p>
          <p className="text-sm text-[#6B7B6E] truncate">{profile?.email}</p>
        </div>
        <Link href="/profile" className="p-2 rounded-xl hover:bg-[rgba(26,61,43,0.04)] text-forest-400 transition-colors">
          <ArrowRight className="size-4 rotate-[-45deg]" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {details?.address_city && (
          <div className="flex items-center gap-3 text-sm text-forest-600">
            <div className="w-8 h-8 rounded-lg bg-[rgba(26,61,43,0.04)] flex items-center justify-center"><MapPin className="size-4 text-forest-500" /></div>
            {details.address_city}, {details.address_county} County, PA
          </div>
        )}
        {details?.payer_type && (
          <div className="flex items-center gap-3 text-sm text-forest-600">
            <div className="w-8 h-8 rounded-lg bg-[rgba(26,61,43,0.04)] flex items-center justify-center"><Shield className="size-4 text-forest-500" /></div>
            {details.payer_type === "medicaid" ? "Medicaid" : details.payer_type === "medicare" ? "Medicare" : details.payer_type === "private" ? "Private Pay" : details.payer_type}
          </div>
        )}
        {details?.care_type && (
          <div className="flex items-center gap-3 text-sm text-forest-600">
            <div className="w-8 h-8 rounded-lg bg-[rgba(26,61,43,0.04)] flex items-center justify-center"><Heart className="size-4 text-forest-500" /></div>
            {details.care_type === "home_health" ? "Home Health" : "Home Care"}
          </div>
        )}
        {profile?.phone && (
          <div className="flex items-center gap-3 text-sm text-forest-600">
            <div className="w-8 h-8 rounded-lg bg-[rgba(26,61,43,0.04)] flex items-center justify-center"><Phone className="size-4 text-forest-500" /></div>
            {profile.phone}
          </div>
        )}
      </div>
    </div>
  );
}

function StatsGrid({ requests }: { requests: DashboardData["switchRequests"] }) {
  const stats = [
    { label: "Total Requests", value: requests.length, color: "text-forest-600", bg: "bg-forest-50" },
    { label: "Active", value: requests.filter(r => ["submitted", "under_review", "accepted"].includes(r.status)).length, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Completed", value: requests.filter(r => r.status === "completed").length, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={cn("rounded-2xl p-6 text-center", s.bg)}>
          <p className={cn("font-fraunces text-4xl font-bold", s.color)}>{s.value}</p>
          <p className="text-xs font-medium text-[#6B7B6E] mt-2 uppercase tracking-wide">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function QuickActions({ complete, hasActive }: { complete: boolean; hasActive: boolean }) {
  return (
    <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-6">
      <h3 className="font-fraunces text-lg font-semibold text-forest-800 mb-5">Quick Actions</h3>
      <div className="space-y-3">
        <Link href="/agencies" className={cn(
          "flex items-center gap-4 p-4 rounded-2xl border transition-all",
          complete ? "border-[rgba(26,61,43,0.08)] hover:border-forest-300 hover:bg-[rgba(26,61,43,0.02)]" : "border-[rgba(26,61,43,0.04)] bg-[rgba(26,61,43,0.02)] opacity-50 pointer-events-none"
        )}>
          <div className="w-11 h-11 rounded-xl bg-forest-100 flex items-center justify-center"><Search className="size-5 text-forest-600" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-forest-700">Browse Agencies</p>
            <p className="text-xs text-[#6B7B6E]">Find agencies in your area</p>
          </div>
          <ArrowRight className="size-4 text-forest-400" />
        </Link>
        
        <Link href="/agencies" className={cn(
          "flex items-center gap-4 p-4 rounded-2xl border transition-all",
          complete && !hasActive ? "border-amber-200 bg-amber-50/50 hover:bg-amber-100" : "border-[rgba(26,61,43,0.04)] bg-[rgba(26,61,43,0.02)] opacity-50 pointer-events-none"
        )}>
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center"><ClipboardList className="size-5 text-amber-600" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-forest-700">{hasActive ? "Request in Progress" : "Start Switch"}</p>
            <p className="text-xs text-[#6B7B6E]">{hasActive ? "View your active request" : "We handle all paperwork"}</p>
          </div>
          <ArrowRight className="size-4 text-amber-500" />
        </Link>

        <Link href={complete ? "/profile" : "/onboarding"} className="flex items-center gap-4 p-4 rounded-2xl border border-[rgba(26,61,43,0.08)] hover:border-forest-300 hover:bg-[rgba(26,61,43,0.02)] transition-all">
          <div className="w-11 h-11 rounded-xl bg-forest-100 flex items-center justify-center"><User className="size-5 text-forest-600" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-forest-700">Update Profile</p>
            <p className="text-xs text-[#6B7B6E]">Edit your information</p>
          </div>
          <ArrowRight className="size-4 text-forest-400" />
        </Link>
      </div>
    </div>
  );
}

function RequestCard({ request, compact = false }: { request: any; compact?: boolean }) {
  const statusColors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-700 border-blue-200",
    under_review: "bg-amber-100 text-amber-700 border-amber-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-forest-100 text-forest-700 border-forest-200",
    denied: "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusSteps = [
    { key: "submitted", label: "Submitted" },
    { key: "under_review", label: "Under Review" },
    { key: "accepted", label: "Accepted" },
    { key: "completed", label: "Completed" },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === request.status);

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(26,61,43,0.06)] p-4 hover:border-[rgba(26,61,43,0.12)] transition-all">
        <div className="flex items-center justify-between gap-3">
          <p className="font-fraunces font-semibold text-forest-800 truncate">{request.new_agency_name || "Agency"}</p>
          <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium border", statusColors[request.status] || "bg-gray-100 text-gray-700")}>
            {request.status === "completed" ? "Done" : request.status === "denied" ? "Denied" : "Cancelled"}
          </span>
        </div>
        <p className="text-xs text-[#6B7B6E] mt-2">
          {new Date(request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-6 hover:border-[rgba(26,61,43,0.12)] transition-all hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <p className="font-fraunces text-lg font-semibold text-forest-800 truncate">{request.new_agency_name || "New Agency"}</p>
          <p className="text-sm text-[#6B7B6E] mt-1">Switch request</p>
        </div>
        <span className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0", statusColors[request.status] || "bg-gray-100 text-gray-700")}>
          {request.status === "submitted" ? "Submitted" : 
           request.status === "under_review" ? "Under Review" :
           request.status === "accepted" ? "Accepted" :
           request.status === "completed" ? "Completed" :
           request.status === "denied" ? "Denied" : "Cancelled"}
        </span>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, i) => (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  i < currentStepIndex ? "bg-forest-600 text-cream" :
                  i === currentStepIndex ? "bg-amber-500 text-white" :
                  "bg-[rgba(26,61,43,0.08)] text-[#6B7B6E]"
                )}>
                  {i < currentStepIndex ? "✓" : i + 1}
                </div>
                <span className={cn("text-[10px] mt-1 font-medium", i <= currentStepIndex ? "text-forest-600" : "text-[#6B7B6E]")}>
                  {step.label}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2", i < currentStepIndex ? "bg-forest-600" : "bg-[rgba(26,61,43,0.08)]")} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-[rgba(26,61,43,0.02)] rounded-2xl mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6B7B6E] mb-1">Started</p>
          <p className="text-sm font-medium text-forest-700">
            {new Date(request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6B7B6E] mb-1">Request ID</p>
          <p className="text-sm font-medium text-forest-700 font-mono">{request.id?.slice(0, 8) || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6B7B6E] mb-1">Care Type</p>
          <p className="text-sm font-medium text-forest-700">{request.care_type || "Home Care"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#6B7B6E] mb-1">Status</p>
          <p className="text-sm font-medium text-forest-700 capitalize">{request.status?.replace("_", " ") || "—"}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/switch/${request.id}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-600 text-cream text-sm font-medium hover:bg-forest-700 transition-colors">
          View Details <ArrowRight className="size-4" />
        </Link>
        <Link href={`/switch/${request.id}/messages`} className="px-4 py-2.5 rounded-xl border border-[rgba(26,61,43,0.1)] text-forest-600 text-sm font-medium hover:bg-[rgba(26,61,43,0.02)] transition-colors">
          Messages
        </Link>
      </div>
    </div>
  );
}

function NotificationsPanel({ notifications, unread }: { notifications: any[]; unread: number }) {
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[rgba(26,61,43,0.04)] flex items-center justify-center mx-auto mb-4">
          <Bell className="size-6 text-forest-400" />
        </div>
        <p className="font-fraunces font-semibold text-forest-700">All caught up!</p>
        <p className="text-sm text-[#6B7B6E] mt-1">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] overflow-hidden">
      <div className="p-5 border-b border-[rgba(26,61,43,0.06)] flex items-center justify-between">
        <h3 className="font-fraunces text-lg font-semibold text-forest-800 flex items-center gap-2">
          <Bell className="size-5 text-forest-500" />
          Notifications
          {unread > 0 && <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">{unread}</span>}
        </h3>
      </div>
      <div className="divide-y divide-[rgba(26,61,43,0.04)]">
        {notifications.slice(0, 5).map((n: any, i: number) => (
          <div key={n.id || i} className="p-4 hover:bg-[rgba(26,61,43,0.02)] transition-colors">
            <p className="text-sm font-medium text-forest-700">{n.title}</p>
            <p className="text-xs text-[#6B7B6E] mt-1 line-clamp-2">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ProfileCard, StatsGrid, QuickActions, RequestCard, NotificationsPanel };
