import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";


export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { agencyId, agencyName, switchData } = await req.json();
        if (!agencyId || !switchData) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

        // Store pending switch data in session metadata (Stripe limit: 500 chars per value)
        // We'll store the switch_request_id after creation in webhook
        const session = await getStripe().checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "usd",
                    unit_amount: 9700, // $97.00
                    product_data: {
                        name: "Chautari Switch Service",
                        description: `Agency switch coordination to ${agencyName}`,
                        images: [],
                    },
                },
                quantity: 1,
            }],
            metadata: {
                user_id: user.id,
                agency_id: agencyId,
                agency_name: agencyName,
                // Store switch form data as JSON string
                switch_data: JSON.stringify(switchData),
            },
            customer_email: user.email ?? undefined,
            success_url: `${appUrl}/switch/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/switch/new?agency=${agencyId}&cancelled=true`,
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (err) {
        console.error("Checkout error:", err);
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
}
