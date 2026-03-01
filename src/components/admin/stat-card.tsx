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
      "rounded-2xl border p-5 space-y-3",
      alert
        ? "bg-amber-50 border-amber-200"
        : highlight
        ? "bg-forest-50 border-forest-200"
        : "bg-white border-gray-200"
    )}>
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center",
        alert ? "bg-amber-100" : highlight ? "bg-forest-100" : "bg-gray-100"
      )}>
        <span className={cn(
          alert ? "text-amber-600" : highlight ? "text-forest-600" : "text-gray-500"
        )}>
          {icon}
        </span>
      </div>
      <div>
        <p className={cn(
          "text-3xl font-bold font-fraunces",
          alert ? "text-amber-700" : highlight ? "text-forest-800" : "text-gray-800"
        )}>
          {value}
        </p>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
