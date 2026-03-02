"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Settings, Users, MessageSquare, LogOut, Menu, X, Building2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface AgencyNavProps {
  agencyName: string | null;
  staffName: string | null;
  staffRole: string | null;
  pendingCount: number;
  unreadMessages?: number;
}

const NAV = [
  { href: "/agency/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agency/requests", label: "Requests", icon: ClipboardList },
  { href: "/agency/messages", label: "Messages", icon: MessageSquare },
  { href: "/agency/team", label: "Team", icon: Users },
  { href: "/agency/profile", label: "Profile", icon: Settings },
];

export function AgencyNav({ agencyName, staffName, staffRole, pendingCount, unreadMessages = 0 }: AgencyNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  function isActive(href: string) {
    if (href === "/agency/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-forest-900/5 shadow-sm transition-all">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
          {/* Logo + agency name */}
          <div className="flex items-center gap-3 shrink-0">
            <Logo size="sm" />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-forest-200">
              <Building2 className="size-4 text-forest-400" />
              <span className="text-sm font-semibold text-forest-800 max-w-[200px] truncate tracking-tight">
                {agencyName ?? "Agency Portal"}
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 ml-4">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                    active
                      ? "bg-forest-50/80 text-forest-900 shadow-sm ring-1 ring-forest-900/5"
                      : "text-forest-500 hover:text-forest-900 hover:bg-forest-50/50"
                  )}
                >
                  <Icon className={cn("size-4 transition-colors", active ? "text-forest-700" : "text-forest-400")} />
                  {label}
                  {label === "Requests" && pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-amber-500/20 ring-2 ring-white">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                  {label === "Messages" && unreadMessages > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-red-500/20 ring-2 ring-white">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex-1 md:flex-none" />

          {/* Staff info + sign out (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right leading-none">
              <p className="text-sm font-bold text-forest-900">{staffName}</p>
              {staffRole && (
                <p className="text-[10px] font-bold tracking-widest text-forest-400 uppercase mt-1">{staffRole}</p>
              )}
            </div>
            <div className="h-8 w-px bg-forest-100" />
            <Link
              href="/api/auth/signout"
              className="p-2.5 rounded-xl text-forest-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-xl text-forest-600 hover:bg-forest-50 transition-colors"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-forest-900/20 backdrop-blur-sm transition-opacity" />
          <div
            className="absolute top-16 left-0 right-0 bg-white border-b border-forest-100 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-6 space-y-2">
              <p className="text-[11px] font-bold text-forest-400 px-3 pb-2 uppercase tracking-widest">{agencyName}</p>
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all",
                      active
                        ? "bg-forest-50 text-forest-900 border border-forest-900/5 shadow-sm"
                        : "text-forest-600 hover:bg-forest-50 hover:text-forest-900"
                    )}
                  >
                    <Icon className={cn("size-5", active ? "text-forest-700" : "text-forest-400")} />
                    {label}
                    {label === "Requests" && pendingCount > 0 && (
                      <span className="ml-auto h-6 w-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                        {pendingCount}
                      </span>
                    )}
                    {label === "Messages" && unreadMessages > 0 && (
                      <span className="ml-auto h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                );
              })}
              <div className="border-t border-forest-100 pt-4 mt-4 space-y-2">
                <div className="px-4 py-2 bg-forest-50 rounded-2xl">
                  <p className="text-sm font-bold text-forest-900">{staffName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-forest-500 mt-0.5">{staffRole}</p>
                </div>
                <Link
                  href="/api/auth/signout"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
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
