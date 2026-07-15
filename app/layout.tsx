import type { Metadata } from "next";
import localFont from "next/font/local";
import { I18nProvider } from "@/common/lib/I18nProvider";
import { defaultLocale, dictionaries } from "@/common/lib/i18n";
import { AuthenticatedHomeRedirect } from "@/features/auth";
import "./globals.css";

const geistSans = localFont({
  display: "swap",
  preload: false,
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900"
});

const defaultMetadata = dictionaries[defaultLocale].metadata;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : undefined;
const ogImage = {
  alt: "SlideX motion deck editor preview",
  height: 630,
  type: "image/png",
  url: "/og-image.png",
  width: 1200
};

export const metadata: Metadata = {
  title: {
    default: "SlideX Pitch - Focused presentations",
    template: "%s | SlideX",
  },
  description: defaultMetadata.description,
  applicationName: "SlideX",
  metadataBase: siteUrl,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "SlideX Pitch - Focused presentations",
    description: defaultMetadata.description,
    url: "/",
    siteName: "SlideX",
    images: [ogImage],
    locale: "en_US",
    alternateLocale: ["zh_TW"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SlideX Pitch - Focused presentations",
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
    <html lang="en" suppressHydrationWarning translate="no" className={geistSans.variable}>
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
