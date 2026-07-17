import assert from "node:assert/strict";
import test from "node:test";

import sharp from "sharp";

import {
  normalizePresentationImage,
  PresentationImageUploadError,
  readExactUploadBody
} from "@/mcp/presentationImageUpload";

test("private image upload reads exactly the declared number of bytes", async () => {
  const bytes = new Uint8Array([1, 2, 3, 4]);
  const result = await readExactUploadBody(streamBytes(bytes), bytes.byteLength);
  assert.deepEqual(result, bytes);

  await assert.rejects(
    readExactUploadBody(streamBytes(bytes), bytes.byteLength - 1),
    (error) => error instanceof PresentationImageUploadError && error.code === "size_mismatch"
  );
  await assert.rejects(
    readExactUploadBody(streamBytes(bytes), bytes.byteLength + 1),
    (error) => error instanceof PresentationImageUploadError && error.code === "size_mismatch"
  );
});

test("private image upload validates the decoded format and emits metadata-free WebP", async () => {
  const source = await sharp({
    create: {
      background: "#cc5533",
      channels: 4,
      height: 1600,
      width: 3200
    }
  })
    .jpeg()
    .withMetadata({ exif: { IFD0: { Artist: "should be removed" } } })
    .toBuffer();

  const normalized = await normalizePresentationImage(new Uint8Array(source), "image/jpeg");
  const metadata = await sharp(normalized).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 2304);
  assert.equal(metadata.height, 1152);
  assert.equal(metadata.exif, undefined);

  await assert.rejects(
    normalizePresentationImage(new Uint8Array(source), "image/png"),
    (error) => error instanceof PresentationImageUploadError && error.code === "invalid_image"
  );
});

test("private image upload rejects corrupt image bytes", async () => {
  await assert.rejects(
    normalizePresentationImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), "image/png"),
    (error) => error instanceof PresentationImageUploadError && error.code === "invalid_image"
  );
});

function streamBytes(bytes: Uint8Array) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.subarray(0, 2));
      controller.enqueue(bytes.subarray(2));
      controller.close();
    }
  });
}
