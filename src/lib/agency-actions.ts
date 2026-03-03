"use server";

import { createClient } from "@/lib/supabase/server";
import type { Agency, CareType, LanguageCode, PayerType } from "@/types/database";

export interface AgencySearchFilters {
  county?: string;
  care_type?: CareType | "all";
  payer_type?: PayerType | "all";
  services?: string[];
  min_quality_score?: number | "all";
  language?: string;
  verified_only?: boolean;
  query?: string;
}

export interface AgencySearchResult {
  agencies: Agency[];
  total: number;
  error?: string;
}

const LANGUAGE_NORMALIZATION_MAP: Record<string, LanguageCode> = {
  en: "en",
  english: "en",
  ne: "ne",
  nepali: "ne",
  hi: "hi",
  hindi: "hi",
};

const DEFAULT_SEARCH_ERROR = "We couldn't load agencies right now. Please try again.";

function dedupeAgencies(agencies: Agency[]): Agency[] {
  const map = new Map<string, Agency>();

  for (const agency of agencies) {
    const keyBase = agency.npi?.trim() || `${agency.name.toLowerCase()}|${agency.address_zip}`;
    const key = keyBase.toLowerCase();
    const existing = map.get(key);

    if (!existing) {
      map.set(key, agency);
      continue;
    }

    const existingScore = (existing.medicare_quality_score ?? 0) + (existing.is_verified_partner ? 1 : 0);
    const incomingScore = (agency.medicare_quality_score ?? 0) + (agency.is_verified_partner ? 1 : 0);
    if (incomingScore > existingScore) {
      map.set(key, agency);
    }
  }

  return Array.from(map.values());
}

function normalizeLanguageFilter(language?: string): LanguageCode | undefined {
  if (!language || language === "all") return undefined;
  return LANGUAGE_NORMALIZATION_MAP[language.trim().toLowerCase()];
}

type PipelineAgencyRow = {
  id: string;
  npi: string | null;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  payers_accepted: string[] | null;
  languages: string[] | null;
  cms_star_rating: number | null;
  is_medicare_certified: boolean | null;
  is_medicaid_certified: boolean | null;
  offers_nursing: boolean | null;
  offers_physical_therapy: boolean | null;
  offers_occupational_therapy: boolean | null;
  offers_speech_pathology: boolean | null;
  offers_medical_social: boolean | null;
  offers_home_health_aide: boolean | null;
};

function mapPipelineServices(row: PipelineAgencyRow): string[] {
  const services: string[] = [];
  if (row.offers_nursing) services.push("Skilled Nursing");
  if (row.offers_physical_therapy) services.push("Physical Therapy");
  if (row.offers_occupational_therapy) services.push("Occupational Therapy");
  if (row.offers_speech_pathology) services.push("Speech Therapy");
  if (row.offers_medical_social) services.push("Medical Social Work");
  if (row.offers_home_health_aide) services.push("Home Health Aide");
  return services;
}

