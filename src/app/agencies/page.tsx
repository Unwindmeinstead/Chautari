import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { searchAgencies, getPatientFilters } from "@/lib/agency-actions";
import { AgencySearchClient } from "@/components/agencies/agency-search-client";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Find Home Care Agencies | SwitchMyCare" };

interface AgenciesPageProps {
  searchParams: { [key: string]: string | undefined };
}

export default async function AgenciesPage({ searchParams }: AgenciesPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // No auth gate — agency browse is fully public
  // If logged in, load patient filters for personalized results
  const patientFilters = user ? await getPatientFilters() : null;

  // Build initial filters from URL params (for shareable links)
  const initialFilters = {
    county: searchParams.county,
    care_type: searchParams.care_type as any,
    payer_type: searchParams.payer_type as any,
    language: searchParams.language,
    verified_only: searchParams.verified === "true",
    query: searchParams.q,
  };

  // SSR initial load
  const { agencies, total } = await searchAgencies(initialFilters, 1, 12);

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="bg-white border-b border-forest-100 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Logo size="sm" />
          <nav className="hidden md:flex items-center gap-6 text-sm text-forest-600">
            {user ? (
              <Link href="/dashboard" className="hover:text-forest-800 transition-colors">Dashboard</Link>
            ) : (
              <Link href="/" className="hover:text-forest-800 transition-colors">Home</Link>
            )}
            <Link href="/agencies" className="text-forest-800 font-medium border-b-2 border-forest-600 pb-0.5">Find Agencies</Link>
          </nav>
          {user ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">← Dashboard</Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Page header */}
        <div className="space-y-1">
          <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
            Find a home care agency
          </h1>
          <p className="text-forest-500">
            {total > 0 ? `Browse ${total.toLocaleString()} agencies` : "Browse agencies"} verified to operate in Pennsylvania.
            {!user && " Sign in for personalized recommendations based on your insurance."}
          </p>
        </div>

        {/* Search + results */}
        <Suspense fallback={<div className="text-forest-400 text-sm">Loading agencies…</div>}>
          <AgencySearchClient
            initialAgencies={agencies}
            initialTotal={total}
            initialFilters={initialFilters}
            patientCounty={patientFilters?.address_county}
            patientPayerType={patientFilters?.payer_type}
          />
        </Suspense>
      </div>
    </div>
  );
}
