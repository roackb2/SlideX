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
