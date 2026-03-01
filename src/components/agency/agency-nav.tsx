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
      <nav className="sticky top-0 z-40 bg-forest-900 border-b border-forest-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo + agency name */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Logo size="sm" invertColors />
            <div className="hidden sm:flex items-center gap-1.5 pl-2.5 border-l border-forest-700">
              <Building2 className="size-3.5 text-forest-400" />
              <span className="text-sm font-medium text-forest-200 max-w-[180px] truncate">
                {agencyName ?? "Agency Portal"}
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 ml-2">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-forest-700 text-white"
                    : "text-forest-400 hover:text-white hover:bg-forest-800"
                )}
              >
                <Icon className="size-4" />
                {label}
                {label === "Requests" && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
                {label === "Messages" && unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex-1 md:flex-none" />

          {/* Staff info + sign out (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right leading-none">
              <p className="text-xs font-medium text-forest-200">{staffName}</p>
              {staffRole && (
                <p className="text-xs text-forest-500 capitalize mt-0.5">{staffRole}</p>
              )}
            </div>
            <Link
              href="/api/auth/signout"
              className="p-2 rounded-lg text-forest-500 hover:text-red-400 hover:bg-forest-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-forest-400 hover:bg-forest-800"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute top-14 left-0 right-0 bg-forest-900 border-b border-forest-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-4 space-y-1">
              <p className="text-xs text-forest-600 px-3 pb-2 uppercase tracking-wider">{agencyName}</p>
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium",
                    isActive(href)
                      ? "bg-forest-700 text-white"
                      : "text-forest-400 hover:bg-forest-800 hover:text-white"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                  {label === "Requests" && pendingCount > 0 && (
                    <span className="ml-auto h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                  {label === "Messages" && unreadMessages > 0 && (
                    <span className="ml-auto h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              ))}
              <div className="border-t border-forest-800 pt-3 mt-3 space-y-1">
                <p className="text-xs text-forest-500 px-3">{staffName} · {staffRole}</p>
                <Link
                  href="/api/auth/signout"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-400 hover:bg-forest-800"
                >
                  <LogOut className="size-4" />
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
