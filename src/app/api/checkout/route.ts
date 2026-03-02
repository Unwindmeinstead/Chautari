import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "You must be signed in to make a payment." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { switchRequestId } = body;

        if (!switchRequestId) {
            return NextResponse.json(
                { error: "switchRequestId is required." },
                { status: 400 }
            );
        }

        // Verify the switch request belongs to this user and is in pending_payment status
        const { data: switchReq, error: switchError } = await supabase
            .from("switch_requests")
            .select("id, status, new_agency_id")
            .eq("id", switchRequestId)
            .eq("patient_id", user.id)
            .single();

        if (switchError || !switchReq) {
            return NextResponse.json(
                { error: "Switch request not found or unauthorized." },
                { status: 404 }
            );
        }

        if (switchReq.status !== "pending_payment") {
            return NextResponse.json(
                { error: `Switch request is in '${switchReq.status}' status. Payment not applicable.` },
                { status: 400 }
            );
        }

        // Get agency name for the checkout description
        const { data: agency } = await supabase
            .from("agencies")
            .select("name")
            .eq("id", switchReq.new_agency_id)
            .single();

        // Create checkout session
        const session = await createCheckoutSession({
            switchRequestId,
            patientId: user.id,
            patientEmail: user.email ?? "",
            agencyName: agency?.name ?? "Selected Agency",
        });

        // Record the pending payment
        await supabase.from("switch_payments").upsert({
            switch_request_id: switchRequestId,
            patient_id: user.id,
            stripe_checkout_session_id: session.id,
            amount_cents: 9700,
            status: "pending",
        }, {
            onConflict: "switch_request_id",
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("Checkout error:", err);
        return NextResponse.json(
            { error: "Failed to create checkout session." },
            { status: 500 }
        );
    }
}
