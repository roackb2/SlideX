import assert from "node:assert/strict";
import test from "node:test";
import { visualFrameToolbarPlacement } from "@/features/pitch/application/visualFrameToolbar";

test("full-canvas media keeps its toolbar inside the visible canvas", () => {
  assert.equal(
    visualFrameToolbarPlacement({ h: 100, w: 100, x: 0, y: 0 }, 0.6),
    "inside-top"
  );
});

test("visual media toolbar uses free canvas space when available", () => {
  assert.equal(
    visualFrameToolbarPlacement({ h: 40, w: 50, x: 25, y: 20 }, 0.8),
    "above"
  );
  assert.equal(
    visualFrameToolbarPlacement({ h: 30, w: 50, x: 25, y: 2 }, 0.8),
    "below"
  );
});
