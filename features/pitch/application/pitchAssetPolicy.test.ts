import assert from "node:assert/strict";
import test from "node:test";
import {
  pitchAssetMimeTypes,
  validatePitchAssetSource
} from "@/features/pitch/application/pitchAssetPolicy";

test("SVG is not accepted as a presentation upload", () => {
  assert.equal((pitchAssetMimeTypes.image as readonly string[]).includes("image/svg+xml"), false);
  assert.deepEqual(
    validatePitchAssetSource({ name: "unsafe.svg", size: 1024, type: "image/svg+xml" }),
    { message: "This file type is not supported", ok: false }
  );
});

test("safe raster image formats remain accepted", () => {
  for (const type of pitchAssetMimeTypes.image) {
    assert.deepEqual(
      validatePitchAssetSource({ name: "image", size: 1024, type }),
      { kind: "image", ok: true }
    );
  }
});
