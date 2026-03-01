"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [agencies, setAgencies] = React.useState<Agency[]>(initialAgencies);
  const [total, setTotal] = React.useState(initialTotal);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState<AgencySearchFilters>(initialFilters);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchAgencies = useCallback(
    async (newFilters: AgencySearchFilters, newPage: number) => {
      setLoading(true);
      setError(null);
      const result = await searchAgencies(newFilters, newPage, PAGE_SIZE);
      if (result.error) {
        setError(result.error);
      } else {
        setAgencies(result.agencies);
        setTotal(result.total);
      }
      setLoading(false);
    },
    []
  );

  // Debounce search query
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

  return (
    <div className="space-y-6">
      {/* Patient-based filter suggestion */}
      {hasPatientFilters && !filters.county && !filters.payer_type && (
        <div className="rounded-xl bg-forest-50 border border-forest-200 p-4 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-forest-700 font-medium">
              Show agencies matching your profile?
            </p>
            <p className="text-xs text-forest-500 mt-0.5">
              {patientCounty && `${patientCounty} County`}
              {patientCounty && patientPayerType && " · "}
              {patientPayerType && patientPayerType.replace("_", " ")}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() =>
              handleFiltersChange({
                ...filters,
                county: patientCounty ?? undefined,
                payer_type: (patientPayerType as AgencySearchFilters["payer_type"]) ?? undefined,
              })
            }
          >
            Apply my filters
          </Button>
          <button
            className="text-xs text-forest-400 hover:text-forest-600"
            onClick={() => router.push(pathname)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search bar (full width above) */}
      <AgencySearchBar
        value={filters.query ?? ""}
        onChange={(q) => handleFiltersChange({ ...filters, query: q })}
      />

      <div className="flex gap-6 items-start">
        {/* Sidebar filters */}
        <AgencyFilters
          filters={filters}
          onChange={handleFiltersChange}
          resultCount={total}
          loading={loading}
        />

        {/* Results grid */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Error state */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="size-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <AgencyCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && agencies.length === 0 && !error && (
            <div className="text-center py-16 space-y-4">
              <div className="text-6xl">🏡</div>
              <h3 className="font-fraunces text-xl font-semibold text-forest-800">
                No agencies found
              </h3>
              <p className="text-forest-500 max-w-sm mx-auto">
                Try adjusting your filters — for example, clearing the county filter to see statewide agencies.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  handleFiltersChange({ query: filters.query })
                }
              >
                Clear all filters
              </Button>
            </div>
          )}

          {/* Results */}
          {!loading && agencies.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {agencies.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="gap-1"
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        pageNum === page
                          ? "bg-forest-600 text-white"
                          : "text-forest-500 hover:bg-forest-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
