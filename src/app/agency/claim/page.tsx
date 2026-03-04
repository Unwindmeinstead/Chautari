"use client";

import { useState } from "react";
import { submitAgencyClaim } from "@/lib/agency-claims-actions";

export default function AgencyClaimPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setMessage(null);
    setError(null);
    const res = await submitAgencyClaim(formData);
    if (res.error) setError(res.error);
    if (res.success) setMessage("Claim submitted. We will review and send an invite email.");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="max-w-xl mx-auto rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Claim your agency account</h1>
        <p className="text-sm text-zinc-500">This is invite-only. Submit this form and our admin team will review your claim.</p>
        {message && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>}
        <form action={action} className="space-y-3">
          <input name="contact_name" placeholder="Your full name" className="w-full h-10 px-3 rounded-lg border border-zinc-300" required />
          <input name="email" type="email" placeholder="Work email" className="w-full h-10 px-3 rounded-lg border border-zinc-300" required />
          <input name="phone" placeholder="Phone (optional)" className="w-full h-10 px-3 rounded-lg border border-zinc-300" />
          <input name="agency_name" placeholder="Agency name" className="w-full h-10 px-3 rounded-lg border border-zinc-300" required />
          <textarea name="notes" placeholder="Anything else we should know?" className="w-full min-h-28 px-3 py-2 rounded-lg border border-zinc-300" />
          <button className="h-10 px-5 rounded-lg bg-zinc-900 text-white text-sm font-medium">Submit claim</button>
        </form>
      </div>
    </main>
  );
}
