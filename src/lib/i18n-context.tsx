"use client";

import * as React from "react";
import { t, getLangFromCookie, setLangCookie } from "@/lib/i18n";
import type { Lang, TranslationKey } from "@/lib/i18n";

interface TranslationContext {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = React.createContext<TranslationContext>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({
  children,
  initialLang = "en",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = React.useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return getLangFromCookie() ?? initialLang;
    }
    return initialLang;
  });

  function setLang(newLang: Lang) {
    setLangState(newLang);
    setLangCookie(newLang);
    // Reload to rehydrate server-rendered strings
    window.location.reload();
  }

  const translate = React.useCallback((key: TranslationKey) => t(key, lang), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translate }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return React.useContext(I18nContext);
}
