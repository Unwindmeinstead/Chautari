"use client";

import * as React from "react";
import { ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { updateAgencyProfile } from "@/lib/agency-portal-actions";
import { cn } from "@/lib/utils";

interface Props {
  initialValue: boolean;
  isAdmin: boolean;
}

export function AcceptingPatientsToggle({ initialValue, isAdmin }: Props) {
  const [accepting, setAccepting] = React.useState(initialValue);
  const [loading, setLoading] = React.useState(false);

  async function toggle() {
    if (!isAdmin || loading) return;
    const next = !accepting;
    setAccepting(next); // optimistic
    setLoading(true);
    const result = await updateAgencyProfile({ is_accepting_patients: next });
    setLoading(false);
    if (result.error) setAccepting(!next); // revert on error
  }

  return (
    <button
      onClick={toggle}
      disabled={!isAdmin || loading}
      title={!isAdmin ? "Only admins can change this" : undefined}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors",
        accepting
          ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
          : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100",
        (!isAdmin || loading) && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : accepting ? (
        <ToggleRight className="size-4 text-green-500" />
      ) : (
        <ToggleLeft className="size-4 text-red-400" />
      )}
      {accepting ? "Accepting patients" : "Not accepting patients"}
    </button>
  );
}
