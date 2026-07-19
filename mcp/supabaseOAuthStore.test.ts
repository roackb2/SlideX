import assert from "node:assert/strict";
import test from "node:test";

import {
  createPkceS256Challenge,
  hashOAuthCredential,
  mcpResourcesMatch
} from "@/mcp/oauth";
import {
  McpOAuthGrantError,
  SupabaseMcpOAuthStore
} from "@/mcp/supabaseOAuthStore";

type CredentialRow = {
  client_id: string;
  code_challenge: string | null;
  created_at: string;
  credential_hash: string;
  credential_type: "authorization_code" | "access_token" | "refresh_token";
  expires_at: string;
  grant_id: string;
  id: string;
  redirect_uri: string | null;
  resource: string;
  revoked_at: string | null;
  scopes: string[];
  user_id: string;
};

const canonicalResource = "https://slidexdeck.com/mcp";
const legacyResource = `${canonicalResource}/`;

test("authorization-code exchange is atomic and sends only the derived PKCE challenge to PostgreSQL", async () => {
  const code = "slx_ac_authorization_code";
  const verifier = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
  const expectedChallenge = createPkceS256Challenge(verifier);
  const redirectUri = "https://client.example/callback";
  let consumed = false;
  const rpcCalls: Array<Record<string, unknown>> = [];
  const client = {
    async rpc(name: string, args: Record<string, unknown>) {
      assert.equal(name, "mcp_exchange_oauth_authorization_code");
      rpcCalls.push(args);
      const isValid = !consumed &&
        args.presented_code_hash === hashOAuthCredential(code) &&
        args.oauth_client_id === "client-id" &&
        args.oauth_redirect_uri === redirectUri &&
        args.oauth_resource === canonicalResource &&
        args.presented_code_challenge === expectedChallenge;
      if (!isValid) {
        return {
          data: [{
            granted_scopes: null,
            result_status: args.oauth_redirect_uri === redirectUri ? "pkce_failure" : "redirect_mismatch",
            security_grant_id: "grant-id",
            security_user_id: "user-id"
          }],
          error: null
        };
      }
      consumed = true;
      return {
        data: [{
          granted_scopes: ["presentations:read"],
          result_status: "exchanged",
          security_grant_id: "grant-id",
          security_user_id: "user-id"
        }],
        error: null
      };
    }
  } as never;
  const store = new SupabaseMcpOAuthStore(client);

  await assert.rejects(
    store.exchangeAuthorizationCode({
      clientId: "client-id",
      code,
      codeChallenge: "b".repeat(43),
      redirectUri,
      resource: canonicalResource
    }),
    (error) => (
      error instanceof McpOAuthGrantError &&
      error.message === "invalid_grant" &&
      error.oauthError === "invalid_grant" &&
      error.securityEvent === "pkce_failure" &&
      error.securityUserId === "user-id" &&
      error.securityGrantId === "grant-id"
    )
  );
  await assert.rejects(
    store.exchangeAuthorizationCode({
      clientId: "client-id",
      code,
      codeChallenge: expectedChallenge,
      redirectUri: `${redirectUri}/changed`,
      resource: canonicalResource
    }),
    (error) => (
      error instanceof McpOAuthGrantError &&
      error.message === "invalid_grant" &&
      error.oauthError === "invalid_grant" &&
      error.securityEvent === "redirect_mismatch" &&
      error.securityUserId === "user-id" &&
      error.securityGrantId === "grant-id"
    )
  );
  assert.equal(consumed, false);

  const tokens = await store.exchangeAuthorizationCode({
    clientId: "client-id",
    code,
    codeChallenge: expectedChallenge,
    redirectUri,
    resource: canonicalResource
  });
  assert.equal(tokens.scope, "presentations:read");
  assert.equal(consumed, true);
  assert.equal(rpcCalls.some((args) => Object.hasOwn(args, "code_verifier")), false);
  assert.equal(JSON.stringify(rpcCalls).includes(verifier), false);
});

