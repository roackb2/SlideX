import assert from "node:assert/strict";
import test from "node:test";
import {
  createPresentationSaveCoordinator,
  enqueueLatestPresentationSave,
  type PresentationSaveRequest
} from "@/features/workspace/application/presentationSaveCoordinator";

function request(source: string): PresentationSaveRequest {
  return {
    editorSnapshot: { source, title: "Deck" },
    generation: 1,
    persistedSnapshot: { source, title: "Deck" },
    presentationId: "presentation-1"
  };
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

test("keeps one active save and collapses pending work to the latest snapshot", async () => {
  const coordinator = createPresentationSaveCoordinator(1);
  const firstSave = deferred();
  const persistedSources: string[] = [];
  const persist = async (saveRequest: PresentationSaveRequest) => {
    persistedSources.push(saveRequest.persistedSnapshot.source);
    if (persistedSources.length === 1) await firstSave.promise;
  };

  const saveA = enqueueLatestPresentationSave(coordinator, request("source-a"), persist);
  const saveB = enqueueLatestPresentationSave(coordinator, request("source-b"), persist);
  const saveC = enqueueLatestPresentationSave(coordinator, request("source-c"), persist);

  assert.deepEqual(persistedSources, ["source-a"]);
  firstSave.resolve();
  await Promise.all([saveA, saveB, saveC]);

  assert.deepEqual(persistedSources, ["source-a", "source-c"]);
  assert.equal(coordinator.pending, null);
  assert.equal(coordinator.running, null);
});

test("does not discard an undo back to the currently persisted source while another save is active", async () => {
  const coordinator = createPresentationSaveCoordinator(1);
  const firstSave = deferred();
  let serverSource = "source-0";
  const persistedSources: string[] = [];
  const persist = async (saveRequest: PresentationSaveRequest) => {
    const nextSource = saveRequest.persistedSnapshot.source;
    if (serverSource === nextSource) return;
    persistedSources.push(nextSource);
    if (persistedSources.length === 1) await firstSave.promise;
    serverSource = nextSource;
  };

  const saveForward = enqueueLatestPresentationSave(coordinator, request("source-1"), persist);
  const saveUndo = enqueueLatestPresentationSave(coordinator, request("source-0"), persist);
  firstSave.resolve();
  await Promise.all([saveForward, saveUndo]);

  assert.deepEqual(persistedSources, ["source-1", "source-0"]);
  assert.equal(serverSource, "source-0");
});

test("attempts the latest pending snapshot when an older active save fails", async () => {
  const coordinator = createPresentationSaveCoordinator(1);
  const firstSave = deferred();
  const persistedSources: string[] = [];
  const persist = async (saveRequest: PresentationSaveRequest) => {
    const source = saveRequest.persistedSnapshot.source;
    persistedSources.push(source);
    if (source === "source-a") {
      await firstSave.promise;
      throw new Error("temporary network failure");
    }
  };

  const saveA = enqueueLatestPresentationSave(coordinator, request("source-a"), persist);
  const saveB = enqueueLatestPresentationSave(coordinator, request("source-b"), persist);
  firstSave.resolve();
  await Promise.all([saveA, saveB]);

  assert.deepEqual(persistedSources, ["source-a", "source-b"]);
  assert.equal(coordinator.pending, null);
  assert.equal(coordinator.running, null);
});

test("keeps each persisted source paired with the editor snapshot that produced it", async () => {
  const coordinator = createPresentationSaveCoordinator(1);
  const firstSave = deferred();
  const requests: PresentationSaveRequest[] = [];
  const persist = async (saveRequest: PresentationSaveRequest) => {
    requests.push(saveRequest);
    if (requests.length === 1) await firstSave.promise;
  };
  const firstRequest = {
    ...request("embedded-source-a"),
    editorSnapshot: { source: "editor-source-a", title: "Deck" }
  };
  const secondRequest = {
    ...request("embedded-source-b"),
    editorSnapshot: { source: "editor-source-b", title: "Deck" }
  };

  const saveA = enqueueLatestPresentationSave(coordinator, firstRequest, persist);
  const saveB = enqueueLatestPresentationSave(coordinator, secondRequest, persist);
  firstSave.resolve();
  await Promise.all([saveA, saveB]);

  assert.equal(requests[0].editorSnapshot.source, "editor-source-a");
  assert.equal(requests[1].editorSnapshot.source, "editor-source-b");
});

test("does not attempt pending work after a revision conflict", async () => {
  const coordinator = createPresentationSaveCoordinator(1);
  const firstSave = deferred();
  const persistedSources: string[] = [];
  const conflict = Object.assign(new Error("conflict"), {
    name: "PresentationRevisionConflictError"
  });
  const persist = async (saveRequest: PresentationSaveRequest) => {
    persistedSources.push(saveRequest.persistedSnapshot.source);
    await firstSave.promise;
    throw conflict;
  };

  const saveA = enqueueLatestPresentationSave(coordinator, request("source-a"), persist);
  void enqueueLatestPresentationSave(coordinator, request("source-b"), persist).catch(() => undefined);
  firstSave.resolve();
  await assert.rejects(saveA, conflict);

  assert.deepEqual(persistedSources, ["source-a"]);
  assert.equal(coordinator.pending?.persistedSnapshot.source, "source-b");
});