function mapPipelineToAgency(row: PipelineAgencyRow): Agency {
  const addressLine1 = row.address ?? "";
  return {
    id: row.id,
    npi: row.npi ?? "",
    name: row.name,
    dba_name: null,
    address_line1: addressLine1,
    address_line2: null,
    address_city: row.city ?? "Pittsburgh",
    address_state: row.state ?? "PA",
    address_zip: row.zip ?? "",
    phone: row.phone,
    email: null,
    website: null,
    care_types: ["home_health"],
    payers_accepted: ((row.payers_accepted as PayerType[] | null) ?? []).filter(Boolean),
    services_offered: mapPipelineServices(row),
    languages_spoken: row.languages ?? ["en"],
    service_counties: ["Allegheny"],
    is_verified_partner: false,
    is_active: true,
    is_approved: true,
    medicare_quality_score: row.cms_star_rating,
    avg_response_hours: null,
    pa_license_number: null,
    npi_last_synced_at: null,
    pay_rates: null,
    benefits: null,
    google_rating: null,
    google_reviews_count: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function searchAgenciesPipelineFallback(filters: AgencySearchFilters, page: number, pageSize: number): Promise<AgencySearchResult> {
  const supabase = await createClient();
  let query = supabase
    .from("agencies")
    .select("id,npi,name,address,city,state,zip,phone,payers_accepted,languages,cms_star_rating,is_medicare_certified,is_medicaid_certified,offers_nursing,offers_physical_therapy,offers_occupational_therapy,offers_speech_pathology,offers_medical_social,offers_home_health_aide", { count: "exact" });

  if (filters.query && filters.query.trim()) query = query.ilike("name", `%${filters.query.trim()}%`);

  if (filters.min_quality_score && filters.min_quality_score !== "all") {
    query = query.gte("cms_star_rating", filters.min_quality_score);
  }

  const normalizedLanguage = normalizeLanguageFilter(filters.language);
  if (normalizedLanguage) query = query.contains("languages", [normalizedLanguage]);

  if (filters.payer_type && filters.payer_type !== "all") {
    if (filters.payer_type === "medicare") query = query.eq("is_medicare_certified", true);
    else if (filters.payer_type === "medicaid") query = query.eq("is_medicaid_certified", true);
    else query = query.contains("payers_accepted", [filters.payer_type]);
  }

  if (filters.services?.length) {
    const serviceMap: Record<string, string> = {
      "Skilled Nursing": "offers_nursing",
      "Physical Therapy": "offers_physical_therapy",
      "Occupational Therapy": "offers_occupational_therapy",
      "Speech Therapy": "offers_speech_pathology",
    };
    for (const service of filters.services) {
      const col = serviceMap[service];
      if (col) query = query.eq(col, true);
    }
  }

  query = query
    .order("cms_star_rating", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error("Agency search fallback error:", error);
    return { agencies: [], total: 0, error: DEFAULT_SEARCH_ERROR };
  }

  const mapped = ((data as PipelineAgencyRow[] | null) ?? []).map(mapPipelineToAgency);
  const agencies = dedupeAgencies(mapped);

  return {
    agencies,
    total: count ?? agencies.length,
  };
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

  if (filters.county && filters.county !== "all") {
    query = query.contains("service_counties", [filters.county]);
  }

  if (filters.care_type && filters.care_type !== "all") {
    query = query.or(
      `care_types.cs.{${filters.care_type}},care_types.cs.{both}`
    );
  }

  if (filters.payer_type && filters.payer_type !== "all") {
    query = query.contains("payers_accepted", [filters.payer_type]);
  }

  if (filters.services && filters.services.length > 0) {
    query = query.overlaps("services_offered", filters.services);
  }

  if (filters.min_quality_score && filters.min_quality_score !== "all") {
    query = query.gte("medicare_quality_score", filters.min_quality_score);
  }

  const normalizedLanguage = normalizeLanguageFilter(filters.language);
  if (normalizedLanguage) {
    query = query.contains("languages_spoken", [normalizedLanguage]);
  }

  if (filters.verified_only) {
    query = query.eq("is_verified_partner", true);
  }

  if (filters.query && filters.query.trim()) {
    query = query.ilike("name", `%${filters.query.trim()}%`);
  }

  query = query
    .order("is_verified_partner", { ascending: false })
    .order("medicare_quality_score", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Agency search error:", error);
    if (error.message.includes("column") || error.message.includes("does not exist")) {
      return searchAgenciesPipelineFallback(filters, page, pageSize);
    }
    return { agencies: [], total: 0, error: DEFAULT_SEARCH_ERROR };
  }

  const agencies = dedupeAgencies((data as Agency[]) ?? []);
  return { agencies, total: count ?? agencies.length };
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

export async function lookupNPI(npi: string): Promise<{
  found: boolean;
  name?: string;
  address?: string;
  phone?: string;
  taxonomy?: string;
} | null> {
  try {
    if (!/^\d{10}$/.test(npi)) return null;

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
