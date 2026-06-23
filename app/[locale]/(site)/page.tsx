import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";
import { HomePage } from "@/features/marketing";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("home", await localeFromParams(params));
}

export default function Home() {
  return <HomePage />;
}
