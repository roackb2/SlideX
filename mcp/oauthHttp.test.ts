import assert from "node:assert/strict";
import test from "node:test";

import {
  createMcpAuthorizationFailure,
  applyMcpTransportSecurityHeaders,
  mcpBearerChallenge,
  parseMcpBearerAuthorization
} from "@/mcp/oauthHttp";

const resourceMetadataUrl =
  "https://slidexdeck.com/.well-known/oauth-protected-resource/mcp";

test("MCP bearer challenge supports discovery without claiming a token error", () => {
  assert.equal(
    mcpBearerChallenge({ resourceMetadataUrl }),
    `Bearer resource_metadata="${resourceMetadataUrl}"`
  );
});

test("MCP bearer challenge distinguishes invalid tokens and insufficient scopes", () => {
  assert.equal(
    mcpBearerChallenge({ error: "invalid_token", resourceMetadataUrl }),
    `Bearer error="invalid_token", resource_metadata="${resourceMetadataUrl}"`
  );
  assert.equal(
    mcpBearerChallenge({
      error: "insufficient_scope",
      resourceMetadataUrl,
      scopes: ["presentations:read"]
    }),
    `Bearer error="insufficient_scope", scope="presentations:read", resource_metadata="${resourceMetadataUrl}"`
  );
});

test("MCP bearer parsing distinguishes discovery from invalid Bearer attempts", () => {
  assert.deepEqual(parseMcpBearerAuthorization(null), { kind: "missing" });
  assert.deepEqual(parseMcpBearerAuthorization("Basic abc"), { kind: "missing" });
  assert.deepEqual(parseMcpBearerAuthorization("Bearer"), { kind: "invalid" });
  assert.deepEqual(parseMcpBearerAuthorization("Bearer abc extra"), { kind: "invalid" });
  assert.deepEqual(parseMcpBearerAuthorization("Bearer abc"), {
    kind: "token",
    token: "abc"
  });
  assert.deepEqual(parseMcpBearerAuthorization("  Bearer abc  "), {
    kind: "token",
    token: "abc"
  });
});

test("MCP authorization failures include standard status, challenge, and cache headers", () => {
  assert.deepEqual(
    createMcpAuthorizationFailure("missing_token", resourceMetadataUrl),
    {
      body: { error: "unauthorized" },
      headers: {
        "Cache-Control": "no-store, private",
        "WWW-Authenticate": `Bearer resource_metadata="${resourceMetadataUrl}"`
      },
      status: 401
    }
  );
  assert.deepEqual(
    createMcpAuthorizationFailure("invalid_token", resourceMetadataUrl),
    {
      body: { error: "invalid_token" },
      headers: {
        "Cache-Control": "no-store, private",
        "WWW-Authenticate": `Bearer error="invalid_token", resource_metadata="${resourceMetadataUrl}"`
      },
      status: 401
    }
  );
  assert.deepEqual(
    createMcpAuthorizationFailure(
      "insufficient_scope",
      resourceMetadataUrl,
      ["presentations:read"]
    ),
    {
      body: { error: "insufficient_scope" },
      headers: {
        "Cache-Control": "no-store, private",
        "WWW-Authenticate": `Bearer error="insufficient_scope", scope="presentations:read", resource_metadata="${resourceMetadataUrl}"`
      },
      status: 403
    }
  );
});

test("MCP transport responses are private, non-cacheable, and non-referring", () => {
  const response = applyMcpTransportSecurityHeaders(new Response(null));
  assert.equal(response.headers.get("cache-control"), "no-store, private");
  assert.equal(response.headers.get("pragma"), "no-cache");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});
