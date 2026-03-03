import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Clock, Building2, Calendar,
  Stethoscope, FileSignature, XCircle, AlertCircle, ShieldCheck, MessageSquare
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSwitchRequestById, cancelSwitchRequest } from "@/lib/switch-actions";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, careTypeLabel } from "@/lib/utils";
import { SWITCH_REASONS_MAP } from "@/lib/switch-schema";
import { CancelRequestButton } from "@/components/switch/cancel-request-button";
import { getDocuments } from "@/lib/document-actions";
import { DocumentManager } from "@/components/documents/document-manager";

export const metadata = { title: "Switch Request | SwitchMyCare" };

interface SwitchDetailPageProps {
  params: { id: string };
}

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}> = {
  submitted: {
    label: "Submitted",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Clock className="size-4" />,
    description: "Your request has been submitted and is awaiting review by the agency.",
  },
  under_review: {
    label: "Under Review",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <AlertCircle className="size-4" />,
    description: "The agency is reviewing your request. They may contact you with questions.",
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle2 className="size-4" />,
    description: "The agency has accepted your request. Your current agency will be notified.",
  },
  completed: {
    label: "Completed",
    color: "bg-forest-100 text-forest-700 border-forest-200",
    icon: <CheckCircle2 className="size-4" />,
    description: "Your switch is complete. Welcome to your new agency!",
  },
  denied: {
    label: "Denied",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: <XCircle className="size-4" />,
    description: "The agency was unable to accept your request at this time.",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-500 border-gray-200",
    icon: <XCircle className="size-4" />,
    description: "This request was cancelled.",
  },
};

const TIMELINE_STEPS = [
  { key: "submitted", label: "Request submitted", icon: <FileSignature className="size-4" /> },
  { key: "under_review", label: "Under review", icon: <Clock className="size-4" /> },
  { key: "accepted", label: "Agency accepted", icon: <Building2 className="size-4" /> },
  { key: "completed", label: "Switch complete", icon: <CheckCircle2 className="size-4" /> },
];

const STATUS_ORDER = ["submitted", "under_review", "accepted", "completed"];

const SERVICE_LABELS: Record<string, string> = {
  skilled_nursing: "Skilled Nursing", physical_therapy: "Physical Therapy",
  occupational_therapy: "Occupational Therapy", speech_therapy: "Speech Therapy",
  medical_social_work: "Medical Social Work", home_health_aide: "Home Health Aide",
  personal_care: "Personal Care", companion_care: "Companion Care",
  homemaker: "Homemaker", respite_care: "Respite Care",
  medication_reminders: "Medication Reminders", transportation: "Transportation",
  meal_preparation: "Meal Preparation",
};

