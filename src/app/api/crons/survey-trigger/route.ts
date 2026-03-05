import { NextResponse } from "next/server";
import { createPendingSurveys } from "@/lib/survey-actions";

/**
 * Daily cron: find completed switches at 30 days → create surveys.
 * 
 * Trigger via:
 *   - Vercel Cron Jobs (vercel.json)
 *   - Or manually: GET /api/crons/survey-trigger?secret=<CRON_SECRET>
 */
export async function GET(req: Request) {
    // Simple auth for cron
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    // Allow if secret matches or if called from Vercel's internal cron
    const authHeader = req.headers.get("authorization");
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;

    if (cronSecret && !isVercelCron && secret !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await createPendingSurveys();
        return NextResponse.json({
            success: true,
            surveysCreated: result.created,
            errors: result.errors.length > 0 ? result.errors : undefined,
        });
    } catch (err) {
        console.error("Survey cron error:", err);
        return NextResponse.json(
            { error: "Cron job failed" },
            { status: 500 }
        );
    }
}
