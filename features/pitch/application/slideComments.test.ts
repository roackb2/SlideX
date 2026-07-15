import assert from "node:assert/strict";
import test from "node:test";
import {
  appendSlideComment,
  removeSlideComment
} from "@/features/pitch/application/slideComments";

test("removes a resolved comment from its slide", () => {
  const comments = appendSlideComment({}, 2, "Please update this title.");
  const commentId = comments[2][0].id;

  assert.deepEqual(removeSlideComment(comments, 2, commentId), {});
});

test("keeps other comments when one is resolved", () => {
  const first = appendSlideComment({}, 1, "First", undefined, "2026-07-14T00:00:00.000Z");
  const comments = appendSlideComment(first, 1, "Second", undefined, "2026-07-14T00:01:00.000Z");

  const next = removeSlideComment(comments, 1, comments[1][0].id);

  assert.equal(next[1].length, 1);
  assert.equal(next[1][0].body, "Second");
});
