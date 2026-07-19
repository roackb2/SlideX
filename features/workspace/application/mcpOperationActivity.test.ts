import assert from "node:assert/strict";
import test from "node:test";

import {
  isMcpOperationVisuallyActive,
  latestMcpOperationForPresentation,
  mcpOperationAction
} from "@/features/workspace/application/mcpOperationActivity";
import type { McpOperationActivity } from "@/features/workspace/domain/mcpOperationActivity";

const activity: McpOperationActivity = {
  clientId: "client-codex",
  clientName: "Codex",
  createdAt: "2026-07-19T01:00:00.000Z",
  expiresAt: "2026-07-26T01:00:00.000Z",
  id: "event-1",
  presentationId: "presentation-1",
  status: "running",
  target: { kind: "block", nodeId: "block-1", slideIndex: 0 },
  toolName: "slidex_update_block",
  updatedAt: "2026-07-19T01:00:00.000Z"
};

test("keeps current operations visible but does not pulse stale running rows for seven days", () => {
  assert.equal(isMcpOperationVisuallyActive(activity, Date.parse("2026-07-19T01:09:59.000Z")), true);
  assert.equal(isMcpOperationVisuallyActive(activity, Date.parse("2026-07-19T01:10:01.000Z")), false);
  assert.equal(
    latestMcpOperationForPresentation([activity], activity.presentationId, Date.parse("2026-07-19T01:05:00.000Z"))?.id,
    activity.id
  );
});

test("uses purple-state copy for completion and conflict without exposing raw errors", () => {
  assert.equal(mcpOperationAction({ ...activity, status: "completed" }, "zh-TW"), "修改物件完成");
  assert.equal(mcpOperationAction({ ...activity, errorCode: "revision_conflict", status: "failed" }, "en"), "Revision conflict; nothing overwritten");
});
