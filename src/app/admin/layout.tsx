// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⚠️ TEMPORARY: Auth + role checks bypassed for testing. Re-enable before launch.
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) redirect("/auth/login");

  // const { data } = await supabase
  //   .from("profiles")
  //   .select("role, full_name")
  //   .eq("id", user.id)
  //   .single();

  // const profile = data as { role: string; full_name: string | null } | null;
  // if (profile?.role !== "switchmycare_admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cream flex">
      <AdminSidebar adminName="Admin" />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
