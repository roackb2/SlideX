import assert from "node:assert/strict";
import test from "node:test";
import {
  applyImageCropRect,
  clampImageMediaPosition,
  imageMediaDimensions
} from "@/core/motion-doc/application/imageCrop";

test("applying a crop rectangle changes the frame and preserves the selected image region", () => {
  const cropped = applyImageCropRect(
    { cropX: 0, cropY: 0, h: 60, scaleX: 1, scaleY: 1, w: 80, x: 10, y: 20 },
    { x: 25, y: 10, w: 50, h: 80 }
  );

  assert.deepEqual(cropped, {
    cropX: 0,
    cropY: 0,
    fit: "cover",
    h: 48,
    scaleX: 2,
    scaleY: 1.25,
    w: 40,
    x: 30,
    y: 26
  });
});

test("cover dimensions expose the complete overflow behind a wide crop frame", () => {
  const dimensions = imageMediaDimensions("cover", 16 / 6, 16 / 9);

  assert.equal(dimensions.width, 100);
  assert.equal(dimensions.height, 150);
});

test("image position is clamped before it can expose empty space", () => {
  assert.equal(clampImageMediaPosition(80, 0, 100, 150), 25);
  assert.equal(clampImageMediaPosition(-80, 0, 100, 150), -25);
  assert.equal(clampImageMediaPosition(20, 0, 100, 100), 0);
});

test("applying a full crop keeps image position independent from zoom", () => {
  const cropped = applyImageCropRect(
    { cropX: 18, cropY: -12, h: 60, scaleX: 1, scaleY: 1, w: 80, x: 10, y: 20 },
    { x: 0, y: 0, w: 100, h: 100 }
  );

  assert.equal(cropped.cropX, 18);
  assert.equal(cropped.cropY, -12);
  assert.equal(cropped.scaleX, 1);
  assert.equal(cropped.scaleY, 1);
});
