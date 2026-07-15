import assert from "node:assert/strict";
import test from "node:test";
import { motionDocBlockKey } from "@/core/motion-doc/application/motionDocBlockIdentity";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import { resolveBlockFrameUpdateIndices } from "@/features/pitch/application/blockFrameIdentity";

const source = `<Slide>
  <Text id="text-a" x={10} y={10} w={30} h={10}>A</Text>
  <ImageBlock id="image-a" src="/image.png" x={50} y={10} w={40} h={60} />
</Slide>`;

test("resolves a transient frame by persistent block id after sibling reordering", () => {
  const originalBlocks = parseMotionDoc(source).scenes[0].blocks;
  const image = originalBlocks[1];
  const reorderedBlocks = [image, originalBlocks[0]];
  const updates = resolveBlockFrameUpdateIndices(reorderedBlocks, [{
    blockId: motionDocBlockKey(image, 1),
    blockIndex: 1,
    frame: { h: 62, w: 42, x: 48, y: 9 }
  }]);

  assert.deepEqual(updates, [{
    blockId: "image-a",
    blockIndex: 0,
    frame: { h: 62, w: 42, x: 48, y: 9 }
  }]);
});

test("drops a transient frame when its block was removed remotely", () => {
  const originalBlocks = parseMotionDoc(source).scenes[0].blocks;
  const image = originalBlocks[1];

  assert.deepEqual(resolveBlockFrameUpdateIndices([originalBlocks[0]], [{
    blockId: motionDocBlockKey(image, 1),
    blockIndex: 1,
    frame: { h: 62, w: 42, x: 48, y: 9 }
  }]), []);
});
