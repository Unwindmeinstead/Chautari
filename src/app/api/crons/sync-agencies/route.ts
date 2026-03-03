import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildAgencyListings } from "@/lib/agencies/fetch";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  console.log("[CronSync] Starting quarterly agency sync...");

  try {
    const listings = await buildAgencyListings("PA", "Pittsburgh");

    const { error } = await supabaseAdmin.from("agencies").upsert(listings, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

    if (error) throw error;

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[CronSync] Done: ${listings.length} agencies synced in ${elapsed}s`);

    return NextResponse.json({
      success: true,
      agencies_synced: listings.length,
      elapsed_seconds: parseFloat(elapsed),
      synced_at: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[CronSync] Failed:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
