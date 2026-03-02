import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  highlight?: boolean;
  alert?: boolean;
}

export function StatCard({ label, value, sub, icon, highlight, alert }: StatCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-[28px] border bg-white p-6 shadow-[0_2px_12px_rgba(26,61,43,0.02)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(26,61,43,0.06)]",
      alert ? "border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-white" : highlight ? "border-forest-200/60 bg-gradient-to-br from-forest-50/50 to-white" : "border-forest-900/5"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-3 rounded-2xl shadow-sm transition-colors duration-500",
          alert ? "bg-amber-100/80 text-amber-700 group-hover:bg-amber-200" : highlight ? "bg-forest-100/80 text-forest-700 group-hover:bg-forest-200" : "bg-gray-50 text-gray-500 group-hover:bg-gray-100"
        )}>
          {icon}
        </div>
        {alert && (
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h3 className={cn(
          "font-fraunces text-[2.5rem] leading-none font-semibold tracking-tight transition-transform duration-500 group-hover:scale-105 origin-left",
          alert ? "text-amber-700" : highlight ? "text-forest-800" : "text-gray-900"
        )}>
          {value}
        </h3>
        <p className="text-[14px] font-semibold text-gray-500 mt-2">{label}</p>
        {sub && <p className="text-[12px] font-medium text-gray-400 mt-1">{sub}</p>}
      </div>

      {/* Decorative subtle icon in background */}
      <div className={cn(
        "absolute -right-6 -bottom-6 opacity-[0.03] transition-all duration-700 pointer-events-none transform group-hover:scale-[1.2] group-hover:-rotate-12",
        alert ? "text-amber-900" : highlight ? "text-forest-900" : "text-gray-900"
      )}>
        {React.cloneElement(icon as React.ReactElement, { className: "size-32" })}
      </div>
    </div>
  );
}
