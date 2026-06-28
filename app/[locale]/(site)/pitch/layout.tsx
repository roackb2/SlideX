import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("pitch", await localeFromParams(params));
}

export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
