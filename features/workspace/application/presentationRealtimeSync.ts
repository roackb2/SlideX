import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";

export type PresentationEditorSnapshot = Pick<
  WorkspacePresentation,
  "editorTemplateId" | "source" | "title"
>;

export type ActivePresentationSave = {
  editorSnapshot: PresentationEditorSnapshot;
  expectedSourceRevision: number;
  persistedSnapshot: PresentationEditorSnapshot;
  presentationId: string;
};

type PresentationRealtimeSyncState = {
  activeSave: ActivePresentationSave | null;
  currentSourceRevision: number;
  editorSnapshot: PresentationEditorSnapshot | null;
  persistedEditorSnapshot: PresentationEditorSnapshot | null;
};

export type PresentationRealtimeUpdateDecision =
  | "acknowledge-local-save"
  | "apply-remote-update"
  | "ignore-stale-update"
  | "preserve-local-edit";

export type PresentationSaveReconciliationDecision =
  | "acknowledge-committed-save"
  | "remote-conflict"
  | "retry-save";

export function normalizePresentationEditorTemplateId(value: string | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized && normalized.length <= 160 ? normalized : undefined;
}

export function reconcilePresentationSaveResult(
  remotePresentation: WorkspacePresentation | null,
  activeSave: ActivePresentationSave
): PresentationSaveReconciliationDecision {
  if (!remotePresentation || remotePresentation.sourceRevision <= activeSave.expectedSourceRevision) {
    return "retry-save";
  }

  if (
    remotePresentation.sourceRevision === activeSave.expectedSourceRevision + 1 &&
    presentationSnapshotEquals(remotePresentation, activeSave.persistedSnapshot)
  ) {
    return "acknowledge-committed-save";
  }

  return "remote-conflict";
}

export function decidePresentationRealtimeUpdate(
  remotePresentation: WorkspacePresentation,
  state: PresentationRealtimeSyncState
): PresentationRealtimeUpdateDecision {
  if (remotePresentation.sourceRevision <= state.currentSourceRevision) {
    return "ignore-stale-update";
  }

  if (
    state.activeSave &&
    remotePresentation.id === state.activeSave.presentationId &&
    remotePresentation.sourceRevision === state.activeSave.expectedSourceRevision + 1 &&
    presentationSnapshotEquals(remotePresentation, state.activeSave.persistedSnapshot)
  ) {
    return "acknowledge-local-save";
  }

  if (
    state.editorSnapshot !== null &&
    state.persistedEditorSnapshot !== null &&
    !presentationSnapshotEquals(state.editorSnapshot, state.persistedEditorSnapshot)
  ) {
    return "preserve-local-edit";
  }

  return "apply-remote-update";
}

export function presentationSnapshotEquals(
  left: PresentationEditorSnapshot,
  right: PresentationEditorSnapshot
) {
  return (
    left.source === right.source &&
    left.editorTemplateId === right.editorTemplateId &&
    left.title === right.title
  );
}
