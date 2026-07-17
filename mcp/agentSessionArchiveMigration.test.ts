import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
  "../supabase/migrations/20260717083000_add_agent_session_archives.sql",
  import.meta.url
);

test("archive migration keeps compacted content service-only and append-only", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /create table public\.agent_session_archives/);
  assert.match(sql, /create table public\.agent_session_archive_heads/);
  assert.match(sql, /foreign key \(session_id, user_id\)[\s\S]*?on delete cascade/g);
  assert.match(sql, /alter table public\.agent_session_archives enable row level security/);
  assert.match(sql, /alter table public\.agent_session_archive_heads enable row level security/);
  assert.match(
    sql,
    /revoke all on table public\.agent_session_archives[\s\S]*?from public, anon, authenticated/
  );
  assert.match(sql, /grant select on table public\.agent_session_archives to service_role/);
  assert.match(sql, /grant select on table public\.agent_session_archive_heads to service_role/);
  assert.doesNotMatch(sql, /grant (?:insert|update|delete)[\s\S]*?to service_role/);
});

test("archive append serializes one user session and advances its manifest atomically", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /create or replace function public\.append_agent_session_archive/);
  assert.match(sql, /security definer/);
  assert.match(sql, /set search_path = pg_catalog, pg_temp/);
  assert.match(
    sql,
    /from public\.agent_sessions[\s\S]*?id = p_session_id[\s\S]*?user_id = p_user_id[\s\S]*?for update/
  );
  assert.match(
    sql,
    /from public\.agent_session_archive_heads[\s\S]*?session_id = p_session_id[\s\S]*?user_id = p_user_id[\s\S]*?for update/
  );
  assert.match(
    sql,
    /insert into public\.agent_session_archives[\s\S]*?update public\.agent_session_archive_heads/
  );
  assert.match(sql, /jsonb_array_elements\(v_manifest -> 'archives'\)/);
  assert.match(sql, /using errcode = '23505'/);
  assert.match(
    sql,
    /revoke all on function public\.append_agent_session_archive[\s\S]*?from public, anon, authenticated/
  );
  assert.match(
    sql,
    /grant execute on function public\.append_agent_session_archive[\s\S]*?to service_role/
  );
});

test("archive rows preserve the Heddle manifest and content invariants", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /archive_record ->> 'id' = archive_id/);
  assert.match(sql, /jsonb_typeof\(messages\) = 'array'/);
  assert.match(sql, /manifest -> 'version' = '1'::jsonb/);
  assert.match(sql, /manifest ->> 'sessionId' = session_id/);
  assert.match(sql, /jsonb_typeof\(manifest -> 'archives'\) = 'array'/);
  assert.match(sql, /'currentSummaryPath', p_archive_record ->> 'summaryPath'/);
});
