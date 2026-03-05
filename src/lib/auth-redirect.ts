import type { UserRole } from "@/types/database";
import type { User } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";

export function getRouteForRole(role: UserRole | null | undefined): string {
  if (role === "agency_staff" || role === "agency_admin") return "/agency/dashboard";
  if (role === "switchmycare_admin") return "/admin";
  return "/dashboard";
}

export async function getUserRedirectPath(_supabase: any, user: User): Promise<string> {
  // Use the service client so RLS never blocks this lookup.
  // The anon/publishable key can fail to read profiles depending on RLS policies,
  // causing everyone to fall back to /dashboard regardless of their actual role.
  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return getRouteForRole((profile?.role as UserRole | null | undefined) ?? null);
}
