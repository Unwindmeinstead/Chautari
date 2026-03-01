"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PA_COUNTIES } from "@/data/pennsylvania";
import type { AgencySearchFilters } from "@/lib/agency-actions";

interface AgencyFiltersProps {
  filters: AgencySearchFilters;
  onChange: (filters: AgencySearchFilters) => void;
  resultCount: number;
  loading?: boolean;
}

const CARE_TYPE_OPTIONS = [
  { value: "all", label: "All care types" },
  { value: "home_health", label: "Home Health" },
  { value: "home_care", label: "Home Care" },
  { value: "both", label: "Both" },
];

const PAYER_OPTIONS = [
  { value: "all", label: "All insurance" },
  { value: "medicaid", label: "Medicaid" },
  { value: "medicare", label: "Medicare" },
  { value: "waiver", label: "Waiver Program" },
  { value: "private", label: "Private Insurance" },
  { value: "self_pay", label: "Self-Pay" },
];

const LANGUAGE_OPTIONS = [
  { value: "all", label: "Any language" },
  { value: "Spanish", label: "Spanish" },
  { value: "Nepali", label: "Nepali" },
  { value: "Hindi", label: "Hindi" },
  { value: "Chinese", label: "Chinese" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "Arabic", label: "Arabic" },
  { value: "Korean", label: "Korean" },
];

export function AgencyFilters({ filters, onChange, resultCount, loading }: AgencyFiltersProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const activeFilterCount = [
    filters.county && filters.county !== "all",
    filters.care_type && filters.care_type !== "all",
    filters.payer_type && filters.payer_type !== "all",
    filters.language && filters.language !== "all",
    filters.verified_only,
  ].filter(Boolean).length;

  function clearAll() {
    onChange({
      query: filters.query,
      county: "all",
      care_type: "all",
      payer_type: "all",
      language: "all",
      verified_only: false,
    });
  }

  const filterContent = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-forest-600" />
          <span className="font-semibold text-forest-800">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="default" className="text-xs px-1.5 py-0.5">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-forest-400 hover:text-forest-600 flex items-center gap-1"
          >
            <X className="size-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-forest-500">
        {loading ? "Searching..." : `${resultCount.toLocaleString()} agencies found`}
      </p>

      {/* County */}
      <div className="space-y-1.5">
        <Select
          value={filters.county ?? "all"}
          onValueChange={(v) => onChange({ ...filters, county: v === "all" ? undefined : v })}
        >
          <SelectTrigger label="County">
            <SelectValue placeholder="All counties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All counties</SelectItem>
            {PA_COUNTIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Care type */}
      <div className="space-y-1.5">
        <Select
          value={filters.care_type ?? "all"}
          onValueChange={(v) => onChange({ ...filters, care_type: v as AgencySearchFilters["care_type"] })}
        >
          <SelectTrigger label="Care type">
            <SelectValue placeholder="All care types" />
          </SelectTrigger>
          <SelectContent>
            {CARE_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Insurance */}
      <div className="space-y-1.5">
        <Select
          value={filters.payer_type ?? "all"}
          onValueChange={(v) => onChange({ ...filters, payer_type: v as AgencySearchFilters["payer_type"] })}
        >
          <SelectTrigger label="Insurance accepted">
            <SelectValue placeholder="All insurance" />
          </SelectTrigger>
          <SelectContent>
            {PAYER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Language */}
      <div className="space-y-1.5">
        <Select
          value={filters.language ?? "all"}
          onValueChange={(v) => onChange({ ...filters, language: v === "all" ? undefined : v })}
        >
          <SelectTrigger label="Language spoken">
            <SelectValue placeholder="Any language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Verified partners only */}
      <div className="rounded-xl border border-forest-100 bg-forest-50 p-4">
        <Checkbox
          label="Verified Chautari partners only"
          description="Agencies we've vetted for quality and compliance"
          checked={filters.verified_only ?? false}
          onCheckedChange={(v) => onChange({ ...filters, verified_only: v === true })}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="gap-2"
        >
          <Filter className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-forest-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
        <span className="text-sm text-forest-500">
          {resultCount.toLocaleString()} agencies
        </span>
      </div>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl p-6 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-fraunces text-lg font-semibold">Filters</h2>
              <button onClick={() => setMobileOpen(false)} className="text-forest-400 hover:text-forest-700">
                <X className="size-5" />
              </button>
            </div>
            {filterContent}
            <Button className="w-full mt-6" onClick={() => setMobileOpen(false)}>
              Show {resultCount} agencies
            </Button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
        <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-5">
          {filterContent}
        </div>
      </div>
    </>
  );
}

// Search bar component (shown at top)
interface AgencySearchBarProps {
  value: string;
  onChange: (query: string) => void;
}

export function AgencySearchBar({ value, onChange }: AgencySearchBarProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search agencies by name..."
      startIcon={<Search className="size-4" />}
      endIcon={
        value ? (
          <button
            onClick={() => onChange("")}
            className="text-forest-400 hover:text-forest-600"
          >
            <X className="size-4" />
          </button>
        ) : undefined
      }
    />
  );
}
