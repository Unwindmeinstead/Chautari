"use client";

import * as React from "react";
import { useCallback } from "react";
import Link from "next/link";
import { AgencyCard, AgencyCardSkeleton } from "./agency-card";
import { AgencyFilters, AgencySearchBar } from "./agency-filters";
import { searchAgencies, type AgencySearchFilters } from "@/lib/agency-actions";
import type { Agency } from "@/types/database";

interface AgencySearchClientProps {
  initialAgencies: Agency[];
  initialTotal: number;
  initialFilters: AgencySearchFilters;
  patientCounty?: string | null;
  patientPayerType?: string | null;
}

const PAGE_SIZE = 12;

/* ── Design tokens ── */
const F = "#1A3D2B"; // forest
const FD = "#0F2419"; // forest dark
const CR = "#FFF8E7"; // cream
const AM = "#E8933A"; // amber

/* ── SVG Icon base ── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p: string, i: number) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const ChevronL = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M15 18l-6-6 6-6" />;
const ChevronR = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M9 18l6-6-6-6" />;
const ArrowR = ({ size = 14, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M5 12h14M12 5l7 7-7 7" />;
const Building = ({ size = 20, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} />;

export function AgencySearchClient({
  initialAgencies,
  initialTotal,
  initialFilters,
  patientCounty,
  patientPayerType,
}: AgencySearchClientProps) {
  const [agencies, setAgencies] = React.useState<Agency[]>(initialAgencies);
  const [total, setTotal] = React.useState(initialTotal);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState<AgencySearchFilters>(initialFilters);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchAgencies = useCallback(async (newFilters: AgencySearchFilters, newPage: number) => {
    setLoading(true);
    setError(null);
    const result = await searchAgencies(newFilters, newPage, PAGE_SIZE);
    if (result.error) setError(result.error);
    else { setAgencies(result.agencies); setTotal(result.total); }
    setLoading(false);
  }, []);

  const queryRef = React.useRef<ReturnType<typeof setTimeout>>();
  function handleFiltersChange(newFilters: AgencySearchFilters) {
    setFilters(newFilters);
    setPage(1);
    clearTimeout(queryRef.current);
    queryRef.current = setTimeout(() => {
      fetchAgencies(newFilters, 1);
    }, (newFilters.query !== filters.query) ? 400 : 0);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchAgencies(filters, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasPatientFilters = patientCounty || patientPayerType;
  const showPersonalisedBanner = hasPatientFilters && !filters.county && !filters.payer_type;

  const activeFilterCount = [
    filters.county && filters.county !== "all",
    filters.care_type && filters.care_type !== "all",
    filters.payer_type && filters.payer_type !== "all",
    filters.language && filters.language !== "all",
    filters.verified_only,
    filters.accepting_patients,
    filters.min_quality_score && filters.min_quality_score > 0,
  ].filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Search bar */}
      <AgencySearchBar
        value={filters.query ?? ""}
        onChange={q => handleFiltersChange({ ...filters, query: q })}
      />

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Sidebar filters */}
        <AgencyFilters
          filters={filters}
          onChange={handleFiltersChange}
          resultCount={total}
          loading={loading}
        />

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Result count & personalized banner */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
            {showPersonalisedBanner && (
              <div style={{ background: F, border: "1px solid rgba(255,248,231,0.08)", borderRadius: 20, padding: "16px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: CR }}>Show agencies matching your profile?</div>
                  <div style={{ fontSize: 12, color: "rgba(255,248,231,0.5)" }}>
                    {patientCounty && `${patientCounty} County`}{patientCounty && patientPayerType && " · "}{patientPayerType?.replace("_", " ")}
                  </div>
                </div>
                <button
                  onClick={() => handleFiltersChange({ ...filters, county: patientCounty ?? undefined, payer_type: (patientPayerType as any) ?? undefined })}
                  style={{ background: AM, color: FD, fontSize: 13, fontWeight: 700, padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer", transition: "all 0.2s" }}
                  className="hover:bg-[#D4822E] hover:-translate-y-px">
                  Apply my filters
                </button>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,248,231,0.45)", fontFamily: "'DM Mono', monospace" }}>
                {loading ? "Searching…" : `${total.toLocaleString()} ${total === 1 ? "agency" : "agencies"} found`}
              </p>
              {activeFilterCount > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: AM, fontFamily: "'DM Mono', monospace" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: AM }} />
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
                </div>
              )}
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, padding: "12px 16px", color: "#FCA5A5", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => <AgencyCardSkeleton key={i} />)}
            </div>
          ) : agencies.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(255,248,231,0.1)", borderRadius: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,248,231,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Building size={22} stroke="rgba(255,248,231,0.3)" />
              </div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: CR, marginBottom: 8 }}>No agencies found</h3>
              <p style={{ fontSize: 13, color: "rgba(255,248,231,0.4)", marginBottom: 24, lineHeight: 1.7, maxWidth: 300, margin: "0 auto 24px" }}>
                Try adjusting your filters — clearing the county filter shows statewide agencies.
              </p>
              <button onClick={() => handleFiltersChange({ query: filters.query })}
                style={{ fontSize: 13, fontWeight: 600, color: AM, background: "rgba(232,147,58,0.1)", border: "1px solid rgba(232,147,58,0.2)", borderRadius: 100, padding: "10px 24px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                className="hover:bg-[#E8933A] hover:text-[#0F2419]">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                {agencies.map((agency, i) => (
                  <div key={agency.id} className="card-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <AgencyCard agency={agency} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 40, borderTop: "1px solid rgba(255,248,231,0.06)", paddingTop: 24 }}>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    style={{ background: "none", border: "none", cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.2 : 1, color: CR, transition: "transform 0.2s" }}
                    onMouseEnter={e => page !== 1 && (e.currentTarget.style.transform = "translateX(-4px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                    <ChevronL size={24} />
                  </button>
                  <div style={{ display: "flex", gap: 12 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => handlePageChange(p)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer", background: p === page ? AM : "rgba(255,255,255,0.05)", color: p === page ? FD : CR, fontSize: 13, fontWeight: 700, transition: "all 0.2s" }}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    style={{ background: "none", border: "none", cursor: page === totalPages ? "default" : "pointer", opacity: page === totalPages ? 0.2 : 1, color: CR, transition: "transform 0.2s" }}
                    onMouseEnter={e => page !== totalPages && (e.currentTarget.style.transform = "translateX(4px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                    <ChevronR size={24} />
                  </button>
                </div>
              )}

              {/* Switch CTA banner */}
              <div style={{ marginTop: 48, background: F, border: "1px solid rgba(255,248,231,0.08)", borderRadius: 20, padding: "24px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: CR, marginBottom: 4 }}>Ready to switch agencies?</div>
                  <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(255,248,231,0.55)", lineHeight: 1.6 }}>We handle the paperwork and coordination. One-time $97 fee. Usually done in 5–7 days.</p>
                </div>
                <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: AM, color: FD, fontSize: 13, fontWeight: 700, padding: "11px 24px", borderRadius: 100, textDecoration: "none", flexShrink: 0, transition: "all 0.2s", boxShadow: "0 8px 24px rgba(232,147,58,0.25)" }}
                  className="hover:bg-[#D4822E] hover:-translate-y-px">
                  Start your switch <ArrowR size={14} stroke={FD} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
