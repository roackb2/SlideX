import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";
import {
  createLocalPresentation,
  getLocalPresentation,
  updateLocalPresentation
} from "@/features/workspace/infrastructure/localPresentationRepository";

const guestDemoDraftStorageKey = "slidex_guest_demo_draft_v2";

function promotionStorageKey(ownerId: string) {
  return `slidex_guest_demo_promotion_v2:${ownerId}`;
}

export type GuestDemoDraft = {
  createdAt: string;
  id: string;
  source: string;
  templateId: string;
  title: string;
  updatedAt: string;
};

function isGuestDemoDraft(value: unknown): value is GuestDemoDraft {
  if (typeof value !== "object" || value === null) return false;

  return (
    "createdAt" in value && typeof value.createdAt === "string" &&
    "id" in value && typeof value.id === "string" &&
    "source" in value && typeof value.source === "string" &&
    "templateId" in value && typeof value.templateId === "string" &&
    "title" in value && typeof value.title === "string" &&
    "updatedAt" in value && typeof value.updatedAt === "string"
  );
}

export function readGuestDemoDraft() {
  try {
    const storedValue = window.localStorage.getItem(guestDemoDraftStorageKey);
    if (!storedValue) return null;
    const parsedValue: unknown = JSON.parse(storedValue);
    return isGuestDemoDraft(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

export function ensureGuestDemoDraft({
  id,
  source,
  templateId,
  title
}: Pick<GuestDemoDraft, "id" | "source" | "templateId" | "title">) {
  const existingDraft = readGuestDemoDraft();
  if (existingDraft?.id === id) return existingDraft;

  const timestamp = new Date().toISOString();
  const draft = {
    createdAt: timestamp,
    id,
    source,
    templateId,
    title,
    updatedAt: timestamp
  } satisfies GuestDemoDraft;
  try {
    window.localStorage.setItem(guestDemoDraftStorageKey, JSON.stringify(draft));
  } catch {
    // The editor can still open; save and sign-in actions will surface the storage failure.
  }
  return draft;
}

export function updateGuestDemoDraft(source: string, title: string) {
  const draft = readGuestDemoDraft();
  if (!draft) throw new Error("This browser could not store the Live Demo draft.");

  const updatedDraft = {
    ...draft,
    source,
    title: title.trim() || draft.title,
    updatedAt: new Date().toISOString()
  } satisfies GuestDemoDraft;
  window.localStorage.setItem(guestDemoDraftStorageKey, JSON.stringify(updatedDraft));
  return updatedDraft;
}

export function promoteGuestDemoDraft(ownerId: string, draft: GuestDemoDraft): WorkspacePresentation {
  const markerKey = promotionStorageKey(ownerId);
  const promotedPresentationId = window.localStorage.getItem(markerKey);
  const promotedPresentation = promotedPresentationId
    ? getLocalPresentation(ownerId, promotedPresentationId)
    : null;

  if (promotedPresentation) {
    return updateLocalPresentation(ownerId, promotedPresentation.id, {
      source: draft.source,
      title: draft.title
    }) ?? promotedPresentation;
  }

  const presentation = createLocalPresentation({
    ownerId,
    source: draft.source,
    templateId: draft.templateId,
    title: draft.title
  });
  window.localStorage.setItem(markerKey, presentation.id);
  return presentation;
}
