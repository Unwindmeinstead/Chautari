import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  light?: boolean;
  invertColors?: boolean;
}

const sizes = {
  sm: { mark: 28, text: "text-lg", gap: "gap-2" },
  md: { mark: 36, text: "text-xl", gap: "gap-2.5" },
  lg: { mark: 48, text: "text-2xl", gap: "gap-3" },
  xl: { mark: 64, text: "text-3xl", gap: "gap-3.5" },
};

export function Logo({ variant = "full", size = "md", className, light = false, invertColors = false }: LogoProps) {
  light = light || invertColors;
  const s = sizes[size];
  const primaryColor = light ? "#FFF8E7" : "#1A3D2B";
  const accentColor = "#E8933A";

  const mark = (
    <svg
      width={s.mark}
      height={s.mark}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rounded square frame */}
      <rect x="4" y="4" width="40" height="40" rx="12" fill={primaryColor} opacity="0.08" />

      {/* Arrow path — the "switch" */}
      <path
        d="M14 20L24 14L34 20"
        stroke={accentColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 14V28"
        stroke={accentColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Heart at the base — the "care" */}
      <path
        d="M24 38C24 38 14 32 14 27C14 24.5 16 23 18 23C20 23 22 24.5 24 27C26 24.5 28 23 30 23C32 23 34 24.5 34 27C34 32 24 38 24 38Z"
        fill={primaryColor}
        opacity="0.9"
      />

      {/* Home roof silhouette */}
      <path
        d="M12 24L24 14L36 24"
        stroke={primaryColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
    </svg>
  );

  if (variant === "mark") return <div className={className}>{mark}</div>;

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      {mark}
      <span
        className={cn(
          "font-semibold tracking-tight leading-none",
          s.text,
          light ? "text-cream-50" : "text-forest-800"
        )}
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <span className={light ? "text-cream-50" : "text-forest-800"}>Switch</span>
        <span className="text-amber-500">My</span>
        <span className={light ? "text-cream-50" : "text-forest-800"}>Care</span>
      </span>
    </div>
  );
}
