"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Settings,
  MessageSquare, Bell, LogOut, ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface AgencyNavProps {
  agencyName: string | null;
  staffName: string | null;
  staffRole: string | null;
  pendingCount: number;
  unreadMessages?: number;
  unreadNotifications?: number;
}

const NAV = [
  { href: "/agency/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/agency/requests", label: "Requests", icon: ClipboardList },
  { href: "/agency/messages", label: "Messages", icon: MessageSquare },
  { href: "/agency/profile", label: "Settings", icon: Settings },
];

export function AgencyNav({
  agencyName, staffName, staffRole,
  pendingCount, unreadMessages = 0, unreadNotifications = 0,
}: AgencyNavProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  // Close profile dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = (staffName ?? "S").charAt(0).toUpperCase();

  return (
    <>
      {/* ── Desktop + tablet header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 hidden sm:block border-b border-zinc-200 bg-white/95 backdrop-blur-xl">
        <div className="max-w-[1280px] mx-auto h-14 px-5 lg:px-8 flex items-center gap-6">

          {/* Logo + agency name */}
          <Link href="/agency/dashboard" className="flex items-center gap-2.5 shrink-0 min-w-0">
            <Logo size="sm" />
            <div className="hidden lg:block min-w-0">
              <p className="text-[12px] font-semibold text-zinc-900 leading-none truncate max-w-[200px]">
                {agencyName ?? "Agency Portal"}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">Operations Workspace</p>
            </div>
          </Link>

          {/* Separator */}
          <div className="hidden lg:block h-5 w-px bg-zinc-200 shrink-0" />

          {/* Nav links */}
          <nav className="flex items-center gap-0.5 flex-1">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              const badge =
                label === "Requests" && pendingCount > 0 ? pendingCount :
                  label === "Messages" && unreadMessages > 0 ? unreadMessages : 0;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative h-9 px-3.5 rounded-lg text-[13px] font-medium inline-flex items-center gap-2 transition-all",
                    active
                      ? "text-zinc-900 bg-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="hidden md:inline">{label}</span>
                  {badge > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold inline-flex items-center justify-center bg-amber-100 text-amber-700 border border-amber-200">
                      {badge}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-zinc-900" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Notifications */}
            <Link
              href="/agency/notifications"
              className="relative h-9 w-9 rounded-lg inline-flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <Bell className="size-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold inline-flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-zinc-900 text-white text-[11px] font-bold inline-flex items-center justify-center shrink-0">
                  {initial}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[12px] font-semibold text-zinc-900 leading-none">{staffName ?? "Staff"}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 capitalize">{staffRole ?? "Member"}</p>
                </div>
                <ChevronDown className={cn("size-3.5 text-zinc-400 transition-transform hidden lg:block", profileOpen && "rotate-180")} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-zinc-200 bg-white shadow-lg shadow-zinc-900/10 py-1 z-50">
                  <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                    <p className="text-[12px] font-semibold text-zinc-900">{staffName ?? "Staff"}</p>
                    <p className="text-[11px] text-zinc-400 capitalize">{staffRole ?? "Member"}</p>
                  </div>
                  <Link
                    href="/agency/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <Settings className="size-3.5 text-zinc-400" /> Profile settings
                  </Link>
                  <div className="border-t border-zinc-100 mt-1 pt-1">
                    <a
                      href="/api/auth/signout"
                      className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="size-3.5" /> Sign out
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile header (logo + notifications + avatar only) ────────────── */}
      <header className="sm:hidden sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-xl">
        <div className="h-14 px-4 flex items-center justify-between gap-3">
          <Link href="/agency/dashboard" className="flex items-center gap-2">
            <Logo size="sm" />
            <p className="text-[13px] font-semibold text-zinc-900 truncate max-w-[160px]">
              {agencyName ?? "Agency Portal"}
            </p>
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              href="/agency/notifications"
              className="relative h-9 w-9 rounded-lg inline-flex items-center justify-center text-zinc-500"
            >
              <Bell className="size-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-rose-500 text-white text-[9px] font-bold inline-flex items-center justify-center px-0.5">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
            <div className="h-8 w-8 rounded-full bg-zinc-900 text-white text-[11px] font-bold inline-flex items-center justify-center">
              {initial}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-zinc-200 safe-area-pb">
        <div className="grid grid-cols-4 h-16">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            const badge =
              label === "Requests" && pendingCount > 0 ? pendingCount :
                label === "Messages" && unreadMessages > 0 ? unreadMessages : 0;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 relative transition-colors",
                  active ? "text-zinc-900" : "text-zinc-400"
                )}
              >
                <div className="relative">
                  <Icon className="size-5" />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white inline-flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
                {active && (
                  <span className="absolute top-0 inset-x-0 h-0.5 bg-zinc-900 rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
