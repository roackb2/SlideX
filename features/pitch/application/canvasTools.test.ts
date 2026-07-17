import assert from "node:assert/strict";
import test from "node:test";
import { canvasToolFromShortcut } from "@/features/pitch/application/canvasTools";

test("Z switches to zoom and V switches back to select", () => {
  assert.equal(canvasToolFromShortcut("z"), "zoom");
  assert.equal(canvasToolFromShortcut("Z"), "zoom");
  assert.equal(canvasToolFromShortcut("v"), "select");
  assert.equal(canvasToolFromShortcut("V"), "select");
});
