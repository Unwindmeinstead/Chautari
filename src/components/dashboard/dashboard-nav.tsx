"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, Bell, User, LogOut, Menu, X
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  userName: string | null;
  unreadCount: number;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/agencies", label: "Find Agencies", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function DashboardNav({ userName, unreadCount }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const firstName = userName?.split(" ")[0] ?? "Account";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1100px] mx-auto px-6 h-[72px] flex items-center gap-8">
          <Link href="/" className="transition-opacity hover:opacity-80 shrink-0">
            <Logo size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-1.5 flex-1 text-[14px] font-medium text-gray-500">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link key={href} href={href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
                    active ? "bg-gray-900 text-white shadow-sm" : "hover:bg-gray-50 hover:text-gray-900"
                  )}>
                  <Icon className={cn("size-4", active ? "text-white" : "text-gray-400")} />
                  {label}
                  {href === "/notifications" && unreadCount > 0 && (
                    <span className={cn("ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold leading-none", active ? "bg-white/20 text-white" : "bg-red-100 text-red-700")}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex-1 md:flex-none" />

          {/* User info */}
          <div className="hidden md:flex items-center gap-4">
            <div className="h-8 w-px bg-gray-100" />
            <span className="text-[14px] font-semibold text-gray-900 capitalize">{firstName}</span>
            <a href="/api/auth/signout"
              className="h-9 w-9 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign out">
              <LogOut className="size-4" />
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm" />
          <div className="absolute top-[72px] left-0 right-0 bg-white border-b border-gray-100 shadow-2xl rounded-b-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-2">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    className={cn("flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[15px] font-semibold transition-all",
                      active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
                    <Icon className={cn("size-5", active ? "text-white" : "text-gray-400")} />{label}
                  </Link>
                );
              })}
            </div>
            <div className="bg-gray-50 p-6 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-gray-900 capitalize">{firstName}</span>
              <a href="/api/auth/signout" className="h-11 w-11 flex items-center justify-center text-red-600 hover:bg-white rounded-full transition-colors">
                <LogOut className="size-5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────── Supporting UI pieces (exported for page.tsx) ─────────────── */

import type { DashboardData } from "@/lib/dashboard-actions";
import {
  ArrowRight, ClipboardList, Shield, Heart, MapPin, Phone, Bell as BellIcon,
  CheckCircle2, ArrowUpRight
} from "lucide-react";
import { cn as twCn } from "@/lib/utils";

