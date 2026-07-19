import assert from "node:assert/strict";
import test from "node:test";

import { parseSupabaseMcpOperationRealtimeChange } from "@/features/workspace/infrastructure/supabaseMcpOperationActivityRepository";

const ownerId = "729c3ccc-09e6-47d8-a49f-66a8395c041c";
const row = {
  client_id: "slx_client_codex",
  client_name: "Codex",
  completed_at: null,
  completed_revision: null,
  created_at: "2026-07-19T01:00:00.000Z",
  error_code: null,
  expires_at: "2026-07-26T01:00:00.000Z",
  id: "67bc1915-dcdc-4474-9061-9d3e8f862121",
  node_id: "block-stable-id",
  presentation_id: "3ffb8bd0-f055-415d-8ec5-29c7effdecd2",
  slide_index: 2,
  status: "running",
  target_kind: "block",
  tool_name: "slidex_update_canvas_node",
  updated_at: "2026-07-19T01:00:00.000Z",
  user_id: ownerId
} as const;

test("parses an owner-matching private MCP operation Broadcast", () => {
  const change = parseSupabaseMcpOperationRealtimeChange({
    event: "INSERT",
    payload: {
      operation: "INSERT",
      record: row,
      schema: "public",
      table: "mcp_operation_events"
    },
    type: "broadcast"
  }, ownerId);

  assert.deepEqual(change, {
    activity: {
      clientId: "slx_client_codex",
      clientName: "Codex",
      completedAt: undefined,
      completedRevision: undefined,
      createdAt: "2026-07-19T01:00:00.000Z",
      errorCode: undefined,
      expiresAt: "2026-07-26T01:00:00.000Z",
      id: "67bc1915-dcdc-4474-9061-9d3e8f862121",
      presentationId: "3ffb8bd0-f055-415d-8ec5-29c7effdecd2",
      status: "running",
      target: { kind: "block", nodeId: "block-stable-id", slideIndex: 2 },
      toolName: "slidex_update_canvas_node",
      updatedAt: "2026-07-19T01:00:00.000Z"
    },
    event: "INSERT"
  });
});

test("rejects a cross-owner or malformed MCP operation Broadcast", () => {
  const message = {
    event: "INSERT",
    payload: {
      operation: "INSERT",
      record: row,
      schema: "public",
      table: "mcp_operation_events"
    },
    type: "broadcast"
  };

  assert.equal(parseSupabaseMcpOperationRealtimeChange(message, "another-user"), null);
  assert.equal(parseSupabaseMcpOperationRealtimeChange({ ...message, event: "UPDATE" }, ownerId), null);
});
