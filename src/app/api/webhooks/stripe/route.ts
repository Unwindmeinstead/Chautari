import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Use service role client for webhook operations (no user context)
function getServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        // Fallback to anon key if service role not available (dev mode)
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
        return createClient(url, anonKey);
    }
    return createClient(url, serviceKey);
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event;
    try {
        event = constructWebhookEvent(body, signature);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json(
            { error: "Invalid webhook signature" },
            { status: 400 }
        );
    }

    const supabase = getServiceClient();

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as any;
                const switchRequestId = session.metadata?.switch_request_id;
                const patientId = session.metadata?.patient_id;
                const paymentIntentId =
                    typeof session.payment_intent === "string"
                        ? session.payment_intent
                        : session.payment_intent?.id;

                if (!switchRequestId) {
                    console.error("No switch_request_id in session metadata");
                    break;
                }

                // Update payment record
                await supabase
                    .from("switch_payments")
                    .update({
                        stripe_payment_intent_id: paymentIntentId,
                        status: "succeeded",
                        paid_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq("switch_request_id", switchRequestId);

                // Move switch request from pending_payment → submitted
                await supabase
                    .from("switch_requests")
                    .update({
                        status: "submitted",
                        submitted_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", switchRequestId)
                    .eq("status", "pending_payment");

                // Notify patient
                if (patientId) {
                    await supabase.from("notifications").insert({
                        user_id: patientId,
                        type: "payment_confirmed",
                        title: "Payment confirmed — $97",
                        body: "Your switch request has been submitted and is being reviewed. We'll notify you when the agency responds.",
                        reference_id: switchRequestId,
                        reference_type: "switch_request",
                    });
                }

                // Audit log
                await supabase.from("audit_logs").insert({
                    actor_id: patientId,
                    actor_role: "patient",
                    action: "switch_payment_completed",
                    resource: "switch_payments",
                    resource_id: switchRequestId,
                    new_data: {
                        amount_cents: 9700,
                        stripe_payment_intent_id: paymentIntentId,
                    },
                });

                console.log(
                    `✅ Payment confirmed for switch ${switchRequestId}`
                );
                break;
            }

            case "charge.refunded": {
                const charge = event.data.object as any;
                const paymentIntentId = charge.payment_intent;

                if (paymentIntentId) {
                    // Update payment record
                    await supabase
                        .from("switch_payments")
                        .update({
                            status: "refunded",
                            refunded_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .eq("stripe_payment_intent_id", paymentIntentId);

                    console.log(
                        `💰 Refund processed for payment_intent ${paymentIntentId}`
                    );
                }
                break;
            }

            case "checkout.session.expired": {
                const session = event.data.object as any;
                const switchRequestId = session.metadata?.switch_request_id;

                if (switchRequestId) {
                    // Mark payment as cancelled
                    await supabase
                        .from("switch_payments")
                        .update({
                            status: "cancelled",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("switch_request_id", switchRequestId)
                        .eq("status", "pending");

                    console.log(
                        `⏰ Checkout expired for switch ${switchRequestId}`
                    );
                }
                break;
            }

            default:
                console.log(`Unhandled webhook event: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("Webhook processing error:", err);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
