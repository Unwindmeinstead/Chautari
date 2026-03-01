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
    <aside className="w-64 shrink-0 bg-forest-950 min-h-screen flex flex-col sticky top-0 h-screen border-r border-forest-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-forest-800">
        <Logo size="sm" invertColors />
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-1">
          <Banknote className="size-3 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400 tracking-wide">Admin Console</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group",
                active
                  ? "bg-forest-700 text-white"
                  : "text-forest-400 hover:text-white hover:bg-forest-800"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="size-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-forest-800 space-y-2">
        <p className="text-xs text-forest-500 px-1">{adminName}</p>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-forest-800 hover:text-red-300 transition-colors"
        >
          <LogOut className="size-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
