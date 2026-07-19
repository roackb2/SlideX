import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  canonicalizeMcpResource,
  createPkceS256Challenge,
  isExactMcpRedirectUri,
  isValidPkceCodeVerifier,
  mcpAuthorizationRequestSchema,
  mcpResourcesMatch,
  normalizeMcpScopes,
  resolveMcpResourceTarget,
  validateMcpRedirectUri,
  verifyPkceChallenge
} from "@/mcp/oauth";

test("MCP OAuth canonicalizes the legacy trailing-slash resource", () => {
  const canonical = "https://slidexdeck.com/mcp";
  const legacy = `${canonical}/`;

  assert.equal(canonicalizeMcpResource(canonical), canonical);
  assert.equal(canonicalizeMcpResource(legacy), canonical);
  assert.equal(mcpResourcesMatch(canonical, legacy), true);
  assert.equal(mcpResourcesMatch(canonical, `${canonical}/other`), false);
  assert.equal(mcpResourcesMatch(canonical, "not a URL"), false);
  assert.equal(resolveMcpResourceTarget(legacy, canonical), canonical);
  assert.equal(resolveMcpResourceTarget(`${canonical}/other`, canonical), undefined);

  const parsed = mcpAuthorizationRequestSchema.parse({
    client_id: "client",
    code_challenge: "a".repeat(43),
    code_challenge_method: "S256",
    redirect_uri: "https://client.example/callback",
    resource: legacy,
    response_type: "code"
  });
  assert.equal(parsed.resource, canonical);
});

test("MCP OAuth accepts HTTPS and loopback redirects only", () => {
  assert.equal(validateMcpRedirectUri("https://client.example/callback"), "https://client.example/callback");
  assert.equal(validateMcpRedirectUri("http://127.0.0.1:4321/callback"), "http://127.0.0.1:4321/callback");
  assert.throws(() => validateMcpRedirectUri("http://client.example/callback"), /invalid_redirect_uri/);
  assert.throws(() => validateMcpRedirectUri("https://user:secret@client.example/callback"), /invalid_redirect_uri/);
  const registered = ["https://client.example/callback?channel=stable"];
  assert.equal(isExactMcpRedirectUri(registered[0], registered), true);
  assert.equal(isExactMcpRedirectUri("https://client.example/callback", registered), false);
  assert.equal(isExactMcpRedirectUri(`${registered[0]}&next=https://evil.example`, registered), false);
  assert.equal(isExactMcpRedirectUri("https://client.example.evil/callback?channel=stable", registered), false);
});

test("MCP OAuth limits scopes and verifies S256 PKCE", () => {
  const verifier = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  assert.equal(verifyPkceChallenge(verifier, challenge), true);
  assert.equal(createPkceS256Challenge(verifier), challenge);
  assert.equal(isValidPkceCodeVerifier(verifier), true);
  assert.equal(isValidPkceCodeVerifier("x"), false);
  assert.equal(isValidPkceCodeVerifier("a".repeat(129)), false);
  assert.equal(isValidPkceCodeVerifier(`${"a".repeat(42)}!`), false);
  assert.equal(verifyPkceChallenge("x", createHash("sha256").update("x").digest("base64url")), false);
  assert.equal(verifyPkceChallenge(verifier, `${challenge}=`), false);
  assert.deepEqual(normalizeMcpScopes(undefined), [
    "presentations:read",
    "presentations:write"
  ]);
  assert.deepEqual(normalizeMcpScopes("presentations:read"), ["presentations:read"]);
  assert.deepEqual(
    normalizeMcpScopes("presentations:read presentation-assets:write"),
    ["presentations:read", "presentation-assets:write"]
  );
  assert.throws(() => normalizeMcpScopes("presentations:write"), /invalid_scope/);
  assert.throws(() => normalizeMcpScopes("presentation-assets:write"), /invalid_scope/);
  assert.throws(() => normalizeMcpScopes("workspace:delete"), /invalid_scope/);
});

test("MCP OAuth authorization requests accept only an unpadded S256 challenge", () => {
  const request = {
    client_id: "client",
    code_challenge_method: "S256",
    redirect_uri: "https://client.example/callback",
    resource: "https://slidexdeck.com/mcp",
    response_type: "code"
  } as const;

  assert.equal(mcpAuthorizationRequestSchema.safeParse({
    ...request,
    code_challenge: "a".repeat(43)
  }).success, true);
  assert.equal(mcpAuthorizationRequestSchema.safeParse({
    ...request,
    code_challenge: "a".repeat(42)
  }).success, false);
  assert.equal(mcpAuthorizationRequestSchema.safeParse({
    ...request,
    code_challenge: `${"a".repeat(42)}=`
  }).success, false);
});
