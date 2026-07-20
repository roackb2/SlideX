import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeUrls = ["authorize", "register", "revoke", "token"].map(
  (route) => new URL(`../app/api/mcp/oauth/${route}/route.ts`, import.meta.url)
);

test("OAuth routes apply safe headers and never expose malformed form parsing errors", async () => {
  const [authorize, register, revoke, token] = await Promise.all(
    routeUrls.map((url) => readFile(url, "utf8"))
  );

  for (const source of [authorize, register, revoke, token]) {
    assert.match(source, /applyOAuthSecurityHeaders/);
  }
  for (const source of [authorize, revoke, token]) {
    assert.match(source, /formData\(\)\.catch\(\(\) => null\)/);
  }
  assert.match(register, /request\.json\(\)\.catch\(\(\) => null\)/);
});

test("authorization diagnostics expose only rejection stages and field names", async () => {
  const authorize = await readFile(routeUrls[0], "utf8");

  assert.match(authorize, /logInvalidAuthorizationRequest/);
  assert.match(authorize, /invalidFields/);
  assert.match(authorize, /noncePresent/);
  assert.match(authorize, /storeError/);
  assert.match(authorize, /describePublicOrigin/);
  assert.doesNotMatch(
    authorize,
    /console\.warn\([\s\S]{0,240}(?:consentNonce|data\.user\.id|parsed\.data)/
  );
});
