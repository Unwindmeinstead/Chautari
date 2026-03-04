"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Settings, Users, MessageSquare, LogOut, Menu, X, Building2, Bell } from "lucide-react";
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
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all">
        <div className="max-w-[1400px] mx-auto px-5 h-16 flex items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Logo size="sm" />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-200">
              <Building2 className="size-4 text-zinc-400" />
              <span className="text-[13px] font-semibold text-zinc-800 tracking-tight truncate max-w-[200px]">
                {agencyName ?? "Agency Portal"}
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 ml-4">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200",
                    active
                      ? "bg-zinc-100 text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  <Icon className={cn("size-3.5", active ? "text-zinc-900" : "text-zinc-400")} />
                  {label}
                  {label === "Requests" && pendingCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold leading-none">
                      {pendingCount}
                    </span>
                  )}
                  {label === "Messages" && unreadMessages > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold leading-none">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex-1 md:flex-none" />

          {/* Utilities */}
          <div className="hidden md:flex items-center gap-4">
            <button className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors">
              <Bell className="size-4" />
            </button>
            <div className="h-4 w-px bg-zinc-200" />
            <div className="text-right">
              <p className="text-[13px] font-semibold text-zinc-900 leading-tight">{staffName}</p>
              {staffRole && (
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest leading-none mt-0.5">{staffRole}</p>
              )}
            </div>
            <Link
              href="/api/auth/signout"
              className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign out"
            >
              <LogOut className="size-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-zinc-900/10 backdrop-blur-sm" />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-zinc-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-4 space-y-1">
              <p className="text-[11px] font-semibold text-zinc-400 px-3 pb-2 uppercase tracking-widest">{agencyName}</p>
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      active ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    <Icon className={cn("size-4", active ? "text-zinc-900" : "text-zinc-400")} />
                    {label}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-zinc-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{staffName}</p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase">{staffRole}</p>
                </div>
                <Link href="/api/auth/signout" className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <LogOut className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
