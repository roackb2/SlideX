import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("briefly", await localeFromParams(params));
}

export default function BrieflyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
