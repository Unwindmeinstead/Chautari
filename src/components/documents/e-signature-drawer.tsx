"use client";

import * as React from "react";
import { X, PenLine, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signDocument } from "@/lib/document-actions";
import type { DocumentRecord } from "@/lib/document-actions";

interface ESignatureDrawerProps {
  doc: DocumentRecord | null;
  patientFullName: string;
  onClose: () => void;
  onSigned: (docId: string) => void;
}

export function ESignatureDrawer({
  doc,
  patientFullName,
  onClose,
  onSigned,
}: ESignatureDrawerProps) {
  const [typedName, setTypedName] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  // Reset when doc changes
  React.useEffect(() => {
    setTypedName("");
    setAgreed(false);
    setError(null);
    setDone(false);
  }, [doc?.id]);

  const nameMatches = typedName.trim().toLowerCase() === patientFullName.toLowerCase();
  const canSign = typedName.trim().length >= 2 && agreed;

  async function handleSign() {
    if (!doc || !canSign) return;
    setSubmitting(true);
    setError(null);

    const result = await signDocument(doc.id, typedName.trim());
    setSubmitting(false);

    if (result.error) { setError(result.error); return; }

    setDone(true);
    setTimeout(() => {
      onSigned(doc.id);
      onClose();
    }, 1800);
  }

  if (!doc) return null;

  const signedAt = new Date().toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        <div className="px-6 pb-8 space-y-5 max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-forest-50 flex items-center justify-center">
                <PenLine className="size-5 text-forest-600" />
              </div>
              <div>
                <h2 className="font-fraunces text-xl font-semibold text-gray-800">
                  Sign document
                </h2>
                <p className="text-sm text-gray-400">{doc.display_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="size-5" />
            </button>
          </div>

          {done ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="size-12 text-green-500 mx-auto" />
              <p className="font-semibold text-gray-800">Document signed successfully</p>
              <p className="text-sm text-gray-400">Your agency has been notified.</p>
            </div>
          ) : (
            <>
              {/* Legal notice */}
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800 leading-relaxed">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <ShieldCheck className="size-4" />
                  Electronic signature disclosure
                </div>
                By typing your legal name below, you are electronically signing this document.
                Your e-signature is legally equivalent to a handwritten signature under the
                ESIGN Act and applicable state law.
              </div>

              {/* Document preview info */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Document</span>
                  <span className="font-medium text-gray-800">{doc.display_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Signing as</span>
                  <span className="font-medium text-gray-800">{patientFullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date &amp; time</span>
                  <span className="font-medium text-gray-800">{signedAt}</span>
                </div>
              </div>

              {/* Typed name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type your full legal name to sign
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder={patientFullName}
                  autoFocus
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-medium italic text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-forest-500 font-serif tracking-wide"
                />
                {typedName && !nameMatches && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    Tip: your name on file is "{patientFullName}"
                  </p>
                )}
              </div>

              {/* Consent checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreed}
                  onClick={() => setAgreed(!agreed)}
                  className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                    agreed ? "bg-forest-600 border-forest-600" : "border-gray-300"
                  }`}
                >
                  {agreed && <CheckCircle2 className="size-3 text-white" />}
                </button>
                <span className="text-sm text-gray-600 leading-snug">
                  I understand that my electronic signature on this document has the same
                  legal effect as my handwritten signature, and I intend to sign.
                </span>
              </label>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="size-4" /> {error}
                </div>
              )}

              {/* Sign button */}
              <Button
                onClick={handleSign}
                disabled={!canSign || submitting}
                className="w-full gap-2 h-12 text-base"
              >
                {submitting
                  ? <><Loader2 className="size-4 animate-spin" /> Signing…</>
                  : <><PenLine className="size-4" /> Sign document</>
                }
              </Button>

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                🔒 Secured by Chautari · HIPAA-compliant · Signature checksum recorded
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
