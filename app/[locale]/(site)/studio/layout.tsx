import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("studio", await localeFromParams(params));
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
