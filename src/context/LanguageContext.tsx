import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_KEY = "bumblebee_language";

/** The saved choice wins; onboarding's language is only a first-visit default. */
function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "ar") return saved;
    const onboarding = JSON.parse(localStorage.getItem("bumblebee_onboarding") || "null");
    if (onboarding?.language === "en" || onboarding?.language === "ar") return onboarding.language;
  } catch {
    // storage blocked — fall through
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Read synchronously so a reload never flashes English before switching back.
  const [lang, setLangState] = useState<Language>(initialLanguage);

  const setLang = (next: Language) => {
    setLangState(next);
    try { localStorage.setItem(LANG_KEY, next); } catch { /* storage blocked */ }
  };

  const isRtl = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
