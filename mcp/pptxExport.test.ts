import assert from "node:assert/strict";
import test from "node:test";

import { validateOutputPath } from "@/mcp/pptxExport";

test("PPTX output requires an absolute pptx path", () => {
  assert.throws(() => validateOutputPath("deck.pptx"), /absolute/);
  assert.throws(() => validateOutputPath("/tmp/deck.pdf"), /\.pptx/);
  assert.equal(validateOutputPath("/tmp/deck.pptx"), "/tmp/deck.pptx");
});
