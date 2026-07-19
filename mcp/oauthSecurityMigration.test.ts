import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
  "../supabase/migrations/20260719150000_harden_remote_mcp_oauth.sql",
  import.meta.url
);
const secureCoreMigrationUrl = new URL(
  "../supabase/migrations/20260719233000_secure_mcp_oauth_core.sql",
  import.meta.url
);
const cleanupMigrationUrl = new URL(
  "../supabase/migrations/20260719234500_schedule_mcp_security_event_cleanup.sql",
  import.meta.url
);

test("OAuth hardening migration keeps consent, rate limits, and token families service-only", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /add column grant_id uuid/);
  assert.match(sql, /mcp_oauth_credentials_active_grant_idx/);
  assert.match(sql, /alter table public\.mcp_oauth_consent_requests enable row level security/);
  assert.match(sql, /alter table public\.mcp_oauth_rate_limits enable row level security/);
  assert.match(
    sql,
    /revoke all on function public\.mcp_rotate_oauth_refresh_token[\s\S]*?from public, anon, authenticated/
  );
  assert.doesNotMatch(sql, /\braw_(?:token|nonce|ip)\b/i);
});

test("OAuth refresh rotation is atomic and revokes the active family on replay", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /credential_type = 'refresh_token'[\s\S]*?for update/);
  assert.match(sql, /'refresh_token' = any\(oauth_client\.grant_types\)/);
  assert.match(
    sql,
    /if credential\.revoked_at is not null then[\s\S]*?family_credential\.grant_id = credential\.grant_id[\s\S]*?set revoked_at = now_at/
  );
  assert.match(sql, /insert into public\.mcp_oauth_credentials[\s\S]*?'access_token'[\s\S]*?'refresh_token'/);
});

test("OAuth consent and rate-limit RPCs consume state atomically and clean bounded rows", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(
    sql,
    /set consumed_at = clock_timestamp\(\)[\s\S]*?consent\.consumed_at is null[\s\S]*?returning consent\.id/
  );
  assert.match(sql, /limit 100/);
  assert.match(sql, /where bucket\.bucket_hash = target_bucket_hash[\s\S]*?for update/);
  assert.match(sql, /return query select true, current_tokens - 1, 0/);
});

test("forward-only OAuth core exchanges codes atomically without sending the verifier to PostgreSQL", async () => {
  const sql = await readFile(secureCoreMigrationUrl, "utf8");

  assert.match(sql, /create or replace function public\.mcp_exchange_oauth_authorization_code/);
  assert.match(sql, /credential_type = 'authorization_code'[\s\S]*?for update/);
  assert.match(sql, /credential\.redirect_uri is distinct from oauth_redirect_uri/);
  assert.match(sql, /credential\.code_challenge <> presented_code_challenge/);
  assert.match(sql, /update public\.mcp_oauth_credentials[\s\S]*?set revoked_at = now_at[\s\S]*?insert into public\.mcp_oauth_credentials/);
  assert.doesNotMatch(sql, /code_verifier/i);
  assert.doesNotMatch(sql, /oauth_redirect_uri\s+(?:like|ilike|similar to)/i);
});

test("forward-only OAuth core keeps access and refresh tokens in one grant family and revokes the family", async () => {
  const sql = await readFile(secureCoreMigrationUrl, "utf8");

  assert.match(sql, /'access_token'[\s\S]*?credential\.grant_id[\s\S]*?'refresh_token'[\s\S]*?credential\.grant_id/);
  assert.match(
    sql,
    /create function public\.mcp_rotate_oauth_refresh_token[\s\S]*?oauth_resource is null[\s\S]*?issued_access_expires_at is null[\s\S]*?issued_refresh_expires_at is null[\s\S]*?issued_access_expires_at <= now_at[\s\S]*?issued_refresh_expires_at <= now_at/
  );
  assert.match(sql, /credential\.resource is distinct from oauth_resource/);
  assert.match(sql, /if credential\.revoked_at is not null then[\s\S]*?family_credential\.grant_id = credential\.grant_id/);
  assert.match(sql, /return query select 'refresh_replay'/);
  assert.match(sql, /create or replace function public\.mcp_revoke_oauth_grant_family/);
  assert.match(sql, /revoke all on function public\.mcp_revoke_oauth_grant_family\(text\)[\s\S]*?from public, anon, authenticated/);
});

test("security events are deidentified, service-only, and exclude sensitive payload fields", async () => {
  const sql = await readFile(secureCoreMigrationUrl, "utf8");

  assert.match(sql, /create table public\.mcp_oauth_security_events/);
  assert.match(sql, /(?:user|client|ip|grant)_hash text/);
  assert.match(sql, /expires_at timestamptz not null default \(now\(\) \+ interval '90 days'\)/);
  assert.match(sql, /alter table public\.mcp_oauth_security_events enable row level security/);
  assert.match(sql, /revoke all on table public\.mcp_oauth_security_events from public, anon, authenticated/);
  assert.match(sql, /event_type = 'invalid_grant'[\s\S]*?>= 10[\s\S]*?'invalid_grant_burst'/);
  assert.match(sql, /event_type = 'rate_limit_triggered'[\s\S]*?>= 5[\s\S]*?'rate_limit_burst'/);
  assert.match(
    sql,
    /if security_event_type = 'invalid_grant'\s+and \(security_client_hash is not null or security_ip_hash is not null\)/
  );
  assert.match(
    sql,
    /if security_event_type = 'rate_limit_triggered'\s+and \(security_client_hash is not null or security_ip_hash is not null\)/
  );
  assert.match(sql, /count\(distinct recent_event\.ip_hash\)[\s\S]*?'account_ip_anomaly'/);
  assert.doesNotMatch(sql, /\b(?:token|code|nonce|state|verifier|cookie|secret|stack)_value\b/i);
});

test("90-day cleanup is isolated in its own executable pg_cron migration", async () => {
  const coreSql = await readFile(secureCoreMigrationUrl, "utf8");
  const cleanupSql = await readFile(cleanupMigrationUrl, "utf8");

  assert.doesNotMatch(coreSql, /pg_cron|cron\.schedule/);
  assert.match(cleanupSql, /create extension if not exists pg_cron/);
  assert.match(cleanupSql, /cron\.schedule/);
  assert.match(cleanupSql, /expires_at <= statement_timestamp\(\)/);
  assert.match(cleanupSql, /'17 \* \* \* \*'/);
});
