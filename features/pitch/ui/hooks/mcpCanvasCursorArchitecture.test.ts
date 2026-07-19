import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const hookUrl = new URL("./useRemoteMcpCanvasCursor.ts", import.meta.url);
const cursorUrl = new URL("../preview/RemoteMcpCanvasCursor.tsx", import.meta.url);
const canvasUrl = new URL("../PreviewCanvas.tsx", import.meta.url);
const previewBlockUrl = new URL("../preview/PreviewBlock.tsx", import.meta.url);
const previewPaneUrl = new URL("../preview/PreviewPane.tsx", import.meta.url);

test("Canvas cursor escapes arbitrary MotionDoc node IDs and retries bounded DOM lookup", async () => {
  const source = await readFile(hookUrl, "utf8");

  assert.match(source, /const domRetryWindowMs = 750/);
  assert.match(source, /const selector = `\[data-motion-doc-node-id="\$\{CSS\.escape\(nodeId\)\}"\]`/);
  assert.match(source, /window\.requestAnimationFrame\(measure\)/);
  assert.match(source, /performance\.now\(\) < retryDeadline/);
  assert.match(source, /mcpCanvasCursorFallbackPosition/);
});

test("Canvas cursor recalculates for layout changes and cancels stale generations", async () => {
  const source = await readFile(hookUrl, "utf8");

  assert.match(source, /new ResizeObserver/);
  assert.match(source, /window\.addEventListener\("scroll", scheduleMeasurement, true\)/);
  assert.match(source, /visualViewport\?\.addEventListener\("resize"/);
  assert.match(source, /actualScale/);
  assert.match(source, /canvasViewportOffset\.x/);
  assert.match(source, /animationGenerationRef\.current !== animationGeneration/);
  assert.match(source, /measurementGenerationRef\.current !== measurementGeneration/);
  assert.match(source, /window\.clearTimeout/);
  assert.match(source, /resizeObserver\?\.disconnect\(\)/);
});

test("Canvas cursor is a direct visual-only canvas layer and never synthesizes user input", async () => {
  const [hookSource, cursorSource, canvasSource] = await Promise.all([
    readFile(hookUrl, "utf8"),
    readFile(cursorUrl, "utf8"),
    readFile(canvasUrl, "utf8")
  ]);
  const source = `${hookSource}\n${cursorSource}`;

  assert.match(cursorSource, /pointer-events-none absolute inset-0/);
  assert.match(canvasSource, /<RemoteMcpCanvasCursor/);
  assert.doesNotMatch(source, /\.click\(|dispatchEvent\(|setPointerCapture\(|focus\(|select\(/);
});

test("MotionDoc preview wrappers use one node attribute and operation frames use only operation IDs", async () => {
  const [blockSource, paneSource, canvasSource] = await Promise.all([
    readFile(previewBlockUrl, "utf8"),
    readFile(previewPaneUrl, "utf8"),
    readFile(canvasUrl, "utf8")
  ]);
  const source = `${blockSource}\n${paneSource}\n${canvasSource}`;

  assert.match(blockSource, /data-motion-doc-node-id=\{blockKey\}/);
  assert.match(paneSource, /data-motion-doc-node-id=\{blockKey\}/);
  assert.equal(source.includes(["data", "mcp", "node-id"].join("-")), false);
});
