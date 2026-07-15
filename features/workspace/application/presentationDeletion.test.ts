import assert from "node:assert/strict";
import test from "node:test";
import { canConfirmPresentationDeletion } from "@/features/workspace/application/presentationDeletion";
import { canDeleteWorkspacePresentation, type WorkspacePresentation } from "@/features/workspace/domain/presentation";

const presentation = {
  createdAt: "2026-07-14T00:00:00.000Z",
  id: "presentation-id",
  kind: "presentation",
  lastOpenedAt: "2026-07-14T00:00:00.000Z",
  ownerId: "user-id",
  source: "",
  sourceRevision: 0,
  title: "Quarterly review",
  updatedAt: "2026-07-14T00:00:00.000Z"
} satisfies WorkspacePresentation;

test("requires the complete presentation name before deletion", () => {
  assert.equal(canConfirmPresentationDeletion("Quarterly review", "Quarterly review"), true);
  assert.equal(canConfirmPresentationDeletion("Quarterly", "Quarterly review"), false);
});

test("keeps confirmation case-sensitive and whitespace-sensitive", () => {
  assert.equal(canConfirmPresentationDeletion("quarterly review", "Quarterly review"), false);
  assert.equal(canConfirmPresentationDeletion("Quarterly review ", "Quarterly review"), false);
});

test("allows regular presentations to be deleted", () => {
  assert.equal(canDeleteWorkspacePresentation(presentation), true);
});

test("prevents official template presentations from being deleted", () => {
  assert.equal(canDeleteWorkspacePresentation({ ...presentation, kind: "template" }), false);
});
