import assert from "node:assert/strict";
import test from "node:test";

import { hashOAuthCredential } from "@/mcp/oauth";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";

type ConsentRow = {
  clientId: string;
  consumed: boolean;
  expiresAt: number;
  nonceHash: string;
  requestHash: string;
  userId: string;
};

test("OAuth consent requests are user-bound, request-bound, expiring, and single-use", async () => {
  const rows = new Map<string, ConsentRow>();
  const store = new SupabaseMcpOAuthStore(consentClient(rows));
  const requestHash = "a".repeat(64);
  const nonce = await store.issueConsentRequest({
    clientId: "client-id",
    requestHash,
    userId: "user-id"
  });

  assert.equal(rows.has(nonce), false);
  assert.ok(rows.has(hashOAuthCredential(nonce)));
  assert.equal(await store.consumeConsentRequest({
    clientId: "client-id",
    nonce,
    requestHash: "b".repeat(64),
    userId: "user-id"
  }), false);
  assert.equal(await store.consumeConsentRequest({
    clientId: "client-id",
    nonce,
    requestHash,
    userId: "other-user"
  }), false);
  assert.equal(await store.consumeConsentRequest({
    clientId: "client-id",
    nonce,
    requestHash,
    userId: "user-id"
  }), true);
  assert.equal(await store.consumeConsentRequest({
    clientId: "client-id",
    nonce,
    requestHash,
    userId: "user-id"
  }), false);

  const expiredNonce = await store.issueConsentRequest({
    clientId: "client-id",
    requestHash,
    userId: "user-id"
  });
  const expired = rows.get(hashOAuthCredential(expiredNonce));
  assert.ok(expired);
  expired.expiresAt = Date.now() - 1;
  assert.equal(await store.consumeConsentRequest({
    clientId: "client-id",
    nonce: expiredNonce,
    requestHash,
    userId: "user-id"
  }), false);
});

test("OAuth store maps persistent token-bucket results without exposing identifiers", async () => {
  const store = new SupabaseMcpOAuthStore(consentClient(new Map()));
  assert.deepEqual(
    await store.consumeRateLimit("c".repeat(64), { capacity: 10, refillSeconds: 360 }),
    { allowed: false, retryAfterSeconds: 12, tokensRemaining: 0 }
  );
});

function consentClient(rows: Map<string, ConsentRow>) {
  return {
    async rpc(name: string, args: Record<string, unknown>) {
      if (name === "mcp_issue_oauth_consent_request") {
        const nonceHash = String(args.consent_nonce_hash);
        rows.set(nonceHash, {
          clientId: String(args.oauth_client_id),
          consumed: false,
          expiresAt: new Date(String(args.consent_expires_at)).getTime(),
          nonceHash,
          requestHash: String(args.authorization_request_hash),
          userId: String(args.actor_user_id)
        });
        return { data: true, error: null };
      }

      if (name === "mcp_consume_oauth_consent_request") {
        const row = rows.get(String(args.consent_nonce_hash));
        const valid = Boolean(
          row &&
          !row.consumed &&
          row.expiresAt > Date.now() &&
          row.clientId === args.oauth_client_id &&
          row.requestHash === args.authorization_request_hash &&
          row.userId === args.actor_user_id
        );
        if (row && valid) row.consumed = true;
        return { data: valid, error: null };
      }

      if (name === "mcp_consume_oauth_rate_limit") {
        assert.equal(args.target_bucket_hash, "c".repeat(64));
        assert.equal(args.bucket_capacity, 10);
        assert.equal(args.refill_interval_seconds, 360);
        return {
          data: [{ allowed: false, retry_after_seconds: 12, tokens_remaining: 0 }],
          error: null
        };
      }

      throw new Error(`Unexpected RPC: ${name}`);
    }
  } as never;
}
