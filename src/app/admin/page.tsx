import { createClient } from "@/lib/supabase/server";
import {
  getPlatformStats, getAdminAgencies, getAdminRequests,
  getAdminUsers, getAuditLogs
} from "@/lib/admin-actions";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin Portal | SwitchMyCare" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "switchmycare_admin") {
    redirect("/dashboard");
  }

  const [stats, agenciesRes, requestsRes, usersRes, logsRes] = await Promise.all([
    getPlatformStats(),
    getAdminAgencies({ limit: 100 }),
    getAdminRequests({ limit: 100 }),
    getAdminUsers({ limit: 200 }),
    getAuditLogs({ limit: 50 })
  ]);

  return (
    <AdminDashboardClient
      initialStats={stats}
      initialRequests={requestsRes.requests}
      initialAgencies={agenciesRes.agencies}
      initialUsers={usersRes.users}
      initialLogs={logsRes.logs}
      adminProfile={{
        full_name: profile.full_name || "Admin",
        email: user.email || ""
      }}
    />
  );
}
