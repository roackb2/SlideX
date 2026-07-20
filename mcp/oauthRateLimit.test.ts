import assert from "node:assert/strict";
import test from "node:test";

import { consumeMcpOAuthRateLimit } from "@/mcp/oauthRateLimit";

test("OAuth route limiter passes only a hashed bucket and the fixed route policy", async () => {
  const previousSecret = process.env.MCP_OAUTH_RATE_LIMIT_SECRET;
  process.env.MCP_OAUTH_RATE_LIMIT_SECRET = "r".repeat(32);
  let receivedBucket = "";
  let receivedPolicy: { capacity: number; refillSeconds: number } | undefined;

  try {
    const result = await consumeMcpOAuthRateLimit({
      clientId: "client-id",
      headers: new Headers({ "x-real-ip": "203.0.113.7" }),
      identity: "client_ip",
      kind: "token",
      store: {
        async consumeRateLimit(bucketHash, policy) {
          receivedBucket = bucketHash;
          receivedPolicy = policy;
          return { allowed: true, retryAfterSeconds: 0, tokensRemaining: 59 };
        }
      }
    });

    assert.equal(result.allowed, true);
    assert.match(receivedBucket, /^[a-f0-9]{64}$/);
    assert.equal(receivedBucket.includes("203.0.113.7"), false);
    assert.deepEqual(receivedPolicy, { capacity: 60, refillSeconds: 1 });
  } finally {
    if (previousSecret === undefined) delete process.env.MCP_OAUTH_RATE_LIMIT_SECRET;
    else process.env.MCP_OAUTH_RATE_LIMIT_SECRET = previousSecret;
  }
});
