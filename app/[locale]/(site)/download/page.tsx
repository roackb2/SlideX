import { DownloadPage } from "@/features/marketing";
import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("download", await localeFromParams(params));
}

export default function DownloadRoutePage() {
  return <DownloadPage />;
}
