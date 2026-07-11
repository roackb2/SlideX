import { LegalPage } from "@/features/marketing";
import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("privacy", await localeFromParams(params));
}

export default function PrivacyRoutePage() {
  return <LegalPage kind="privacy" />;
}
