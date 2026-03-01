"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Globe, Phone, Mail, Languages } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateAgencyProfile } from "@/lib/agency-portal-actions";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  "English", "Nepali", "Hindi", "Spanish", "Mandarin",
  "Arabic", "French", "Portuguese", "Korean", "Vietnamese",
];

interface Props {
  initialData: { phone: string; email: string; website: string; languages_spoken: string[] };
  isAdmin: boolean;
}

export function AgencyProfileForm({ initialData, isAdmin }: Props) {
  const router = useRouter();
  const [form, setForm] = React.useState(initialData);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function toggleLang(lang: string) {
    setForm((p) => ({
      ...p,
      languages_spoken: p.languages_spoken.includes(lang)
        ? p.languages_spoken.filter((l) => l !== lang)
        : [...p.languages_spoken, lang],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await updateAgencyProfile(form);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {!isAdmin && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          Only agency admins can edit the agency profile.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Phone number"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="(412) 555-0100"
          disabled={!isAdmin}
          startIcon={<Phone className="size-4" />}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="referrals@youragency.com"
          disabled={!isAdmin}
          startIcon={<Mail className="size-4" />}
        />
        <Input
          label="Website"
          type="url"
          value={form.website}
          onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
          placeholder="https://youragency.com"
          disabled={!isAdmin}
          startIcon={<Globe className="size-4" />}
          className="sm:col-span-2"
        />
      </div>

      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-forest-700">
          <Languages className="size-4 text-forest-400" />
          Languages spoken by staff
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => {
            const checked = form.languages_spoken.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => isAdmin && toggleLang(lang)}
                disabled={!isAdmin}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left transition-colors",
                  checked
                    ? "border-forest-400 bg-forest-50 text-forest-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                  !isAdmin && "opacity-60 cursor-not-allowed"
                )}
              >
                <span className={cn(
                  "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                  checked ? "border-forest-500 bg-forest-600" : "border-gray-300"
                )}>
                  {checked && <Check className="size-2.5 text-white" />}
                </span>
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {isAdmin && (
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? (
            <><Loader2 className="size-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check className="size-4" /> Saved!</>
          ) : "Save changes"}
        </Button>
      )}
    </form>
  );
}
