import type { CMSAgencyRaw, NPIRaw, AgencyListing } from "./types";

const CMS_API_BASE = "https://data.cms.gov/provider-data/api/1/datastore/sql";
const HHA_DATASET_ID = "6jpm-sxkc";
const NPPES_API_BASE = "https://npiregistry.cms.hhs.gov/api";
const PITTSBURGH_ZIP_PREFIXES = ["150", "151", "152"];
export const CMS_REFRESH_DAYS = 91;

export async function fetchCMSAgencies(stateCode = "PA", pageSize = 500): Promise<CMSAgencyRaw[]> {
  const all: CMSAgencyRaw[] = [];
  let offset = 0;

  while (true) {
    const query = [
      `[SELECT * FROM ${HHA_DATASET_ID}]`,
      `[WHERE \`state\` = "${stateCode}"]`,
      `[LIMIT ${pageSize}]`,
      `[OFFSET ${offset}]`,
    ].join("");
    const url = `${CMS_API_BASE}?query=${encodeURIComponent(query)}&show_db_columns`;

    const res = await fetch(url, {
      next: { revalidate: CMS_REFRESH_DAYS * 86400 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`CMS PDC API error: ${res.status} ${res.statusText}`);

    const rows = (await res.json()) as CMSAgencyRaw[];
    all.push(...rows);

    if (rows.length < pageSize) break;
    offset += pageSize;
    if (offset >= 10000) break;
  }

  return all;
}

export function filterPittsburghAgencies(agencies: CMSAgencyRaw[]): CMSAgencyRaw[] {
  return agencies.filter((a) => {
    const zip5 = a.zip_code?.slice(0, 5) ?? "";
    const prefix = zip5.slice(0, 3);
    return PITTSBURGH_ZIP_PREFIXES.includes(prefix);
  });
}

export async function fetchNPIAgencies(city = "Pittsburgh", state = "PA", skip = 0): Promise<NPIRaw[]> {
  const params = new URLSearchParams({
    version: "2.1",
    enumeration_type: "NPI-2",
    taxonomy_description: "Home Health",
    city,
    state,
    limit: "200",
    skip: String(skip),
  });

  const res = await fetch(`${NPPES_API_BASE}?${params}`, {
    next: { revalidate: CMS_REFRESH_DAYS * 86400 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`NPPES API error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return (json.results ?? []) as NPIRaw[];
}

export async function fetchAllNPIAgencies(city = "Pittsburgh", state = "PA"): Promise<NPIRaw[]> {
  const all: NPIRaw[] = [];
  let skip = 0;
  const pageSize = 200;

  while (true) {
    const page = await fetchNPIAgencies(city, state, skip);
    all.push(...page);
    if (page.length < pageSize) break;
    skip += pageSize;
    if (skip >= 1000) break;
  }

  return all;
}

function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(inc|llc|lp|corp|ltd|co|the|of|at|for|and|an|a)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function zip5(raw: string): string {
  return (raw ?? "").replace(/\D/g, "").slice(0, 5);
}

function buildNPIIndex(npiRecords: NPIRaw[]): Map<string, NPIRaw> {
  const byNameZip = new Map<string, NPIRaw>();
  const byName = new Map<string, NPIRaw>();

  for (const rec of npiRecords) {
    const name = normalizeName(rec.basic.organization_name);
    const loc = rec.addresses.find((a) => a.address_purpose === "LOCATION") ?? rec.addresses[0];
    const zip = zip5(loc?.postal_code ?? "");

    byNameZip.set(`${name}|${zip}`, rec);
    if (!byName.has(name)) byName.set(name, rec);
  }

  return new Map([...Array.from(byNameZip.entries()), ...Array.from(byName.entries())]);
}

function formatPhone(raw: string): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === "1") return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return raw;
}

function titleCase(str: string): string {
  const acronyms = new Set(["LLC", "INC", "LP", "UPMC", "VNA", "AHN", "PA", "USA", "HHA", "CNA", "RN", "LPN", "MD", "DO"]);
  return str
    .toLowerCase()
    .replace(/\b\w+/g, (word) => {
      const up = word.toUpperCase();
      return acronyms.has(up) ? up : word.charAt(0).toUpperCase() + word.slice(1);
    });
}

function currentRefreshQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const q = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4;
  return `${year}-Q${q}`;
}

function mergeAgency(cms: CMSAgencyRaw, npi: NPIRaw | undefined): AgencyListing {
  const phone = formatPhone(
    npi?.addresses.find((a) => a.address_purpose === "LOCATION")?.telephone_number ?? cms.phone_number ?? ""
  );

  const isMedicaidCertified = npi?.identifiers.some((id) => id.code === "05") ?? false;
  const starRating = cms.quality_of_patient_care_star_rating?.trim() ? parseFloat(cms.quality_of_patient_care_star_rating) : null;
  const surveyRating = cms.patient_survey_star_rating?.trim() ? parseFloat(cms.patient_survey_star_rating) : null;

  return {
    id: cms.cms_certification_number,
    npi: npi?.number ?? null,
    name: titleCase(cms.provider_name),
    address: titleCase(cms.address),
    city: titleCase(cms.city),
    state: cms.state,
    zip: zip5(cms.zip_code),
    phone,
    type_of_ownership: cms.type_of_ownership,
    date_certified: cms.date_certified,
    is_medicare_certified: !!cms.cms_certification_number,
    is_medicaid_certified: isMedicaidCertified,
    offers_nursing: cms.offers_nursing_care_services === "Yes",
    offers_physical_therapy: cms.offers_physical_therapy_services === "Yes",
    offers_occupational_therapy: cms.offers_occupational_therapy_services === "Yes",
    offers_speech_pathology: cms.offers_speech_pathology_services === "Yes",
    offers_medical_social: cms.offers_medical_social_services === "Yes",
    offers_home_health_aide: cms.offers_home_health_aide_services === "Yes",
    cms_star_rating: starRating,
    patient_survey_star_rating: surveyRating,
    accepting_patients: true,
    accepting_updated_at: null,
    hha_pay_min: null,
    hha_pay_max: null,
    pay_updated_at: null,
    languages: [],
    data_source: "cms_pdcatalog",
    last_synced_at: new Date().toISOString(),
    cms_refresh_quarter: currentRefreshQuarter(),
  };
}

export async function buildAgencyListings(state = "PA", city = "Pittsburgh"): Promise<AgencyListing[]> {
  console.log("[AgencyPipeline] Fetching from CMS PDC...");
  const cmsAll = await fetchCMSAgencies(state);
  const cmsPgh = filterPittsburghAgencies(cmsAll);
  console.log(`[AgencyPipeline] CMS: ${cmsAll.length} PA agencies, ${cmsPgh.length} Pittsburgh-area`);

  console.log("[AgencyPipeline] Fetching from NPPES NPI Registry...");
  const npiAll = await fetchAllNPIAgencies(city, state);
  console.log(`[AgencyPipeline] NPPES: ${npiAll.length} NPI records`);

  const npiIndex = buildNPIIndex(npiAll);

  const listings = cmsPgh.map((cms) => {
    const cmsName = normalizeName(cms.provider_name);
    const cmsZip = zip5(cms.zip_code);
    const npiMatch = npiIndex.get(`${cmsName}|${cmsZip}`) ?? npiIndex.get(cmsName);
    return mergeAgency(cms, npiMatch);
  });

  listings.sort((a, b) => {
    const starA = a.cms_star_rating ?? 0;
    const starB = b.cms_star_rating ?? 0;
    if (starB !== starA) return starB - starA;
    return a.name.localeCompare(b.name);
  });

  console.log(`[AgencyPipeline] Built ${listings.length} enriched agency listings`);
  return listings;
}
