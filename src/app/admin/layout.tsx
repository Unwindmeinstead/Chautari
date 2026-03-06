import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BYPASS_AUTH = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;

  if ((!user || authError) && !BYPASS_AUTH) redirect("/auth/login");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const profile = data as { role: string } | null;
  if (!BYPASS_AUTH && profile?.role !== "switchmycare_admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0F2419]">
      {children}
    </div>
  );
}