export default async function SwitchDetailPage({ params }: SwitchDetailPageProps) {
  // Always show mock data for UI preview
  const isPreview = true;

  if (isPreview) {
    const mockRequest = {
      id: params.id,
      status: "under_review",
      care_type: "Personal Care",
      switch_reason: "Better care quality",
      requested_start_date: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      new_agency: { id: "a1", name: "Premium Care Agency", phone: "(555) 123-4567", email: "info@premiumcare.com", address_city: "Pittsburgh", address_zip: "15222", website: "https://premiumcare.com" },
      e_signatures: [],
    };
    
    return (
      <div className="min-h-screen bg-cream">
        <nav className="bg-white border-b border-[rgba(26,61,43,0.06)] px-6 py-4 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Logo size="md" />
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800 transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-xs text-[#6B7B6E] uppercase tracking-wider mb-2">Request ID</p>
              <h1 className="font-fraunces text-3xl font-bold text-forest-800">{mockRequest.new_agency.name}</h1>
              <p className="text-[#6B7B6E] mt-1">Personal Care Services</p>
            </div>
            <div className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-sm font-medium">
              Under Review
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-6">
            <h3 className="font-fraunces text-lg font-semibold text-forest-800 mb-5">Progress</h3>
            <div className="flex items-center justify-between">
              {[
                { label: "Submitted", done: true },
                { label: "Under Review", done: true, current: true },
                { label: "Accepted", done: false },
                { label: "Complete", done: false },
              ].map((step, i) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.done ? "bg-forest-600 text-cream" : step.current ? "bg-amber-500 text-white" : "bg-[rgba(26,61,43,0.08)] text-[#6B7B6E]"
                    }`}>
                      {step.done ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${step.done || step.current ? "text-forest-600" : "text-[#6B7B6E]"}`}>{step.label}</span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-0.5 ${step.done ? "bg-forest-600" : "bg-[rgba(26,61,43,0.08)]"}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-6">
              <h3 className="font-fraunces text-lg font-semibold text-forest-800 mb-4">Request Details</h3>
              <div className="space-y-4">
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Started</p><p className="text-sm font-medium text-forest-700">Jan 15, 2026</p></div>
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Reason</p><p className="text-sm font-medium text-forest-700">Better care quality</p></div>
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Requested Start</p><p className="text-sm font-medium text-forest-700">As soon as possible</p></div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-6">
              <h3 className="font-fraunces text-lg font-semibold text-forest-800 mb-4">Agency Info</h3>
              <div className="space-y-4">
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Agency</p><p className="text-sm font-medium text-forest-700">{mockRequest.new_agency.name}</p></div>
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Location</p><p className="text-sm font-medium text-forest-700">{mockRequest.new_agency.address_city}, PA</p></div>
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Phone</p><p className="text-sm font-medium text-forest-700">{mockRequest.new_agency.phone}</p></div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href={`/switch/${params.id}/messages`} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-forest-600 text-cream font-medium hover:bg-forest-700 transition-colors">
              Messages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  
  return (
      <div className="min-h-screen bg-cream">
        <nav className="bg-white border-b border-[rgba(26,61,43,0.06)] px-6 py-4 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Logo size="md" />
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800 transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-xs text-[#6B7B6E] uppercase tracking-wider mb-2">Request ID</p>
              <h1 className="font-fraunces text-3xl font-bold text-forest-800">{mockRequest.new_agency.name}</h1>
              <p className="text-[#6B7B6E] mt-1">Personal Care Services</p>
            </div>
            <div className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-sm font-medium">
              Under Review
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-6">
            <h3 className="font-fraunces text-lg font-semibold text-forest-800 mb-5">Progress</h3>
            <div className="flex items-center justify-between">
              {[
                { label: "Submitted", done: true },
                { label: "Under Review", done: true, current: true },
                { label: "Accepted", done: false },
                { label: "Complete", done: false },
              ].map((step, i) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.done ? "bg-forest-600 text-cream" : step.current ? "bg-amber-500 text-white" : "bg-[rgba(26,61,43,0.08)] text-[#6B7B6E]"
                    }`}>
                      {step.done ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${step.done || step.current ? "text-forest-600" : "text-[#6B7B6E]"}`}>{step.label}</span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-0.5 ${step.done ? "bg-forest-600" : "bg-[rgba(26,61,43,0.08)]"}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-6">
              <h3 className="font-fraunces text-lg font-semibold text-forest-800 mb-4">Request Details</h3>
              <div className="space-y-4">
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Started</p><p className="text-sm font-medium text-forest-700">Jan 15, 2026</p></div>
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Reason</p><p className="text-sm font-medium text-forest-700">Better care quality</p></div>
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Requested Start</p><p className="text-sm font-medium text-forest-700">As soon as possible</p></div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] p-6">
              <h3 className="font-fraunces text-lg font-semibold text-forest-800 mb-4">Agency Info</h3>
              <div className="space-y-4">
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Agency</p><p className="text-sm font-medium text-forest-700">{mockRequest.new_agency.name}</p></div>
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Location</p><p className="text-sm font-medium text-forest-700">{mockRequest.new_agency.address_city}, PA</p></div>
                <div><p className="text-xs text-[#6B7B6E] uppercase tracking-wider">Phone</p><p className="text-sm font-medium text-forest-700">{mockRequest.new_agency.phone}</p></div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href={`/switch/${params.id}/messages`} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-forest-600 text-cream font-medium hover:bg-forest-700 transition-colors">
              Messages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Production code - requires authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const request = await getSwitchRequestById(params.id);
  if (!request) return notFound();

  const [docsResult, profileResult] = await Promise.all([
    getDocuments(params.id),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);
  const documents = docsResult.documents;
  const patientFullName = profileResult.data?.full_name ?? user.email?.split("@")[0] ?? "Patient";

  const status = request.status as string;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted;
  const currentStatusIndex = STATUS_ORDER.indexOf(status);
  const isCancellable = ["submitted", "under_review"].includes(status);

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="bg-white border-b border-forest-100 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <p className="text-xs text-forest-400 font-mono">
              REQ-{request.id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
              Switch Request
            </h1>
            <p className="text-forest-500">
              Submitted {new Date(request.submitted_at ?? request.created_at).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric"
              })}
            </p>
          </div>
          <div className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium", config.color)}>
            {config.icon}
            {config.label}
          </div>
        </div>

        {/* Status description */}
        <div className="rounded-xl bg-white border border-forest-100 shadow-card p-5 flex items-start gap-3">
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", config.color)}>
            {config.icon}
          </div>
          <div>
            <p className="font-medium text-forest-800 text-sm">{config.label}</p>
            <p className="text-sm text-forest-500 mt-0.5">{config.description}</p>
          </div>
        </div>

        {/* Progress timeline */}
        {!["denied", "cancelled"].includes(status) && (
          <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-6 space-y-4">
            <h2 className="font-fraunces text-lg font-semibold text-forest-800">Progress</h2>
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, i) => {
                const stepIndex = STATUS_ORDER.indexOf(step.key);
                const isDone = stepIndex < currentStatusIndex || (step.key === status && status === "completed");
                const isCurrent = step.key === status;
                const isFuture = stepIndex > currentStatusIndex;

                return (
                  <div key={step.key} className="flex items-start gap-4">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all z-10",
                        isDone ? "bg-forest-600 border-forest-600 text-white" :
                        isCurrent ? "bg-white border-forest-600 text-forest-600" :
                        "bg-white border-forest-200 text-forest-300"
                      )}>
                        {isDone ? <CheckCircle2 className="size-4" /> : step.icon}
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={cn(
                          "w-0.5 h-8 -my-0.5",
                          stepIndex < currentStatusIndex ? "bg-forest-600" : "bg-forest-100"
                        )} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pb-8 pt-1">
                      <p className={cn(
                        "text-sm font-medium",
                        isDone || isCurrent ? "text-forest-800" : "text-forest-300"
                      )}>
                        {step.label}
                      </p>
                      {isCurrent && !isDone && (
                        <p className="text-xs text-forest-400 mt-0.5">In progress</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Details grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* New agency */}
          <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-5 space-y-3">
            <h2 className="font-fraunces text-base font-semibold text-forest-800 flex items-center gap-2">
              <Building2 className="size-4 text-forest-500" /> New Agency
            </h2>
            <div>
              <p className="font-medium text-forest-800">{(request as any).new_agency?.name}</p>
              <p className="text-sm text-forest-500">{(request as any).new_agency?.address_city}, PA</p>
              {(request as any).new_agency?.phone && (
                <a href={`tel:${(request as any).new_agency.phone}`}
                  className="text-sm text-forest-600 hover:text-forest-800 mt-1 block">
                  {(request as any).new_agency.phone}
                </a>
              )}
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/agencies/${request.new_agency_id}`}>View agency</Link>
            </Button>
          </div>

          {/* Current agency */}
          <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-5 space-y-3">
            <h2 className="font-fraunces text-base font-semibold text-forest-800 flex items-center gap-2">
              <Building2 className="size-4 text-forest-400" /> Current Agency
            </h2>
            <p className="text-sm text-forest-600">
              {request.current_agency_name ?? "Not specified"}
            </p>
            <p className="text-xs text-forest-400">
              Will be notified after your new agency accepts.
            </p>
          </div>

          {/* Care details */}
          <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-5 space-y-3">
            <h2 className="font-fraunces text-base font-semibold text-forest-800 flex items-center gap-2">
              <Stethoscope className="size-4 text-forest-500" /> Care Requested
            </h2>
            <p className="text-sm font-medium text-forest-700">
              {careTypeLabel(request.care_type as string)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(request.services_requested as string[])?.map((s) => (
                <span key={s} className="text-xs bg-forest-50 border border-forest-200 text-forest-600 px-2 py-0.5 rounded-full">
                  {SERVICE_LABELS[s] ?? s.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-5 space-y-3">
            <h2 className="font-fraunces text-base font-semibold text-forest-800 flex items-center gap-2">
              <Calendar className="size-4 text-forest-500" /> Dates
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-forest-400 uppercase tracking-wide">Requested start</p>
                <p className="text-forest-700 font-medium">
                  {request.requested_start_date
                    ? new Date(request.requested_start_date).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-forest-400 uppercase tracking-wide">Submitted</p>
                <p className="text-forest-700">
                  {new Date(request.submitted_at ?? request.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reason & instructions */}
        {(request.switch_reason || request.special_instructions) && (
          <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-5 space-y-4">
            {request.switch_reason && (
              <div>
                <p className="text-xs text-forest-400 uppercase tracking-wide font-medium mb-1">Reason for switch</p>
                <p className="text-sm text-forest-700">
                  {SWITCH_REASONS_MAP[request.switch_reason as string] ?? request.switch_reason}
                </p>
              </div>
            )}
            {request.special_instructions && (
              <div>
                <p className="text-xs text-forest-400 uppercase tracking-wide font-medium mb-1">Special instructions</p>
                <p className="text-sm text-forest-700 italic">{request.special_instructions}</p>
              </div>
            )}
          </div>
        )}

        {/* E-signature record */}
        {(request as any).e_signatures?.length > 0 && (
          <div className="rounded-xl bg-forest-50 border border-forest-200 p-4 flex items-center gap-3 text-sm text-forest-600">
            <ShieldCheck className="size-4 text-forest-500 shrink-0" />
            Electronically signed on{" "}
            {new Date((request as any).e_signatures[0].signed_at).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric"
            })}
            {" "}via {(request as any).e_signatures[0].signature_method} signature.
          </div>
        )}

        {/* Documents */}
        <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-6">
          <DocumentManager
            requestId={request.id}
            initialDocuments={documents}
            currentUserId={user.id}
            currentRole="patient"
            patientFullName={patientFullName}
            canUpload={!["completed", "denied", "cancelled"].includes(status)}
          />
        </div>

        {/* Message agency */}
        {!["denied", "cancelled"].includes(status) && (
          <div className="rounded-xl bg-white border border-forest-100 shadow-card p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-forest-50 flex items-center justify-center shrink-0">
                <MessageSquare className="size-4 text-forest-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-forest-800">Message your agency</p>
                <p className="text-xs text-forest-400 mt-0.5">Secure, HIPAA-compliant messaging</p>
              </div>
            </div>
            <Button variant="amber" size="sm" asChild className="gap-2 shrink-0">
              <Link href={`/switch/${request.id}/messages`}>
                <MessageSquare className="size-3.5" />
                Open chat
              </Link>
            </Button>
          </div>
        )}

        {/* Cancel button */}
        {isCancellable && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-red-700">Cancel this request</p>
              <p className="text-xs text-red-500 mt-0.5">
                This cannot be undone. You can start a new request afterward.
              </p>
            </div>
            <CancelRequestButton requestId={request.id} />
          </div>
        )}
      </div>
    </div>
  );
}
