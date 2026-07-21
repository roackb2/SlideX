import { buildSiteMetadata, localeFromParams, type LocaleRouteParams } from "@/common/lib/i18nRouting";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: LocaleRouteParams }) {
  return buildSiteMetadata("docs", await localeFromParams(params));
}

export default async function McpServerRoutePage({ params }: { params: LocaleRouteParams }) {
  const locale = await localeFromParams(params);
  redirect(`/${locale}/docs#mcp-server`);
}
