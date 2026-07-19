import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeUrl = new URL("../app/mcp/route.ts", import.meta.url);

test("the normal MCP transport exposes timing without invoking OAuth endpoint rate limits", async () => {
  const source = await readFile(routeUrl, "utf8");

  assert.match(source, /applyMcpServerTiming/);
  assert.match(source, /timing\.measure\("auth"/);
  assert.match(source, /timing\.add\("store"/);
  assert.doesNotMatch(source, /consumeMcpOAuthRateLimit|mcp_consume_oauth_rate_limit/);
});
