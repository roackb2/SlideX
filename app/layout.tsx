import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { I18nProvider } from "@/common/lib/I18nProvider";
import { defaultLocale, dictionaries } from "@/common/lib/i18n";
import "./globals.css";

const defaultMetadata = dictionaries[defaultLocale].metadata;
const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://slide-x-psi.vercel.app/");
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
    <html lang="en" suppressHydrationWarning translate="no" className={GeistSans.variable}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
