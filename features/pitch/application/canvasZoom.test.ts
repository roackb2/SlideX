import assert from "node:assert/strict";
import test from "node:test";
import {
  canvasZoomScaleFromWheel,
  canvasZoomAnchorFromPoint,
  canvasZoomScrollCorrection,
  dampedCanvasZoomScale,
  maxCanvasZoomScale
} from "@/features/pitch/application/canvasZoom";

test("wheel zoom correction keeps the pointed canvas position under the cursor", () => {
  const anchor = canvasZoomAnchorFromPoint(
    { clientX: 500, clientY: 300 },
    { height: 450, left: 100, top: 75, width: 800 }
  );
  const correction = canvasZoomScrollCorrection(
    anchor,
    { height: 675, left: 100, top: 75, width: 1200 }
  );

  assert.deepEqual(correction, { x: 200, y: 112.5 });
});

test("wheel zoom uses the nearest canvas edge when the cursor is outside", () => {
  const anchor = canvasZoomAnchorFromPoint(
    { clientX: 40, clientY: 900 },
    { height: 450, left: 100, top: 75, width: 800 }
  );

  assert.deepEqual(anchor, { clientX: 100, clientY: 525, xRatio: 0, yRatio: 1 });
});

test("trackpad wheel deltas change zoom continuously instead of jumping by a fixed step", () => {
  assert.equal(canvasZoomScaleFromWheel(1, -1), 1.0012);
  assert.equal(canvasZoomScaleFromWheel(1, 1), 0.9988);
  assert.ok(canvasZoomScaleFromWheel(1, -100) < 1.13);
});

test("wheel zoom respects the presentation workspace maximum", () => {
  assert.equal(canvasZoomScaleFromWheel(maxCanvasZoomScale, -240), maxCanvasZoomScale);
});

test("native wheel damping approaches the target without spring overshoot", () => {
  const nextScale = dampedCanvasZoomScale(1, 2, 70);

  assert.ok(nextScale > 1.63 && nextScale < 1.64);
  assert.ok(dampedCanvasZoomScale(nextScale, 2, 70) > nextScale);
  assert.ok(dampedCanvasZoomScale(nextScale, 2, 70) < 2);
});
