import assert from "node:assert/strict";
import test from "node:test";
import { generateSlideString } from "@/core/motion-doc/application/motionDocSerialize";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";

test("parser and serializer preserve supported block types and content", () => {
  const source = `# Round trip

<Slide duration={7} theme="light">
  <Title x={8} y={10} w={84} h={14}>Hello</Title>
  <Text x={8} y={28} w={84} h={12}>World</Text>
  <Table rows={2} columns={2} cells="A|B;1|2" x={8} y={45} w={84} h={35} />
</Slide>`;
  const document = parseMotionDoc(source);
  const serialized = generateSlideString(document.scenes[0]);
  const reparsed = parseMotionDoc(`# Round trip\n\n${serialized}`);

  assert.equal(reparsed.scenes.length, 1);
  assert.deepEqual(reparsed.scenes[0].blocks.map((block) => block.type), ["Title", "Text", "Table"]);
  assert.equal(reparsed.scenes[0].duration, 7);
  assert.equal(reparsed.scenes[0].props.theme, "light");
});
