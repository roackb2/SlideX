import assert from "node:assert/strict";
import test from "node:test";

import { applyMcpServerTiming, McpServerTiming } from "@/mcp/serverTiming";

test("MCP Server-Timing exposes fixed metric names and rounded durations", async () => {
  const values = [0, 2.04, 4.26, 8.88];
  const timing = new McpServerTiming(() => values.shift() ?? 8.88);
  await timing.measure("auth", async () => undefined);
  timing.add("store", 1.26);

  const response = applyMcpServerTiming(new Response(null), timing);
  assert.equal(
    response.headers.get("server-timing"),
    "auth;dur=2.2, store;dur=1.3, total;dur=8.9"
  );
});
