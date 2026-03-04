import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Setup Your Profile",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: details } = await supabase
    .from("patient_details")
    .select("patient_id, payer_type, address_line1, address_line2, address_city, address_state, address_zip, address_county, medicaid_plan, care_type, services_needed")
    .eq("patient_id", user.id)
    .single();

  if (details?.payer_type) {
    redirect("/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, preferred_lang")
    .eq("id", user.id)
    .single();

  const initialData = {
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    preferred_lang: (profile?.preferred_lang as "en" | "ne" | "hi" | undefined) ?? "en",
    address_line1: details?.address_line1 ?? "",
    address_line2: details?.address_line2 ?? "",
    address_city: details?.address_city ?? "",
    address_state: details?.address_state ?? "PA",
    address_zip: details?.address_zip ?? "",
    address_county: details?.address_county ?? "",
    payer_type: details?.payer_type ?? undefined,
    medicaid_plan: details?.medicaid_plan ?? "",
    care_type: details?.care_type ?? undefined,
    care_needs: details?.services_needed ?? [],
  };

  return <OnboardingWizard userName={profile?.full_name} initialData={initialData} />;
}