export function ProfileCard({ profile, details }: { profile: DashboardData["profile"]; details: DashboardData["patientDetails"] }) {
  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
          <span className="text-[16px] font-bold text-white">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900 truncate">{profile?.full_name ?? "Your name"}</p>
          <p className="text-[12px] font-medium text-gray-500 truncate">{profile?.email}</p>
        </div>
        <Link href="/profile" className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-colors">
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="space-y-3 pt-1">
        {details?.address_city && (
          <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600">
            <MapPin className="size-4 text-gray-400 shrink-0" />
            {details.address_city}, {details.address_county} County, PA
          </div>
        )}
        {details?.payer_type && (
          <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600">
            <Shield className="size-4 text-gray-400 shrink-0" />
            {details.payer_type === "medicaid" ? "Medicaid" : details.payer_type === "medicare" ? "Medicare" : "Private Pay"}
          </div>
        )}
        {details?.care_type && (
          <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600">
            <Heart className="size-4 text-gray-400 shrink-0" />
            {details.care_type === "home_health" ? "Home Health" : "Home Care"}
          </div>
        )}
        {profile?.phone && (
          <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600">
            <Phone className="size-4 text-gray-400 shrink-0" />
            {profile.phone}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatsGrid({ requests }: { requests: DashboardData["switchRequests"] }) {
  const items = [
    { label: "Total Requests", value: requests.length },
    { label: "Active", value: requests.filter(r => ["submitted", "under_review", "accepted"].includes(r.status)).length, highlight: true },
    { label: "Completed", value: requests.filter(r => r.status === "completed").length },
  ];
  return (
    <div className="grid grid-cols-3 gap-5">
      {items.map((s) => (
        <div key={s.label} className="flex flex-col border-l-2 pl-5" style={{ borderColor: s.highlight ? "#2563eb" : "#e5e7eb" }}>
          <p className={twCn("text-3xl font-extrabold tracking-tight leading-none mb-1", s.highlight ? "text-blue-600" : "text-gray-900")}>{s.value}</p>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export function QuickActions({ complete, hasActive }: { complete: boolean; hasActive: boolean }) {
  const links = [
    { href: "/agencies", label: "Browse Agencies", desc: "Find agencies in your area", enabled: complete },
    { href: "/agencies", label: hasActive ? "Request in Progress" : "Start a Switch", desc: hasActive ? "View your active request" : "We handle all paperwork", enabled: complete && !hasActive },
    { href: complete ? "/profile" : "/onboarding", label: "Update Profile", desc: "Edit your information", enabled: true },
  ];
  return (
    <div className="space-y-2">
      {links.map((l) => (
        <Link key={l.label} href={l.enabled ? l.href : "#"}
          className={twCn("flex items-center justify-between group p-4 rounded-2xl transition-colors",
            l.enabled ? "hover:bg-gray-50 cursor-pointer" : "opacity-40 pointer-events-none")}>
          <div>
            <p className="text-[14px] font-bold text-gray-900">{l.label}</p>
            <p className="text-[12px] font-medium text-gray-500">{l.desc}</p>
          </div>
          <ArrowUpRight className="size-5 text-gray-300 group-hover:text-gray-900 transition-colors" strokeWidth={2.5} />
        </Link>
      ))}
    </div>
  );
}

export function RequestCard({ request, compact = false }: { request: any; compact?: boolean }) {
  const STATUS: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    submitted: { label: "Submitted", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
    under_review: { label: "Under Review", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
    accepted: { label: "Accepted", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
    completed: { label: "Completed", dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100" },
    denied: { label: "Denied", dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50" },
    cancelled: { label: "Cancelled", dot: "bg-gray-300", text: "text-gray-500", bg: "bg-gray-50" },
  };
  const s = STATUS[request.status] ?? STATUS.submitted;
  const agencyName = request.new_agency?.name ?? "Agency";

  const steps = ["submitted", "under_review", "accepted", "completed"];
  const stepIdx = steps.indexOf(request.status);

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
        <div>
          <p className="text-[14px] font-bold text-gray-900 truncate">{agencyName}</p>
          <p className="text-[12px] font-medium text-gray-500">{new Date(request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
        <span className={twCn("flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full", s.bg, s.text)}>
          <span className={twCn("h-1.5 w-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-900/5 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[18px] font-bold text-gray-900 leading-tight">{agencyName}</p>
          <p className="text-[13px] font-medium text-gray-500 mt-0.5">Switch request</p>
        </div>
        <span className={twCn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold shrink-0", s.bg, s.text)}>
          <span className={twCn("h-2 w-2 rounded-full", s.dot)} />
          {s.label}
        </span>
      </div>

      {/* Progress Track */}
      <div className="flex items-center gap-0 mb-6">
        {["Submitted", "Review", "Accepted", "Done"].map((label, i) => {
          const done = i < stepIdx;
          const current = i === stepIdx;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center shrink-0">
                <div className={twCn("h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                  done ? "bg-gray-900 text-white" : current ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400")}>
                  {done ? <CheckCircle2 className="size-4" /> : i + 1}
                </div>
                <span className={twCn("text-[10px] font-semibold mt-1.5 whitespace-nowrap", done || current ? "text-gray-900" : "text-gray-400")}>{label}</span>
              </div>
              {i < 3 && <div className={twCn("flex-1 h-[2px] mx-1.5 -mt-4", done ? "bg-gray-900" : "bg-gray-100")} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Detail Rows */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6 text-[13px]">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Started</p>
          <p className="font-semibold text-gray-900">{new Date(request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Request ID</p>
          <p className="font-semibold text-gray-900 font-mono">{request.id?.slice(0, 8) ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Care Type</p>
          <p className="font-semibold text-gray-900 capitalize">{request.care_type?.replace("_", " ") ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
          <p className="font-semibold text-gray-900">{request.new_agency?.address_city ?? "—"}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/switch/${request.id}`}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-gray-900 text-white text-[13px] font-bold hover:bg-gray-800 transition-colors">
          View Details <ArrowRight className="size-4" />
        </Link>
        <Link href={`/switch/${request.id}/messages`}
          className="h-10 px-5 rounded-lg border border-gray-200 text-gray-700 text-[13px] font-bold hover:bg-gray-50 transition-colors flex items-center">
          Messages
        </Link>
      </div>
    </div>
  );
}

export function NotificationsPanel({ notifications, unread }: { notifications: any[]; unread: number }) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-center">
        <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3">
          <BellIcon className="size-4 text-gray-400" />
        </div>
        <p className="text-[14px] font-bold text-gray-900">All caught up!</p>
        <p className="text-[12px] font-medium text-gray-500 mt-1">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
          <BellIcon className="size-4 text-gray-400" /> Notifications
          {unread > 0 && <span className="h-5 px-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">{unread}</span>}
        </h3>
        <Link href="/notifications" className="text-[12px] font-bold text-blue-600 hover:text-blue-800">View all</Link>
      </div>
      <div className="divide-y divide-gray-50">
        {notifications.slice(0, 5).map((n: any, i: number) => (
          <div key={n.id || i} className="p-4 hover:bg-gray-50 transition-colors">
            <p className="text-[13px] font-bold text-gray-900">{n.title}</p>
            <p className="text-[12px] font-medium text-gray-500 mt-0.5 line-clamp-2 leading-snug">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ProfileCard as default };
