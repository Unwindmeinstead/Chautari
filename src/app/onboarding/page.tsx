import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { loadOnboardingDraft } from "@/lib/onboarding-actions";

export const metadata = { title: "Setup Your Profile" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // If fully complete, go to dashboard
  const { data: details } = await supabase
    .from("patient_details")
    .select("patient_id, payer_type, care_needs")
    .eq("patient_id", user.id)
    .single();

  if (details?.payer_type && details?.care_needs?.length) {
    redirect("/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Load any partial draft to resume from
  const draft = await loadOnboardingDraft();

  return (
    <OnboardingWizard
      userName={profile?.full_name}
      initialStep={draft?.resumeStep ?? 0}
      initialData={draft?.savedData}
    />
  );
}
