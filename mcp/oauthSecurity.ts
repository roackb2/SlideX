import { createHash, createHmac, randomBytes } from "node:crypto";

import type { McpAuthorizationRequest } from "@/mcp/oauth";

export type McpOAuthRateLimitKind = "authorize" | "register" | "revoke" | "token";
export type McpOAuthRateLimitIdentity = "ip" | "client_ip";

export type McpOAuthRateLimitPolicy = {
  capacity: number;
  refillSeconds: number;
};

export const mcpOAuthRateLimitPolicies = {
  authorize: { capacity: 30, refillSeconds: 20 },
  register: { capacity: 10, refillSeconds: 360 },
  revoke: { capacity: 60, refillSeconds: 1 },
  token: { capacity: 60, refillSeconds: 1 }
} satisfies Record<McpOAuthRateLimitKind, McpOAuthRateLimitPolicy>;

const OAUTH_RATE_LIMIT_SECRET_BYTES = 32;
const OAUTH_AUDIT_SECRET_BYTES = 32;

export type McpOAuthSecurityEventType =
  | "refresh_replay"
  | "invalid_grant"
  | "invalid_grant_burst"
  | "pkce_failure"
  | "redirect_mismatch"
  | "rate_limit_triggered"
  | "rate_limit_burst"
  | "account_ip_anomaly"
  | "sensitive_environment_misconfiguration";

export type McpOAuthSecurityEventSeverity = "low" | "medium" | "high" | "critical";

type McpOAuthSecurityEventStore = {
  recordSecurityEvent(input: {
    clientHash?: string;
    errorCode?: string;
    eventType: McpOAuthSecurityEventType;
    grantHash?: string;
    ipHash?: string;
    requestId?: string;
    route: string;
    severity: McpOAuthSecurityEventSeverity;
    userHash?: string;
  }): Promise<void>;
};

export function createMcpConsentNonce() {
  return `slx_consent_${randomBytes(32).toString("base64url")}`;
}

export function hashMcpAuthorizationRequest(request: McpAuthorizationRequest) {
  return createHash("sha256")
    .update(JSON.stringify({
      clientId: request.client_id,
      codeChallenge: request.code_challenge,
      codeChallengeMethod: request.code_challenge_method,
      redirectUri: request.redirect_uri,
      resource: request.resource,
      responseType: request.response_type,
      scope: request.scope ?? "",
      state: request.state ?? ""
    }))
    .digest("hex");
}

export function readMcpOAuthRateLimitSecret(
  environment: Record<string, string | undefined> = process.env
) {
  const secret = environment.MCP_OAUTH_RATE_LIMIT_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < OAUTH_RATE_LIMIT_SECRET_BYTES) {
    throw new Error("MCP_OAUTH_RATE_LIMIT_SECRET must contain at least 32 bytes.");
  }
  return secret;
}

export function readMcpOAuthAuditSecret(
  environment: Record<string, string | undefined> = process.env
) {
  const secret = environment.MCP_OAUTH_AUDIT_HMAC_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < OAUTH_AUDIT_SECRET_BYTES) {
    throw new Error("MCP OAuth audit HMAC secret is not configured securely.");
  }
  return secret;
}

export function createMcpOAuthRateLimitBucket(input: {
  clientId?: string;
  headers: Headers;
  identity: McpOAuthRateLimitIdentity;
  kind: McpOAuthRateLimitKind;
  secret: string;
}) {
  if (Buffer.byteLength(input.secret, "utf8") < OAUTH_RATE_LIMIT_SECRET_BYTES) {
    throw new Error("MCP OAuth rate-limit secret is too short.");
  }

  const clientAddress = trustedClientAddress(input.headers);
  if (input.identity === "client_ip" && !input.clientId) {
    throw new Error("A verified OAuth client is required for this rate-limit bucket.");
  }
  return createHmac("sha256", input.secret)
    .update(
      `slidex:mcp:oauth-rate-limit:v2:${input.kind}:${input.identity}:${input.clientId ?? "-"}:${clientAddress}`
    )
    .digest("hex");
}

export function createMcpOAuthAuditIdentifier(value: string, secret: string) {
  if (Buffer.byteLength(secret, "utf8") < OAUTH_AUDIT_SECRET_BYTES) {
    throw new Error("MCP OAuth audit HMAC secret is too short.");
  }
  return createHmac("sha256", secret)
    .update(`slidex:mcp:oauth-audit:v1:${value}`)
    .digest("hex");
}

export async function recordMcpOAuthSecurityEvent(input: {
  clientId?: string;
  errorCode?: string;
  eventType: McpOAuthSecurityEventType;
  grantId?: string;
  headers: Headers;
  route: string;
  severity: McpOAuthSecurityEventSeverity;
  store: McpOAuthSecurityEventStore;
  userId?: string;
}) {
  try {
    const secret = readMcpOAuthAuditSecret();
    const clientAddress = trustedClientAddress(input.headers);
    await input.store.recordSecurityEvent({
      clientHash: input.clientId
        ? createMcpOAuthAuditIdentifier(input.clientId, secret)
        : undefined,
      errorCode: sanitizeSecurityErrorCode(input.errorCode),
      eventType: input.eventType,
      grantHash: input.grantId
        ? createMcpOAuthAuditIdentifier(input.grantId, secret)
        : undefined,
      ipHash: createMcpOAuthAuditIdentifier(clientAddress, secret),
      requestId: securityRequestId(input.headers),
      route: input.route,
      severity: input.severity,
      userHash: input.userId
        ? createMcpOAuthAuditIdentifier(input.userId, secret)
        : undefined
    });
    return true;
  } catch {
    return false;
  }
}

export function isSameOriginMcpConsentPost(originHeader: string | null, expectedOrigin: string) {
  if (!originHeader) return false;
  try {
    const expected = new URL(expectedOrigin).origin;
    const received = originHeader.split(",").map((value) => value.trim()).filter(Boolean);
    return received.length > 0 && received.every((value) => new URL(value).origin === expected);
  } catch {
    return false;
  }
}

export function applyOAuthSecurityHeaders<T extends Response>(
  response: T,
  options: { denyFraming?: boolean } = {}
) {
  response.headers.set("Cache-Control", "no-store, private");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  if (options.denyFraming) {
    response.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
    response.headers.set("X-Frame-Options", "DENY");
  }
  return response;
}

export function mcpOAuthRateLimitFailure(retryAfterSeconds: number) {
  return {
    body: { error: "temporarily_unavailable" },
    headers: {
      "Cache-Control": "no-store, private",
      "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds)))
    },
    status: 429
  } as const;
}

function trustedClientAddress(headers: Headers) {
  const value = headers.get("x-real-ip")?.trim();
  return value && /^[0-9a-f:.]{3,64}$/i.test(value) ? value : "unknown";
}

function securityRequestId(headers: Headers) {
  const value = headers.get("x-request-id")?.trim();
  return value && /^[A-Za-z0-9._:-]{1,128}$/.test(value) ? value : undefined;
}

function sanitizeSecurityErrorCode(value: string | undefined) {
  return value && /^[a-z0-9_]{1,64}$/.test(value) ? value : undefined;
}
