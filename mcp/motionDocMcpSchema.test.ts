import assert from "node:assert/strict";
import test from "node:test";
import { motionDocAddBlockTypes } from "@/core/motion-doc/application/motionDocAutomation";
import { getMotionDocMcpSchema } from "@/mcp/motionDocMcpSchema";

test("MCP schema is generated from the current MotionDoc add-block surface", () => {
  const schema = getMotionDocMcpSchema();

  assert.deepEqual(
    schema.block.types.map((type) => type.addType),
    motionDocAddBlockTypes
  );
  assert.ok(schema.block.types.every((type) => type.fields.includes("x")));
  assert.deepEqual(
    schema.block.types.map((type) => type.addType),
    ["Text", "Image", "Video", "Icon", "Table", "ShapeRectangle"]
  );
  assert.ok(schema.slide.fields.includes("shaderPreset"));
});
