import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildAgencyListings, CMS_REFRESH_DAYS } from "@/lib/agencies/fetch";
import type { AgenciesAPIResponse, AgenciesQueryParams } from "@/lib/agencies/types";

function isFresh(lastSyncedAt: string | null): boolean {
  if (!lastSyncedAt) return false;
  const syncedMs = new Date(lastSyncedAt).getTime();
  const ageMs = Date.now() - syncedMs;
  const ttlMs = CMS_REFRESH_DAYS * 24 * 60 * 60 * 1000;
  return ageMs < ttlMs;
}

let refreshInProgress = false;

async function refreshCache() {
  if (refreshInProgress) return;
  refreshInProgress = true;

  try {
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    console.log("[AgenciesAPI] Background cache refresh started");
    const listings = await buildAgencyListings("PA", "Pittsburgh");
    const { error } = await service.from("agencies").upsert(listings, { onConflict: "id" });

    if (error) console.error("[AgenciesAPI] Supabase upsert error:", error.message);
    else console.log(`[AgenciesAPI] Upserted ${listings.length} agencies into Supabase`);
  } catch (err) {
    console.error("[AgenciesAPI] Refresh failed:", err);
  } finally {
    refreshInProgress = false;
  }
}

function parseParams(req: NextRequest): AgenciesQueryParams {
  const p = req.nextUrl.searchParams;
  return {
    zip: p.get("zip") ?? undefined,
    city: p.get("city") ?? undefined,
    min_stars: p.has("min_stars") ? parseFloat(p.get("min_stars")!) : undefined,
    accepting: p.has("accepting") ? p.get("accepting") === "true" : undefined,
    service: p.get("service") ?? undefined,
    language: p.get("language") ?? undefined,
    payer: p.get("payer") ?? undefined,
    sort: (p.get("sort") as AgenciesQueryParams["sort"]) ?? "stars",
    limit: p.has("limit") ? Math.min(parseInt(p.get("limit")!, 10), 100) : 20,
    offset: p.has("offset") ? parseInt(p.get("offset")!, 10) : 0,
  };
}

function applyFilters(query: any, params: AgenciesQueryParams) {
  if (params.zip) query = query.like("zip", `${params.zip}%`);
  if (params.city) query = query.ilike("city", `%${params.city}%`);
  if (params.min_stars !== undefined) query = query.gte("cms_star_rating", params.min_stars);
  if (params.accepting === true) query = query.eq("accepting_patients", true);

  if (params.service) {
    const serviceMap: Record<string, string> = {
      nursing: "offers_nursing",
      physical_therapy: "offers_physical_therapy",
      occupational_therapy: "offers_occupational_therapy",
      speech_pathology: "offers_speech_pathology",
      medical_social: "offers_medical_social",
      home_health_aide: "offers_home_health_aide",
    };
    const col = serviceMap[params.service.toLowerCase()];
    if (col) query = query.eq(col, true);
  }

  if (params.language) query = query.contains("languages", [params.language]);

  if (params.payer === "Medicare") query = query.eq("is_medicare_certified", true);
  else if (params.payer === "Medicaid") query = query.eq("is_medicaid_certified", true);

  return query;
}

export async function GET(req: NextRequest) {
  const params = parseParams(req);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: meta } = await supabase
    .from("agencies")
    .select("last_synced_at")
    .order("last_synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let cachedAt = meta?.last_synced_at ?? null;
  if (!isFresh(cachedAt)) {
    console.log("[AgenciesAPI] Cache stale or empty — fetching live data");
    await refreshCache();
    cachedAt = new Date().toISOString();
  }

  let dbQuery = supabase.from("agencies").select("*", { count: "exact" });
  dbQuery = applyFilters(dbQuery, params);

  if (params.sort === "stars") dbQuery = dbQuery.order("cms_star_rating", { ascending: false, nullsFirst: false });
  else if (params.sort === "name") dbQuery = dbQuery.order("name", { ascending: true });
  else if (params.sort === "pay_rate") dbQuery = dbQuery.order("hha_pay_max", { ascending: false, nullsFirst: false });

  dbQuery = dbQuery.range(params.offset!, params.offset! + params.limit! - 1);

  const { data: agencies, count, error } = await dbQuery;
  if (error) {
    return NextResponse.json({ error: "Database query failed", detail: error.message }, { status: 500 });
  }

  const response: AgenciesAPIResponse = {
    agencies: agencies ?? [],
    total: count ?? 0,
    source: "supabase_cache:cms_pdcatalog+nppes",
    cached_at: cachedAt,
    cms_refresh_quarter: agencies?.[0]?.cms_refresh_quarter ?? "",
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
