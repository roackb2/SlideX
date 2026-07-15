import {
  presentationSnapshotEquals,
  type PresentationEditorSnapshot
} from "@/features/workspace/application/presentationRealtimeSync";

const recoveryDraftPrefix = "slidex_presentation_recovery_v1:";

export type PresentationRecoveryDraft = {
  baseSourceRevision: number;
  presentationId: string;
  snapshot: PresentationEditorSnapshot;
  updatedAt: string;
};

type RecoveryStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export function readPresentationRecoveryDraft(
  presentationId: string,
  storage: RecoveryStorage | undefined = browserStorage()
) {
  if (!storage) return null;
  try {
    const value: unknown = JSON.parse(storage.getItem(recoveryDraftKey(presentationId)) ?? "null");
    return isPresentationRecoveryDraft(value, presentationId) ? value : null;
  } catch {
    return null;
  }
}

export function writePresentationRecoveryDraft(
  draft: Omit<PresentationRecoveryDraft, "updatedAt">,
  storage: RecoveryStorage | undefined = browserStorage()
) {
  if (!storage) return false;
  try {
    storage.setItem(recoveryDraftKey(draft.presentationId), JSON.stringify({
      ...draft,
      updatedAt: new Date().toISOString()
    } satisfies PresentationRecoveryDraft));
    return true;
  } catch {
    return false;
  }
}

export function advancePresentationRecoveryDraft(
  presentationId: string,
  savedSnapshot: PresentationEditorSnapshot,
  nextSourceRevision: number,
  storage: RecoveryStorage | undefined = browserStorage()
) {
  if (!storage) return;
  const draft = readPresentationRecoveryDraft(presentationId, storage);
  if (!draft) return;
  if (presentationSnapshotEquals(draft.snapshot, savedSnapshot)) {
    storage.removeItem(recoveryDraftKey(presentationId));
    return;
  }

  writePresentationRecoveryDraft({
    ...draft,
    baseSourceRevision: nextSourceRevision
  }, storage);
}

export function clearPresentationRecoveryDraft(
  presentationId: string,
  storage: RecoveryStorage | undefined = browserStorage()
) {
  if (!storage) return;
  try {
    storage.removeItem(recoveryDraftKey(presentationId));
  } catch {
    // Recovery cleanup must never interrupt the editor.
  }
}

function recoveryDraftKey(presentationId: string) {
  return `${recoveryDraftPrefix}${presentationId}`;
}

function browserStorage(): RecoveryStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function isPresentationRecoveryDraft(
  value: unknown,
  expectedPresentationId: string
): value is PresentationRecoveryDraft {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const snapshot = record.snapshot;
  if (typeof snapshot !== "object" || snapshot === null) return false;
  const snapshotRecord = snapshot as Record<string, unknown>;

  return (
    record.presentationId === expectedPresentationId &&
    typeof record.baseSourceRevision === "number" &&
    Number.isSafeInteger(record.baseSourceRevision) &&
    record.baseSourceRevision >= 0 &&
    typeof record.updatedAt === "string" &&
    typeof snapshotRecord.source === "string" &&
    typeof snapshotRecord.title === "string" &&
    (
      snapshotRecord.editorTemplateId === undefined ||
      typeof snapshotRecord.editorTemplateId === "string"
    )
  );
}
