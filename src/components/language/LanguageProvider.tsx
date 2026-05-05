"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LANGUAGE,
  getMessage,
  isSupportedLanguage,
  LANGUAGE_STORAGE_KEY,
  type SupportedLanguageCode,
  type TranslationKey,
} from "@/lib/i18n";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
] as const;

type LanguageContextValue = {
  selectedLanguageCode: SupportedLanguageCode;
  setSelectedLanguageCode: (code: SupportedLanguageCode) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [selectedLanguageCode, setSelectedLanguageCode] =
    useState<SupportedLanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const storedCode = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!isSupportedLanguage(storedCode) || storedCode === DEFAULT_LANGUAGE) {
      return;
    }

    // Delay state sync until after hydration to avoid server/client text mismatch.
    window.requestAnimationFrame(() => {
      setSelectedLanguageCode(storedCode);
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguageCode);
    document.documentElement.lang = selectedLanguageCode;
  }, [selectedLanguageCode]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      selectedLanguageCode,
      setSelectedLanguageCode,
      t: (key: TranslationKey) => getMessage(selectedLanguageCode, key),
    }),
    [selectedLanguageCode],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }

  return context;
}
