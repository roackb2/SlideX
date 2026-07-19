import assert from "node:assert/strict";
import test from "node:test";

// The runtime Next.js config is JavaScript and intentionally has no declaration file.
// @ts-expect-error next.config.mjs has no TypeScript declarations
import nextConfig from "../../next.config.mjs";

type HeaderRule = {
  headers: Array<{ key: string; value: string }>;
  source: string;
};

test("MCP consent page preserves its same-origin POST Origin header", async () => {
  const rules = await (nextConfig as { headers(): Promise<HeaderRule[]> }).headers();
  const consentRule = rules.find((rule) => rule.source === "/mcp/authorize/:path*");
  const apiRule = rules.find((rule) => rule.source === "/api/mcp/oauth/:path*");

  assert.ok(consentRule);
  assert.ok(apiRule);
  assert.deepEqual(
    consentRule.headers.filter((header) => header.key === "Referrer-Policy"),
    [{ key: "Referrer-Policy", value: "same-origin" }]
  );
  assert.deepEqual(
    apiRule.headers.filter((header) => header.key === "Referrer-Policy"),
    [{ key: "Referrer-Policy", value: "no-referrer" }]
  );
});
