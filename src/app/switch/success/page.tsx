import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SwitchRequestSuccess } from "@/components/switch/switch-request-success";

interface Props {
    searchParams: Promise<{ request_id?: string }>;
}

export default async function SwitchSuccessPage({ searchParams }: Props) {
    const params = await searchParams;
    if (!params.request_id) redirect("/agencies");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // Load the switch request and agency name
    const { data: request } = await supabase
        .from("switch_requests")
        .select(`
      id,
      requested_start_date,
      new_agency:agencies!switch_requests_new_agency_id_fkey (name)
    `)
        .eq("id", params.request_id)
        .eq("patient_id", user.id)
        .single();

    if (!request) redirect("/dashboard");

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    const agencyName = (request.new_agency as any)?.name ?? "your new agency";

    return (
        <SwitchRequestSuccess
            requestId={request.id}
            agencyName={agencyName}
            requestedStartDate={request.requested_start_date ?? undefined}
            userName={profile?.full_name}
        />
    );
}
