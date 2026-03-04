"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, ArrowLeftRight,
  Shield, LogOut, Settings, Bell, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/agencies", label: "Agencies", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/requests", label: "Switch Requests", icon: ArrowLeftRight },
  { href: "/admin/audit", label: "Audit Log", icon: Shield },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="w-[220px] shrink-0 flex flex-col sticky top-0 h-screen overflow-hidden"
      style={{ background: "#09090B", borderRight: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Brand */}
      <Link href="/" className="block px-5 pt-6 pb-5 hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-2.5">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <Zap className="size-3.5 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white leading-none">SwitchMyCare</p>
            <p className="text-[10px] text-white/30 font-medium tracking-wider mt-0.5">Admin Console</p>
          </div>
        </div>
      </Link>

      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group",
                active ? "text-white bg-white/10" : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active ? "text-white" : "text-white/30 group-hover:text-white/60")} />
              <span className="flex-1">{label}</span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-white/40" />}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

      {/* Utilities */}
      <div className="px-3 py-3 space-y-0.5">
        <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-150 group">
          <Bell className="size-3.5 text-white/20 group-hover:text-white/50" />
          Notifications
        </Link>
        <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-150 group">
          <Settings className="size-3.5 text-white/20 group-hover:text-white/50" />
          Settings
        </Link>
      </div>

      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

      {/* User */}
      <div className="p-4">
        <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            {adminName[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white truncate">{adminName}</p>
            <p className="text-[10px] text-white/30">Super Admin</p>
          </div>
          <Link href="/api/auth/signout" title="Sign out"
            className="h-6 w-6 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150">
            <LogOut className="size-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
