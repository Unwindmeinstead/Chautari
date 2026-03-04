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
  { href: "/agency/dashboard", label: "Overview", icon: LayoutDashboard },
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
      <nav
        className="sticky top-0 z-50 transition-all"
        style={{
          background: "rgba(10,22,40,0.95)",
          borderBottom: "1px solid rgba(59,130,246,0.15)",
          backdropFilter: "blur(20px) saturate(1.5)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-[68px] flex items-center gap-6">

          {/* Brand — links back to landing page */}
          <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
            <Logo size="sm" light />
            <div className="hidden sm:flex items-center gap-2.5 pl-4" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)" }}>
                <Building2 className="size-3.5 text-blue-400" />
              </div>
              <span className="text-[14px] font-semibold text-white/80 tracking-tight truncate max-w-[200px]">
                {agencyName ?? "Agency Portal"}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 ml-2">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200",
                    active
                      ? "text-white"
                      : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
                  )}
                  style={active ? {
                    background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))",
                    border: "1px solid rgba(59,130,246,0.3)"
                  } : {}}
                >
                  <Icon className={cn("size-3.5 shrink-0", active ? "text-blue-400" : "text-white/25")} />
                  {label}
                  {label === "Requests" && pendingCount > 0 && (
                    <span className={cn(
                      "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                      active ? "bg-white/20 text-white" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    )}>
                      {pendingCount}
                    </span>
                  )}
                  {label === "Messages" && unreadMessages > 0 && (
                    <span className={cn(
                      "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                      active ? "bg-white/20 text-white" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    )}>
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex-1 md:flex-none" />

          {/* Right items */}
          <div className="hidden md:flex items-center gap-4">
            <button className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)" }}>
              <Bell className="size-4 text-white/30" />
            </button>
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)" }} />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[13px] font-semibold text-white/80 leading-none">{staffName}</p>
                {staffRole && (
                  <p className="text-[11px] text-blue-300/50 capitalize mt-1 leading-none font-medium">{staffRole}</p>
                )}
              </div>
              <Link
                href="/api/auth/signout"
                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all"
                style={{ border: "1px solid rgba(252,165,165,0.15)", background: "rgba(252,165,165,0.05)" }}
                title="Sign out"
              >
                <LogOut className="size-3.5 text-red-400/60 hover:text-red-400 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2.5 rounded-xl transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
          >
            {open ? <X className="size-5 text-white/60" /> : <Menu className="size-5 text-white/60" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
          <div
            className="absolute top-[68px] left-0 right-0 rounded-b-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "rgba(10,22,40,0.98)", border: "1px solid rgba(59,130,246,0.15)", borderTop: "none" }}
          >
            <div className="p-5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300/40 px-4 pb-2">{agencyName}</p>
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[15px] font-semibold transition-all",
                      active
                        ? "text-white"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                    )}
                    style={active ? {
                      background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))",
                      border: "1px solid rgba(59,130,246,0.25)"
                    } : {}}
                  >
                    <Icon className={cn("size-5 shrink-0", active ? "text-blue-400" : "text-white/25")} />
                    {label}
                  </Link>
                );
              })}
            </div>
            <div className="p-5 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
              <div>
                <p className="text-[14px] font-semibold text-white/80">{staffName}</p>
                <p className="text-[12px] text-blue-300/50 capitalize font-medium">{staffRole}</p>
              </div>
              <Link href="/api/auth/signout"
                className="h-11 w-11 flex items-center justify-center rounded-xl transition-colors"
                style={{ background: "rgba(252,165,165,0.08)", border: "1px solid rgba(252,165,165,0.15)" }}>
                <LogOut className="size-5 text-red-400" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
