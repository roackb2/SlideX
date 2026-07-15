import assert from "node:assert/strict";
import test from "node:test";
import {
  advancePresentationRecoveryDraft,
  readPresentationRecoveryDraft,
  writePresentationRecoveryDraft
} from "@/features/workspace/infrastructure/presentationRecoveryDraft";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const presentationId = "presentation-1";

test("persists a synchronous recovery snapshot before the debounced save", () => {
  const storage = new MemoryStorage();
  assert.equal(writePresentationRecoveryDraft({
    baseSourceRevision: 4,
    presentationId,
    snapshot: { editorTemplateId: "blank:basic-white", source: "local-source", title: "Deck" }
  }, storage), true);

  const draft = readPresentationRecoveryDraft(presentationId, storage);
  assert.equal(draft?.baseSourceRevision, 4);
  assert.equal(draft?.snapshot.source, "local-source");
});

test("clears a recovery only when that exact editor snapshot was saved", () => {
  const storage = new MemoryStorage();
  writePresentationRecoveryDraft({
    baseSourceRevision: 4,
    presentationId,
    snapshot: { source: "newer-local-source", title: "Deck" }
  }, storage);

  advancePresentationRecoveryDraft(
    presentationId,
    { source: "older-saved-source", title: "Deck" },
    5,
    storage
  );
  assert.equal(readPresentationRecoveryDraft(presentationId, storage)?.baseSourceRevision, 5);

  advancePresentationRecoveryDraft(
    presentationId,
    { source: "newer-local-source", title: "Deck" },
    6,
    storage
  );
  assert.equal(readPresentationRecoveryDraft(presentationId, storage), null);
});
