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

  // If already completed onboarding, go to dashboard
  const { data: details } = await supabase
    .from("patient_details")
    .select("patient_id, payer_type")
    .eq("patient_id", user.id)
    .single();

  if (details?.payer_type) {
    redirect("/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return <OnboardingWizard userName={profile?.full_name} />;
}
