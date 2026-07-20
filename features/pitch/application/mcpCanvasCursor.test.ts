import assert from "node:assert/strict";
import test from "node:test";

import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import {
  latestRemoteMcpCanvasOperation,
  mcpCanvasCursorFallbackPosition,
  mcpCanvasCursorGeneration,
  mcpCanvasCursorPositionFromRects
} from "@/features/pitch/application/mcpCanvasCursor";
import type { RemoteMcpOperation } from "@/features/pitch/domain/remoteMcpOperation";

test("MCP cursor translates browser rects into its direct canvas layer without applying scale twice", () => {
  assert.deepEqual(mcpCanvasCursorPositionFromRects(
    { height: 40, left: 300, top: 250, width: 80 },
    { height: 400, left: 100, top: 100, width: 800 }
  ), {
    source: "dom",
    xPercent: 30,
    yPercent: 42.5
  });
  assert.deepEqual(mcpCanvasCursorPositionFromRects(
    { height: 10, left: -500, top: 900, width: 10 },
    { height: 0, left: 0, top: 0, width: 0 }
  ), {
    source: "dom",
    xPercent: 0,
    yPercent: 100
  });
});

test("MCP cursor falls back from MotionDoc frame to slide center", () => {
  const activity = operation({
    target: { kind: "block", nodeId: "target.block[1]", slideIndex: 0 }
  });
  const scene = {
    blocks: [{
      props: { h: 20, id: "target.block[1]", w: 40, x: 10, y: 30 },
      text: "Target",
      type: "Text"
    }]
  } as unknown as MotionDocScene;

  assert.deepEqual(mcpCanvasCursorFallbackPosition(activity, scene, 0), {
    source: "motion-doc",
    xPercent: 30,
    yPercent: 40
  });
  assert.deepEqual(mcpCanvasCursorFallbackPosition(
    operation({ target: { kind: "block", nodeId: "missing", slideIndex: 0 } }),
    scene,
    0
  ), {
    source: "slide-center",
    xPercent: 50,
    yPercent: 50
  });
});

test("latest MCP event wins and an event for an old slide suppresses the cursor", () => {
  const older = operation({ id: "older", updatedAt: "2026-07-19T10:00:00.000Z" });
  const newer = operation({
    id: "newer",
    target: { kind: "slide", slideIndex: 1 },
    updatedAt: "2026-07-19T10:00:01.000Z"
  });

  assert.equal(latestRemoteMcpCanvasOperation([newer, older], 1)?.id, "newer");
  assert.equal(latestRemoteMcpCanvasOperation([older, newer], 0), undefined);
  assert.equal(mcpCanvasCursorGeneration(older), "older:2026-07-19T10:00:00.000Z");
});

function operation(overrides: Partial<RemoteMcpOperation> = {}): RemoteMcpOperation {
  return {
    clientId: "client-id",
    clientName: "Codex",
    createdAt: "2026-07-19T10:00:00.000Z",
    expiresAt: "2026-07-19T11:00:00.000Z",
    id: "operation-id",
    presentationId: "presentation-id",
    status: "running",
    target: { kind: "presentation" },
    toolName: "slidex_update_block",
    updatedAt: "2026-07-19T10:00:00.000Z",
    ...overrides
  };
}
