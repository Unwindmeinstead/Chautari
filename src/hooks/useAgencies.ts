"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AgencyListing, AgenciesQueryParams } from "@/lib/agencies/types";

interface UseAgenciesState {
  agencies: AgencyListing[];
  total: number;
  loading: boolean;
  error: string | null;
  cached_at: string | null;
  cms_quarter: string;
}

interface UseAgenciesReturn extends UseAgenciesState {
  setFilters: (f: Partial<AgenciesQueryParams>) => void;
  filters: AgenciesQueryParams;
  nextPage: () => void;
  prevPage: () => void;
  page: number;
  totalPages: number;
  refresh: () => void;
}

const DEFAULT_FILTERS: AgenciesQueryParams = {
  zip: "152",
  sort: "stars",
  limit: 20,
  offset: 0,
};

function buildQueryString(params: AgenciesQueryParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  return q.toString();
}

export function useAgencies(initialFilters?: Partial<AgenciesQueryParams>): UseAgenciesReturn {
  const [filters, setFiltersState] = useState<AgenciesQueryParams>({ ...DEFAULT_FILTERS, ...initialFilters });
  const [state, setState] = useState<UseAgenciesState>({
    agencies: [],
    total: 0,
    loading: true,
    error: null,
    cached_at: null,
    cms_quarter: "",
  });

  const abortRef = useRef<AbortController | null>(null);

  const fetchAgencies = useCallback(async (params: AgenciesQueryParams) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(`/api/agencies?${buildQueryString(params)}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      setState({
        agencies: json.agencies ?? [],
        total: json.total ?? 0,
        loading: false,
        error: null,
        cached_at: json.cached_at ?? null,
        cms_quarter: json.cms_refresh_quarter ?? "",
      });
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  useEffect(() => {
    fetchAgencies(filters);
    return () => abortRef.current?.abort();
  }, [filters, fetchAgencies]);

  const setFilters = useCallback((newFilters: Partial<AgenciesQueryParams>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters, offset: 0 }));
  }, []);

  const page = Math.floor((filters.offset ?? 0) / (filters.limit ?? 20)) + 1;
  const totalPages = Math.ceil(state.total / (filters.limit ?? 20));

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setFiltersState((prev) => ({
        ...prev,
        offset: (prev.offset ?? 0) + (prev.limit ?? 20),
      }));
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setFiltersState((prev) => ({
        ...prev,
        offset: Math.max(0, (prev.offset ?? 0) - (prev.limit ?? 20)),
      }));
    }
  }, [page]);

  const refresh = useCallback(() => {
    fetchAgencies(filters);
  }, [fetchAgencies, filters]);

  return {
    ...state,
    filters,
    setFilters,
    page,
    totalPages,
    nextPage,
    prevPage,
    refresh,
  };
}
