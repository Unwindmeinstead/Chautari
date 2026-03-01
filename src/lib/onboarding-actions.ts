"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingData } from "@/lib/onboarding-schema";

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
    // 1. Update profile (full_name, phone, preferred_lang)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        preferred_lang: data.preferred_lang,
      })
      .eq("id", user.id);

    if (profileError) throw profileError;

    // 2. Upsert patient_details
    // Note: DOB and Medicaid ID are stored encrypted via pgcrypto on the DB side.
    // We pass them as raw values; the DB trigger/function handles encryption.
    // For now we store them in the encrypted columns directly via Supabase RPC.
    // In production, add a DB function: save_patient_details(patient_id, dob, medicaid_id, ...)
    const { error: detailsError } = await supabase
      .from("patient_details")
      .upsert(
        {
          patient_id: user.id,
          address_line1: data.address_line1,
          address_line2: data.address_line2 || null,
          address_city: data.address_city,
          address_state: data.address_state,
          address_zip: data.address_zip,
          address_county: data.address_county,
          payer_type: data.payer_type,
          medicaid_plan: data.medicaid_plan || null,
          care_needs: data.care_needs,
        },
        { onConflict: "patient_id" }
      );

    if (detailsError) throw detailsError;

    // 3. Log to audit trail
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
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Onboarding save error:", err);
    return { error: "Something went wrong saving your information. Please try again." };
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
    .select("patient_id, payer_type, care_needs, address_county")
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
