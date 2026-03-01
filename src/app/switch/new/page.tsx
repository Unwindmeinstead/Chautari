import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAgencyById } from "@/lib/agency-actions";
import { SwitchWizard } from "@/components/switch/switch-wizard";

export const metadata = { title: "Start Switch Request | Chautari" };

interface NewSwitchPageProps {
  searchParams: { agency?: string };
}

export default async function NewSwitchPage({ searchParams }: NewSwitchPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectedFrom=/switch/new");

  // Agency ID required
  if (!searchParams.agency) redirect("/agencies");

  const [agency, profile] = await Promise.all([
    getAgencyById(searchParams.agency),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  if (!agency) return notFound();

  // Check onboarding is complete
  const { data: details } = await supabase
    .from("patient_details")
    .select("id")
    .eq("patient_id", user.id)
    .single();

  if (!details) redirect("/onboarding");

  return (
    <SwitchWizard
      agency={agency}
      userName={profile.data?.full_name ?? user.email ?? null}
    />
  );
}
