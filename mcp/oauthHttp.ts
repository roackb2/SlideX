type McpBearerChallengeOptions = {
  error?: "insufficient_scope" | "invalid_token";
  resourceMetadataUrl: string;
  scopes?: string[];
};

export type McpAuthorizationFailureKind =
  | "insufficient_scope"
  | "invalid_token"
  | "missing_token";

export type McpBearerAuthorization =
  | { kind: "invalid" | "missing" }
  | { kind: "token"; token: string };

export function parseMcpBearerAuthorization(
  authorizationHeader: string | null
): McpBearerAuthorization {
  if (!authorizationHeader) return { kind: "missing" };
  const normalizedHeader = authorizationHeader.trim();
  if (!/^Bearer(?:\s|$)/i.test(normalizedHeader)) return { kind: "missing" };

  const match = normalizedHeader.match(/^Bearer\s+([^\s,]+)$/i);
  return match?.[1]
    ? { kind: "token", token: match[1] }
    : { kind: "invalid" };
}

export function createMcpAuthorizationFailure(
  kind: McpAuthorizationFailureKind,
  resourceMetadataUrl: string,
  scopes: string[] = []
) {
  const insufficientScope = kind === "insufficient_scope";
  const invalidToken = kind === "invalid_token";

  return {
    body: {
      error: insufficientScope
        ? "insufficient_scope"
        : invalidToken
          ? "invalid_token"
          : "unauthorized"
    },
    headers: {
      "Cache-Control": "no-store, private",
      "WWW-Authenticate": mcpBearerChallenge({
        error: insufficientScope
          ? "insufficient_scope"
          : invalidToken
            ? "invalid_token"
            : undefined,
        resourceMetadataUrl,
        scopes: insufficientScope ? scopes : undefined
      })
    },
    status: insufficientScope ? 403 : 401
  } as const;
}

export function applyMcpTransportSecurityHeaders<T extends Response>(response: T) {
  response.headers.set("Cache-Control", "no-store, private");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export function mcpBearerChallenge({
  error,
  resourceMetadataUrl,
  scopes
}: McpBearerChallengeOptions) {
  const parameters = [
    error ? `error="${error}"` : undefined,
    scopes?.length ? `scope="${scopes.join(" ")}"` : undefined,
    `resource_metadata="${resourceMetadataUrl}"`
  ].filter((value): value is string => Boolean(value));

  return `Bearer ${parameters.join(", ")}`;
}
