import { BlogPage } from "@/features/marketing";
import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("blog", await localeFromParams(params));
}

export default function BlogRoutePage() {
  return <BlogPage />;
}
