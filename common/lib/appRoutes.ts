import { locales } from "@/common/lib/i18n";

export const appRoutes = {
  login: "/login",
  pitch: "/workspace/pitch",
  workspace: "/workspace"
} as const;

const marketingHomePaths = new Set<string>([
  "/",
  ...locales.map((locale) => `/${locale}`)
]);

export function isMarketingHomePath(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  return marketingHomePaths.has(normalizedPath);
}
