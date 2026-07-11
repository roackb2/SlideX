import { PricingPage } from "@/features/marketing";
import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("pricing", await localeFromParams(params));
}

export default function PricingRoutePage() {
  return <PricingPage />;
}
