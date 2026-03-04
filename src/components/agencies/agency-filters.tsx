"use client";

import * as React from "react";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { PA_COUNTIES } from "@/data/pennsylvania";
import { cn } from "@/lib/utils";
import type { AgencySearchFilters } from "@/lib/agency-actions";

interface AgencyFiltersProps {
  filters: AgencySearchFilters;
  onChange: (filters: AgencySearchFilters) => void;
  resultCount: number;
  loading?: boolean;
}

const CARE_TYPES = [{ v: "all", l: "All types" }, { v: "home_health", l: "Home Health" }, { v: "home_care", l: "Home Care" }, { v: "both", l: "Both" }];
const PAYERS = [{ v: "all", l: "All payers" }, { v: "medicaid", l: "Medicaid" }, { v: "medicare", l: "Medicare" }, { v: "waiver", l: "Waiver Program" }, { v: "private", l: "Private Insurance" }, { v: "self_pay", l: "Self-Pay" }];
const LANGUAGES = [{ v: "all", l: "Any language" }, { v: "en", l: "English" }, { v: "ne", l: "Nepali" }, { v: "hi", l: "Hindi" }, { v: "es", l: "Spanish" }, { v: "zh", l: "Mandarin" }, { v: "ar", l: "Arabic" }];
const SORT_OPTIONS = [{ v: "verified", l: "Best Match" }, { v: "quality", l: "Highest Rated" }, { v: "response_time", l: "Fastest Response" }, { v: "name", l: "Name (A–Z)" }];
const QUALITY_OPTS = [{ v: 0, l: "Any rating" }, { v: 3, l: "3★ and above" }, { v: 4, l: "4★ and above" }, { v: 4.5, l: "4.5★ and above" }];

function NativeSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string | number; l: string }[] }) {
  return (
    <div className="relative">
      <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={String(value)}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-gray-800 pr-8 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors cursor-pointer"
        >
          {options.map(o => <option key={o.v} value={String(o.v)}>{o.l}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn("w-full flex items-center justify-between px-4 py-3 rounded-xl border text-[13px] font-semibold transition-all",
        checked ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400")}
    >
      {label}
      <div className={cn("h-5 w-9 rounded-full transition-colors flex items-center px-0.5", checked ? "bg-white/20" : "bg-gray-200")}>
        <div className={cn("h-4 w-4 rounded-full transition-transform bg-white shadow-sm", checked ? "translate-x-4" : "translate-x-0")} />
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
    <div className="space-y-5">
      <NativeSelect
        label="Sort by"
        value={filters.sort_by ?? "verified"}
        onChange={v => onChange({ ...filters, sort_by: v as any })}
        options={SORT_OPTIONS}
      />
      <div className="h-px bg-gray-100" />
      <NativeSelect
        label="County"
        value={filters.county ?? "all"}
        onChange={v => onChange({ ...filters, county: v === "all" ? undefined : v })}
        options={[{ v: "all", l: "All counties" }, ...PA_COUNTIES.map(c => ({ v: c, l: c }))]}
      />
      <NativeSelect
        label="Care Type"
        value={filters.care_type ?? "all"}
        onChange={v => onChange({ ...filters, care_type: v as any })}
        options={CARE_TYPES}
      />
      <NativeSelect
        label="Insurance Accepted"
        value={filters.payer_type ?? "all"}
        onChange={v => onChange({ ...filters, payer_type: v as any })}
        options={PAYERS}
      />
      <NativeSelect
        label="Language Spoken"
        value={filters.language ?? "all"}
        onChange={v => onChange({ ...filters, language: v === "all" ? undefined : v })}
        options={LANGUAGES}
      />
      <NativeSelect
        label="Minimum Quality Rating"
        value={String(filters.min_quality_score ?? 0)}
        onChange={v => onChange({ ...filters, min_quality_score: Number(v) })}
        options={QUALITY_OPTS}
      />
      <div className="h-px bg-gray-100" />
      <Toggle
        label="Accepting patients now"
        checked={filters.accepting_patients ?? false}
        onChange={v => onChange({ ...filters, accepting_patients: v })}
      />
      <Toggle
        label="Verified partners only"
        checked={filters.verified_only ?? false}
        onChange={v => onChange({ ...filters, verified_only: v })}
      />
      {activeCount > 0 && (
        <button onClick={clearAll} className="w-full flex items-center justify-center gap-1.5 text-[12px] font-bold text-gray-500 hover:text-gray-900 py-2 transition-colors">
          <X className="size-3.5" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-full border border-gray-200 text-[13px] font-bold text-gray-700 bg-white hover:border-gray-900 hover:text-gray-900 transition-all"
        >
          <SlidersHorizontal className="size-4 text-gray-400" />
          Filters
          {activeCount > 0 && (
            <span className="h-5 px-1.5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">{activeCount}</span>
          )}
        </button>
        <p className="text-[13px] font-semibold text-gray-500">
          {loading ? "Searching…" : `${resultCount.toLocaleString()} agencies`}
        </p>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-[17px] font-bold text-gray-900">Filters</h2>
              <button onClick={() => setMobileOpen(false)} className="h-9 w-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 pb-28">{filterPanel}</div>
            <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] flex gap-3">
              {activeCount > 0 && (
                <button onClick={() => { clearAll(); setMobileOpen(false); }} className="flex-1 h-11 rounded-full border border-gray-200 text-[14px] font-bold text-gray-700 hover:border-gray-400 transition-colors">
                  Clear
                </button>
              )}
              <button onClick={() => setMobileOpen(false)} className="flex-1 h-11 rounded-full bg-gray-900 text-white text-[14px] font-bold hover:bg-gray-800 transition-colors">
                Show {resultCount.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-gray-400" /> Filters
            </h2>
            {activeCount > 0 && (
              <span className="h-5 px-1.5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">{activeCount}</span>
            )}
          </div>
          {filterPanel}
        </div>
      </div>
    </>
  );
}

export function AgencySearchBar({ value, onChange }: { value: string; onChange: (q: string) => void }) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search agencies by name…"
        className="w-full h-12 pl-11 pr-10 rounded-2xl border border-gray-200 bg-white text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all shadow-sm"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
