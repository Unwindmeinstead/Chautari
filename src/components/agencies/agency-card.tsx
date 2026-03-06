"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { careTypeLabel, payerLabel } from "@/lib/utils";
import type { Agency } from "@/types/database";

/* ── Design tokens ── */
const CR = "#FFF8E7"; // cream
const AM = "#E8933A"; // amber

/* ── SVG Icon base ── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p: string, i: number) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const MapPin = ({ size = 14, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"]} />;
const Clock = ({ size = 14, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 6v6l4 2"]} />;
const Globe = ({ size = 14, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"]} />;
const Phone = ({ size = 14, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l1.06-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />;
const Check = ({ size = 12, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} strokeWidth={2.5} d="M20 6L9 17l-5-5" />;
const ArrowR = ({ size = 14, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M5 12h14M12 5l7 7-7 7" />;

const Star = ({ filled, size = 12 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#E8933A" : "rgba(255,248,231,0.15)"} stroke="none">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const LANG_LABELS: Record<string, string> = {
  en: "English", ne: "Nepali", hi: "Hindi", es: "Spanish", zh: "Mandarin", ar: "Arabic", fr: "French"
};

interface AgencyCardProps {
  agency: Agency;
  highlighted?: boolean;
  showSelectButton?: boolean;
  onSelect?: (agency: Agency) => void;
}

export function AgencyCard({ agency, highlighted = false, showSelectButton = false, onSelect }: AgencyCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const score = agency.medicare_quality_score ?? null;
  const topLangs = agency.languages_spoken.slice(0, 3);

  const cardContent = (
    <div style={{ padding: "20px 20px 16px" }}>
      {/* Amber top line on hover */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${AM}, transparent)`, opacity: hovered || highlighted ? 1 : 0, transition: "opacity 0.2s" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {agency.is_verified_partner && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#4ADE80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 100, padding: "2px 8px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>
                <Check size={10} stroke="#4ADE80" /> Verified
              </span>
            )}
            {(agency as any).is_accepting_patients && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#60A5FA", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 100, padding: "2px 8px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#60A5FA", animation: "pulse-dot 2s ease-in-out infinite", display: "inline-block" }} /> Accepting
              </span>
            )}
            {!(agency as any).is_accepting_patients && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "rgba(255,210,100,0.8)", background: "rgba(255,210,100,0.08)", border: "1px solid rgba(255,210,100,0.2)", borderRadius: 100, padding: "2px 8px", fontFamily: "'DM Mono', monospace" }}>
                Waitlist
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: CR, lineHeight: 1.25, marginBottom: 2 }}>{agency.name}</div>
          {agency.dba_name && <div style={{ fontSize: 11, color: "rgba(255,248,231,0.35)", fontWeight: 400 }}>dba {agency.dba_name}</div>}
        </div>
        {/* Star rating */}
        {score && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[1, 2, 3, 4, 5].map(i => <Star key={i} filled={i <= Math.round(score)} size={11} />)}
            </div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: AM }}>{score.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Meta info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "rgba(255,248,231,0.55)" }}>
          <MapPin size={13} stroke="rgba(255,248,231,0.3)" />
          {agency.address_city}, PA · Serves {agency.service_counties.slice(0, 2).join(", ")}{agency.service_counties.length > 2 ? ` +${agency.service_counties.length - 2}` : ""}
        </div>
        {agency.avg_response_hours && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "rgba(255,248,231,0.55)" }}>
            <Clock size={13} stroke="rgba(255,248,231,0.3)" />
            Responds in ~{agency.avg_response_hours}h
          </div>
        )}
        {agency.languages_spoken.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "rgba(255,248,231,0.55)" }}>
            <Globe size={13} stroke="rgba(255,248,231,0.3)" />
            {topLangs.map(l => LANG_LABELS[l] ?? l).join(", ")}{agency.languages_spoken.length > 3 ? ` +${agency.languages_spoken.length - 3}` : ""}
          </div>
        )}
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {agency.care_types.map(t => (
          <span key={t} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,248,231,0.7)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,248,231,0.08)", borderRadius: 8, padding: "3px 10px" }}>{careTypeLabel(t)}</span>
        ))}
        {agency.payers_accepted.slice(0, 2).map(p => (
          <span key={p} style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,248,231,0.5)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,248,231,0.06)", borderRadius: 8, padding: "3px 10px" }}>{payerLabel(p)}</span>
        ))}
        {agency.payers_accepted.length > 2 && (
          <span style={{ fontSize: 11, color: "rgba(255,248,231,0.35)", padding: "3px 8px" }}>+{agency.payers_accepted.length - 2} payers</span>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,248,231,0.06)", padding: "12px 0 0", marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {agency.phone && (
          <a href={`tel:${agency.phone}`} onClick={e => e.stopPropagation()}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "rgba(255,248,231,0.45)", textDecoration: "none", transition: "color 0.2s" }}
            className="hover:text-[#FFF8E7]">
            <Phone size={13} stroke="rgba(255,248,231,0.35)" />
            {agency.phone}
          </a>
        )}
        {showSelectButton && onSelect ? (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(agency); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: AM, background: "rgba(232,147,58,0.1)", border: "1px solid rgba(232,147,58,0.2)", borderRadius: 100, padding: "6px 16px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
            className="hover:bg-[#E8933A] hover:text-[#0F2419]">
            Select agency
          </button>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: hovered ? AM : "rgba(255,248,231,0.5)", transition: "color 0.2s", marginLeft: "auto" }}>
            View details <ArrowR size={13} stroke={hovered ? AM : "rgba(255,248,231,0.5)"} />
          </span>
        )}
      </div>
    </div>
  );

  const style = {
    display: "flex",
    flexDirection: "column" as const,
    background: hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${hovered || highlighted ? "rgba(255,248,231,0.14)" : "rgba(255,248,231,0.07)"}`,
    borderRadius: 20,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.22s ease",
    transform: hovered ? "translateY(-2px)" : "translateY(0)",
    position: "relative" as const
  };

  const handleCardClick = () => {
    if (showSelectButton && onSelect) {
      onSelect(agency);
    } else {
      router.push(`/agencies/${agency.id}`);
    }
  };

  return (
    <div
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
    >
      {cardContent}
    </div>
  );
}

export function AgencyCardSkeleton() {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,248,231,0.06)", borderRadius: 20, padding: 20, animation: "pulse 1.5s ease-in-out infinite" }}>
      {[["30%", "10px"], ["70%", "16px"], ["50%", "10px"]].map(([w, h], i) => (
        <div key={i} style={{ width: w as string, height: h as string, background: "rgba(255,248,231,0.07)", borderRadius: 6, marginBottom: 10 }} />
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {["60px", "80px", "50px"].map((w, i) => (
          <div key={i} style={{ width: w, height: 24, background: "rgba(255,248,231,0.05)", borderRadius: 8 }} />
        ))}
      </div>
    </div>
  );
}
