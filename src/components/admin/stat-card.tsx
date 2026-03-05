import * as React from "react";
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
  const accentColor = alert ? "#F59E0B" : accent ?? "#6EE7B7";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#6EE7B7" : trend === "down" ? "#FCA5A5" : "#94A3B8";

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group"
      style={{ background: "linear-gradient(145deg, #1E2433, #181E2C)", border: "1px solid rgba(148,163,184,0.1)" }}>
      {/* Top accent glow */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-12 rounded-full blur-2xl opacity-20"
        style={{ background: accentColor }} />

      <div className="flex items-start justify-between mb-4">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
          {React.cloneElement(icon as React.ReactElement, { className: "size-4", style: { color: accentColor } })}
        </div>

        {alert && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2.5 py-1"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            ALERT
          </span>
        )}

        {trend && trendValue && !alert && (
          <span className="flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-1"
            style={{ background: `${trendColor}15`, border: `1px solid ${trendColor}25`, color: trendColor }}>
            <TrendIcon className="size-3" />
            {trendValue}
          </span>
        )}
      </div>

      <p className="text-[2.5rem] leading-none font-bold tracking-tight"
        style={{ color: "#F1F5F9", fontFamily: "Georgia, serif" }}>{value}</p>
      <p className="text-[12px] font-semibold mt-2" style={{ color: "#94A3B8" }}>{label}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: "#64748B" }}>{sub}</p>}
    </div>
  );
}
