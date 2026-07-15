import assert from "node:assert/strict";
import test from "node:test";
import {
  deleteMotionDocSlide,
  reorderMotionDocSlide
} from "@/core/motion-doc/application/motionDocAutomation";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import {
  deleteSlideSource,
  duplicateBlockAt,
  reorderSlideSource
} from "@/features/pitch/application/motionDocCommands";
import { createMotionDocBlock } from "@/core/motion-doc/application/motionDocBlockFactory";
import { motionDocBlockId } from "@/core/motion-doc/application/motionDocBlockIdentity";

const source = `# Commands

<Slide><Title>One</Title></Slide>

<Slide><Title>Two</Title></Slide>

<Slide><Title>Three</Title></Slide>`;

test("UI and AI slide delete commands share the same source behavior", () => {
  const uiSource = deleteSlideSource(source, 1);
  const aiSource = deleteMotionDocSlide(source, 1).source;
  assert.equal(uiSource, aiSource);
  assert.deepEqual(parseMotionDoc(uiSource).scenes.flatMap((scene) => scene.blocks.map((block) => "text" in block ? block.text : "")), ["One", "Three"]);
});

test("UI and AI slide reorder commands share the same source behavior", () => {
  const uiSource = reorderSlideSource(source, 2, 0);
  const aiSource = reorderMotionDocSlide(source, 2, 0).source;
  assert.equal(uiSource, aiSource);
  assert.deepEqual(parseMotionDoc(uiSource).scenes.map((scene) => scene.blocks[0] && "text" in scene.blocks[0] ? scene.blocks[0].text : ""), ["Three", "One", "Two"]);
});

test("duplicating a block gives the copy a new stable identity", () => {
  const original = createMotionDocBlock("Text");
  const result = duplicateBlockAt({ blocks: [original], duration: 5, props: {} }, 0);

  assert.ok(result);
  assert.notEqual(motionDocBlockId(result.slide.blocks[0]), motionDocBlockId(result.slide.blocks[1]));
});
