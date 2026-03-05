"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, ArrowLeftRight,
  Shield, LogOut, Settings, Bell, Zap, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/agencies", label: "Agencies", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/requests", label: "Switch Requests", icon: ArrowLeftRight },
  { href: "/admin/audit", label: "Audit Log", icon: Shield },
];

export const ADMIN_UTIL_NAV = [
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [switching, setSwitching] = React.useState(false);
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function switchView(role: string) {
    setSwitching(true);
    const res = await fetch("/api/admin/view-as", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const { redirectTo } = await res.json();
    router.push(redirectTo);
    setSwitching(false);
  }

  return (
    <aside
      className="hidden lg:flex w-[250px] shrink-0 flex-col sticky top-0 h-screen overflow-hidden"
      style={{ background: "#09090B", borderRight: "1px solid rgba(255,255,255,0.08)" }}
    >
      <Link href="/admin" className="block px-5 pt-6 pb-5 hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.14)" }}
          >
            <Zap className="size-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white leading-none">SwitchMyCare</p>
            <p className="text-[10px] text-white/30 font-medium tracking-wider mt-0.5">Admin Console</p>
          </div>
        </div>
      </Link>

      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {ADMIN_NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group",
                active
                  ? "text-white bg-white/[0.12]"
                  : "text-white/45 hover:text-white/75 hover:bg-white/5"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active ? "text-white" : "text-white/35 group-hover:text-white/65")} />
              <span className="flex-1">{label}</span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-white/50" />}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

      <div className="px-3 py-3 space-y-1">
        {ADMIN_UTIL_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-medium text-white/35 hover:text-white/70 hover:bg-white/5 transition-all duration-150 group"
          >
            <Icon className="size-3.5 text-white/25 group-hover:text-white/55" />
            {label}
          </Link>
        ))}
      </div>

      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

      {/* View As switcher */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-2 px-1">Preview as</p>
        <div className="flex gap-1.5">
          {[
            { role: "patient", label: "Patient" },
            { role: "agency", label: "Agency" },
          ].map(({ role, label }) => (
            <button
              key={role}
              onClick={() => switchView(role)}
              disabled={switching}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold text-white/40 hover:text-white/80 transition-all disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Eye className="size-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
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
          className="h-6 w-6 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150">
          <LogOut className="size-3" />
        </Link>
      </div>
    </aside>
  );
}
