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
  sm: { mark: 28, text: "text-lg" },
  md: { mark: 36, text: "text-xl" },
  lg: { mark: 48, text: "text-2xl" },
  xl: { mark: 64, text: "text-3xl" },
};

export function Logo({ variant = "full", size = "md", className, light = false, invertColors = false }: LogoProps) {
  light = light || invertColors;
  const s = sizes[size];
  const color = light ? "#FFF8E7" : "#1A3D2B";
  const accentColor = "#E8933A";

  const mark = (
    <svg
      width={s.mark}
      height={s.mark}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Banyan tree roots */}
      <path d="M24 44 L24 28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 38 L18 44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M24 38 L30 44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M20 34 L14 40" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M28 34 L34 40" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

      {/* Trunk */}
      <path d="M22 28 L26 28 L25 18 L23 18 Z" fill={color} opacity="0.9" />

      {/* Main canopy */}
      <circle cx="24" cy="14" r="11" fill={color} />

      {/* Sub-canopies */}
      <circle cx="13" cy="18" r="7" fill={color} opacity="0.85" />
      <circle cx="35" cy="18" r="7" fill={color} opacity="0.85" />

      {/* Leaf highlights */}
      <circle cx="20" cy="10" r="3" fill={accentColor} opacity="0.7" />
      <circle cx="28" cy="12" r="2" fill={accentColor} opacity="0.5" />
      <circle cx="13" cy="15" r="2" fill={accentColor} opacity="0.4" />
    </svg>
  );

  if (variant === "mark") return <div className={className}>{mark}</div>;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {mark}
      {variant !== "mark" && (
        <span
          className={cn(
            "font-fraunces font-semibold tracking-tight",
            s.text,
            light ? "text-cream-50" : "text-forest-600"
          )}
        >
          Chautari
        </span>
      )}
    </div>
  );
}
