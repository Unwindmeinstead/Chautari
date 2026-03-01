"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, Bell, User, LogOut, ChevronDown, Menu, X
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

interface DashboardNavProps {
  userName: string | null;
  unreadCount: number;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agencies", label: "Find Agencies", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function DashboardNav({ userName, unreadCount }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const firstName = userName?.split(" ")[0] ?? "Account";

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-forest-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Logo size="sm" />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 flex-1 ml-4">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                  pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                    ? "bg-forest-100 text-forest-800"
                    : "text-forest-500 hover:text-forest-700 hover:bg-forest-50"
                )}
              >
                <Icon className="size-4" />
                {label}
                {label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex-1 md:flex-none" />

          {/* User menu desktop */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <div className="text-sm text-forest-600 font-medium">{firstName}</div>
            <Button variant="ghost" size="sm" asChild className="text-forest-400 hover:text-red-600">
              <Link href="/api/auth/signout">
                <LogOut className="size-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile: notification bell + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher compact />
            <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-forest-50 text-forest-500">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-forest-50 text-forest-500"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="absolute top-14 left-0 right-0 bg-white border-b border-forest-100 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-forest-100 text-forest-800"
                      : "text-forest-600 hover:bg-forest-50"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                  {label === "Notifications" && unreadCount > 0 && (
                    <span className="ml-auto h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
              <div className="border-t border-forest-100 pt-3 mt-3">
                <div className="px-3 pb-2 text-xs text-forest-400">{userName}</div>
                <Link
                  href="/api/auth/signout"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50"
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
