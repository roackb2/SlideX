import type { Metadata } from "next";
import { defaultLocale, isLocale, locales, type Locale } from "@/common/lib/i18n";

export const localizedSiteSegments = ["blog", "docs", "download", "pitch", "pricing", "privacy", "terms"] as const;

export type SitePageKey = "blog" | "docs" | "download" | "home" | "pitch" | "pricing" | "privacy" | "terms";

export type LocaleRouteParams = Promise<{ locale: string }>;

type PageMetadataCopy = {
  description: string;
  title: string;
};

export const sitePagePaths = {
  home: "/",
  pitch: "/pitch",
  download: "/download",
  pricing: "/pricing",
  docs: "/docs",
  blog: "/blog",
  terms: "/terms",
  privacy: "/privacy"
} satisfies Record<SitePageKey, string>;

const pageMetadata = {
  "zh-TW": {
    home: {
      title: "SlideX Pitch - 專注的簡報工作區",
      description: "用精確畫布、單色 Fill 與克制動態製作清楚的簡報。"
    },
    pitch: {
      title: "SlideX Pitch - 單色簡報編輯器",
      description: "用單色 Fill、精確畫布與動態節奏完成可持續修改的簡報。"
    },
    download: {
      title: "下載 SlideX Pitch",
      description: "Pitch 的網頁工作區現在可用，Mac 版正在開發中。"
    },
    pricing: {
      title: "SlideX Pitch 定價",
      description: "Pitch 目前免費使用。任何未來付費功能都會在收費前清楚說明。"
    },
    docs: {
      title: "SlideX Pitch 文件",
      description: "快速了解 Pitch 的畫布、單色 Fill、動態背景與 SlideX MCP Server。"
    },
    blog: {
      title: "SlideX Journal",
      description: "SlideX Pitch 的產品近況與設計筆記。"
    },
    terms: {
      title: "SlideX 使用條款",
      description: "SlideX Pitch 使用條款。"
    },
    privacy: {
      title: "SlideX 隱私權政策",
      description: "SlideX Pitch 如何處理與保護個人資料。"
    }
  },
  en: {
    home: {
      title: "SlideX Pitch - A focused presentation workspace",
      description: "Build clear presentations with a precise canvas, solid fills, and restrained motion."
    },
    pitch: {
      title: "SlideX Pitch - Solid color presentation editor",
      description: "Build editable presentations with solid fills, a precise canvas, and focused motion."
    },
    download: {
      title: "Download SlideX Pitch",
      description: "The Pitch web workspace is available now. Pitch for Mac is in progress."
    },
    pricing: {
      title: "SlideX Pitch Pricing",
      description: "Pitch is free to use today. Any future paid functionality will be explained before it is available."
    },
    docs: {
      title: "SlideX Pitch Documentation",
      description: "Learn the Pitch canvas, solid fill, motion background, and SlideX MCP Server workflow."
    },
    blog: {
      title: "SlideX Journal",
      description: "Product updates and design notes from SlideX Pitch."
    },
    terms: {
      title: "SlideX Terms of Use",
      description: "Terms governing use of SlideX Pitch."
    },
    privacy: {
      title: "SlideX Privacy Policy",
      description: "How SlideX Pitch handles and protects personal information."
    }
  }
} satisfies Record<Locale, Record<SitePageKey, PageMetadataCopy>>;

export function localeFromPathname(pathname: string): Locale | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : null;
}

export async function localeFromParams(params: LocaleRouteParams): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : defaultLocale;
}

export function stripLocaleFromPath(pathname: string): string {
  const locale = localeFromPathname(pathname);

  if (!locale) {
    return pathname || "/";
  }

  const stripped = pathname.replace(`/${locale}`, "");
  return stripped || "/";
}

export function isLocalizedSitePath(pathname: string) {
  const pathWithoutLocale = stripLocaleFromPath(pathname);

  if (pathWithoutLocale === "/") {
    return true;
  }

  const firstSegment = pathWithoutLocale.split("/").filter(Boolean)[0];
  return localizedSiteSegments.some((segment) => segment === firstSegment);
}

export function localizePath(path: string, locale: Locale) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return path;
  }

  const [, pathname = "/", search = "", hash = ""] = path.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/) ?? [];
  const pathWithoutLocale = stripLocaleFromPath(pathname);

  if (!isLocalizedSitePath(pathWithoutLocale)) {
    return `${pathWithoutLocale}${search}${hash}`;
  }

  const localizedPath = pathWithoutLocale === "/" ? `/${locale}` : `/${locale}${pathWithoutLocale}`;
  return `${localizedPath}${search}${hash}`;
}

export function localizedLanguages(path: string) {
  return Object.fromEntries(locales.map((locale) => [locale, localizePath(path, locale)]));
}

function openGraphLocale(locale: Locale) {
  return locale === "zh-TW" ? "zh_TW" : "en_US";
}

export function buildSiteMetadata(page: SitePageKey, locale: Locale = defaultLocale): Metadata {
  const copy = pageMetadata[locale][page];
  const path = sitePagePaths[page];
  const canonical = localizePath(path, locale);

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        ...localizedLanguages(path),
        "x-default": localizePath(path, defaultLocale)
      }
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonical,
      siteName: "SlideX",
      locale: openGraphLocale(locale),
      alternateLocale: locales.filter((item) => item !== locale).map(openGraphLocale),
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description
    }
  };
}
