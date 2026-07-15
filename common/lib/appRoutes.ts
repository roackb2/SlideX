import { locales } from "@/common/lib/i18n";

export const appRoutes = {
  authCallback: "/auth/callback/",
  exampleDeck: "/workspace/pitch?demo=1&view=preview",
  liveDemo: "/workspace/pitch?demo=1",
  login: "/login",
  pitch: "/workspace/pitch",
  workspace: "/workspace"
} as const;

export function loginPath(nextPath?: string) {
  if (!nextPath) return appRoutes.login;
  return `${appRoutes.login}?next=${encodeURIComponent(nextPath)}`;
}

const marketingHomePaths = new Set<string>([
  "/",
  ...locales.map((locale) => `/${locale}`)
]);

export function isMarketingHomePath(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  return marketingHomePaths.has(normalizedPath);
}
