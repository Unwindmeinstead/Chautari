import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";


function getServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        console.error("Webhook signature failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "paid") return NextResponse.json({ ok: true });

        const { user_id, agency_id, switch_data } = session.metadata ?? {};
        if (!user_id || !agency_id || !switch_data) {
            console.error("Missing metadata in session", session.id);
            return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
        }

        const supabase = getServiceClient();
        const data = JSON.parse(switch_data);

        try {
            // 1. Create the switch request
            const { data: request, error: reqErr } = await supabase
                .from("switch_requests")
                .insert({
                    patient_id: user_id,
                    new_agency_id: agency_id,
                    current_agency_name: data.current_agency_name || null,
                    switch_reason: data.switch_reason,
                    care_type: data.care_type,
                    services_requested: data.services_requested,
                    requested_start_date: data.requested_start_date,
                    special_instructions: data.special_instructions || null,
                    status: "submitted",
                    submitted_at: new Date().toISOString(),
                })
                .select("id")
                .single();

            if (reqErr) throw reqErr;
            const requestId = request.id;

            // 2. Record payment
            await supabase.from("switch_payments").insert({
                switch_request_id: requestId,
                patient_id: user_id,
                stripe_payment_intent_id: session.payment_intent as string,
                stripe_checkout_session_id: session.id,
                amount_cents: 9700,
                status: "succeeded",
                paid_at: new Date().toISOString(),
            });

            // 3. Save e-signature if present
            if (data.signature_name) {
                await supabase.from("e_signatures").insert({
                    request_id: requestId,
                    signer_id: user_id,
                    signer_role: "patient",
                    full_name: data.signature_name,
                    signed_at: new Date().toISOString(),
                    signature_method: data.signature_method ?? "typed",
                    signature_data: data.signature_data || null,
                    consent_hipaa: data.consent_hipaa ?? true,
                    consent_current_agency_notification: data.consent_current_agency_notification ?? true,
                    consent_terms: data.consent_terms ?? true,
                });
            }

            // 4. Schedule post-switch survey (set sent_at to null — cron handles delivery at day 30)
            await supabase.from("post_switch_surveys").insert({
                switch_request_id: requestId,
                patient_id: user_id,
                destination_agency_id: agency_id,
                origin_agency_id: data.current_agency_id || null,
                token: crypto.randomUUID(),
            });

            // 5. Notification
            await supabase.from("notifications").insert({
                user_id,
                type: "request_submitted",
                title: "Switch request submitted — payment received",
                body: "Your $97 coordination fee was received. Your switch request is now active.",
                reference_id: requestId,
                reference_type: "switch_request",
            });

            // 6. Audit log
            await supabase.from("audit_logs").insert({
                actor_id: user_id,
                actor_role: "patient",
                action: "switch_request_paid_and_submitted",
                resource: "switch_requests",
                resource_id: requestId,
                new_data: { stripe_session_id: session.id, amount_cents: 9700 },
            });

            console.log("Switch request created after payment:", requestId);
        } catch (err) {
            console.error("Post-payment processing error:", err);
            return NextResponse.json({ error: "Processing failed" }, { status: 500 });
        }
    }

    return NextResponse.json({ ok: true });
}
