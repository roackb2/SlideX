import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod/v4";

export const mcpOAuthScopes = [
  "presentations:read",
  "presentations:write",
  "presentation-assets:write"
] as const;
export type McpOAuthScope = (typeof mcpOAuthScopes)[number];

const defaultMcpOAuthScopes: McpOAuthScope[] = [
  "presentations:read",
  "presentations:write"
];

const pkceCodeVerifierPattern = /^[A-Za-z0-9\-._~]{43,128}$/;
const pkceS256ChallengePattern = /^[A-Za-z0-9_-]{43}$/;

export const mcpClientRegistrationSchema = z.object({
  client_name: z.string().trim().min(1).max(160).default("MCP client"),
  grant_types: z
    .array(z.enum(["authorization_code", "refresh_token"]))
    .min(1)
    .default(["authorization_code", "refresh_token"]),
  redirect_uris: z.array(z.string()).min(1).max(10),
  response_types: z.array(z.literal("code")).min(1).default(["code"]),
  token_endpoint_auth_method: z.literal("none").default("none")
}).refine((client) => client.grant_types.includes("authorization_code"), {
  message: "authorization_code is required",
  path: ["grant_types"]
});

export const mcpAuthorizationRequestSchema = z.object({
  client_id: z.string().min(1),
  code_challenge: z.string().regex(pkceS256ChallengePattern),
  code_challenge_method: z.literal("S256"),
  redirect_uri: z.string(),
  resource: z.string().url().transform(canonicalizeMcpResource),
  response_type: z.literal("code"),
  scope: z.string().optional(),
  state: z.string().max(2048).optional()
});
export type McpAuthorizationRequest = z.infer<typeof mcpAuthorizationRequestSchema>;

export function canonicalizeMcpResource(value: string) {
  const resource = new URL(value);
  if (resource.pathname === "/mcp/") resource.pathname = "/mcp";
  return resource.toString();
}

export function mcpResourcesMatch(left: string, right: string) {
  try {
    return canonicalizeMcpResource(left) === canonicalizeMcpResource(right);
  } catch {
    return false;
  }
}

export function resolveMcpResourceTarget(value: string, expectedResource: string) {
  return mcpResourcesMatch(value, expectedResource)
    ? canonicalizeMcpResource(value)
    : undefined;
}

export type McpTokenResourceResolution =
  | { resource: string }
  | { error: "invalid_request" | "invalid_target" };

export function resolveMcpTokenRequestResource(input: {
  expectedResource: string;
  grantType: string;
  resource?: string;
}): McpTokenResourceResolution {
  if (!input.resource) {
    // rmcp 1.8 omits `resource` while refreshing. Bind that compatibility
    // path to this server's canonical audience; the rotation RPC still checks
    // that the stored refresh credential was issued for the same audience.
    return input.grantType === "refresh_token"
      ? { resource: canonicalizeMcpResource(input.expectedResource) }
      : { error: "invalid_request" };
  }

  const resource = resolveMcpResourceTarget(input.resource, input.expectedResource);
  return resource ? { resource } : { error: "invalid_target" };
}

export function createOAuthCredential(prefix: "slx_ac" | "slx_at" | "slx_rt") {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

export function hashOAuthCredential(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyPkceChallenge(verifier: string, expectedChallenge: string) {
  if (!isValidPkceCodeVerifier(verifier) || !pkceS256ChallengePattern.test(expectedChallenge)) {
    return false;
  }
  const actual = createPkceS256Challenge(verifier);
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expectedChallenge);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function isValidPkceCodeVerifier(value: string) {
  return pkceCodeVerifierPattern.test(value);
}

export function createPkceS256Challenge(verifier: string) {
  if (!isValidPkceCodeVerifier(verifier)) throw new Error("invalid_grant");
  return createHash("sha256").update(verifier).digest("base64url");
}

export function normalizeMcpScopes(value: string | undefined): McpOAuthScope[] {
  const requested = value?.trim()
    ? [...new Set(value.trim().split(/\s+/))]
    : [...defaultMcpOAuthScopes];

  if (requested.some((scope) => !mcpOAuthScopes.includes(scope as McpOAuthScope))) {
    throw new Error("invalid_scope");
  }

  if (requested.includes("presentations:write") && !requested.includes("presentations:read")) {
    throw new Error("invalid_scope");
  }

  if (
    requested.includes("presentation-assets:write") &&
    !requested.includes("presentations:read")
  ) {
    throw new Error("invalid_scope");
  }

  return requested as McpOAuthScope[];
}

export function validateMcpRedirectUri(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("invalid_redirect_uri");
  }

  const isLoopback = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname);
  if (
    url.hash ||
    url.username ||
    url.password ||
    (url.protocol !== "https:" && !(url.protocol === "http:" && isLoopback))
  ) {
    throw new Error("invalid_redirect_uri");
  }

  return url.toString();
}

export function isExactMcpRedirectUri(requestedUri: string, registeredUris: readonly string[]) {
  return registeredUris.some((registeredUri) => registeredUri === requestedUri);
}

export function appendOAuthRedirectParams(
  redirectUri: string,
  params: Record<string, string | undefined>
) {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, value);
  }
  return url;
}
