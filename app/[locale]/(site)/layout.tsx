import { notFound } from "next/navigation";
import { isLocale, locales } from "@/common/lib/i18n";
import { SiteNav } from "@/common/ui";
import { MarketingFooter } from "@/features/marketing";

type LocaleSiteLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default async function LocaleSiteLayout({
  children,
  params,
}: LocaleSiteLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <>
      <SiteNav />
      {children}
      <MarketingFooter />
    </>
  );
}
