import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Phone, Globe, Mail, CheckCircle2, Star,
  Clock, Languages, ShieldCheck, Building2, ArrowLeft,
  ExternalLink, Heart, AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAgencyById } from "@/lib/agency-actions";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { careTypeLabel, payerLabel, cn } from "@/lib/utils";

interface AgencyDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: AgencyDetailPageProps) {
  const agency = await getAgencyById(params.id);
  return {
    title: agency ? `${agency.name} | Chautari` : "Agency Not Found",
  };
}

const SERVICE_LABELS: Record<string, string> = {
  skilled_nursing: "Skilled Nursing",
  physical_therapy: "Physical Therapy",
  occupational_therapy: "Occupational Therapy",
  speech_therapy: "Speech Therapy",
  medical_social_work: "Medical Social Work",
  home_health_aide: "Home Health Aide (HHA)",
  personal_care: "Personal Care",
  companion_care: "Companion Care",
  homemaker: "Homemaker Services",
  respite_care: "Respite Care",
  medication_reminders: "Medication Reminders",
  transportation: "Transportation",
  meal_preparation: "Meal Preparation",
};

export default async function AgencyDetailPage({ params }: AgencyDetailPageProps) {
  const [agency, supabase] = await Promise.all([
    getAgencyById(params.id),
    createClient(),
  ]);

  if (!agency) return notFound();

  const { data: { user } } = await supabase.auth.getUser();

  // Check if patient already has an active switch request for this agency
  let existingSwitchRequest = null;
  if (user) {
    const { data } = await supabase
      .from("switch_requests")
      .select("id, status")
      .eq("patient_id", user.id)
      .eq("new_agency_id", agency.id)
      .not("status", "in", '("cancelled","denied")')
      .single();
    existingSwitchRequest = data;
  }

  const stars = agency.medicare_quality_score;

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="bg-white border-b border-forest-100 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/agencies">
              <ArrowLeft className="size-4" />
              Back to search
            </Link>
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero card */}
        <div className="rounded-2xl bg-white shadow-card border border-forest-100 overflow-hidden">
          {/* Colored top band */}
          <div className="h-2 bg-forest-gradient" />

          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Agency icon placeholder */}
              <div className="h-16 w-16 rounded-2xl bg-forest-100 flex items-center justify-center shrink-0">
                <Building2 className="size-8 text-forest-600" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {agency.is_verified_partner && (
                    <Badge variant="verified" className="gap-1">
                      <CheckCircle2 className="size-3.5" />
                      Verified Chautari Partner
                    </Badge>
                  )}
                  {agency.care_types.map((ct) => (
                    <Badge key={ct} variant="default">{careTypeLabel(ct)}</Badge>
                  ))}
                </div>
                <h1 className="font-fraunces text-3xl font-semibold text-forest-800 leading-tight">
                  {agency.name}
                </h1>
                {agency.dba_name && (
                  <p className="text-forest-500">dba {agency.dba_name}</p>
                )}

                {/* Star rating */}
                {stars && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-4",
                            i <= Math.round(stars)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200 fill-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-forest-700">
                      {stars.toFixed(1)} Medicare quality score
                    </span>
                  </div>
                )}
              </div>

              {/* CTA - desktop */}
              <div className="hidden sm:block shrink-0">
                {existingSwitchRequest ? (
                  <div className="text-center space-y-2">
                    <Badge variant="success" className="text-sm px-3 py-1.5">
                      Request submitted
                    </Badge>
                    <p className="text-xs text-forest-400">Status: {existingSwitchRequest.status}</p>
                  </div>
                ) : (
                  <Button size="lg" variant="amber" asChild>
                    <Link href={`/switch/new?agency=${agency.id}`}>
                      <Heart className="size-4" />
                      Select this agency
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Contact row */}
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-forest-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4 text-forest-400 shrink-0" />
                {agency.address_line1}, {agency.address_city}, PA {agency.address_zip}
              </div>
              {agency.phone && (
                <a href={`tel:${agency.phone}`} className="flex items-center gap-1.5 hover:text-forest-800 transition-colors">
                  <Phone className="size-4 text-forest-400 shrink-0" />
                  {agency.phone}
                </a>
              )}
              {agency.email && (
                <a href={`mailto:${agency.email}`} className="flex items-center gap-1.5 hover:text-forest-800 transition-colors">
                  <Mail className="size-4 text-forest-400 shrink-0" />
                  {agency.email}
                </a>
              )}
              {agency.website && (
                <a href={agency.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-forest-800 transition-colors">
                  <Globe className="size-4 text-forest-400 shrink-0" />
                  Website
                  <ExternalLink className="size-3 text-forest-300" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services offered */}
            <div className="rounded-2xl bg-white shadow-card border border-forest-100 p-6 space-y-4">
              <h2 className="font-fraunces text-xl font-semibold text-forest-800">
                Services offered
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {agency.services_offered.map((svc) => (
                  <div key={svc} className="flex items-center gap-2 text-sm text-forest-700">
                    <CheckCircle2 className="size-4 text-forest-500 shrink-0" />
                    {SERVICE_LABELS[svc] ?? svc.replace(/_/g, " ")}
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance accepted */}
            <div className="rounded-2xl bg-white shadow-card border border-forest-100 p-6 space-y-4">
              <h2 className="font-fraunces text-xl font-semibold text-forest-800">
                Insurance accepted
              </h2>
              <div className="flex flex-wrap gap-2">
                {agency.payers_accepted.map((p) => (
                  <Badge key={p} variant="info" className="text-sm px-3 py-1">
                    {payerLabel(p)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Service area */}
            <div className="rounded-2xl bg-white shadow-card border border-forest-100 p-6 space-y-4">
              <h2 className="font-fraunces text-xl font-semibold text-forest-800">
                Service area
              </h2>
              <p className="text-sm text-forest-500">
                This agency serves patients in {agency.service_counties.length} Pennsylvania{" "}
                {agency.service_counties.length === 1 ? "county" : "counties"}:
              </p>
              <div className="flex flex-wrap gap-2">
                {agency.service_counties.sort().map((county) => (
                  <span key={county}
                    className="text-xs bg-forest-50 border border-forest-200 text-forest-700 px-2.5 py-1 rounded-full">
                    {county}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            {agency.languages_spoken.length > 0 && (
              <div className="rounded-2xl bg-white shadow-card border border-forest-100 p-6 space-y-4">
                <h2 className="font-fraunces text-xl font-semibold text-forest-800 flex items-center gap-2">
                  <Languages className="size-5 text-forest-500" />
                  Languages spoken
                </h2>
                <div className="flex flex-wrap gap-2">
                  {agency.languages_spoken.map((lang) => (
                    <Badge key={lang} variant="secondary">{lang}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - sidebar */}
          <div className="space-y-4">
            {/* Quick stats */}
            <div className="rounded-2xl bg-forest-600 text-white p-6 space-y-4">
              <h3 className="font-fraunces text-lg font-semibold">At a glance</h3>
              <div className="space-y-3">
                {agency.avg_response_hours && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-forest-500 flex items-center justify-center">
                      <Clock className="size-4 text-cream" />
                    </div>
                    <div>
                      <p className="text-xs text-forest-300">Avg. response time</p>
                      <p className="text-sm font-medium">{agency.avg_response_hours} hours</p>
                    </div>
                  </div>
                )}
                {agency.pa_license_number && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-forest-500 flex items-center justify-center">
                      <ShieldCheck className="size-4 text-cream" />
                    </div>
                    <div>
                      <p className="text-xs text-forest-300">PA License</p>
                      <p className="text-sm font-medium font-mono">{agency.pa_license_number}</p>
                    </div>
                  </div>
                )}
                {agency.npi && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-forest-500 flex items-center justify-center">
                      <Building2 className="size-4 text-cream" />
                    </div>
                    <div>
                      <p className="text-xs text-forest-300">NPI Number</p>
                      <p className="text-sm font-medium font-mono">{agency.npi}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA card - mobile & sticky sidebar */}
            <div className="rounded-2xl bg-white shadow-card border border-forest-100 p-6 space-y-4">
              <h3 className="font-fraunces text-lg font-semibold text-forest-800">
                Ready to switch?
              </h3>
              <p className="text-sm text-forest-500">
                Chautari will handle all the paperwork and coordinate with your current and new agency.
              </p>

              {existingSwitchRequest ? (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
                  <CheckCircle2 className="size-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">Request already submitted</p>
                  <p className="text-xs text-green-600 mt-1">Status: {existingSwitchRequest.status}</p>
                  <Button size="sm" variant="outline" className="mt-3" asChild>
                    <Link href="/dashboard">View in dashboard</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <Button size="lg" variant="amber" className="w-full" asChild>
                    <Link href={`/switch/new?agency=${agency.id}`}>
                      <Heart className="size-4" />
                      Select this agency
                    </Link>
                  </Button>
                  <p className="text-xs text-forest-400 text-center">
                    Free. No commitment. 100% paperwork handled.
                  </p>
                </>
              )}
            </div>

            {/* HIPAA notice */}
            <div className="rounded-xl bg-forest-50 border border-forest-100 p-4 flex items-start gap-2">
              <ShieldCheck className="size-4 text-forest-500 mt-0.5 shrink-0" />
              <p className="text-xs text-forest-500">
                All information shared with this agency is protected under HIPAA.
                Your current agency is only notified after a successful match.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
