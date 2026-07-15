import assert from "node:assert/strict";
import test from "node:test";
import { motionDocBlockId } from "@/core/motion-doc/application/motionDocBlockIdentity";
import {
  ensureMotionDocSourceBlockIds,
  generateSlideString
} from "@/core/motion-doc/application/motionDocSerialize";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";

const legacySource = `# Stable blocks

<Slide duration={5}>
  <Title x={8} y={8} w={40} h={12}>Title</Title>
  <Text x={8} y={24} w={40} h={10}>Body</Text>
  <ImageBlock src="https://example.com/image.png" x={52} y={8} w={40} h={70} />
</Slide>`;

test("source normalization assigns unique persistent ids to legacy blocks", () => {
  const normalized = ensureMotionDocSourceBlockIds(legacySource);
  const scene = parseMotionDoc(normalized).scenes[0];
  const ids = scene.blocks.map(motionDocBlockId);

  assert.equal(ids.length, 3);
  assert.equal(ids.every(Boolean), true);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ensureMotionDocSourceBlockIds(normalized), normalized);
});

test("deleting a sibling preserves the remaining image identity", () => {
  const normalized = ensureMotionDocSourceBlockIds(legacySource);
  const scene = parseMotionDoc(normalized).scenes[0];
  const image = scene.blocks[2];
  const imageId = motionDocBlockId(image);
  const nextSlide = { ...scene, blocks: scene.blocks.slice(1) };
  const reparsed = parseMotionDoc(`# Stable blocks\n\n${generateSlideString(nextSlide)}`).scenes[0];
  const remainingImage = reparsed.blocks.find((block) => block.type === "ImageBlock");

  assert.ok(remainingImage);
  assert.equal(motionDocBlockId(remainingImage), imageId);
});

test("source normalization repairs duplicate ids", () => {
  const duplicated = `<Slide>
  <Text id="block-same">One</Text>
  <Text id="block-same">Two</Text>
</Slide>`;
  const scene = parseMotionDoc(ensureMotionDocSourceBlockIds(duplicated)).scenes[0];
  const ids = scene.blocks.map(motionDocBlockId);

  assert.equal(ids[0], "block-same");
  assert.notEqual(ids[1], "block-same");
  assert.equal(new Set(ids).size, 2);
});

test("source normalization preserves unknown markup, ordering, and every existing prop", () => {
  const source = `<Slide duration={8} transition="fade">
  <Text duration={2} mb={12} radius={22}>First</Text>
  ## Middle heading
  <Unknown custom="keep-me" />
  <ImageBlock src="https://example.com/image.png" marginBottom={9} />
</Slide>`;
  const normalized = ensureMotionDocSourceBlockIds(source);
  const withoutIdentities = normalized
    .replace(/\s+id="block-[^"]+"/g, "")
    .replace(/\s+<!--\s*slidex-block-id\s*:\s*block-[A-Za-z0-9._:-]+\s*-->/g, "");

  assert.equal(withoutIdentities, source);
  assert.ok(normalized.indexOf("<Text") < normalized.indexOf("## Middle heading"));
  assert.ok(normalized.indexOf("## Middle heading") < normalized.indexOf("<Unknown"));
  assert.ok(normalized.indexOf("<Unknown") < normalized.indexOf("<ImageBlock"));
  assert.match(normalized, /duration=\{2\} mb=\{12\} radius=\{22\}/);
  assert.match(normalized, /<Unknown custom="keep-me" \/>/);
  const heading = parseMotionDoc(normalized).scenes[0].blocks.find((block) => block.type === "heading");
  assert.ok(heading && motionDocBlockId(heading));
  assert.equal(ensureMotionDocSourceBlockIds(normalized), normalized);
});

test("source normalization does not annotate content owned by an unknown paired component", () => {
  const source = `<Slide>
  <UnknownPanel>
    Proprietary child syntax
  </UnknownPanel>
  <Text>Known text</Text>
</Slide>`;
  const normalized = ensureMotionDocSourceBlockIds(source);

  assert.match(normalized, /<UnknownPanel>\n    Proprietary child syntax\n  <\/UnknownPanel>/);
  assert.doesNotMatch(normalized, /Proprietary child syntax.*slidex-block-id/);
});

test("markdown blocks receive persistent identities without changing their visible text", () => {
  const normalized = ensureMotionDocSourceBlockIds(`<Slide>
  # Markdown title
  ## Markdown heading
  Plain body
</Slide>`);
  const blocks = parseMotionDoc(normalized).scenes[0].blocks;

  assert.deepEqual(blocks.map((block) => "text" in block ? block.text : ""), [
    "Markdown title",
    "Markdown heading",
    "Plain body"
  ]);
  assert.equal(blocks.every((block) => Boolean(motionDocBlockId(block))), true);
});
