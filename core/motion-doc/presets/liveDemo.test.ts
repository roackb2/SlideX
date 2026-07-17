import assert from "node:assert/strict";
import test from "node:test";
import { liveDemoPresentation } from "@/core/motion-doc/presets/liveDemo";

test("serves a versioned Traditional Chinese Live Demo", () => {
  const demo = liveDemoPresentation("zh-TW");

  assert.equal(demo.id, "slidex-live-demo-launch-v7-zh-tw");
  assert.equal(demo.title, "產品發布簡報");
  assert.match(demo.source, /讓每次發布都勢在必行。/);
  assert.match(demo.source, /試點・發布・擴展/);
  assert.doesNotMatch(demo.source, /Make every launch feel inevitable\./);
});

test("keeps the original English Live Demo available", () => {
  const demo = liveDemoPresentation("en");

  assert.equal(demo.id, "slidex-live-demo-launch-v6");
  assert.equal(demo.title, "Launch Deck");
  assert.match(demo.source, /Make every launch feel inevitable\./);
});
