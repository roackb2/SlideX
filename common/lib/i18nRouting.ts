import type { Metadata } from "next";
import { defaultLocale, isLocale, locales, type Locale } from "@/common/lib/i18n";

export const localizedSiteSegments = [
  "briefly",
  "docs",
  "studio"
] as const;

export type SitePageKey =
  | "briefly"
  | "home"
  | "docs"
  | "studio";

export type LocaleRouteParams = Promise<{ locale: string }>;

type PageMetadataCopy = {
  description: string;
  openGraphDescription?: string;
  openGraphTitle?: string;
  title: string;
};

export const sitePagePaths = {
  briefly: "/briefly",
  home: "/",
  docs: "/docs",
  studio: "/studio"
} satisfies Record<SitePageKey, string>;

const pageMetadata = {
  "zh-TW": {
    briefly: {
      title: "SlideX Briefly — 專案需求建構器",
      description: "建立結構化專案需求文件，即時預覽為精美文檔，並匯出為 MDX、HTML 或 PDF。",
    },
    home: {
      title: "SlideX — 動態簡報與專案文件平台",
      description: "用 MDX Slide 製作動態簡報，搭配 Briefly 建立專案文件，讓團隊更快對齊敘事、設計與輸出。",
    },
    docs: {
      title: "SlideX 資源中心 — 文件與教學",
      description: "SlideX 完整技術文件、使用教學與 API 參考。涵蓋 Studio 編輯器與 SwiftShip 範本系統。",
    },
    studio: {
      title: "SlideX Studio — 動態簡報編輯器",
      description: "用 MDX 語法撰寫投影片，即時預覽動效，並匯出高品質動態簡報。",
    }
  },
  en: {
    briefly: {
      title: "SlideX Briefly — Project Brief Builder",
      description: "Create structured project briefs, preview polished documents, and export to MDX, HTML, or PDF.",
    },
    home: {
      title: "SlideX — Motion Decks and Project Briefs",
      description: "Build motion presentations with MDX Slides and create project briefs that keep narrative, design, and delivery aligned.",
    },
    docs: {
      title: "SlideX Resources — Documentation and Guides",
      description: "Technical documentation, workflow guides, and API references for SlideX Studio and SwiftShip.",
    },
    studio: {
      title: "SlideX Studio — Motion Deck Editor",
      description: "Write slides in MDX, preview motion live, and export polished motion presentations.",
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

export function openGraphLocale(locale: Locale) {
  return locale === "zh-TW" ? "zh_TW" : "en_US";
}

export function buildSiteMetadata(page: SitePageKey, locale: Locale = defaultLocale): Metadata {
  const copy: PageMetadataCopy = pageMetadata[locale][page];
  const path = sitePagePaths[page];
  const canonical = localizePath(path, locale);
  const alternateLocale = locales.filter((item) => item !== locale).map(openGraphLocale);

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
      title: copy.openGraphTitle ?? copy.title,
      description: copy.openGraphDescription ?? copy.description,
      url: canonical,
      siteName: "SlideX",
      locale: openGraphLocale(locale),
      alternateLocale,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description
    }
  };
}
