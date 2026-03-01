"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelSwitchRequest } from "@/lib/switch-actions";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    const result = await cancelSwitchRequest(requestId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          Keep request
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
          Yes, cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setConfirming(true)}
      className="text-red-600 hover:text-red-700 hover:bg-red-100 gap-1.5"
    >
      <XCircle className="size-3.5" />
      Cancel request
    </Button>
  );
}
