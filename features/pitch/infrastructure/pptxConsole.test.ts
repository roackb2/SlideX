import assert from "node:assert/strict";
import test from "node:test";
import {
  redactPptxConsoleArguments,
  sanitizePptxExportError,
  withPptxConsoleRedaction
} from "@/features/pitch/infrastructure/pptxConsole";

const pageUrl = "http://localhost:3000/workspace/pitch/?demo=1";
const pngDataUrl = "data:image/png;base64,QUJDRA==";
const blobUrl = "blob:http://localhost:3000/temporary-image";

test("PPTX console output never exposes image arguments", () => {
  assert.deepEqual(
    redactPptxConsoleArguments(["Image URL being set:", pngDataUrl, blobUrl, pageUrl], "log"),
    []
  );
  assert.deepEqual(
    redactPptxConsoleArguments(["Image URL being set:", pageUrl], "info"),
    []
  );
});

test("PPTX console errors use one fixed message", () => {
  const [message] = redactPptxConsoleArguments(
    ["Image processing failed", pngDataUrl, blobUrl, pageUrl, "mime=image/png", "length=123"],
    "error"
  );

  assert.equal(message, "[PPTX] Image processing failed");
  assert.doesNotMatch(String(message), /QUJDRA|data:image|blob:|https?:\/\/|mime|length/);
});

test("PPTX export errors omit source URLs and image metadata", () => {
  const sanitized = sanitizePptxExportError(
    new Error(`Unable to load ${pngDataUrl} from ${blobUrl} at ${pageUrl} mime=image/png length=123`)
  );

  assert.doesNotMatch(sanitized.message, /QUJDRA|data:image|blob:|https?:\/\/|mime=image|length=123/);
  assert.match(sanitized.message, /\[PPTX source omitted\]/);
  assert.match(sanitized.message, /\[PPTX image detail omitted\]/);
});

test("PPTX console guard suppresses logs and restores console methods", async () => {
  const originalLog = console.log;
  const originalError = console.error;
  let capturedLog: unknown[] = [];
  let capturedError: unknown[] = [];
  const captureLog = (...args: unknown[]) => {
    capturedLog = args;
  };
  const captureError = (...args: unknown[]) => {
    capturedError = args;
  };
  console.log = captureLog;
  console.error = captureError;

  try {
    await withPptxConsoleRedaction(async () => {
      console.log("Image URL being set:", pageUrl, pngDataUrl);
      console.error("Image processing failed", pageUrl, pngDataUrl);
    });

    assert.deepEqual(capturedLog, []);
    assert.deepEqual(capturedError, ["[PPTX] Image processing failed"]);
    assert.equal(console.log, captureLog);
    assert.equal(console.error, captureError);
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
});
