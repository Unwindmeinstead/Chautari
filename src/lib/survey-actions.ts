"use server";

import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

/**
 * Create a survey record 30 days after switch completion.
 * Called by the daily cron job.
 */
export async function createPendingSurveys(): Promise<{
    created: number;
    errors: string[];
}> {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find completed switches that don't have surveys yet
    const { data: completedSwitches, error } = await supabase
        .from("switch_requests")
        .select("id, patient_id, current_agency_id, new_agency_id, completed_at")
        .eq("status", "completed")
        .lte("completed_at", thirtyDaysAgo.toISOString())
        .not("id", "in", `(SELECT switch_request_id FROM post_switch_surveys)`)
        .limit(50);

    if (error || !completedSwitches) {
        return { created: 0, errors: [error?.message ?? "No completed switches found"] };
    }

    let created = 0;
    const errors: string[] = [];

    for (const sw of completedSwitches) {
        const token = randomBytes(32).toString("hex");

        const { error: insertError } = await supabase
            .from("post_switch_surveys")
            .insert({
                switch_request_id: sw.id,
                patient_id: sw.patient_id,
                origin_agency_id: sw.current_agency_id,
                destination_agency_id: sw.new_agency_id,
                status: "sent",
                sent_at: new Date().toISOString(),
                token,
            } as any);

        if (insertError) {
            errors.push(`Switch ${sw.id}: ${insertError.message}`);
        } else {
            // Send notification to patient
            await supabase.from("notifications").insert({
                user_id: sw.patient_id,
                type: "survey_request",
                title: "How's your new agency?",
                body: "It's been 30 days since your switch. We'd love your feedback — it helps other patients.",
                reference_id: sw.id,
                reference_type: "switch_request",
            } as any);

            created++;
        }
    }

    return { created, errors };
}

/**
 * Get a survey by its public token (no auth required).
 */
export async function getSurveyByToken(token: string) {
    const supabase = await createClient();

    const { data } = await supabase
        .from("post_switch_surveys")
        .select(`
      id, status, token,
      destination_agency:agencies!post_switch_surveys_destination_agency_id_fkey (
        id, name
      )
    `)
        .eq("token", token)
        .in("status", ["sent", "pending"])
        .single() as any;

    return data;
}

/**
 * Submit survey responses via public token.
 */
export async function submitSurveyResponse(
    token: string,
    responses: {
        q1_better: boolean;
        q2_recommend: boolean;
        q3_comment?: string;
        q4_leave_reason?: string;
    }
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Get survey by token
    const { data: survey } = await supabase
        .from("post_switch_surveys")
        .select("id, status, patient_id, switch_request_id")
        .eq("token", token)
        .in("status", ["sent", "pending"])
        .single() as any;

    if (!survey) {
        return { success: false, error: "Survey not found or already completed." };
    }

    // Update survey
    const { error: updateError } = await supabase
        .from("post_switch_surveys")
        .update({
            q1_better: responses.q1_better,
            q2_recommend: responses.q2_recommend,
            q3_comment: responses.q3_comment?.slice(0, 1000) || null,
            q4_leave_reason: responses.q4_leave_reason || null,
            status: "completed",
            responded_at: new Date().toISOString(),
        } as any)
        .eq("id", survey.id);

    if (updateError) {
        console.error("Survey submission error:", updateError);
        return { success: false, error: "Failed to submit survey." };
    }

    // Notify patient
    await supabase.from("notifications").insert({
        user_id: survey.patient_id,
        type: "survey_completed",
        title: "Thanks for your feedback!",
        body: "Your survey helps other patients make better choices. Thank you.",
        reference_id: survey.switch_request_id,
        reference_type: "switch_request",
    } as any);

    return { success: true };
}

/**
 * Get aggregated survey stats for an agency.
 * Only shows data if 5+ responses exist (statistical significance).
 */
export async function getSurveyStats(agencyId: string) {
    const supabase = await createClient();

    const { data: surveys } = await supabase
        .from("post_switch_surveys")
        .select("q1_better, q2_recommend, q4_leave_reason")
        .eq("destination_agency_id", agencyId)
        .eq("status", "completed") as any;

    if (!surveys || surveys.length < 5) {
        return null; // Not enough data
    }

    const total = surveys.length;
    const better = surveys.filter((s: any) => s.q1_better).length;
    const recommend = surveys.filter((s: any) => s.q2_recommend).length;

    // Count leave reasons
    const reasonCounts: Record<string, number> = {};
    for (const s of surveys) {
        if (s.q4_leave_reason) {
            reasonCounts[s.q4_leave_reason] = (reasonCounts[s.q4_leave_reason] || 0) + 1;
        }
    }

    return {
        total,
        betterRate: Math.round((better / total) * 100),
        recommendRate: Math.round((recommend / total) * 100),
        topLeaveReasons: Object.entries(reasonCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([reason, count]) => ({ reason, count })),
    };
}
