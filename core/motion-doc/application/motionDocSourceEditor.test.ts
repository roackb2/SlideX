import assert from "node:assert/strict";
import test from "node:test";
import {
  appendMotionDocSlideSource,
  deleteMotionDocSlideSource,
  insertMotionDocSlideSource,
  motionDocSlideSourceRanges,
  reorderMotionDocSlideSource,
  replaceMotionDocSlideOpeningTag,
  replaceMotionDocSlideSource
} from "@/core/motion-doc/application/motionDocSourceEditor";

const source = `# Deck

<Slide duration={5} theme="dark">
  <Title>One</Title>
</Slide>

<Scene duration={6}>
  <Title>Two</Title>
</Scene>`;

test("scans Slide and Scene ranges", () => {
  const ranges = motionDocSlideSourceRanges(source);
  assert.equal(ranges.length, 2);
  assert.match(ranges[0].openingTag, /^<Slide/);
  assert.match(ranges[1].openingTag, /^<Scene/);
});

test("inserts, appends, replaces, deletes and reorders slides", () => {
  const inserted = insertMotionDocSlideSource(source, 0, "<Slide><Text>Inserted</Text></Slide>", "after");
  assert.deepEqual(motionDocSlideSourceRanges(inserted).map((range) => range.source.includes("Inserted")), [false, true, false]);

  const appended = appendMotionDocSlideSource(source, "<Slide><Text>Last</Text></Slide>");
  assert.equal(motionDocSlideSourceRanges(appended).length, 3);

  const replaced = replaceMotionDocSlideSource(source, 1, "<Slide><Text>Replacement</Text></Slide>");
  assert.match(replaced, /Replacement/);
  assert.doesNotMatch(replaced, />Two</);

  const deleted = deleteMotionDocSlideSource(source, 0);
  assert.equal(motionDocSlideSourceRanges(deleted).length, 1);
  assert.match(deleted, />Two</);

  const reordered = reorderMotionDocSlideSource(source, 1, 0);
  assert.ok(reordered.indexOf(">Two<") < reordered.indexOf(">One<"));
});

test("replaces only the selected opening tag", () => {
  const nextSource = replaceMotionDocSlideOpeningTag(source, 1, '<Slide duration={8} theme="light">');
  assert.match(nextSource, /<Slide duration=\{5\} theme="dark">/);
  assert.match(nextSource, /<Slide duration=\{8\} theme="light">/);
});
