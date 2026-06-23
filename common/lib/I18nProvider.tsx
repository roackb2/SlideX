"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  defaultLocale,
  dictionaries,
  isLocale,
  localeStorageKey,
  type Dictionary,
  type Locale
} from "@/common/lib/i18n";
import { localeFromPathname, localizePath, stripLocaleFromPath } from "@/common/lib/i18nRouting";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  localePath: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Derive locale from URL path first, then fallback to localStorage
  const urlLocale = localeFromPathname(pathname);

  const [locale, setLocaleState] = useState<Locale>(urlLocale ?? defaultLocale);
  const skipNextPersistRef = useRef(false);

  // Sync locale from URL on navigation
  useEffect(() => {
    const nextLocale = urlLocale ?? readStoredLocale();

    if (!nextLocale) {
      return;
    }

    setLocaleState((currentLocale) => {
      if (currentLocale === nextLocale) {
        return currentLocale;
      }

      skipNextPersistRef.current = true;
      return nextLocale;
    });
  }, [pathname, urlLocale]);

  // Persist to localStorage and update html lang
  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    persistLocale(locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    // Navigate to the same page but with the new locale prefix
    const currentPath = pathname;
    const basePath = stripLocaleFromPath(currentPath);
    const newPath = localizePath(basePath, nextLocale);
    persistLocale(nextLocale);
    setLocaleState(nextLocale);
    router.push(newPath);
  }, [pathname, router]);

  const localePath = useCallback((path: string) => {
    return localizePath(path, locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
      localePath,
    }),
    [locale, setLocale, localePath]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function readStoredLocale(): Locale | null {
  try {
    const storedLocale = window.localStorage.getItem(localeStorageKey);
    return isLocale(storedLocale) ? storedLocale : null;
  } catch {
    return null;
  }
}

function persistLocale(locale: Locale) {
  document.documentElement.lang = locale;

  try {
    window.localStorage.setItem(localeStorageKey, locale);
    document.cookie = `${localeStorageKey}=${locale};path=/;max-age=31536000;samesite=lax`;
  } catch {
    // Ignore storage failures and keep the in-memory locale active.
  }
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}
