import assert from "node:assert/strict";
import test from "node:test";
import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";
import {
  decidePresentationRealtimeUpdate,
  reconcilePresentationSaveResult,
  type ActivePresentationSave
} from "@/features/workspace/application/presentationRealtimeSync";

const remotePresentation: WorkspacePresentation = {
  createdAt: "2026-07-15T00:00:00.000Z",
  editorTemplateId: "template-a",
  id: "presentation-1",
  kind: "presentation",
  lastOpenedAt: "2026-07-15T00:00:00.000Z",
  ownerId: "user-1",
  source: "source-a",
  sourceRevision: 2,
  title: "Deck",
  updatedAt: "2026-07-15T00:01:00.000Z"
};

const activeSave: ActivePresentationSave = {
  editorSnapshot: {
    editorTemplateId: remotePresentation.editorTemplateId,
    source: "editor-source-a",
    title: remotePresentation.title
  },
  expectedSourceRevision: 1,
  persistedSnapshot: {
    editorTemplateId: remotePresentation.editorTemplateId,
    source: remotePresentation.source,
    title: remotePresentation.title
  },
  presentationId: remotePresentation.id
};

test("ignores a Realtime update that is not newer than the acknowledged revision", () => {
  assert.equal(decidePresentationRealtimeUpdate(remotePresentation, {
    activeSave: null,
    currentSourceRevision: remotePresentation.sourceRevision,
    editorSnapshot: { source: "source-a", title: "Deck" },
    persistedEditorSnapshot: { source: "source-a", title: "Deck" }
  }), "ignore-stale-update");
});

test("acknowledges the active local save without applying it over a newer editor source", () => {
  assert.equal(decidePresentationRealtimeUpdate(remotePresentation, {
    activeSave,
    currentSourceRevision: 1,
    editorSnapshot: { source: "source-b", title: "Deck" },
    persistedEditorSnapshot: { source: "editor-source-before-a", title: "Deck" }
  }), "acknowledge-local-save");
});

test("preserves an unsaved local edit when an unrelated remote update arrives", () => {
  assert.equal(decidePresentationRealtimeUpdate({
    ...remotePresentation,
    source: "remote-source"
  }, {
    activeSave,
    currentSourceRevision: 1,
    editorSnapshot: { source: "local-source", title: "Deck" },
    persistedEditorSnapshot: { source: "persisted-source", title: "Deck" }
  }), "preserve-local-edit");
});

test("applies a newer remote update when the editor has no local changes", () => {
  assert.equal(decidePresentationRealtimeUpdate({
    ...remotePresentation,
    source: "remote-source"
  }, {
    activeSave: null,
    currentSourceRevision: 1,
    editorSnapshot: { source: "persisted-source", title: "Deck" },
    persistedEditorSnapshot: { source: "persisted-source", title: "Deck" }
  }), "apply-remote-update");
});

test("does not mistake a revision jump with matching content for the active local save", () => {
  assert.equal(decidePresentationRealtimeUpdate({
    ...remotePresentation,
    sourceRevision: 3
  }, {
    activeSave,
    currentSourceRevision: 1,
    editorSnapshot: { source: "local-source", title: "Deck" },
    persistedEditorSnapshot: { source: "persisted-source", title: "Deck" }
  }), "preserve-local-edit");
});

test("preserves a local template-only edit", () => {
  assert.equal(decidePresentationRealtimeUpdate({
    ...remotePresentation,
    source: "remote-source"
  }, {
    activeSave: null,
    currentSourceRevision: 1,
    editorSnapshot: { editorTemplateId: "template-b", source: "source-a", title: "Deck" },
    persistedEditorSnapshot: { editorTemplateId: "template-a", source: "source-a", title: "Deck" }
  }), "preserve-local-edit");
});

test("reconciles a committed save whose HTTP response was lost", () => {
  assert.equal(
    reconcilePresentationSaveResult(remotePresentation, activeSave),
    "acknowledge-committed-save"
  );
});

test("retries when the database revision did not advance", () => {
  assert.equal(reconcilePresentationSaveResult({
    ...remotePresentation,
    source: "persisted-source-before-save",
    sourceRevision: activeSave.expectedSourceRevision
  }, activeSave), "retry-save");
});

test("stops when reconciliation finds a different remote document", () => {
  assert.equal(reconcilePresentationSaveResult({
    ...remotePresentation,
    source: "another-editor-source"
  }, activeSave), "remote-conflict");
});
