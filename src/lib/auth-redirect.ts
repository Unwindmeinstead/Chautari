import type { UserRole } from "@/types/database";
import type { User } from "@supabase/supabase-js";

type LegacyRole = UserRole | "admin" | "agency" | null | undefined;

export function normalizeUserRole(role: LegacyRole): UserRole | null {
  if (!role) return null;
  if (role === "admin") return "chautari_admin";
  if (role === "agency") return "agency_admin";
  if (["patient", "agency_staff", "agency_admin", "chautari_admin"].includes(role)) {
    return role as UserRole;
  }
  return null;
}

export function getRouteForRole(role: LegacyRole): string {
  const normalizedRole = normalizeUserRole(role);
  if (normalizedRole === "agency_staff" || normalizedRole === "agency_admin") return "/agency/dashboard";
  if (normalizedRole === "chautari_admin") return "/admin";
  return "/dashboard";
}

export async function getUserRedirectPath(supabase: any, user: User): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return getRouteForRole(profile?.role as LegacyRole);
}
