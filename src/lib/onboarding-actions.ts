"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingData } from "@/lib/onboarding-schema";

export async function saveOnboardingData(data: OnboardingData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in to complete onboarding." };
  }

  try {
    // 1. Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        preferred_lang: data.preferred_lang,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("[onboarding] profile update failed:", profileError);
      return { error: `Profile update failed: ${profileError.message}` };
    }

    // 2. Upsert patient_details — try update first, then insert
    const detailsPayload = {
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
    };

    // Check if a row already exists
    const { data: existing } = await supabase
      .from("patient_details")
      .select("patient_id")
      .eq("patient_id", user.id)
      .maybeSingle();

    let detailsError;
    if (existing) {
      const { error } = await supabase
        .from("patient_details")
        .update(detailsPayload)
        .eq("patient_id", user.id);
      detailsError = error;
    } else {
      const { error } = await supabase
        .from("patient_details")
        .insert(detailsPayload);
      detailsError = error;
    }

    if (detailsError) {
      console.error("[onboarding] patient_details save failed:", detailsError);
      return { error: `Details save failed: ${detailsError.message}` };
    }

    // 3. Audit log (non-blocking)
    supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_role: "patient",
      action: "onboarding_completed",
      resource: "patient_details",
      resource_id: user.id,
      new_data: { payer_type: data.payer_type, care_type: (data as any).care_type, county: data.address_county },
    }).then(({ error }) => {
      if (error) console.warn("[onboarding] audit log failed (non-fatal):", error.message);
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[onboarding] unexpected error:", err);
    return { error: err?.message ?? "Something went wrong saving your information. Please try again." };
  }
}

// Partial save for "Save & exit"
export async function saveOnboardingDraft(data: Partial<OnboardingData>) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not signed in" };

  try {
    // Save profile fields if present
    if (data.full_name || data.phone !== undefined || data.preferred_lang) {
      const { error } = await supabase.from("profiles").update({
        ...(data.full_name && { full_name: data.full_name }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.preferred_lang && { preferred_lang: data.preferred_lang }),
      }).eq("id", user.id);
      if (error) console.error("[draft] profile update failed:", error.message);
    }

    // Save patient details if any address/insurance/care data exists
    const hasDetails = data.address_line1 || data.address_city || data.address_county || data.payer_type || data.care_needs?.length;
    if (hasDetails) {
      const payload = {
        patient_id: user.id,
        ...(data.address_line1 !== undefined && { address_line1: data.address_line1 }),
        ...(data.address_line2 !== undefined && { address_line2: data.address_line2 || null }),
        ...(data.address_city !== undefined && { address_city: data.address_city }),
        ...(data.address_state !== undefined && { address_state: data.address_state }),
        ...(data.address_zip !== undefined && { address_zip: data.address_zip }),
        ...(data.address_county !== undefined && { address_county: data.address_county }),
        ...(data.payer_type !== undefined && { payer_type: data.payer_type }),
        ...(data.medicaid_plan !== undefined && { medicaid_plan: data.medicaid_plan || null }),
        ...(data.care_needs !== undefined && { care_needs: data.care_needs }),
      };

      const { data: existing } = await supabase
        .from("patient_details")
        .select("patient_id")
        .eq("patient_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("patient_details").update(payload).eq("patient_id", user.id);
        if (error) console.error("[draft] patient_details update failed:", error.message);
      } else {
        const { error } = await supabase.from("patient_details").insert(payload);
        if (error) console.error("[draft] patient_details insert failed:", error.message);
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[draft] unexpected error:", err);
    return { error: err?.message ?? "Draft save failed" };
  }
}

// Load saved onboarding data for resuming the wizard
export async function loadOnboardingDraft() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, detailsRes] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, preferred_lang").eq("id", user.id).single(),
    supabase.from("patient_details")
      .select("address_line1, address_line2, address_city, address_state, address_zip, address_county, payer_type, medicaid_plan, care_needs")
      .eq("patient_id", user.id)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const details = detailsRes.data;

  // Determine how far they got based on what's saved
  let resumeStep = 0;
  if (profile?.full_name) resumeStep = 1;
  if (details?.address_city) resumeStep = 2;
  if (details?.payer_type) resumeStep = 3;
  if (details?.care_needs?.length) resumeStep = 4;

  return {
    resumeStep,
    savedData: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      preferred_lang: (profile?.preferred_lang ?? "en") as "en" | "ne" | "hi",
      address_line1: details?.address_line1 ?? "",
      address_line2: details?.address_line2 ?? "",
      address_city: details?.address_city ?? "",
      address_state: "PA" as const,
      address_zip: details?.address_zip ?? "",
      address_county: details?.address_county ?? "",
      payer_type: details?.payer_type as any ?? undefined,
      medicaid_plan: details?.medicaid_plan ?? "",
      care_needs: details?.care_needs ?? [],
    },
  };
}

export async function getOnboardingStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { complete: false };

  const { data: details } = await supabase
    .from("patient_details")
    .select("payer_type, address_county, care_needs")
    .eq("patient_id", user.id)
    .single();

  const complete = !!(details?.payer_type && details?.address_county && details?.care_needs?.length);
  return { complete, details };
}
