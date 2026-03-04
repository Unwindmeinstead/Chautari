"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingData } from "@/lib/onboarding-schema";

function toPatientDetailsPayload(userId: string, data: Partial<OnboardingData>) {
  return {
    patient_id: userId,
    address_line1: data.address_line1,
    address_line2: data.address_line2 || null,
    address_city: data.address_city,
    address_state: data.address_state,
    address_zip: data.address_zip,
    address_county: data.address_county,
    payer_type: data.payer_type,
    medicaid_plan: data.medicaid_plan || null,
    care_type: data.care_type,
    services_needed: data.care_needs,
  };
}

export async function saveOnboardingData(data: OnboardingData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be signed in to complete onboarding." };
  }

  try {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        preferred_lang: data.preferred_lang,
      })
      .eq("id", user.id);

    if (profileError) throw profileError;

    const { error: detailsError } = await supabase
      .from("patient_details")
      .upsert(toPatientDetailsPayload(user.id, data) as any, { onConflict: "patient_id" });

    if (detailsError) throw detailsError;

    // Best-effort audit log; onboarding should not fail if audit insert is blocked by policy.
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_role: "patient",
      action: "onboarding_completed",
      resource: "patient_details",
      resource_id: user.id,
      new_data: {
        payer_type: data.payer_type,
        care_type: data.care_type,
        county: data.address_county,
      },
    } as any);

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("Onboarding save error:", err);
    return { error: "Something went wrong saving your information. Please try again." };
  }
}

export async function saveOnboardingDraft(data: Partial<OnboardingData>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  try {
    const profileUpdate: Record<string, any> = {};
    if (typeof data.full_name === "string" && data.full_name.trim()) profileUpdate.full_name = data.full_name;
    if (typeof data.phone === "string") profileUpdate.phone = data.phone || null;
    if (typeof data.preferred_lang === "string") profileUpdate.preferred_lang = data.preferred_lang;

    if (Object.keys(profileUpdate).length > 0) {
      await supabase.from("profiles").update(profileUpdate).eq("id", user.id);
    }

    await supabase
      .from("patient_details")
      .upsert(toPatientDetailsPayload(user.id, data) as any, { onConflict: "patient_id" });

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    return { success: true };
  } catch (err) {
    console.error("Save onboarding draft error:", err);
    return { error: "Could not save draft right now." };
  }
}

export async function getOnboardingStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: details } = await supabase
    .from("patient_details")
    .select("patient_id, payer_type, care_type, services_needed, address_county")
    .eq("patient_id", user.id)
    .single();

  return {
    completed: !!details?.payer_type,
    details,
  };
}

export async function skipOnboarding() {
  redirect("/dashboard");
}
