import type { UserRole } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export function getRouteForRole(role: UserRole | null | undefined): string {
  if (role === "agency_staff" || role === "agency_admin") return "/agency/dashboard";
  if (role === "chautari_admin") return "/admin";
  return "/dashboard";
}

export async function getUserRedirectPath(supabase: any, user: User): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return getRouteForRole((profile?.role as UserRole | null | undefined) ?? null);
}
