import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  highlight?: boolean;
  alert?: boolean;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accent?: string;
}

export function StatCard({ label, value, sub, icon, alert, trend, trendValue, accent }: StatCardProps) {
  const color = alert ? "#FBBF24" : accent ?? "rgba(255,255,255,0.5)";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#4ADE80" : trend === "down" ? "#F87171" : "rgba(255,255,255,0.3)";

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5 group"
      style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />

      {/* Icon + trend */}
      <div className="flex items-start justify-between mb-4">
        <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {React.cloneElement(icon as React.ReactElement, { className: "size-4 text-white/50" })}
        </div>

        {alert && (
          <span className="flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5"
            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#FBBF24" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            ALERT
          </span>
        )}

        {trend && trendValue && !alert && (
          <span className="flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5"
            style={{ background: `${trendColor}15`, border: `1px solid ${trendColor}30`, color: trendColor }}>
            <TrendIcon className="size-3" />
            {trendValue}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-[2.25rem] leading-none font-bold text-white font-fraunces">{value}</p>
      <p className="text-[11px] font-semibold text-white/40 mt-2">{label}</p>
      {sub && <p className="text-[11px] text-white/20 mt-0.5 font-medium">{sub}</p>}
    </div>
  );
}
