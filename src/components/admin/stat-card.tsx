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
  accent?: string; // hex color
}

export function StatCard({
  label, value, sub, icon, highlight, alert, trend, trendValue, accent
}: StatCardProps) {
  const accentColor = alert
    ? "#F59E0B"
    : highlight
      ? "#10B981"
      : accent ?? "#6B7280";

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#6B7280";

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 group"
      style={{
        background: "#111714",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      {/* Accent glow at top */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}25` }}>
          {React.cloneElement(icon as React.ReactElement, {
            className: "size-4",
            style: { color: accentColor }
          })}
        </div>

        {alert && (
          <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            <span className="text-[10px] font-bold text-amber-400 tracking-wider">ALERT</span>
          </div>
        )}

        {trend && trendValue && (
          <div className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: `${trendColor}12`, border: `1px solid ${trendColor}25` }}>
            <TrendIcon className="size-3" style={{ color: trendColor }} />
            <span className="text-[10px] font-bold" style={{ color: trendColor }}>{trendValue}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-[2.4rem] leading-none font-bold text-white tracking-tight font-fraunces">
          {value}
        </p>
        <p className="text-[12px] font-semibold mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          {label}
        </p>
        {sub && (
          <p className="text-[11px] mt-1 font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>
            {sub}
          </p>
        )}
      </div>

      {/* Corner glow */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)` }} />
    </div>
  );
}
