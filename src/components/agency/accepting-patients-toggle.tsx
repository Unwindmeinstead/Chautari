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
        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all",
        (!isAdmin || loading) && "opacity-50 cursor-not-allowed"
      )}
      style={accepting ? {
        background: "rgba(74,222,128,0.12)",
        border: "1px solid rgba(74,222,128,0.3)",
        color: "#4ADE80",
      } : {
        background: "rgba(252,165,165,0.1)",
        border: "1px solid rgba(252,165,165,0.25)",
        color: "#FCA5A5",
      }}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : accepting ? (
        <ToggleRight className="size-4" style={{ color: "#4ADE80" }} />
      ) : (
        <ToggleLeft className="size-4" style={{ color: "#FCA5A5" }} />
      )}
      {accepting ? "Accepting patients" : "Not accepting"}
    </button>
  );
}