test("refresh rotation accepts legacy resources and writes canonical tokens", async () => {
  const originalRefreshToken = "slx_rt_existing_legacy_token";
  const { client, rows, selects } = credentialClient([credentialRow({
    credential_hash: hashOAuthCredential(originalRefreshToken),
    credential_type: "refresh_token",
    id: "legacy-refresh",
    resource: legacyResource
  })]);
  const store = new SupabaseMcpOAuthStore(client);
  const issuedAt = Date.now();

  const first = await store.exchangeRefreshToken({
    clientId: "client-id",
    refreshToken: originalRefreshToken,
    resource: canonicalResource
  });

  assert.equal(first.expires_in, 60 * 60);
  assert.equal(first.scope, "presentations:read presentations:write");
  assert.ok(rows.find((row) => row.id === "legacy-refresh")?.revoked_at);

  const firstAccess = rowForToken(rows, first.access_token);
  const firstRefresh = rowForToken(rows, first.refresh_token);
  assert.equal(firstAccess.resource, canonicalResource);
  assert.equal(firstRefresh.resource, canonicalResource);
  assertExpiryNear(firstAccess.expires_at, issuedAt + 60 * 60 * 1000);
  assertExpiryNear(firstRefresh.expires_at, issuedAt + 30 * 24 * 60 * 60 * 1000);

  const auth = await store.verifyAccessToken(first.access_token, legacyResource);
  assert.equal(auth.resource, canonicalResource);
  assert.equal(auth.userId, "user-id");
  assert.ok(selects.includes("client_id,expires_at,resource,scopes,user_id"));

  const second = await store.exchangeRefreshToken({
    clientId: "client-id",
    refreshToken: first.refresh_token,
    resource: legacyResource
  });
  assert.equal((await store.verifyAccessToken(second.access_token, canonicalResource)).userId, "user-id");
  assert.equal(rowForToken(rows, second.refresh_token).resource, canonicalResource);

  await assert.rejects(
    store.exchangeRefreshToken({
      clientId: "client-id",
      refreshToken: originalRefreshToken,
      resource: canonicalResource
    }),
    (error) => (
      error instanceof McpOAuthGrantError &&
      error.message === "invalid_grant" &&
      error.securityEvent === "refresh_replay"
    )
  );
  await assert.rejects(
    store.verifyAccessToken(second.access_token, canonicalResource),
    /invalid_token/
  );
  await assert.rejects(
    store.exchangeRefreshToken({
      clientId: "client-id",
      refreshToken: first.refresh_token,
      resource: canonicalResource
    }),
    /invalid_grant/
  );
  await assert.rejects(
    store.verifyAccessToken(second.access_token, `${canonicalResource}/wrong`),
    /invalid_token/
  );
});

test("legacy access tokens verify canonically while expired tokens are rejected", async () => {
  const activeToken = "slx_at_existing_legacy_token";
  const expiredToken = "slx_at_expired_token";
  const { client } = credentialClient([
    credentialRow({
      credential_hash: hashOAuthCredential(activeToken),
      id: "legacy-access",
      resource: legacyResource
    }),
    credentialRow({
      credential_hash: hashOAuthCredential(expiredToken),
      expires_at: new Date(Date.now() - 60_000).toISOString(),
      id: "expired-access"
    })
  ]);
  const store = new SupabaseMcpOAuthStore(client);

  assert.equal(
    (await store.verifyAccessToken(activeToken, canonicalResource)).resource,
    canonicalResource
  );
  await assert.rejects(
    store.verifyAccessToken(expiredToken, canonicalResource),
    /invalid_token/
  );
});

