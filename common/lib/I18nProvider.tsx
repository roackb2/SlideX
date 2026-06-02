"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  defaultLocale,
  dictionaries,
  isLocale,
  localeStorageKey,
  type Dictionary,
  type Locale
} from "@/common/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function browserLocale() {
  if (typeof navigator === "undefined") {
    return defaultLocale;
  }

  return navigator.language.toLowerCase().startsWith("zh") ? "zh-TW" : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem(localeStorageKey);
      setLocaleState(isLocale(storedLocale) ? storedLocale : browserLocale());
    } catch {
      setLocaleState(browserLocale());
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(localeStorageKey, locale);
    } catch {
      // Ignore storage failures and keep the in-memory locale active.
    }
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale]
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}
