import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod/v4";

export const mcpOAuthScopes = ["presentations:read", "presentations:write"] as const;
export type McpOAuthScope = (typeof mcpOAuthScopes)[number];

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
  code_challenge: z.string().min(43).max(128),
  code_challenge_method: z.literal("S256"),
  redirect_uri: z.string(),
  resource: z.string().url(),
  response_type: z.literal("code"),
  scope: z.string().optional(),
  state: z.string().max(2048).optional()
});

export function createOAuthCredential(prefix: "slx_ac" | "slx_at" | "slx_rt") {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

export function hashOAuthCredential(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyPkceChallenge(verifier: string, expectedChallenge: string) {
  const actual = createHash("sha256").update(verifier).digest("base64url");
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expectedChallenge);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function normalizeMcpScopes(value: string | undefined): McpOAuthScope[] {
  const requested = value?.trim()
    ? [...new Set(value.trim().split(/\s+/))]
    : [...mcpOAuthScopes];

  if (requested.some((scope) => !mcpOAuthScopes.includes(scope as McpOAuthScope))) {
    throw new Error("invalid_scope");
  }

  if (requested.includes("presentations:write") && !requested.includes("presentations:read")) {
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
