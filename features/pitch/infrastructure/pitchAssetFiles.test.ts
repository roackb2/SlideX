import assert from "node:assert/strict";
import test from "node:test";
import {
  detectPitchImageMimeType,
  PitchAssetFileError,
  preparePitchAssetFile
} from "@/features/pitch/infrastructure/pitchAssetFiles";

const imageSamples = [
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], type: "image/png" },
  { bytes: [0xff, 0xd8, 0xff, 0xe0], type: "image/jpeg" },
  { bytes: Array.from(Buffer.from("GIF89a", "ascii")), type: "image/gif" },
  { bytes: Array.from(Buffer.from("RIFF0000WEBP", "ascii")), type: "image/webp" },
  {
    bytes: [
      0x00, 0x00, 0x00, 0x18,
      ...Buffer.from("ftyp", "ascii"),
      ...Buffer.from("avif", "ascii"),
      0x00, 0x00, 0x00, 0x00,
      ...Buffer.from("mif1", "ascii")
    ],
    type: "image/avif"
  }
] as const;

test("detects each allowed raster image from its file signature", async () => {
  for (const sample of imageSamples) {
    const file = new File([Uint8Array.from(sample.bytes)], "image", { type: sample.type });
    assert.equal(await detectPitchImageMimeType(file), sample.type);
  }
});

test("rejects an image whose bytes do not match its declared MIME type", async () => {
  const fakePng = new File(["<html>not an image</html>"], "fake.png", { type: "image/png" });

  await assert.rejects(
    preparePitchAssetFile(fakePng),
    (error: unknown) => error instanceof PitchAssetFileError &&
      error.message === "The image contents do not match the selected file type"
  );
});
