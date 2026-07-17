import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrls = [
  "../supabase/migrations/20260717030000_add_mcp_image_uploads.sql",
  "../supabase/migrations/20260717033000_fix_mcp_image_upload_clock.sql"
].map((path) => new URL(path, import.meta.url));

test("MCP image upload migration keeps credentials and rows service-only", async () => {
  const sql = await readMigrations();

  assert.match(sql, /token_hash text not null unique check \(char_length\(token_hash\) = 64\)/);
  assert.doesNotMatch(sql, /\btoken\s+text\b/i);
  assert.match(sql, /alter table public\.mcp_image_upload_intents enable row level security/);
  assert.match(sql, /alter table public\.mcp_image_upload_rate_limits enable row level security/);
  assert.match(
    sql,
    /revoke all on table public\.mcp_image_upload_intents from public, anon, authenticated/
  );
  assert.match(
    sql,
    /revoke all on function public\.mcp_claim_presentation_image_upload[\s\S]*?from public, anon, authenticated/
  );
});

test("MCP image upload migration serializes quota and token-bucket decisions", async () => {
  const sql = await readMigrations();

  assert.match(sql, /bucket_capacity constant integer := 20/);
  assert.match(sql, /refill_seconds constant integer := 30/);
  assert.match(sql, /image_quota_bytes constant bigint := 1073741824/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /for update/);
  assert.match(sql, /status in \('prepared', 'claimed'\)/);
  assert.match(sql, /current_tokens - 1/);
  assert.match(sql, /interval '10 minutes'/);
  assert.match(sql, /now_at timestamptz := clock_timestamp\(\)/);
});

test("MCP image upload claim consumes one unexpired credential atomically", async () => {
  const sql = await readMigrations();

  assert.match(
    sql,
    /set status = 'claimed',[\s\S]*?intent\.token_hash = credential_hash[\s\S]*?intent\.status = 'prepared'[\s\S]*?intent\.expires_at > clock_timestamp\(\)[\s\S]*?returning/
  );
  assert.match(sql, /interval '24 hours'/);
  assert.match(sql, /interval '30 days'/);
});

async function readMigrations() {
  return (await Promise.all(migrationUrls.map((url) => readFile(url, "utf8")))).join("\n");
}
