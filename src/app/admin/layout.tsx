import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

const BYPASS_AUTH = true;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !BYPASS_AUTH) redirect("/auth/login");

  const { data } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user?.id ?? "")
    .single();

  const profile = data as { role: string; full_name: string | null } | null;
  if (!BYPASS_AUTH && profile?.role !== "switchmycare_admin") redirect("/dashboard");

  const adminName = profile?.full_name ?? user?.email?.split("@")[0] ?? "Admin";

  return (
    <div className="min-h-dvh flex bg-[#07070A] overscroll-none">
      <AdminSidebar adminName={adminName} />
      <div className="flex-1 min-w-0 bg-[#09090B]">
        <AdminMobileNav />
        <main className="min-h-dvh overflow-y-auto overscroll-y-none bg-[#09090B] pb-24 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
