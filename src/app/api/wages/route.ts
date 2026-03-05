import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            agency_name,
            role,
            employment_type,
            actual_hourly_rate,
            benefits,
            management_score,
            comment_text,
            time_on_page_seconds,
        } = body;

        // Anti-bot: reject if time on page < 10 seconds
        if (typeof time_on_page_seconds === "number" && time_on_page_seconds < 10) {
            return NextResponse.json({ error: "Submission too fast" }, { status: 429 });
        }

        // Validate rate
        if (!actual_hourly_rate || actual_hourly_rate < 7.25 || actual_hourly_rate > 75) {
            return NextResponse.json({ error: "Invalid hourly rate" }, { status: 400 });
        }

        // Look up agency by name (fuzzy-ish — try exact first, then ilike)
        const supabase = await createClient();
        let agency = null;

        const { data: exactMatch } = await supabase
            .from("agencies")
            .select("id")
            .ilike("name", agency_name.trim())
            .limit(1)
            .single();

        if (exactMatch) {
            agency = exactMatch;
        } else {
            const { data: fuzzyMatch } = await supabase
                .from("agencies")
                .select("id")
                .ilike("name", `%${agency_name.trim()}%`)
                .limit(1)
                .single();
            agency = fuzzyMatch;
        }

        if (!agency) {
            // Still accept — store with agency_id null and let admin match it
            // For now return friendly error asking them to be more specific
            return NextResponse.json(
                { error: `Could not find an agency named "${agency_name}" in our directory. Try using the full official agency name.` },
                { status: 422 }
            );
        }

        // Build submitter hash: sha256(ua + forwarded-for + date) — no raw IP stored
        const ua = req.headers.get("user-agent") ?? "unknown";
        const forwarded = req.headers.get("x-forwarded-for") ?? "0.0.0.0";
        const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const submitterHash = createHash("sha256")
            .update(`${ua}|${forwarded}|${dateStr}`)
            .digest("hex");

        const benefitsJson: Record<string, boolean> = {};
        if (Array.isArray(benefits)) {
            benefits.forEach((b: string) => { benefitsJson[b] = true; });
        }

        const { error: insertError } = await supabase.from("caregiver_submissions").insert({
            agency_id: agency.id,
            role,
            employment_type: employment_type ?? null,
            actual_hourly_rate,
            benefits_json: benefitsJson,
            management_score: management_score ?? null,
            comment_text: comment_text?.trim() || null,
            submitter_hash: submitterHash,
            time_on_page_seconds,
            moderation_status: "pending",
        });

        if (insertError) {
            // Unique index violation = rate limit hit
            if (insertError.code === "23505") {
                return NextResponse.json(
                    { error: "You've already submitted for this agency recently. Thank you!" },
                    { status: 429 }
                );
            }
            throw insertError;
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Wage submission error:", err);
        return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 });
    }
}
