const DEFAULT_DEVELOPMENT_SITE_ORIGIN = "http://localhost:3000";
const DEFAULT_PRODUCTION_SITE_ORIGIN = "https://slidexdeck.com";

type SiteUrlEnvironment = {
  NEXT_PUBLIC_SITE_URL?: string;
  NODE_ENV?: string;
  SITE_URL?: string;
};

type RequestUrlContext = {
  headers: Headers;
  nextUrl: URL;
};

export function resolveSiteOrigin(
  environment: SiteUrlEnvironment = process.env
) {
  const configuredOrigin = parseHttpOrigin(
    environment.SITE_URL ?? environment.NEXT_PUBLIC_SITE_URL
  );

  if (
    configuredOrigin &&
    (environment.NODE_ENV !== "production" || !isLoopbackOrigin(configuredOrigin))
  ) {
    return configuredOrigin;
  }

  return environment.NODE_ENV === "production"
    ? DEFAULT_PRODUCTION_SITE_ORIGIN
    : DEFAULT_DEVELOPMENT_SITE_ORIGIN;
}

export function resolveRequestOrigin(
  request: RequestUrlContext,
  environment: SiteUrlEnvironment = process.env
) {
  const configuredOrigin = parseHttpOrigin(
    environment.SITE_URL ?? environment.NEXT_PUBLIC_SITE_URL
  );

  // Railway's request URL may contain its internal localhost:8080 listener.
  // Production redirects must never expose that origin or trust a forwarded
  // host supplied by an untrusted request.
  if (environment.NODE_ENV === "production") {
    return configuredOrigin && !isLoopbackOrigin(configuredOrigin)
      ? configuredOrigin
      : DEFAULT_PRODUCTION_SITE_ORIGIN;
  }

  return forwardedRequestOrigin(request) ??
    parseHttpOrigin(request.nextUrl.origin) ??
    configuredOrigin ??
    DEFAULT_DEVELOPMENT_SITE_ORIGIN;
}

export function appUrl(
  request: RequestUrlContext,
  path: string,
  environment: SiteUrlEnvironment = process.env
) {
  return new URL(path, `${resolveRequestOrigin(request, environment)}/`);
}

function forwardedRequestOrigin(request: RequestUrlContext) {
  const host = firstForwardedValue(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  );
  if (!host) return undefined;

  const protocol = firstForwardedValue(request.headers.get("x-forwarded-proto")) ??
    request.nextUrl.protocol.replace(/:$/, "");
  if (protocol !== "http" && protocol !== "https") return undefined;

  const origin = parseHttpOrigin(`${protocol}://${host}`);
  if (!origin) return undefined;

  return new URL(origin).host === host ? origin : undefined;
}

function firstForwardedValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || undefined;
}

function parseHttpOrigin(value: string | undefined) {
  if (!value) return undefined;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

function isLoopbackOrigin(origin: string) {
  const hostname = new URL(origin).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}
