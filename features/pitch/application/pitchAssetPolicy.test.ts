import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeAbsolutePitchImageSource,
  normalizeDirectPitchImageSource,
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

test("existing image URLs and paths are used directly", () => {
  assert.equal(normalizeDirectPitchImageSource(" https://cdn.example.com/image.png "), "https://cdn.example.com/image.png");
  assert.equal(normalizeDirectPitchImageSource("/images/cover.webp"), "/images/cover.webp");
  assert.equal(normalizeDirectPitchImageSource("images/cover.webp"), "images/cover.webp");
});

test("direct image sources reject temporary blobs and unsafe paths", () => {
  assert.equal(normalizeDirectPitchImageSource("blob:https://app.example.com/temporary"), null);
  assert.equal(normalizeDirectPitchImageSource("javascript:alert(1)"), null);
  assert.equal(normalizeDirectPitchImageSource("../private/image.png"), null);
});

test("guest image sources require a complete HTTPS URL", () => {
  assert.equal(
    normalizeAbsolutePitchImageSource(" https://cdn.example.com/image.png "),
    "https://cdn.example.com/image.png"
  );
  assert.equal(normalizeAbsolutePitchImageSource("/images/cover.webp"), null);
  assert.equal(normalizeAbsolutePitchImageSource("images/cover.webp"), null);
  assert.equal(normalizeAbsolutePitchImageSource("http://cdn.example.com/image.png"), null);
});
