import assert from "node:assert/strict";
import test from "node:test";

import { resolveSafeAuthNextPath } from "@/features/auth/application/authRedirect";

test("login preserves the MCP authorization return path", () => {
  const next = "/mcp/authorize/?client_id=test&state=opaque";

  assert.equal(resolveSafeAuthNextPath(next, "/workspace"), next);
});

test("login still rejects external OAuth return paths", () => {
  assert.equal(resolveSafeAuthNextPath("https://attacker.example", "/workspace"), "/workspace");
  assert.equal(resolveSafeAuthNextPath("//attacker.example", "/workspace"), "/workspace");
});