function credentialClient(initialRows: CredentialRow[]) {
  const rows = initialRows.map((row) => ({ ...row }));
  const selects: string[] = [];
  const client = {
    async rpc(name: string, args: Record<string, unknown>) {
      assert.equal(name, "mcp_rotate_oauth_refresh_token");
      const credential = rows.find((row) =>
        row.credential_hash === args.presented_refresh_hash &&
        row.credential_type === "refresh_token"
      );
      if (!credential) {
        return { data: [{ granted_scopes: null, result_status: "invalid_grant" }], error: null };
      }
      if (credential.revoked_at) {
        for (const row of rows) {
          if (row.grant_id === credential.grant_id && !row.revoked_at) {
            row.revoked_at = new Date().toISOString();
          }
        }
        return {
          data: [{
            granted_scopes: null,
            result_status: "refresh_replay",
            security_grant_id: credential.grant_id,
            security_user_id: credential.user_id
          }],
          error: null
        };
      }
      if (
        credential.client_id !== args.oauth_client_id ||
        !mcpResourcesMatch(credential.resource, String(args.oauth_resource)) ||
        new Date(credential.expires_at).getTime() <= Date.now()
      ) {
        return { data: [{ granted_scopes: null, result_status: "invalid_grant" }], error: null };
      }

      const requestedScopes = args.requested_scopes as string[] | null;
      if (requestedScopes?.some((scope) => !credential.scopes.includes(scope))) {
        return { data: [{ granted_scopes: null, result_status: "invalid_scope" }], error: null };
      }

      const grantedScopes = requestedScopes ?? credential.scopes;
      credential.revoked_at = new Date().toISOString();
      rows.push(
        credentialRow({
          credential_hash: String(args.issued_access_hash),
          credential_type: "access_token",
          expires_at: String(args.issued_access_expires_at),
          grant_id: credential.grant_id,
          resource: canonicalResource,
          scopes: grantedScopes
        }),
        credentialRow({
          credential_hash: String(args.issued_refresh_hash),
          credential_type: "refresh_token",
          expires_at: String(args.issued_refresh_expires_at),
          grant_id: credential.grant_id,
          resource: canonicalResource,
          scopes: grantedScopes
        })
      );
      return { data: [{ granted_scopes: grantedScopes, result_status: "rotated" }], error: null };
    },
    from(table: string) {
      assert.equal(table, "mcp_oauth_credentials");
      const filters: Array<(row: CredentialRow) => boolean> = [];
      let updates: Partial<CredentialRow> | undefined;
      const query = {
        eq(field: keyof CredentialRow, value: unknown) {
          filters.push((row) => row[field] === value);
          return query;
        },
        gt(field: keyof CredentialRow, value: string) {
          filters.push((row) => typeof row[field] === "string" && row[field] > value);
          return query;
        },
        insert(input: Partial<CredentialRow> | Array<Partial<CredentialRow>>) {
          const values = Array.isArray(input) ? input : [input];
          rows.push(...values.map((value) => credentialRow(value)));
          return Promise.resolve({ error: null });
        },
        is(field: keyof CredentialRow, value: unknown) {
          filters.push((row) => row[field] === value);
          return query;
        },
        async maybeSingle() {
          const row = rows.find((candidate) => filters.every((filter) => filter(candidate)));
          if (row && updates) Object.assign(row, updates);
          return { data: row ? { ...row } : null, error: null };
        },
        select(columns?: string) {
          if (columns) selects.push(columns);
          return query;
        },
        update(value: Partial<CredentialRow>) {
          updates = value;
          return query;
        }
      };
      return query;
    }
  } as never;

  return { client, rows, selects };
}

function credentialRow(value: Partial<CredentialRow>): CredentialRow {
  return {
    client_id: "client-id",
    code_challenge: null,
    created_at: new Date().toISOString(),
    credential_hash: "credential-hash",
    credential_type: "access_token",
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    grant_id: "grant-id",
    id: crypto.randomUUID(),
    redirect_uri: null,
    resource: canonicalResource,
    revoked_at: null,
    scopes: ["presentations:read", "presentations:write"],
    user_id: "user-id",
    ...value
  };
}

function rowForToken(rows: CredentialRow[], token: string) {
  const row = rows.find((candidate) => candidate.credential_hash === hashOAuthCredential(token));
  assert.ok(row);
  return row;
}

function assertExpiryNear(actual: string, expected: number) {
  assert.ok(Math.abs(new Date(actual).getTime() - expected) < 2_000);
}
