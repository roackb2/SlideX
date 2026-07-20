import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PGlite } from "@electric-sql/pglite";

const secureCoreMigrationUrl = new URL(
  "../supabase/migrations/20260719233000_secure_mcp_oauth_core.sql",
  import.meta.url
);

test("refresh RPC rejects a NULL resource without revoking or rotating the refresh token", async (context) => {
  const database = new PGlite();
  context.after(async () => database.close());

  await database.exec(oauthSchemaFixture);
  await database.exec(await readFile(secureCoreMigrationUrl, "utf8"));

  const clientId = "slx_client_database_test";
  const userId = "10000000-0000-4000-8000-000000000001";
  const grantId = "20000000-0000-4000-8000-000000000001";
  const existingRefreshHash = "1".repeat(64);
  const rejectedAccessHash = "2".repeat(64);
  const rejectedRefreshHash = "3".repeat(64);

  await database.query(
    "insert into auth.users (id) values ($1::uuid);",
    [userId]
  );
  await database.query(
    `insert into public.mcp_oauth_clients (
       client_id, client_name, redirect_uris, grant_types, response_types
     ) values (
       $1, 'Database test client', array['https://client.example/callback'],
       array['authorization_code', 'refresh_token'], array['code']
     );`,
    [clientId]
  );
  await database.query(
    `insert into public.mcp_oauth_credentials (
       credential_hash, credential_type, client_id, user_id, scopes,
       resource, expires_at, grant_id
     ) values (
       $1, 'refresh_token', $2, $3::uuid, array['presentations:read'],
       'https://slidexdeck.com/mcp', clock_timestamp() + interval '1 day', $4::uuid
     );`,
    [existingRefreshHash, clientId, userId, grantId]
  );

  const rotation = await database.query<{
    result_status: string;
    security_grant_id: string | null;
    security_user_id: string | null;
  }>(
    `select result_status, security_user_id, security_grant_id
     from public.mcp_rotate_oauth_refresh_token(
       $1::text,
       $2::text,
       null::text,
       null::text[],
       $3::text,
       clock_timestamp() + interval '1 hour',
       $4::text,
       clock_timestamp() + interval '30 days'
     );`,
    [existingRefreshHash, clientId, rejectedAccessHash, rejectedRefreshHash]
  );

  assert.deepEqual(rotation.rows, [{
    result_status: "invalid_grant",
    security_grant_id: null,
    security_user_id: null
  }]);

  const credentials = await database.query<{
    credential_hash: string;
    revoked_at: string | null;
  }>(
    `select credential_hash, revoked_at
     from public.mcp_oauth_credentials
     order by created_at, credential_hash;`
  );

  assert.deepEqual(credentials.rows, [{
    credential_hash: existingRefreshHash,
    revoked_at: null
  }]);
});

const oauthSchemaFixture = `
  create schema auth;
  create schema extensions;
  create role anon;
  create role authenticated;
  create role service_role;

  create function extensions.gen_random_uuid()
  returns uuid
  language sql
  volatile
  as $$ select pg_catalog.gen_random_uuid() $$;

  create table auth.users (
    id uuid primary key
  );

  create table public.mcp_oauth_clients (
    client_id text primary key check (char_length(client_id) between 12 and 200),
    client_name text not null,
    redirect_uris text[] not null,
    grant_types text[] not null,
    response_types text[] not null,
    token_endpoint_auth_method text not null default 'none',
    created_at timestamptz not null default now()
  );

  create table public.mcp_oauth_credentials (
    id uuid primary key default extensions.gen_random_uuid(),
    credential_hash text not null unique,
    credential_type text not null check (
      credential_type in ('authorization_code', 'access_token', 'refresh_token')
    ),
    client_id text not null references public.mcp_oauth_clients (client_id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    redirect_uri text,
    code_challenge text,
    scopes text[] not null default '{}',
    resource text not null,
    expires_at timestamptz not null,
    revoked_at timestamptz,
    created_at timestamptz not null default now(),
    grant_id uuid not null default extensions.gen_random_uuid()
  );
`;
