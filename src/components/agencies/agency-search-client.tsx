"use client";

import * as React from "react";
import { useCallback } from "react";
import { ChevronLeft, ChevronRight, AlertCircle, Building2 } from "lucide-react";
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
    }, newFilters.query !== filters.query ? 400 : 0);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchAgencies(filters, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasPatientFilters = patientCounty || patientPayerType;
  const showPersonalisedBanner = hasPatientFilters && !filters.county && !filters.payer_type;

  return (
    <div className="space-y-6">
      {/* Personalised banner */}
      {showPersonalisedBanner && (
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-bold text-gray-900">Show agencies matching your profile?</p>
            <p className="text-[12px] font-medium text-gray-500 mt-0.5">
              {patientCounty && `${patientCounty} County`}{patientCounty && patientPayerType && " · "}{patientPayerType?.replace("_", " ")}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => handleFiltersChange({ ...filters, county: patientCounty ?? undefined, payer_type: (patientPayerType as any) ?? undefined })}
              className="h-10 w-full sm:w-auto px-5 rounded-full bg-gray-900 text-white text-[12px] font-bold hover:bg-gray-800 transition-colors">
              Apply my filters
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <AgencySearchBar
        value={filters.query ?? ""}
        onChange={q => handleFiltersChange({ ...filters, query: q })}
      />

      <div className="flex flex-col lg:flex-row gap-5 lg:gap-7 items-start">
        {/* Sidebar filters */}
        <AgencyFilters
          filters={filters}
          onChange={handleFiltersChange}
          resultCount={total}
          loading={loading}
        />

        {/* Results */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Results count (desktop) */}
          <div className="hidden lg:flex items-center justify-between">
            <p className="text-[13px] font-semibold text-gray-500">
              {loading ? "Searching…" : `${total.toLocaleString()} agencies found`}
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="size-5 shrink-0" />
              <p className="text-[13px] font-semibold">{error}</p>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => <AgencyCardSkeleton key={i} />)}
            </div>
          )}

          {!loading && agencies.length === 0 && !error && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 text-center px-6">
              <div className="h-14 w-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-5">
                <Building2 className="size-6 text-gray-400" />
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">No agencies found</h3>
              <p className="text-[13px] font-medium text-gray-500 max-w-sm mx-auto mb-6">
                Try adjusting your filters — for example, clear the county filter to see statewide agencies.
              </p>
              <button
                onClick={() => handleFiltersChange({ query: filters.query })}
                className="h-10 px-6 rounded-full border border-gray-300 text-[13px] font-bold text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all inline-flex items-center gap-2"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!loading && agencies.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
              {agencies.map(agency => <AgencyCard key={agency.id} agency={agency} />)}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center justify-center gap-1.5 h-10 px-5 rounded-full border border-gray-200 text-[13px] font-bold text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all disabled:opacity-40 disabled:pointer-events-none w-full sm:w-auto"
              >
                <ChevronLeft className="size-4" /> Previous
              </button>

              <div className="flex items-center justify-center gap-1 order-first sm:order-none">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5) {
                    if (page <= 3) p = i + 1;
                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                    else p = page - 2 + i;
                  }
                  return (
                    <button key={p} onClick={() => handlePageChange(p)}
                      className={`h-9 w-9 rounded-full text-[13px] font-bold transition-colors ${p === page ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="flex items-center justify-center gap-1.5 h-10 px-5 rounded-full border border-gray-200 text-[13px] font-bold text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all disabled:opacity-40 disabled:pointer-events-none w-full sm:w-auto"
              >
                Next <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
