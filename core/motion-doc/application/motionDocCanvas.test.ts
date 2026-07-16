import assert from "node:assert/strict";
import test from "node:test";

import {
  getMotionDocCanvasNodes,
  updateMotionDocCanvasNodeFrame
} from "@/core/motion-doc/application/motionDocCanvas";

const source = `# Canvas

<Slide duration={5}>
  <Text id="node-a" x={10.125} y={20.25} w={30.5} h={12.75}>Hello</Text>
</Slide>`;

test("canvas nodes expose stable ids plus percent and pixel frames", () => {
  const result = getMotionDocCanvasNodes(source);
  const node = result.slides[0]?.nodes[0];

  assert.equal(result.canvas.width, 1024);
  assert.equal(result.canvas.height, 576);
  assert.equal(node?.nodeId, "node-a");
  assert.deepEqual(node?.framePercent, { h: 12.75, w: 30.5, x: 10.125, y: 20.25 });
  assert.deepEqual(node?.framePixels, { h: 73.44, w: 312.32, x: 103.68, y: 116.64 });
});

test("canvas node frames update by stable id with decimal precision", () => {
  const result = updateMotionDocCanvasNodeFrame(source, 0, "node-a", {
    x: 11.375,
    y: 22.625
  });

  assert.equal(result.node.nodeId, "node-a");
  assert.deepEqual(result.node.framePercent, { h: 12.75, w: 30.5, x: 11.375, y: 22.625 });
  assert.match(result.source, /x=\{11\.375\}/);
  assert.throws(
    () => updateMotionDocCanvasNodeFrame(source, 0, "node-a", { x: 80 }),
    /inside the slide bounds/
  );
});
