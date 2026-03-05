import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { searchAgencies, getPatientFilters } from "@/lib/agency-actions";
import { AgencySearchClient } from "@/components/agencies/agency-search-client";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export const metadata = { title: "Find Home Care Agencies | SwitchMyCare" };

interface AgenciesPageProps {
  searchParams: { [key: string]: string | undefined };
}

export default async function AgenciesPage({ searchParams }: AgenciesPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const patientFilters = user ? await getPatientFilters() : null;

  const initialFilters = {
    county: searchParams.county,
    care_type: searchParams.care_type as any,
    payer_type: searchParams.payer_type as any,
    language: searchParams.language,
    verified_only: searchParams.verified === "true",
    accepting_patients: searchParams.accepting === "true",
    min_quality_score: searchParams.quality ? Number(searchParams.quality) : undefined,
    sort_by: (searchParams.sort as any) ?? "verified",
    query: searchParams.q,
  };

  const { agencies, total } = await searchAgencies(initialFilters, 1, 12);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-3 sm:gap-6">
          <Link href="/" className="hover:opacity-80 transition-opacity shrink-0">
            <Logo size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[14px] font-semibold text-gray-500">
            {user ? (
              <Link href="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
            ) : (
              <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            )}
            <Link href="/agencies" className="text-gray-900 font-bold border-b-2 border-gray-900 pb-0.5">Find Agencies</Link>
          </div>
          {user ? (
            <Link href="/dashboard" className="h-9 px-3 sm:px-5 rounded-full border border-gray-200 text-[12px] sm:text-[13px] font-bold text-gray-700 flex items-center hover:border-gray-900 hover:text-gray-900 transition-all whitespace-nowrap">
              <span className="hidden sm:inline">← </span>Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="h-9 px-4 sm:px-5 rounded-full bg-gray-900 text-white text-[12px] sm:text-[13px] font-bold flex items-center hover:bg-gray-800 transition-colors whitespace-nowrap">
              Sign in
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2 pb-6 border-b border-gray-100">
          <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-gray-900">
            Find a Home Care Agency
          </h1>
          <p className="text-[14px] sm:text-[15px] font-medium text-gray-500 max-w-2xl">
            {total > 0 ? `${total.toLocaleString()} agencies` : "Agencies"} verified to operate in Pennsylvania.
            {!user && " Sign in for personalized recommendations based on your insurance."}
          </p>
        </div>

        <Suspense fallback={<div className="text-gray-400 text-sm font-medium py-8">Loading agencies…</div>}>
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
