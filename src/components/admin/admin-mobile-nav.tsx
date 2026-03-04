"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV, ADMIN_UTIL_NAV } from "@/components/admin/admin-sidebar";
import { cn } from "@/lib/utils";

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <>
      <div className="lg:hidden sticky top-0 z-40 border-b border-white/10 bg-[#09090B]/95 backdrop-blur-xl">
        <div className="px-4 py-3">
          <p className="text-white text-sm font-semibold">Admin Console</p>
          <p className="text-white/35 text-xs">SwitchMyCare</p>
        </div>
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {ADMIN_NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border",
                    active
                      ? "bg-white text-zinc-900 border-white"
                      : "text-white/70 border-white/15 bg-white/[0.03]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 rounded-2xl border border-white/10 bg-[#0f0f12]/95 backdrop-blur-xl p-2">
        <div className="grid grid-cols-2 gap-2">
          {ADMIN_UTIL_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "h-9 rounded-xl text-xs font-medium flex items-center justify-center",
                  active ? "bg-white text-zinc-900" : "bg-white/[0.04] text-white/75"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
