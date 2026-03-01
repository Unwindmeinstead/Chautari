"use client";

import * as React from "react";
import { Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProfile } from "@/lib/dashboard-actions";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ne", label: "Nepali" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "zh", label: "Chinese (Mandarin)" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
];

interface ProfileEditFormProps {
  initialData: {
    full_name: string;
    phone: string;
    preferred_lang: string;
  };
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const [formData, setFormData] = React.useState(initialData);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isDirty) return;
    setSaving(true);
    setError(null);
    const result = await updateProfile(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Input
        label="Full name"
        value={formData.full_name}
        onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
        placeholder="Jane Smith"
      />

      <Input
        label="Phone number (optional)"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
        placeholder="(555) 123-4567"
        hint="Used only if your agency needs to reach you."
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-forest-700">Preferred language</label>
        <Select
          value={formData.preferred_lang}
          onValueChange={(v) => setFormData((p) => ({ ...p, preferred_lang: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={!isDirty || saving}
          className="gap-2"
        >
          {saving ? (
            <><Loader2 className="size-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check className="size-4 text-green-400" /> Saved!</>
          ) : (
            "Save changes"
          )}
        </Button>
        {isDirty && !saving && (
          <button
            type="button"
            onClick={() => setFormData(initialData)}
            className="text-sm text-forest-400 hover:text-forest-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
