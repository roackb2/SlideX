import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
  "../supabase/migrations/20260719093000_add_mcp_operation_events.sql",
  import.meta.url
);

test("MCP operation events are owner-private, service-written, and content-safe", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  const tableDefinition = sql.match(/create table public\.mcp_operation_events \(([\s\S]*?)\n\);/)?.[1] ?? "";

  assert.match(sql, /alter table public\.mcp_operation_events enable row level security/);
  assert.match(sql, /grant select on table public\.mcp_operation_events to authenticated/);
  assert.match(sql, /grant select, insert, update, delete on table public\.mcp_operation_events to service_role/);
  assert.match(sql, /user_id = \(select auth\.uid\(\)\)/);
  assert.match(sql, /expires_at > statement_timestamp\(\)/);
  assert.match(sql, /presentation not owned by operation event user/);
  assert.doesNotMatch(tableDefinition, /\b(prompt|token|source|user_text|raw_error)\b/i);
});

test("MCP operation events enforce targets, transitions, private Broadcast, and hourly cleanup", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /target_kind in \('presentation', 'slide', 'block'\)/);
  assert.match(sql, /target_kind = 'block' and slide_index is not null and node_id is not null/);
  assert.match(sql, /old\.status <> 'running' or new\.status not in \('completed', 'failed'\)/);
  assert.match(sql, /'mcp-operation-events:' \|\| owner_id::text/);
  assert.match(sql, /realtime\.messages\.extension = 'broadcast'/);
  assert.match(sql, /new\.expires_at := new\.created_at \+ interval '7 days'/);
  assert.match(sql, /'purge-expired-mcp-operation-events',[\s\S]*?'0 \* \* \* \*'/);
  assert.match(sql, /delete from public\.mcp_operation_events where expires_at <= statement_timestamp\(\)/);
});
