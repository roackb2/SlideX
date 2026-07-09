"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/i18nRouting";

type LocaleRedirectProps = {
  targetPath: string;
};

export function LocaleRedirect({ targetPath }: LocaleRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(localizePath(targetPath, defaultLocale));
  }, [router, targetPath]);

  return null;
}
