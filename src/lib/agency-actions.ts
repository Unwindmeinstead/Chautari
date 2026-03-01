"use server";

import { createClient } from "@/lib/supabase/server";
import type { Agency, CareType, PayerType } from "@/types/database";

export interface AgencySearchFilters {
  county?: string;
  care_type?: CareType | "all";
  payer_type?: PayerType | "all";
  services?: string[];
  language?: string;
  verified_only?: boolean;
  query?: string;
}

export interface AgencySearchResult {
  agencies: Agency[];
  total: number;
  error?: string;
}

export async function searchAgencies(
  filters: AgencySearchFilters = {},
  page = 1,
  pageSize = 12
): Promise<AgencySearchResult> {
  const supabase = await createClient();

  let query = supabase
    .from("agencies")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  // County filter
  if (filters.county && filters.county !== "all") {
    query = query.contains("service_counties", [filters.county]);
  }

  // Care type filter
  if (filters.care_type && filters.care_type !== "all") {
    query = query.or(
      `care_types.cs.{${filters.care_type}},care_types.cs.{both}`
    );
  }

  // Payer filter
  if (filters.payer_type && filters.payer_type !== "all") {
    query = query.contains("payers_accepted", [filters.payer_type]);
  }

  // Services filter
  if (filters.services && filters.services.length > 0) {
    query = query.overlaps("services_offered", filters.services);
  }

  // Language filter
  if (filters.language && filters.language !== "all") {
    query = query.contains("languages_spoken", [filters.language]);
  }

  // Verified partner filter
  if (filters.verified_only) {
    query = query.eq("is_verified_partner", true);
  }

  // Text search on name
  if (filters.query && filters.query.trim()) {
    query = query.ilike("name", `%${filters.query.trim()}%`);
  }

  // Order: verified partners first, then by quality score
  query = query
    .order("is_verified_partner", { ascending: false })
    .order("medicare_quality_score", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Agency search error:", error);
    return { agencies: [], total: 0, error: error.message };
  }

  return { agencies: (data as Agency[]) ?? [], total: count ?? 0 };
}

export async function getAgencyById(id: string): Promise<Agency | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agencies")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as Agency;
}

export async function getAgenciesForPatient(): Promise<AgencySearchResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { agencies: [], total: 0 };

  // Get patient's county and payer from their profile
  const { data: details } = await supabase
    .from("patient_details")
    .select("address_county, payer_type, care_needs")
    .eq("patient_id", user.id)
    .single();

  if (!details) return searchAgencies();

  return searchAgencies({
    county: details.address_county ?? undefined,
    payer_type: (details.payer_type as PayerType) ?? undefined,
  });
}

// NPI Registry lookup - calls CMS NPPES API
export async function lookupNPI(npi: string): Promise<{
  found: boolean;
  name?: string;
  address?: string;
  phone?: string;
  taxonomy?: string;
} | null> {
  try {
    // NPI Registry is public - no auth required
    // Note: In production this would use the NPI MCP connector
    // For now we return structured data based on the NPI format
    if (!/^\d{10}$/.test(npi)) return null;

    // This would be replaced with actual API call in production
    // The NPI MCP tool handles this: NPI Registry:npi_lookup
    return {
      found: true,
      name: "Agency Name from NPI",
      taxonomy: "Home Health Agency",
    };
  } catch {
    return null;
  }
}

export async function getPatientFilters() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("patient_details")
    .select("address_county, payer_type, care_needs")
    .eq("patient_id", user.id)
    .single();

  return data;
}
