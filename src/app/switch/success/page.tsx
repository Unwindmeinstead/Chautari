import { redirect } from "next/navigation";
import Stripe from "stripe";
import { SwitchRequestSuccess } from "@/components/switch/switch-request-success";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia" as any,
});

interface Props {
    searchParams: Promise<{ session_id?: string }>;
}

export default async function SwitchSuccessPage({ searchParams }: Props) {
    const params = await searchParams;
    if (!params.session_id) redirect("/agencies");

    const session = await stripe.checkout.sessions.retrieve(params.session_id);
    if (session.payment_status !== "paid") redirect("/agencies");

    const supabase = await createClient();

    // Find the switch request created by the webhook
    // Webhook may be slightly behind — poll up to 5s
    let request = null;
    for (let i = 0; i < 5; i++) {
        const { data } = await supabase
            .from("switch_payments")
            .select("switch_request_id, switch_requests(id, new_agency_id, requested_start_date, agencies!switch_requests_new_agency_id_fkey(name))")
            .eq("stripe_checkout_session_id", params.session_id)
            .single();
        if (data?.switch_request_id) { request = data; break; }
        await new Promise(r => setTimeout(r, 1000));
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
        .single();

    const switchReq = (request as any)?.switch_requests;
    const agencyName = (switchReq as any)?.agencies?.name ?? session.metadata?.agency_name ?? "your new agency";
    const requestId = switchReq?.id ?? "pending";
    const startDate = switchReq?.requested_start_date;

    return (
        <SwitchRequestSuccess
            requestId={requestId}
            agencyName={agencyName}
            requestedStartDate={startDate}
            userName={profile?.full_name}
        />
    );
}
