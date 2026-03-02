"use server";

import { createClient } from "@/lib/supabase/server";
import { getCheckoutSession } from "@/lib/stripe";

/**
 * Verify payment was successful for a switch request.
 * Called from the success page after Stripe redirect.
 */
export async function confirmSwitchPayment(
    sessionId: string
): Promise<{
    success: boolean;
    switchRequestId?: string;
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify the checkout session with Stripe
        const session = await getCheckoutSession(sessionId);

        if (session.payment_status !== "paid") {
            return {
                success: false,
                error: "Payment has not been confirmed yet. Please wait a moment and refresh.",
            };
        }

        const switchRequestId = session.metadata?.switch_request_id;
        if (!switchRequestId) {
            return { success: false, error: "Invalid session data." };
        }

        // Verify this payment belongs to the current user
        const { data: payment } = await supabase
            .from("switch_payments")
            .select("status, patient_id")
            .eq("switch_request_id", switchRequestId)
            .single();

        if (!payment || payment.patient_id !== user.id) {
            return { success: false, error: "Payment not found or unauthorized." };
        }

        return { success: true, switchRequestId };
    } catch (err) {
        console.error("Payment confirmation error:", err);
        return { success: false, error: "Failed to verify payment." };
    }
}

/**
 * Get payment info for a switch request.
 */
export async function getSwitchPayment(switchRequestId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from("switch_payments")
        .select("*")
        .eq("switch_request_id", switchRequestId)
        .eq("patient_id", user.id)
        .single();

    return data;
}
