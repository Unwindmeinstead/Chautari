"use client";

import * as React from "react";
import { PA_COUNTIES } from "@/data/pennsylvania";
import type { AgencySearchFilters } from "@/lib/agency-actions";

/* ── Design tokens ── */
const FD = "#0F2419"; // forest dark
const CR = "#FFF8E7"; // cream
const AM = "#E8933A"; // amber

/* ── SVG Icon base ── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p: string, i: number) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const Search = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const X = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M18 6L6 18", "M6 6l12 12"]} />;
const ChevronD = ({ size = 14, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M6 9l6 6 6-6" />;
const Sliders = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M4 21v-7", "M4 10V3", "M12 21v-9", "M12 8V3", "M20 21v-5", "M20 12V3", "M1 14h6", "M9 8h6", "M17 16h6"]} />;

const CARE_TYPES = [{ v: "all", l: "All types" }, { v: "home_health", l: "Home Health" }, { v: "home_care", l: "Home Care" }, { v: "both", l: "Both" }];
const PAYERS = [{ v: "all", l: "All payers" }, { v: "medicaid", l: "Medicaid" }, { v: "medicare", l: "Medicare" }, { v: "waiver", l: "Waiver Program" }, { v: "private", l: "Private Insurance" }, { v: "self_pay", l: "Self-Pay" }];
const LANGUAGES = [{ v: "all", l: "Any language" }, { v: "en", l: "English" }, { v: "ne", l: "Nepali" }, { v: "hi", l: "Hindi" }, { v: "es", l: "Spanish" }, { v: "zh", l: "Mandarin" }, { v: "ar", l: "Arabic" }];
const SORT_OPTIONS = [{ v: "verified", l: "Best Match" }, { v: "quality", l: "Highest Rated" }, { v: "response_time", l: "Fastest Response" }, { v: "name", l: "Name (A–Z)" }];
const QUALITY_OPTS = [{ v: 0, l: "Any rating" }, { v: 3, l: "3★ and above" }, { v: 4, l: "4★ and above" }, { v: 4.5, l: "4.5★ and above" }];

interface AgencyFiltersProps {
  filters: AgencySearchFilters;
  onChange: (filters: AgencySearchFilters) => void;
  resultCount: number;
  loading?: boolean;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string | number; l: string }[] }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,248,231,0.4)", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <select value={String(value)} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", appearance: "none", background: "rgba(255,255,255,0.04)", border: focused ? `1px solid rgba(232,147,58,0.5)` : "1px solid rgba(255,248,231,0.1)", borderRadius: 12, padding: "9px 32px 9px 14px", fontSize: 13, fontWeight: 500, color: CR, cursor: "pointer", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}>
          {options.map(o => <option key={o.v} value={String(o.v)} style={{ background: FD, color: CR }}>{o.l}</option>)}
        </select>
        <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <ChevronD size={13} stroke="rgba(255,248,231,0.4)" />
        </div>
      </div>
    </div>
  );
}

function FilterToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, border: `1px solid ${checked ? AM : "rgba(255,248,231,0.1)"}`, background: checked ? "rgba(232,147,58,0.1)" : "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: checked ? AM : CR }}>{label}</span>
      <div style={{ width: 36, height: 20, borderRadius: 10, background: checked ? AM : "rgba(255,248,231,0.1)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
      </div>
    </button>
  );
}

export function AgencyFilters({ filters, onChange, resultCount, loading }: AgencyFiltersProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const activeCount = [
    filters.county && filters.county !== "all",
    filters.care_type && filters.care_type !== "all",
    filters.payer_type && filters.payer_type !== "all",
    filters.language && filters.language !== "all",
    filters.verified_only,
    filters.accepting_patients,
    filters.min_quality_score && filters.min_quality_score > 0,
  ].filter(Boolean).length;

  function clearAll() {
    onChange({ query: filters.query, sort_by: filters.sort_by });
  }

  const filterPanel = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <FilterSelect
        label="Sort by"
        value={filters.sort_by ?? "verified"}
        onChange={v => onChange({ ...filters, sort_by: v as any })}
        options={SORT_OPTIONS}
      />
      <div style={{ height: 1, background: "rgba(255,248,231,0.06)" }} />
      <FilterSelect
        label="County"
        value={filters.county ?? "all"}
        onChange={v => onChange({ ...filters, county: v === "all" ? undefined : v })}
        options={[{ v: "all", l: "All counties" }, ...PA_COUNTIES.map(c => ({ v: c, l: c }))]}
      />
      <FilterSelect
        label="Care Type"
        value={filters.care_type ?? "all"}
        onChange={v => onChange({ ...filters, care_type: v as any })}
        options={CARE_TYPES}
      />
      <FilterSelect
        label="Insurance Accepted"
        value={filters.payer_type ?? "all"}
        onChange={v => onChange({ ...filters, payer_type: v as any })}
        options={PAYERS}
      />
      <FilterSelect
        label="Language Spoken"
        value={filters.language ?? "all"}
        onChange={v => onChange({ ...filters, language: v === "all" ? undefined : v })}
        options={LANGUAGES}
      />
      <FilterSelect
        label="Minimum Quality Rating"
        value={String(filters.min_quality_score ?? 0)}
        onChange={v => onChange({ ...filters, min_quality_score: Number(v) })}
        options={QUALITY_OPTS}
      />
      <div style={{ height: 1, background: "rgba(255,248,231,0.06)" }} />
      <FilterToggle
        label="Accepting patients now"
        checked={filters.accepting_patients ?? false}
        onChange={v => onChange({ ...filters, accepting_patients: v })}
      />
      <FilterToggle
        label="Verified partners only"
        checked={filters.verified_only ?? false}
        onChange={v => onChange({ ...filters, verified_only: v })}
      />
      {activeCount > 0 && (
        <button onClick={clearAll}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "rgba(255,248,231,0.4)", background: "none", border: "none", cursor: "pointer", padding: "6px 0", fontFamily: "inherit", transition: "color 0.2s" }}
          className="hover:text-[rgba(255,248,231,0.7)]">
          <X size={12} stroke="currentColor" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        #filters-mobile-trigger { display: none; }
        #filters-desktop-sidebar { display: block; width: 224px; flex-shrink: 0; position: sticky; top: 96px; align-self: flex-start; }
        
        @media (max-width: 1024px) {
          #filters-mobile-trigger { display: flex; }
          #filters-desktop-sidebar { display: none; }
        }
        
        .mobile-filters-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(15,36,25,0.8);
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
        }
        
        .mobile-filters-drawer {
          position: fixed; bottom: 0; left: 0; right: 0; height: 85vh; 
          z-index: 1000; background: ${FD}; 
          border-top: 1px solid rgba(255,248,231,0.1);
          border-radius: 32px 32px 0 0;
          display: flex; flexDirection: column;
          box-shadow: 0 -20px 40px rgba(0,0,0,0.4);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      {/* Mobile trigger */}
      <div id="filters-mobile-trigger">
        <button onClick={() => setMobileOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 20px", borderRadius: 100, border: "1px solid rgba(255,248,231,0.15)", background: "rgba(255,255,255,0.06)", color: CR, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
          <Sliders size={14} stroke="rgba(255,248,231,0.5)" />
          Filters
          {activeCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: FD, background: AM, borderRadius: 100, padding: "2px 8px", fontFamily: "'DM Mono', monospace" }}>{activeCount}</span>
          )}
        </button>
        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,248,231,0.45)", marginLeft: "auto" }}>
          {loading ? "Searching…" : `${resultCount.toLocaleString()} found`}
        </p>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="mobile-filters-overlay" onClick={() => setMobileOpen(false)} />
          <div className="mobile-filters-drawer">
            <div style={{ width: 40, height: 4, background: "rgba(255,248,231,0.2)", borderRadius: 2, margin: "12px auto 8px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid rgba(255,248,231,0.06)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: CR, fontFamily: "'Fraunces', serif" }}>Refine Search</h2>
              <button onClick={() => setMobileOpen(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: CR, cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} /></button>
            </div>
            <div style={{ overflowY: "auto", padding: "24px 24px 120px", flex: 1 }}>{filterPanel}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: FD, padding: "20px 24px 32px", borderTop: "1px solid rgba(255,248,231,0.06)", display: "flex", gap: 12 }}>
              <button onClick={() => setMobileOpen(false)} style={{ flex: 1, height: 52, borderRadius: 100, background: AM, color: FD, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(232,147,58,0.2)" }}>
                Show Results
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <div id="filters-desktop-sidebar">
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,248,231,0.07)", borderRadius: 24, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: CR }}>
              <Sliders size={14} stroke="rgba(255,248,231,0.5)" /> Filters
            </div>
            {activeCount > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: FD, background: AM, borderRadius: 100, padding: "2px 8px", fontFamily: "'DM Mono', monospace" }}>{activeCount}</span>
            )}
          </div>
          {filterPanel}
        </div>
      </div>
    </>
  );
}

export function AgencySearchBar({ value, onChange }: { value: string; onChange: (q: string) => void }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ position: "relative", marginBottom: 24 }}>
      <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <Search size={16} stroke="rgba(255,248,231,0.3)" />
      </div>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search agencies by name…"
        style={{ width: "100%", height: 52, paddingLeft: 44, paddingRight: value ? 44 : 16, background: "rgba(255,255,255,0.05)", border: focused ? `1px solid rgba(232,147,58,0.5)` : "1px solid rgba(255,248,231,0.1)", borderRadius: 16, fontSize: 14, fontWeight: 400, color: CR, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s", caretColor: AM }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value && (
        <button onClick={() => onChange("")}
          style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(255,248,231,0.4)", display: "flex", alignItems: "center" }}>
          <X size={15} stroke="currentColor" />
        </button>
      )}
    </div>
  );
}
