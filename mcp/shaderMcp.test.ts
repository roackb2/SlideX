import assert from "node:assert/strict";
import test from "node:test";

import { summarizeMotionDoc } from "@/core/motion-doc/application/motionDocAutomation";
import { applyMcpShaderPreset, getMcpShader, listMcpShaders } from "@/mcp/shaderMcp";

const source = `# Shader test

<Slide duration={5} theme="dark" background="#000000">
  <Text x={10} y={10} w={80} h={20}>Hello</Text>
</Slide>`;

test("MCP shader catalog exposes the current Paper shaders", () => {
  const catalog = listMcpShaders();

  assert.equal(catalog.count, 12);
  assert.ok(catalog.shaders.some((shader) => shader.id === "mesh-gradient"));
  assert.equal(getMcpShader("mesh-gradient").defaultPreset, "Default");
});

test("MCP shader preset updates a slide with valid MotionDoc props", () => {
  const result = applyMcpShaderPreset(source, 0, "mesh-gradient", "Default");

  assert.equal(result.summary.validation.isValid, true);
  assert.equal(summarizeMotionDoc(result.source).document.scenes[0]?.props.shader, "mesh-gradient");
});

test("MCP shader preset rejects unknown ids and preset names", () => {
  assert.throws(() => getMcpShader("missing"), /Unknown shaderId/);
  assert.throws(
    () => applyMcpShaderPreset(source, 0, "mesh-gradient", "Missing"),
    /Unknown presetName/
  );
});
