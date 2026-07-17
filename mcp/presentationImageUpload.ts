import sharp from "sharp";

import type { McpPresentationImageMimeType } from "@/mcp/presentationImageUploadStore";

const maximumImageBytes = 10 * 1024 * 1024;
const maximumImagePixels = 40_000_000;
const maximumImageDimension = 2304;

const sharpFormatsByMimeType: Record<McpPresentationImageMimeType, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp"
};

export class PresentationImageUploadError extends Error {
  constructor(
    readonly code: "invalid_body" | "invalid_image" | "size_mismatch",
    message: string
  ) {
    super(message);
    this.name = "PresentationImageUploadError";
  }
}

export async function readExactUploadBody(
  body: ReadableStream<Uint8Array> | null,
  expectedSize: number
) {
  if (!body) {
    throw new PresentationImageUploadError("invalid_body", "The upload body is missing.");
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;

      size += value.byteLength;
      if (size > expectedSize || size > maximumImageBytes) {
        await reader.cancel();
        throw new PresentationImageUploadError(
          "size_mismatch",
          "The upload is larger than the declared byte length."
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (size !== expectedSize) {
    throw new PresentationImageUploadError(
      "size_mismatch",
      "The upload byte length does not match the prepared upload."
    );
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function normalizePresentationImage(
  bytes: Uint8Array,
  expectedMimeType: McpPresentationImageMimeType
) {
  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(bytes, {
      animated: true,
      failOn: "error",
      limitInputPixels: maximumImagePixels
    }).metadata();
  } catch {
    throw new PresentationImageUploadError("invalid_image", "The image could not be decoded.");
  }

  if (metadata.format !== sharpFormatsByMimeType[expectedMimeType]) {
    throw new PresentationImageUploadError(
      "invalid_image",
      "The decoded image type does not match Content-Type."
    );
  }
  if (!metadata.width || !metadata.height || metadata.width * metadata.height > maximumImagePixels) {
    throw new PresentationImageUploadError("invalid_image", "The image dimensions are not allowed.");
  }
  if ((metadata.pages ?? 1) !== 1) {
    throw new PresentationImageUploadError("invalid_image", "Animated images are not allowed.");
  }

  let output: Buffer;
  try {
    output = await sharp(bytes, {
      failOn: "error",
      limitInputPixels: maximumImagePixels
    })
      .rotate()
      .resize({
        fit: "inside",
        height: maximumImageDimension,
        width: maximumImageDimension,
        withoutEnlargement: true
      })
      .webp({ effort: 4, quality: 84 })
      .toBuffer();
  } catch {
    throw new PresentationImageUploadError("invalid_image", "The image could not be normalized.");
  }

  if (output.byteLength < 1 || output.byteLength > maximumImageBytes) {
    throw new PresentationImageUploadError("invalid_image", "The normalized image is too large.");
  }

  return new Uint8Array(output);
}
