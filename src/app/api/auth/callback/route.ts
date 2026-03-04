import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getUserRedirectPath, normalizeUserRole } from "@/lib/auth-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?message=auth-error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?message=auth-error`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?message=auth-error`);
  }

  // Ensure profile exists and role is aligned (including legacy aliases like "admin").
  const roleFromMeta = (user.user_metadata?.role as string | undefined) ?? "patient";
  const normalizedRole = normalizeUserRole(roleFromMeta as any) ?? "patient";

  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
    phone: user.user_metadata?.phone ?? null,
    role: normalizedRole,
    preferred_lang: "en",
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });

  // Invite flow: callback reads invite metadata and links agency membership automatically.
  const inviteAgencyId = user.user_metadata?.invite_agency_id as string | undefined;
  const inviteAgencyRole = user.user_metadata?.invite_agency_role as string | undefined;

  if (inviteAgencyId && inviteAgencyRole && ["owner", "admin", "staff"].includes(inviteAgencyRole)) {
    await supabase.from("profiles").update({ role: inviteAgencyRole === "staff" ? "agency_staff" : "agency_admin" }).eq("id", user.id);

    await supabase.from("agency_members").upsert({
      agency_id: inviteAgencyId,
      user_id: user.id,
      role: inviteAgencyRole,
      is_active: true,
      joined_at: new Date().toISOString(),
    }, { onConflict: "agency_id,user_id" });

    try {
      const service = createServiceClient();
      await (service.from("agency_invites") as any)
        .update({ status: "accepted", accepted_by: user.id, accepted_at: new Date().toISOString() } as any)
        .eq("email", user.email ?? "")
        .eq("agency_id", inviteAgencyId)
        .eq("status", "sent");
    } catch {
      // best-effort if service role is unavailable
    }

    return NextResponse.redirect(`${origin}/agency/dashboard`);
  }

  const roleDefault = await getUserRedirectPath(supabase, user);
  const destination = next && next.startsWith("/") ? next : roleDefault;
  return NextResponse.redirect(`${origin}${destination}`);
}
