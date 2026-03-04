"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function submitAgencyClaim(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  const payload = {
    contact_name: String(formData.get("contact_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    agency_name: String(formData.get("agency_name") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim() || null,
    status: "submitted",
  };

  if (!payload.contact_name || !payload.email || !payload.agency_name) {
    return { error: "Name, email, and agency name are required." };
  }

  const { error } = await supabase.from("agency_claims").insert(payload as any);
  if (error) return { error: error.message };

  revalidatePath("/agency/claim");
  return { success: true };
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" } as const;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "chautari_admin") return { error: "Admin access required" } as const;

  return { supabase, user } as const;
}

export async function getAgencyClaims() {
  const auth = await requireAdmin();
  if ("error" in auth) return { claims: [], error: auth.error };

  const { data, error } = await auth.supabase
    .from("agency_claims")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { claims: [], error: error.message };
  return { claims: data ?? [] };
}

export async function sendAgencyInvite(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const claimId = String(formData.get("claim_id") ?? "");
  const agencyId = String(formData.get("agency_id") ?? "");
  const role = String(formData.get("role") ?? "staff");
  if (!claimId || !agencyId || !["owner", "admin", "staff"].includes(role)) {
    return { error: "Invalid invite payload." };
  }

  const { data: claim } = await auth.supabase.from("agency_claims").select("id,email,contact_name").eq("id", claimId).single();
  if (!claim?.email) return { error: "Claim not found." };

  try {
    const service = createServiceClient();

    const invite = await (service as any).auth.admin.inviteUserByEmail(claim.email, {
      data: {
        full_name: claim.contact_name,
        role: role === "staff" ? "agency_staff" : "agency_admin",
        invite_agency_id: agencyId,
        invite_agency_role: role,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/agency/dashboard`,
    });

    if (invite.error) return { error: invite.error.message };

    await (service.from("agency_invites") as any).insert({
      agency_id: agencyId,
      claim_id: claimId,
      email: claim.email,
      role,
      invited_by: auth.user.id,
      status: "sent",
      sent_at: new Date().toISOString(),
    } as any);

    await (service.from("agency_claims") as any).update({ status: "invited", agency_id: agencyId, invited_role: role, updated_at: new Date().toISOString() } as any).eq("id", claimId);

    revalidatePath("/admin/claims");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message ?? "Failed to send invite." };
  }
}
