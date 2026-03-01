"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, PackageCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  acceptSwitchRequest,
  denySwitchRequest,
  markUnderReview,
  markRequestCompleted,
} from "@/lib/agency-portal-actions";

type Mode = null | "accept" | "deny" | "complete";

interface RequestActionsProps {
  requestId: string;
  status: string;
}

export function RequestActions({ requestId, status }: RequestActionsProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>(null);
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isTerminal = ["completed", "denied", "cancelled"].includes(status);
  const canReview = status === "submitted";
  const canAcceptDeny = ["submitted", "under_review"].includes(status);
  const canComplete = status === "accepted";

  async function handleAction() {
    if (!mode) return;
    if (mode === "deny" && !note.trim()) {
      setError("Please provide a reason for denying this request.");
      return;
    }
    setLoading(true);
    setError(null);

    const result =
      mode === "accept"   ? await acceptSwitchRequest(requestId, note || undefined) :
      mode === "deny"     ? await denySwitchRequest(requestId, note) :
                            await markRequestCompleted(requestId);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setMode(null);
      setNote("");
      router.refresh();
    }
  }

  async function handleMarkReview() {
    setLoading(true);
    const result = await markUnderReview(requestId);
    setLoading(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  if (isTerminal) {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center text-sm text-gray-400">
        This request is <strong>{status}</strong> — no further actions available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Default buttons */}
      {mode === null && (
        <div className="space-y-3">
          {canReview && (
            <Button variant="outline" className="w-full gap-2" onClick={handleMarkReview} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Clock className="size-4 text-blue-500" />}
              Mark as Under Review
            </Button>
          )}
          {canAcceptDeny && (
            <div className="grid grid-cols-2 gap-3">
              <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => setMode("accept")}>
                <CheckCircle2 className="size-4" /> Accept
              </Button>
              <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50" onClick={() => setMode("deny")}>
                <XCircle className="size-4" /> Deny
              </Button>
            </div>
          )}
          {canComplete && (
            <Button className="w-full gap-2" onClick={() => setMode("complete")}>
              <PackageCheck className="size-4" /> Mark as Completed
            </Button>
          )}
        </div>
      )}

      {/* Accept confirmation */}
      {mode === "accept" && (
        <div className="rounded-2xl bg-green-50 border-2 border-green-300 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-600" />
            <p className="font-semibold text-green-800">Accept this request?</p>
          </div>
          <p className="text-sm text-green-700">
            The patient will be notified immediately. You are committing to onboard this patient.
          </p>
          <Textarea
            label="Optional note to patient"
            placeholder="e.g. Welcome! A coordinator will reach out within 24 hours to schedule your first visit."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
          />
          <div className="flex gap-3">
            <Button onClick={handleAction} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Confirm Accept
            </Button>
            <Button variant="ghost" onClick={() => { setMode(null); setNote(""); }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Deny confirmation */}
      {mode === "deny" && (
        <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <XCircle className="size-5 text-red-500" />
            <p className="font-semibold text-red-700">Deny this request?</p>
          </div>
          <p className="text-sm text-red-600">
            The patient will be notified. Please explain why so they can find another agency.
          </p>
          <Textarea
            label="Reason for denial (required)"
            placeholder="e.g. We are at capacity in Allegheny County. We recommend contacting ABC Home Care at..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            required
          />
          <div className="flex gap-3">
            <Button onClick={handleAction} disabled={loading || !note.trim()} className="flex-1 bg-red-600 hover:bg-red-700 gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
              Confirm Denial
            </Button>
            <Button variant="ghost" onClick={() => { setMode(null); setNote(""); }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Complete confirmation */}
      {mode === "complete" && (
        <div className="rounded-2xl bg-forest-50 border-2 border-forest-300 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="size-5 text-forest-600" />
            <p className="font-semibold text-forest-800">Mark as completed?</p>
          </div>
          <p className="text-sm text-forest-600">
            This confirms the patient has been successfully onboarded and care has begun with your agency.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleAction} disabled={loading} className="flex-1 gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <PackageCheck className="size-4" />}
              Confirm Complete
            </Button>
            <Button variant="ghost" onClick={() => setMode(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
