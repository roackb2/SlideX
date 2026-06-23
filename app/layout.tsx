import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { IBM_Plex_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { I18nProvider } from "@/common/lib/I18nProvider";
import { defaultLocale, dictionaries } from "@/common/lib/i18n";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-ibm",
  display: "swap",
});

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
    default: "SlideX — 專案管理與協作平台 | Project Management Platform",
    template: "%s | SlideX",
  },
  description: defaultMetadata.description,
  applicationName: "SlideX",
  metadataBase: siteUrl,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "SlideX — 專案管理與協作平台",
    description: defaultMetadata.description,
    url: "/",
    siteName: "SlideX",
    images: [ogImage],
    locale: "zh_TW",
    alternateLocale: ["en_US"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SlideX — 專案管理與協作平台",
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
    <html lang="zh-TW" suppressHydrationWarning translate="no" className={`${GeistSans.variable} ${jetbrainsMono.variable} ${ibmPlexSans.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@300..700&family=Fira+Sans:wght@300..700&family=Fraunces:opsz,wght@9..144,300..900&family=Inter:wght@300..900&family=Lato:ital,wght@0,300..700;1,300..700&family=Lora:ital,wght@0,400..700;1,400..700&family=Merriweather:ital,wght@0,300..900;1,300..900&family=Montserrat:ital,wght@0,300..900;1,300..900&family=Noto+Sans+TC:wght@100..900&family=Noto+Serif+TC:wght@200..900&family=Nunito:ital,wght@0,300..900;1,300..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@300..900&family=Oswald:wght@300..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Poppins:ital,wght@0,300..900;1,300..900&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Raleway:ital,wght@0,300..900;1,300..900&family=Rubik:ital,wght@0,300..900;1,300..900&family=Space+Grotesk:wght@300..700&family=Ubuntu:ital,wght@0,300..700;1,300..700&family=Work+Sans:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
