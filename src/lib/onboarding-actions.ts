"use server";

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
      console.error("Onboarding profile error:", profileError);
      throw new Error(`Profile update failed: ${profileError.message}`);
    }

    // 2. Upsert patient_details
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

    if (detailsError) {
      console.error("Onboarding patient_details error:", detailsError);
      throw new Error(`Details save failed: ${detailsError.message}`);
    }

    // 3. Audit log (non-blocking)
    supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_role: "patient",
      action: "onboarding_completed",
      resource: "patient_details",
      resource_id: user.id,
      new_data: { payer_type: data.payer_type, care_type: data.care_type, county: data.address_county },
    }).then(({ error }) => {
      if (error) console.warn("Audit log failed (non-fatal):", error.message);
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Onboarding save error:", err);
    const message =
      process.env.NODE_ENV === "development"
        ? err?.message ?? "Unknown error"
        : "Something went wrong saving your information. Please try again.";
    return { error: message };
  }
}

// Partial save for "Save & exit" — only saves what's been filled so far
export async function saveOnboardingDraft(data: Partial<OnboardingData>) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not signed in" };

  try {
    if (data.full_name || data.phone || data.preferred_lang) {
      await supabase.from("profiles").update({
        ...(data.full_name && { full_name: data.full_name }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.preferred_lang && { preferred_lang: data.preferred_lang }),
      }).eq("id", user.id);
    }

    const hasDetails = data.address_line1 || data.address_city || data.address_county || data.payer_type || data.care_needs?.length;
    if (hasDetails) {
      await supabase.from("patient_details").upsert(
        {
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
        },
        { onConflict: "patient_id" }
      );
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Draft save error:", err);
    return { error: err?.message ?? "Draft save failed" };
  }
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
