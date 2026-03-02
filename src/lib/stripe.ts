import Stripe from "stripe";

// Stripe singleton — server-side only
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
    if (!stripeInstance) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error(
                "STRIPE_SECRET_KEY is not set. Add it to .env.local to enable payments."
            );
        }
        stripeInstance = new Stripe(key, {
            apiVersion: "2024-12-18.acacia" as any,
            typescript: true,
        });
    }
    return stripeInstance;
}

/**
 * Create a Stripe Checkout Session for a $97 switch fee.
 */
export async function createCheckoutSession({
    switchRequestId,
    patientId,
    patientEmail,
    agencyName,
}: {
    switchRequestId: string;
    patientId: string;
    patientEmail: string;
    agencyName: string;
}) {
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: patientEmail,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Chautari Switch Service",
                        description: `Agency switch to ${agencyName} — includes transfer coordination, NOTAM filing, and care plan handoff.`,
                    },
                    unit_amount: 9700, // $97.00
                },
                quantity: 1,
            },
        ],
        metadata: {
            switch_request_id: switchRequestId,
            patient_id: patientId,
        },
        success_url: `${appUrl}/switch/${switchRequestId}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/switch/${switchRequestId}?cancelled=true`,
        payment_intent_data: {
            metadata: {
                switch_request_id: switchRequestId,
                patient_id: patientId,
            },
        },
    });

    return session;
}

/**
 * Process a refund for a switch payment.
 */
export async function processRefund(
    paymentIntentId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const stripe = getStripe();
        await stripe.refunds.create({
            payment_intent: paymentIntentId,
            reason: "requested_by_customer",
            metadata: { refund_reason: reason },
        });
        return { success: true };
    } catch (err) {
        console.error("Stripe refund error:", err);
        return { success: false, error: String(err) };
    }
}

/**
 * Retrieve a Checkout Session to verify payment status.
 */
export async function getCheckoutSession(sessionId: string) {
    const stripe = getStripe();
    return stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"],
    });
}

/**
 * Construct and verify a webhook event from Stripe.
 */
export function constructWebhookEvent(
    body: string,
    signature: string
): Stripe.Event {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not set.");
    }
    return stripe.webhooks.constructEvent(body, signature, secret);
}
