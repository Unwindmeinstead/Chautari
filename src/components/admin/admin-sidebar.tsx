"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, ArrowLeftRight,
  Shield, LogOut, ChevronRight, Banknote
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/agencies", label: "Agencies", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/requests", label: "Switch Requests", icon: ArrowLeftRight },
  { href: "/admin/audit", label: "Audit Log", icon: Shield },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-[280px] shrink-0 bg-[#0A1A11] min-h-screen flex flex-col sticky top-0 h-screen border-r border-white/5 relative overflow-hidden text-forest-50">
      {/* Ambient Glow */}
      <div className="absolute top-0 -left-12 w-48 h-48 bg-forest-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Logo */}
      <div className="px-6 py-8 relative z-10">
        <Logo size="sm" invertColors />
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 shadow-sm">
          <Banknote className="size-3.5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Admin Console</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto relative z-10">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden outline-none",
                active
                  ? "text-white bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/5"
                  : "text-forest-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-400 rounded-r-lg shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
              )}
              <Icon className={cn("size-5 shrink-0 transition-transform duration-300 group-hover:scale-110", active ? "text-amber-400" : "")} />
              <span className="flex-1 tracking-wide">{label}</span>
              {active && <ChevronRight className="size-4 opacity-50 text-amber-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 relative z-10">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-forest-800 flex items-center justify-center border border-white/10 shrink-0">
              <span className="text-sm font-bold text-white">{adminName[0]?.toUpperCase() ?? "A"}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{adminName}</p>
              <p className="text-[10px] font-bold tracking-widest text-forest-400 uppercase mt-0.5">Super Admin</p>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-white hover:bg-red-500/80 transition-all duration-300 border border-transparent hover:border-red-500"
          >
            <LogOut className="size-4" />
            Sign out
          </Link>
        </div>
      </div>
    </aside>
  );
}
