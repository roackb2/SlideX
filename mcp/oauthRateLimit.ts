import {
  createMcpOAuthRateLimitBucket,
  mcpOAuthRateLimitPolicies,
  readMcpOAuthRateLimitSecret,
  type McpOAuthRateLimitIdentity,
  type McpOAuthRateLimitKind,
  type McpOAuthRateLimitPolicy
} from "@/mcp/oauthSecurity";

type McpOAuthRateLimitStore = {
  consumeRateLimit(
    bucketHash: string,
    policy: McpOAuthRateLimitPolicy
  ): Promise<{
    allowed: boolean;
    retryAfterSeconds: number;
    tokensRemaining: number;
  }>;
};

export async function consumeMcpOAuthRateLimit(input: {
  clientId?: string;
  headers: Headers;
  identity: McpOAuthRateLimitIdentity;
  kind: McpOAuthRateLimitKind;
  store: McpOAuthRateLimitStore;
}) {
  const bucketHash = createMcpOAuthRateLimitBucket({
    clientId: input.clientId,
    headers: input.headers,
    identity: input.identity,
    kind: input.kind,
    secret: readMcpOAuthRateLimitSecret()
  });
  return input.store.consumeRateLimit(bucketHash, mcpOAuthRateLimitPolicies[input.kind]);
}
