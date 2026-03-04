"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { createHash } from "crypto";

interface WageSubmissionData {
    agencyId: string;
    role: string;
    employmentType: string;
    actualHourlyRate: number;
    yearsAtAgency?: number;
    benefits: Record<string, boolean>;
    managementScore: number;
    trainingScore?: number;
    schedulingScore?: number;
    commentText?: string;
    timeOnPageSeconds: number;
}

function generateSubmitterHash(): string {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)); // Week number
    return createHash("sha256")
        .update(`${ip}:${userAgent}:${weekNum}`)
        .digest("hex");
}

export async function submitWage(
    data: WageSubmissionData
): Promise<{ success: boolean; error?: string }> {
    // Anti-bot: time on page must be at least 15 seconds
    if (data.timeOnPageSeconds < 15) {
        // Silently reject bots — don't reveal detection
        return { success: true };
    }

    // Validate hourly rate
    if (data.actualHourlyRate < 7.25 || data.actualHourlyRate > 75) {
        return { success: false, error: "Hourly rate must be between $7.25 and $75.00." };
    }

    // Validate management score
    if (data.managementScore < 1 || data.managementScore > 5) {
        return { success: false, error: "Management score must be between 1 and 5." };
    }

    const submitterHash = generateSubmitterHash();
    const supabase = await createClient();

    // Check if agency exists
    const { data: agency } = await supabase
        .from("agencies")
        .select("id, name")
        .eq("id", data.agencyId)
        .eq("is_active", true)
        .single();

    if (!agency) {
        return { success: false, error: "Agency not found." };
    }

    try {
        const { error: insertError } = await supabase
            .from("caregiver_submissions")
            .insert({
                agency_id: data.agencyId,
                role: data.role,
                employment_type: data.employmentType || null,
                actual_hourly_rate: data.actualHourlyRate,
                years_at_agency: data.yearsAtAgency || null,
                benefits_json: data.benefits,
                management_score: data.managementScore,
                training_score: data.trainingScore || null,
                scheduling_score: data.schedulingScore || null,
                comment_text: data.commentText?.slice(0, 500) || null,
                submitter_hash: submitterHash,
                time_on_page_seconds: data.timeOnPageSeconds,
                moderation_status: "pending",
            } as any);

        if (insertError) {
            // Rate limit violation
            if (insertError.code === "23505") {
                return {
                    success: false,
                    error:
                        "You've already submitted for this agency recently. Please wait a week before submitting again.",
                };
            }
            console.error("Wage submission error:", insertError);
            return { success: false, error: "Failed to submit. Please try again." };
        }

        return { success: true };
    } catch (err) {
        console.error("Wage submission error:", err);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

/**
 * Get aggregated wage data for an agency (only if 3+ verified submissions).
 */
export async function getWageAggregates(agencyId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("agency_wage_summary" as any)
        .select("*")
        .eq("agency_id", agencyId);

    return data ?? [];
}

/**
 * Search agencies by name for the autocomplete.
 */
export async function searchAgenciesForAutocomplete(
    query: string
): Promise<{ id: string; name: string }[]> {
    if (!query || query.length < 2) return [];

    const supabase = await createClient();
    const { data } = await supabase
        .from("agencies")
        .select("id, name")
        .eq("is_active", true)
        .ilike("name", `%${query}%`)
        .limit(8);

    return (data as { id: string; name: string }[]) ?? [];
}
