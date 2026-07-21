import { AgentPage } from "@/features/marketing";
import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("agent", await localeFromParams(params));
}

export default function AgentRoutePage() {
  return <AgentPage />;
}
