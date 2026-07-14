import assert from "node:assert/strict";
import test from "node:test";
import { parseWorkspacePresentations } from "@/features/workspace/domain/presentation";

const storedPresentation = {
  createdAt: "2026-07-14T00:00:00.000Z",
  id: "presentation-1",
  kind: "presentation",
  lastOpenedAt: "2026-07-14T00:00:00.000Z",
  ownerId: "user-1",
  source: "# Deck",
  title: "Deck",
  updatedAt: "2026-07-14T00:00:00.000Z"
};

test("migrates legacy local presentations to source revision zero", () => {
  const [presentation] = parseWorkspacePresentations([storedPresentation]);
  assert.equal(presentation?.sourceRevision, 0);
});

test("preserves a valid source revision", () => {
  const [presentation] = parseWorkspacePresentations([{
    ...storedPresentation,
    sourceRevision: 7
  }]);
  assert.equal(presentation?.sourceRevision, 7);
});

test("rejects invalid source revisions back to zero", () => {
  const [presentation] = parseWorkspacePresentations([{
    ...storedPresentation,
    sourceRevision: -1
  }]);
  assert.equal(presentation?.sourceRevision, 0);
});
