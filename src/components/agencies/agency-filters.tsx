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

const FilterIcon = ({ d, size = 18 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={AM} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const FilterIcons = {
  sort: "M3 6h18M7 12h10M10 18h4",
  county: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  care: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  payer: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  lang: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  quality: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
};

function FilterSelect({ label, value, onChange, options, iconD }: { label: string; value: string; onChange: (v: string) => void; options: { v: string | number; l: string }[]; iconD: string }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ flex: "1 1 100%", marginBottom: 4 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,248,231,0.35)", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
        <FilterIcon d={iconD} size={12} /> {label}
      </label>
      <div style={{ position: "relative" }}>
        <select value={String(value)} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", appearance: "none", background: "rgba(255,255,255,0.04)", border: focused ? `1px solid ${AM}` : "1px solid rgba(255,248,231,0.1)", borderRadius: 14, padding: "12px 36px 12px 16px", fontSize: 14, fontWeight: 500, color: CR, cursor: "pointer", outline: "none", fontFamily: "inherit", transition: "all 0.2s" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}>
          {options.map(o => <option key={o.v} value={String(o.v)} style={{ background: FD, color: CR }}>{o.l}</option>)}
        </select>
        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>
          <ChevronD size={14} stroke={CR} />
        </div>
      </div>
    </div>
  );
}

function FilterToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 16, border: `1px solid ${checked ? AM : "rgba(255,248,231,0.1)"}`, background: checked ? "rgba(232,147,58,0.08)" : "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: checked ? AM : CR }}>{label}</span>
      <div style={{ width: 40, height: 22, borderRadius: 100, background: checked ? AM : "rgba(255,248,231,0.15)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: checked ? FD : CR, transition: "left 0.2s, background 0.2s" }} />
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Primary sorting always at top */}
      <FilterSelect
        label="Sort Results"
        iconD={FilterIcons.sort}
        value={filters.sort_by ?? "verified"}
        onChange={v => onChange({ ...filters, sort_by: v as any })}
        options={SORT_OPTIONS}
      />

      <div style={{ height: 1, background: "rgba(255,248,231,0.08)", margin: "4px 0" }} />

      {/* Main filters in a grid on desktop-sidebar, vertical elsewhere */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FilterSelect
          label="Location"
          iconD={FilterIcons.county}
          value={filters.county ?? "all"}
          onChange={v => onChange({ ...filters, county: v === "all" ? undefined : v })}
          options={[{ v: "all", l: "All counties" }, ...PA_COUNTIES.map(c => ({ v: c, l: c }))]}
        />
        <FilterSelect
          label="Care Category"
          iconD={FilterIcons.care}
          value={filters.care_type ?? "all"}
          onChange={v => onChange({ ...filters, care_type: v as any })}
          options={CARE_TYPES}
        />
        <FilterSelect
          label="Payment & Insurance"
          iconD={FilterIcons.payer}
          value={filters.payer_type ?? "all"}
          onChange={v => onChange({ ...filters, payer_type: v as any })}
          options={PAYERS}
        />
        <FilterSelect
          label="Language Preference"
          iconD={FilterIcons.lang}
          value={filters.language ?? "all"}
          onChange={v => onChange({ ...filters, language: v === "all" ? undefined : v })}
          options={LANGUAGES}
        />
        <FilterSelect
          label="Min Quality Score"
          iconD={FilterIcons.quality}
          value={String(filters.min_quality_score ?? 0)}
          onChange={v => onChange({ ...filters, min_quality_score: Number(v) })}
          options={QUALITY_OPTS}
        />
      </div>

      <div style={{ height: 1, background: "rgba(255,248,231,0.08)", margin: "4px 0" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <FilterToggle
          label="Accepting patients"
          checked={filters.accepting_patients ?? false}
          onChange={v => onChange({ ...filters, accepting_patients: v })}
        />
        <FilterToggle
          label="Verified partners"
          checked={filters.verified_only ?? false}
          onChange={v => onChange({ ...filters, verified_only: v })}
        />
      </div>

      {activeCount > 0 && (
        <button onClick={clearAll}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, color: AM, background: "rgba(232,147,58,0.08)", border: "1px solid rgba(232,147,58,0.15)", borderRadius: 12, padding: "10px 0", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
          className="hover:bg-[rgba(232,147,58,0.15)]">
          <X size={14} stroke="currentColor" /> Reset all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        #filters-mobile-trigger { display: none; }
        #filters-desktop-sidebar { display: block; width: 260px; flex-shrink: 0; position: sticky; top: 96px; align-self: flex-start; }
        
        @media (max-width: 1024px) {
          #filters-mobile-trigger { display: flex; }
          #filters-desktop-sidebar { display: none; }
        }
        
        .mobile-filters-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(10,24,18,0.7);
          backdrop-filter: blur(12px);
          animation: fadeIn 0.4s ease;
        }
        
        .mobile-filters-drawer {
          position: fixed; bottom: 0; left: 0; right: 0; height: 90vh; 
          z-index: 1000; background: ${FD}; 
          border-top: 1px solid rgba(255,248,231,0.15);
          border-radius: 32px 32px 0 0;
          display: flex; 
          flex-direction: column;
          box-shadow: 0 -20px 60px rgba(0,0,0,0.5);
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      {/* Mobile trigger */}
      <div id="filters-mobile-trigger" style={{ flexDirection: "column", gap: 10, marginBottom: 16, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: CR, fontFamily: "'Fraunces', serif", marginBottom: 0 }}>Filters</h2>
            <p style={{ fontSize: 12, color: "rgba(255,248,231,0.4)" }}>{resultCount.toLocaleString()} agencies found</p>
          </div>
          {activeCount > 0 && (
            <button onClick={clearAll} style={{ background: "none", border: "none", color: AM, fontSize: 11, fontWeight: 800, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em", padding: "4px 0", cursor: "pointer" }}>RESET ALL</button>
          )}
        </div>
        <button onClick={() => setMobileOpen(true)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 54, width: "100%", borderRadius: 16, border: `1.5px solid ${AM}`, background: "rgba(232,147,58,0.06)", color: CR, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: `0 8px 24px rgba(232,147,58,0.15), inset 0 0 12px rgba(232,147,58,0.1)`, appearance: "none", outline: "none", padding: "0 20px" }}
          className="hover:scale-[0.98] active:scale-[0.96]">
          <Sliders size={18} stroke={AM} />
          Refine Search
          {activeCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 800, color: FD, background: AM, borderRadius: 100, padding: "2px 8px", minWidth: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>{activeCount}</span>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="mobile-filters-overlay" onClick={() => setMobileOpen(false)} />
          <div className="mobile-filters-drawer" style={{
            background: "linear-gradient(to bottom, #122B1E, #0F2419)",
          }}>
            <div style={{ width: 44, height: 5, background: "rgba(255,248,231,0.15)", borderRadius: 10, margin: "16px auto 0", flexShrink: 0 }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 28px 16px", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: CR, fontFamily: "'Fraunces', serif", letterSpacing: "-0.02em" }}>Refine Search</h2>
                <p style={{ fontSize: 13, color: "rgba(255,248,231,0.4)" }}>{resultCount.toLocaleString()} agencies match your criteria</p>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,248,231,0.1)", color: CR, cursor: "pointer", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={22} /></button>
            </div>

            <div style={{ overflowY: "auto", padding: "10px 28px 40px", flex: 1 }}>
              {filterPanel}
            </div>

            <div style={{ padding: "20px 28px 32px", background: "rgba(10,24,18,0.85)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,248,231,0.1)", flexShrink: 0 }}>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ width: "100%", height: 60, borderRadius: 100, background: AM, color: FD, fontSize: 16, fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 10px 30px rgba(232,147,58,0.35)" }}>
                Explore {resultCount.toLocaleString()} Agencies
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <div id="filters-desktop-sidebar">
        <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))", border: "1px solid rgba(255,248,231,0.08)", borderRadius: 28, padding: 28, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 800, color: CR, fontFamily: "'Fraunces', serif" }}>
              <Sliders size={18} stroke={AM} /> Filters
            </div>
            {activeCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 800, color: FD, background: AM, borderRadius: 100, padding: "2px 10px", fontFamily: "'DM Mono', monospace" }}>{activeCount}</span>
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
    <div style={{ position: "relative", marginBottom: 32 }}>
      <div style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <Search size={20} stroke={AM} style={{ opacity: focused ? 1 : 0.4 }} />
      </div>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search clinical or local agency names…"
        style={{ width: "100%", height: 60, paddingLeft: 56, paddingRight: value ? 56 : 24, background: "rgba(255,255,255,0.04)", border: focused ? `2px solid ${AM}` : "1px solid rgba(255,248,231,0.15)", borderRadius: 20, fontSize: 15, fontWeight: 400, color: CR, outline: "none", fontFamily: "inherit", transition: "all 0.2s", caretColor: AM, boxShadow: focused ? "0 0 0 4px rgba(232,147,58,0.1)" : "none" }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value && (
        <button onClick={() => onChange("")}
          style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: CR, display: "flex", alignItems: "center", transition: "all 0.2s" }} className="hover:scale-90">
          <X size={16} stroke="currentColor" />
        </button>
      )}
    </div>
  );
}
