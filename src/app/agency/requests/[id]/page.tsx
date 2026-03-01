import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, MapPin, ShieldCheck, Languages, Calendar,
  FileText, ShieldAlert, Stethoscope, Clock, MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSwitchRequestForAgency, getAgencyPortalData } from "@/lib/agency-portal-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { RequestActions } from "@/components/agency/request-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { payerLabel, careTypeLabel, cn } from "@/lib/utils";
import { SWITCH_REASONS_MAP } from "@/lib/switch-schema";
import { getDocuments } from "@/lib/document-actions";
import { DocumentManager } from "@/components/documents/document-manager";

export const dynamic = "force-dynamic";

const LANG_LABELS: Record<string, string> = {
  en: "English", ne: "Nepali", hi: "Hindi", es: "Spanish",
  zh: "Mandarin", ar: "Arabic", fr: "French", pt: "Portuguese",
};

const SERVICE_LABELS: Record<string, string> = {
  skilled_nursing: "Skilled Nursing", physical_therapy: "Physical Therapy",
  occupational_therapy: "Occupational Therapy", speech_therapy: "Speech Therapy",
  medical_social_work: "Medical Social Work", home_health_aide: "Home Health Aide",
  personal_care: "Personal Care", companion_care: "Companion Care",
  homemaker: "Homemaker", respite_care: "Respite Care",
  medication_reminders: "Medication Reminders", transportation: "Transportation",
  meal_preparation: "Meal Preparation",
};

