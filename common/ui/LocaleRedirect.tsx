"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale, isLocale, localeStorageKey, type Locale } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/i18nRouting";

type LocaleRedirectProps = {
  targetPath: string;
};

export function LocaleRedirect({ targetPath }: LocaleRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(localizePath(targetPath, preferredLocale()));
  }, [router, targetPath]);

  return null;
}

function preferredLocale(): Locale {
  try {
    const storedLocale = window.localStorage.getItem(localeStorageKey);

    if (isLocale(storedLocale)) {
      return storedLocale;
    }
  } catch {
    // Keep the default locale when browser storage is unavailable.
  }

  return defaultLocale;
}
