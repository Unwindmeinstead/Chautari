"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, ArrowLeftRight,
  Shield, LogOut, ChevronRight, Zap, Bell, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_PRIMARY = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
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
    <aside className="w-[240px] shrink-0 flex flex-col sticky top-0 h-screen overflow-hidden"
      style={{ background: "#090E0C", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Top glow orb */}
      <div className="absolute top-0 left-0 w-full h-48 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 30% 0%, rgba(16,185,129,0.12) 0%, transparent 65%)" }} />

      {/* Logo / Brand */}
      <div className="relative z-10 px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}>
            <Zap className="size-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white tracking-tight">SwitchMyCare</p>
            <p className="text-[10px] font-semibold text-white/30 tracking-widest uppercase">Admin</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Nav label */}
      <p className="relative z-10 px-5 pt-5 pb-2 text-[10px] font-bold tracking-widest uppercase text-white/20">
        Navigation
      </p>

      {/* Primary Nav */}
      <nav className="relative z-10 flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_PRIMARY.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group relative",
                active
                  ? "text-white"
                  : "text-white/35 hover:text-white/70 hover:bg-white/4"
              )}
              style={active ? {
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.15)",
              } : {}}
            >
              {/* Active indicator dot */}
              {active && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-emerald-400"
                  style={{ boxShadow: "0 0 6px rgba(16,185,129,0.8)" }} />
              )}
              <Icon className={cn(
                "size-4 shrink-0 transition-all duration-150",
                active ? "text-emerald-400" : "text-white/25 group-hover:text-white/50"
              )} />
              <span className="flex-1 tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom utilities */}
      <div className="relative z-10 px-3 pb-4 space-y-0.5">
        <div className="mx-2 mb-3 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        <Link href="/admin"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/25 hover:text-white/60 hover:bg-white/4 transition-all duration-150 group">
          <Bell className="size-4 text-white/20 group-hover:text-white/50" />
          <span>Notifications</span>
        </Link>
        <Link href="/admin"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/25 hover:text-white/60 hover:bg-white/4 transition-all duration-150 group">
          <Settings className="size-4 text-white/20 group-hover:text-white/50" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* User block */}
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl group cursor-default"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}>
            {adminName[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{adminName}</p>
            <p className="text-[10px] text-white/30 font-medium">Super Admin</p>
          </div>
          <Link href="/api/auth/signout" title="Sign out"
            className="h-7 w-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150">
            <LogOut className="size-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
