"use client";

import * as React from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n-context";
import { createClient } from "@/lib/supabase/client";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English",  nativeLabel: "English" },
  { code: "ne", label: "Nepali",   nativeLabel: "नेपाली" },
  { code: "hi", label: "Hindi",    nativeLabel: "हिन्दी" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSelect(newLang: Lang) {
    if (newLang === lang) { setOpen(false); return; }
    setSaving(true);
    // Persist to profile
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ preferred_lang: newLang }).eq("id", user.id);
    }
    setSaving(false);
    setOpen(false);
    setLang(newLang); // triggers cookie + reload
  }

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={saving}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        aria-label="Change language"
      >
        <Globe className="size-4 shrink-0" />
        {!compact && (
          <span className="font-medium">
            {current.nativeLabel}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[140px] rounded-xl border border-gray-200 bg-white shadow-lg py-1 overflow-hidden">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
            >
              <span className={lang === l.code ? "font-semibold text-forest-700" : "text-gray-700"}>
                {l.nativeLabel}
              </span>
              {lang === l.code && <Check className="size-3.5 text-forest-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
