import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  normalizeMcpScopes,
  validateMcpRedirectUri,
  verifyPkceChallenge
} from "@/mcp/oauth";

test("MCP OAuth accepts HTTPS and loopback redirects only", () => {
  assert.equal(validateMcpRedirectUri("https://client.example/callback"), "https://client.example/callback");
  assert.equal(validateMcpRedirectUri("http://127.0.0.1:4321/callback"), "http://127.0.0.1:4321/callback");
  assert.throws(() => validateMcpRedirectUri("http://client.example/callback"), /invalid_redirect_uri/);
  assert.throws(() => validateMcpRedirectUri("https://user:secret@client.example/callback"), /invalid_redirect_uri/);
});

test("MCP OAuth limits scopes and verifies S256 PKCE", () => {
  const verifier = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  assert.equal(verifyPkceChallenge(verifier, challenge), true);
  assert.deepEqual(normalizeMcpScopes("presentations:read"), ["presentations:read"]);
  assert.throws(() => normalizeMcpScopes("presentations:write"), /invalid_scope/);
  assert.throws(() => normalizeMcpScopes("workspace:delete"), /invalid_scope/);
});
