import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("docs", await localeFromParams(params));
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
