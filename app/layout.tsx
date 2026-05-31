import type { Metadata } from "next";
import { I18nProvider } from "@/components/I18nProvider";
import { defaultLocale, dictionaries } from "@/lib/i18n";
import "./globals.css";

const defaultMetadata = dictionaries[defaultLocale].metadata;

export const metadata: Metadata = {
  title: defaultMetadata.title,
  description: defaultMetadata.description,
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
    <html lang="zh-TW" suppressHydrationWarning translate="no">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