const STATUS_COLORS: Record<string, string> = {
  submitted:    "bg-amber-100 text-amber-700 border-amber-300",
  under_review: "bg-blue-100 text-blue-700 border-blue-300",
  accepted:     "bg-green-100 text-green-700 border-green-300",
  completed:    "bg-forest-100 text-forest-700 border-forest-300",
  denied:       "bg-red-100 text-red-600 border-red-200",
  cancelled:    "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function AgencyRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [request, portalData, docsResult] = await Promise.all([
    getSwitchRequestForAgency(params.id),
    getAgencyPortalData(),
    getDocuments(params.id),
  ]);

  if (!request || !portalData.agency) return notFound();

  const { agency, member, stats } = portalData;
  const staffName = user.email?.split("@")[0] ?? "Staff";
  const documents = docsResult.documents;
  const patientFullName = request.patient?.full_name ?? "Patient";
  const hipaaOk = request.e_signatures?.some((s) => s.consent_hipaa);
  const lang = request.patient?.preferred_lang;
  const needsInterpreter = lang && lang !== "en";
  const statusColor = STATUS_COLORS[request.status] ?? STATUS_COLORS.submitted;
  const activePulse = ["submitted", "under_review"].includes(request.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyNav
        agencyName={agency?.name ?? null}
        staffName={staffName}
        staffRole={member?.role ?? null}
        pendingCount={stats.pending}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Back */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/agency/requests"><ArrowLeft className="size-4 mr-1" />All requests</Link>
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 font-mono mb-1">REQ-{request.id.slice(0, 8).toUpperCase()}</p>
            <h1 className="font-fraunces text-3xl font-semibold text-gray-800">Switch Request</h1>
            <p className="text-gray-500 mt-0.5">
              Submitted {new Date(request.submitted_at ?? request.created_at).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric"
              })}
            </p>
          </div>
          <div className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold capitalize", statusColor)}>
            <span className={cn("h-2 w-2 rounded-full bg-current opacity-60", activePulse && "animate-pulse")} />
            {request.status.replace("_", " ")}
          </div>
        </div>

        {/* HIPAA warning */}
        {!hipaaOk && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
            <ShieldAlert className="size-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">Missing HIPAA authorization</p>
              <p className="text-xs text-red-600 mt-0.5">
                No HIPAA consent on file. Contact Chautari support before accepting.
              </p>
            </div>
          </div>
        )}

        {/* Interpreter flag */}
        {needsInterpreter && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
            <Languages className="size-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">
              <strong>Interpreter may be needed:</strong> Patient&apos;s preferred language is{" "}
              <strong>{LANG_LABELS[lang!] ?? lang}</strong>.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Left: patient + care details */}
          <div className="lg:col-span-2 space-y-5">

            {/* Patient info */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-6 space-y-4">
              <h2 className="font-fraunces text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User className="size-4 text-gray-400" /> Patient Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Full name</p>
                  <p className="font-semibold text-gray-800">{request.patient?.full_name ?? "Not provided"}</p>
                </div>
                {request.patient?.phone && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Phone</p>
                    <a href={`tel:${request.patient.phone}`} className="text-forest-600 hover:text-forest-800 font-medium">
                      {request.patient.phone}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Location</p>
                  <p className="text-gray-700 flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-gray-400 shrink-0" />
                    {request.patient_details?.address_city ?? "—"}, {request.patient_details?.address_county ?? "—"} County
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Insurance</p>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-gray-400 shrink-0" />
                    <Badge variant="info">
                      {request.patient_details?.payer_type ? payerLabel(request.patient_details.payer_type) : "Unknown"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Language</p>
                  <p className="text-gray-700 flex items-center gap-1.5">
                    <Languages className="size-3.5 text-gray-400 shrink-0" />
                    {lang ? (LANG_LABELS[lang] ?? lang) : "English"}
                  </p>
                </div>
              </div>
            </div>

            {/* Care details */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-6 space-y-4">
              <h2 className="font-fraunces text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Stethoscope className="size-4 text-gray-400" /> Care Requested
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Care type</p>
                  <Badge variant="default">{careTypeLabel(request.care_type)}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Reason for switching</p>
                  <p className="text-gray-700">{SWITCH_REASONS_MAP[request.switch_reason] ?? request.switch_reason}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Services requested</p>
                <div className="flex flex-wrap gap-1.5">
                  {request.services_requested.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {SERVICE_LABELS[s] ?? s.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
              {request.requested_start_date && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="size-4 text-gray-400 shrink-0" />
                  Requested start:{" "}
                  <strong className="text-gray-800">
                    {new Date(request.requested_start_date).toLocaleDateString("en-US", {
                      weekday: "long", month: "long", day: "numeric", year: "numeric"
                    })}
                  </strong>
                </div>
              )}
              {request.special_instructions && (
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Special instructions</p>
                  <p className="text-sm text-gray-700 italic">"{request.special_instructions}"</p>
                </div>
              )}
            </div>

            {/* HIPAA record */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-5 space-y-3">
              <h2 className="font-fraunces text-base font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="size-4 text-gray-400" /> Authorization & Signature
              </h2>
              {(request.e_signatures?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  {request.e_signatures.map((sig) => (
                    <div key={sig.id} className={cn(
                      "flex items-center gap-3 rounded-xl p-3 text-sm",
                      sig.consent_hipaa ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    )}>
                      <ShieldCheck className={cn("size-4 shrink-0", sig.consent_hipaa ? "text-green-500" : "text-red-400")} />
                      <div>
                        <p className={sig.consent_hipaa ? "text-green-700 font-medium" : "text-red-600 font-medium"}>
                          {sig.consent_hipaa ? "HIPAA authorization granted" : "HIPAA authorization NOT granted"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Signed {new Date(sig.signed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No signature on file</p>
              )}
            </div>
          </div>

          {/* Documents - full width below the two columns */}
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-6">
          <DocumentManager
            requestId={request.id}
            initialDocuments={documents}
            currentUserId={user.id}
            currentRole="agency_staff"
            patientFullName={patientFullName}
            canUpload={!["completed", "denied", "cancelled"].includes(request.status)}
          />
        </div>

        {/* Actions sidebar continues below */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2" />

          {/* Right: actions + timeline */}
          <div className="space-y-5">

            {/* Actions */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-5 space-y-4">
              <h2 className="font-fraunces text-lg font-semibold text-gray-800">Actions</h2>
              <RequestActions requestId={request.id} status={request.status} />
            </div>

            {/* Timeline */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-card p-5 space-y-3">
              <h2 className="font-fraunces text-base font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="size-4 text-gray-400" /> Timeline
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Submitted</span>
                  <span className="text-gray-700">
                    {new Date(request.submitted_at ?? request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last updated</span>
                  <span className="text-gray-700">
                    {new Date(request.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                {request.requested_start_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target start</span>
                    <span className="text-gray-700 font-medium">
                      {new Date(request.requested_start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Messaging */}
            <div className="rounded-2xl bg-forest-50 border border-forest-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-forest-600" />
                <p className="text-sm text-forest-800 font-semibold">Secure Messaging</p>
              </div>
              <p className="text-xs text-forest-500 leading-relaxed">
                Send and receive HIPAA-compliant messages with the patient about this request.
              </p>
              <Button variant="amber" size="sm" asChild className="w-full gap-2">
                <Link href={`/agency/messages`}>
                  <MessageSquare className="size-3.5" />
                  Open conversation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
