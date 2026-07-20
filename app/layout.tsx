import type { Metadata } from "next";
import localFont from "next/font/local";
import { I18nProvider } from "@/common/lib/I18nProvider";
import { defaultLocale, dictionaries } from "@/common/lib/i18n";
import { resolveSiteOrigin } from "@/common/lib/siteUrl";
import { AuthenticatedHomeRedirect } from "@/features/auth";
import "./globals.css";

const geistSans = localFont({
  display: "swap",
  preload: false,
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900"
});

const geistMono = localFont({
  display: "swap",
  preload: false,
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900"
});

const defaultMetadata = dictionaries[defaultLocale].metadata;
const defaultTitle = defaultLocale === "zh-TW"
  ? "SlideX Pitch - 專注的簡報工作區"
  : "SlideX Pitch - Focused presentations";
const defaultOpenGraphLocale = defaultLocale === "zh-TW" ? "zh_TW" : "en_US";
const alternateOpenGraphLocale = defaultLocale === "zh-TW" ? "en_US" : "zh_TW";
const siteUrl = new URL(resolveSiteOrigin());
const ogImage = {
  alt: "SlideX motion deck editor preview",
  height: 630,
  type: "image/png",
  url: "/og-image.png",
  width: 1200
};

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: "%s | SlideX",
  },
  description: defaultMetadata.description,
  applicationName: "SlideX",
  metadataBase: siteUrl,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: defaultTitle,
    description: defaultMetadata.description,
    url: "/",
    siteName: "SlideX",
    images: [ogImage],
    locale: defaultOpenGraphLocale,
    alternateLocale: [alternateOpenGraphLocale],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultMetadata.description,
    images: [
      {
        alt: ogImage.alt,
        url: ogImage.url
      }
    ]
  },
  other: {
    google: "notranslate"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning translate="no" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="antialiased">
        <I18nProvider>
          <AuthenticatedHomeRedirect>{children}</AuthenticatedHomeRedirect>
        </I18nProvider>
      </body>
    </html>
  );
}
