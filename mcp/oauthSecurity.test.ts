import assert from "node:assert/strict";
import test from "node:test";

import {
  applyOAuthSecurityHeaders,
  createMcpConsentNonce,
  createMcpOAuthAuditIdentifier,
  createMcpOAuthRateLimitBucket,
  hashMcpAuthorizationRequest,
  isSameOriginMcpConsentPost,
  mcpOAuthRateLimitFailure,
  recordMcpOAuthSecurityEvent,
  readMcpOAuthAuditSecret,
  readMcpOAuthRateLimitSecret
} from "@/mcp/oauthSecurity";

const authorizationRequest = {
  client_id: "client-id",
  code_challenge: "a".repeat(43),
  code_challenge_method: "S256" as const,
  redirect_uri: "https://client.example/callback",
  resource: "https://slidexdeck.com/mcp",
  response_type: "code" as const,
  scope: "presentations:read",
  state: "opaque-state"
};

test("MCP consent nonces and request hashes bind the complete authorization request", () => {
  assert.match(createMcpConsentNonce(), /^slx_consent_[A-Za-z0-9_-]{43}$/);
  const fingerprint = hashMcpAuthorizationRequest(authorizationRequest);
  assert.match(fingerprint, /^[a-f0-9]{64}$/);
  assert.notEqual(
    fingerprint,
    hashMcpAuthorizationRequest({ ...authorizationRequest, scope: "presentations:read presentations:write" })
  );
  assert.notEqual(
    fingerprint,
    hashMcpAuthorizationRequest({ ...authorizationRequest, state: "changed" })
  );
});

test("MCP OAuth rate-limit buckets hide the trusted Railway client address", () => {
  const headers = new Headers({ "x-real-ip": "203.0.113.42" });
  const secret = "s".repeat(32);
  const bucket = createMcpOAuthRateLimitBucket({
    clientId: "client-id",
    headers,
    identity: "client_ip",
    kind: "token",
    secret
  });

  assert.match(bucket, /^[a-f0-9]{64}$/);
  assert.equal(bucket.includes("203.0.113.42"), false);
  assert.notEqual(
    bucket,
    createMcpOAuthRateLimitBucket({
      clientId: "other-client",
      headers,
      identity: "client_ip",
      kind: "token",
      secret
    })
  );
  assert.throws(
    () => createMcpOAuthRateLimitBucket({
      headers,
      identity: "ip",
      kind: "register",
      secret: "short"
    }),
    /too short/
  );
  assert.equal(readMcpOAuthRateLimitSecret({ MCP_OAUTH_RATE_LIMIT_SECRET: secret }), secret);
  assert.notEqual(
    bucket,
    createMcpOAuthRateLimitBucket({
      headers,
      identity: "ip",
      kind: "token",
      secret
    })
  );
});

test("OAuth security events persist only HMAC identifiers and fail closed without leaking", async () => {
  const previousSecret = process.env.MCP_OAUTH_AUDIT_HMAC_SECRET;
  const auditSecret = "a".repeat(32);
  process.env.MCP_OAUTH_AUDIT_HMAC_SECRET = auditSecret;
  const rawClient = "client-id";
  const rawUser = "user-id";
  const rawGrant = "grant-id";
  const rawIp = "203.0.113.19";
  let recorded: Record<string, unknown> | undefined;

  try {
    assert.equal(readMcpOAuthAuditSecret({ MCP_OAUTH_AUDIT_HMAC_SECRET: auditSecret }), auditSecret);
    assert.match(createMcpOAuthAuditIdentifier(rawClient, auditSecret), /^[a-f0-9]{64}$/);
    const success = await recordMcpOAuthSecurityEvent({
      clientId: rawClient,
      errorCode: "invalid_grant",
      eventType: "refresh_replay",
      grantId: rawGrant,
      headers: new Headers({
        "x-real-ip": rawIp,
        "x-request-id": "request-123"
      }),
      route: "/api/mcp/oauth/token",
      severity: "high",
      store: {
        async recordSecurityEvent(input) {
          recorded = input;
        }
      },
      userId: rawUser
    });

    assert.equal(success, true);
    assert.ok(recorded);
    const serialized = JSON.stringify(recorded);
    assert.equal(serialized.includes(rawClient), false);
    assert.equal(serialized.includes(rawUser), false);
    assert.equal(serialized.includes(rawGrant), false);
    assert.equal(serialized.includes(rawIp), false);
    assert.equal(serialized.includes("token"), true);

    const writeFailure = await recordMcpOAuthSecurityEvent({
      eventType: "invalid_grant",
      headers: new Headers({ "x-real-ip": rawIp }),
      route: "/api/mcp/oauth/token",
      severity: "medium",
      store: {
        async recordSecurityEvent() {
          throw new Error("database unavailable");
        }
      }
    });
    assert.equal(writeFailure, false);
  } finally {
    if (previousSecret === undefined) delete process.env.MCP_OAUTH_AUDIT_HMAC_SECRET;
    else process.env.MCP_OAUTH_AUDIT_HMAC_SECRET = previousSecret;
  }
});

test("MCP consent POST requires the exact request origin", () => {
  assert.equal(
    isSameOriginMcpConsentPost("https://slidexdeck.com", "https://slidexdeck.com"),
    true
  );
  assert.equal(
    isSameOriginMcpConsentPost("https://evil.example", "https://slidexdeck.com"),
    false
  );
  assert.equal(
    isSameOriginMcpConsentPost(
      "https://slidexdeck.com, https://slidexdeck.com",
      "https://slidexdeck.com"
    ),
    false
  );
  assert.equal(
    isSameOriginMcpConsentPost(
      "https://slidexdeck.com, https://evil.example",
      "https://slidexdeck.com"
    ),
    false
  );
  assert.equal(isSameOriginMcpConsentPost("null", "https://slidexdeck.com"), false);
  assert.equal(isSameOriginMcpConsentPost(null, "https://slidexdeck.com"), false);
});

test("OAuth security responses are non-cacheable and frame protected when requested", () => {
  const response = applyOAuthSecurityHeaders(new Response(null), { denyFraming: true });
  assert.equal(response.headers.get("cache-control"), "no-store, private");
  assert.equal(response.headers.get("pragma"), "no-cache");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("content-security-policy"), "frame-ancestors 'none'");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.deepEqual(mcpOAuthRateLimitFailure(2.1), {
    body: { error: "temporarily_unavailable" },
    headers: { "Cache-Control": "no-store, private", "Retry-After": "3" },
    status: 429
  });
});
