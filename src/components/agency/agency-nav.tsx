"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  MessageSquare,
  Menu,
  X,
  Bell,
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
  { href: "/agency/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/agency/requests", label: "Requests", icon: ClipboardList },
  { href: "/agency/messages", label: "Messages", icon: MessageSquare },
  { href: "/agency/profile", label: "Profile", icon: Settings },
];

export function AgencyNav({ agencyName, staffName, staffRole, pendingCount, unreadMessages = 0, unreadNotifications = 0 }: AgencyNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  function isActive(href: string) {
    if (href === "/agency/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl">
        <div className="max-w-[1240px] mx-auto h-16 px-4 md:px-6 flex items-center gap-4">
          <Link href="/agency/dashboard" className="flex items-center gap-2.5 shrink-0">
            <Logo size="sm" />
            <div className="hidden sm:block">
              <p className="text-[12px] font-semibold text-zinc-900 leading-none truncate max-w-[180px]">{agencyName ?? "Agency Portal"}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Operations Workspace</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "h-9 px-3.5 rounded-lg text-[13px] font-medium inline-flex items-center gap-2 border transition-all",
                    active
                      ? "text-zinc-900 border-zinc-300 bg-zinc-100"
                      : "text-zinc-600 border-transparent hover:text-zinc-900 hover:bg-zinc-100/80"
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                  {label === "Requests" && pendingCount > 0 && (
                    <span className="ml-0.5 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 inline-flex items-center justify-center">{pendingCount}</span>
                  )}
                  {label === "Messages" && unreadMessages > 0 && (
                    <span className="ml-0.5 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200 inline-flex items-center justify-center">{unreadMessages}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/agency/notifications" className="relative h-9 w-9 rounded-xl border border-zinc-200 bg-white inline-flex items-center justify-center text-zinc-600 hover:bg-zinc-100">
              <Bell className="size-4" />
              {unreadNotifications > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold inline-flex items-center justify-center">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}
            </Link>
            <div className="h-8 w-8 rounded-full border border-zinc-200 bg-zinc-100 text-[11px] font-bold text-zinc-700 inline-flex items-center justify-center">{(staffName ?? "S").charAt(0).toUpperCase()}</div>
            <div className="text-right">
              <p className="text-[12px] font-semibold text-zinc-900 leading-none">{staffName ?? "Staff"}</p>
              <p className="text-[11px] text-zinc-500 mt-1">{staffRole ?? "Member"}</p>
            </div>
            <Link href="/api/auth/signout" className="h-8 px-3 rounded-lg border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-100"><span className="h-full inline-flex items-center">Sign out</span></Link>
          </div>

          <button type="button" onClick={() => setOpen((v) => !v)} className="md:hidden ml-auto h-9 w-9 rounded-lg border border-zinc-200 bg-white inline-flex items-center justify-center text-zinc-700" aria-label="Toggle menu">
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)}>
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-zinc-200 px-4 pb-4 pt-2" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("h-10 px-3 rounded-lg flex items-center gap-2.5 text-sm font-medium", active ? "bg-zinc-100 text-zinc-900" : "text-zinc-700")}>
                    <Icon className="size-4" />
                    {label}
                  </Link>
                );
              })}
              <Link href="/agency/notifications" onClick={() => setOpen(false)} className="h-10 px-3 rounded-lg flex items-center gap-2.5 text-sm font-medium text-zinc-700">
                <Bell className="size-4" /> Notifications {unreadNotifications > 0 ? <span className="text-[10px] rounded-full px-1.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-200">{unreadNotifications}</span> : null}
              </Link>
            </div>

            <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white border border-zinc-200 inline-flex items-center justify-center text-xs font-semibold text-zinc-700">{(staffName ?? "S").charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900">{staffName ?? "Staff"}</p>
                  <p className="text-[11px] text-zinc-500">{staffRole ?? "Member"}</p>
                </div>
              </div>
              <Link href="/api/auth/signout" className="text-xs font-medium text-zinc-600">Sign out</Link>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur px-2 py-2">
        <div className="grid grid-cols-4 gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} className={cn("h-12 rounded-xl flex flex-col items-center justify-center gap-0.5", active ? "bg-zinc-100 text-zinc-900" : "text-zinc-500")}>
                <Icon className="size-4" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
