const guestDemoDraftStorageKey = "slidex_guest_demo_draft_v4";
const legacyGuestDemoDraftStorageKeys = [
  "slidex_guest_demo_draft_v3",
  "slidex_guest_demo_draft_v2"
] as const;
const liveDemoOriginTemplateId = "launch-deck";

export type GuestDemoDraft = {
  createdAt: string;
  editorTemplateId?: string;
  id: string;
  importId: string;
  source: string;
  templateId: string;
  title: string;
  updatedAt: string;
};

function isGuestDemoDraft(value: unknown): value is GuestDemoDraft {
  if (typeof value !== "object" || value === null) return false;

  return (
    "createdAt" in value && typeof value.createdAt === "string" &&
    (!("editorTemplateId" in value) || value.editorTemplateId === undefined || typeof value.editorTemplateId === "string") &&
    "id" in value && typeof value.id === "string" &&
    "importId" in value && typeof value.importId === "string" &&
    "source" in value && typeof value.source === "string" &&
    "templateId" in value && typeof value.templateId === "string" &&
    "title" in value && typeof value.title === "string" &&
    "updatedAt" in value && typeof value.updatedAt === "string"
  );
}

type LegacyGuestDemoDraft = Omit<GuestDemoDraft, "editorTemplateId" | "importId"> & {
  importId?: string;
};

function isLegacyGuestDemoDraft(value: unknown): value is LegacyGuestDemoDraft {
  if (typeof value !== "object" || value === null) return false;

  return (
    "createdAt" in value && typeof value.createdAt === "string" &&
    "id" in value && typeof value.id === "string" &&
    (!("importId" in value) || typeof value.importId === "string") &&
    "source" in value && typeof value.source === "string" &&
    "templateId" in value && typeof value.templateId === "string" &&
    "title" in value && typeof value.title === "string" &&
    "updatedAt" in value && typeof value.updatedAt === "string"
  );
}

export function readGuestDemoDraft() {
  try {
    const storedValue = window.localStorage.getItem(guestDemoDraftStorageKey);
    if (storedValue) {
      const parsedValue: unknown = JSON.parse(storedValue);
      return isGuestDemoDraft(parsedValue) ? parsedValue : null;
    }

    const legacyStorageKey = legacyGuestDemoDraftStorageKeys.find(
      (key) => window.localStorage.getItem(key) !== null
    );
    if (!legacyStorageKey) return null;
    const legacyValue = window.localStorage.getItem(legacyStorageKey);
    if (!legacyValue) return null;
    const legacyDraft: unknown = JSON.parse(legacyValue);
    if (!isLegacyGuestDemoDraft(legacyDraft)) return null;

    const migratedDraft = {
      ...legacyDraft,
      editorTemplateId: legacyDraft.templateId === liveDemoOriginTemplateId
        ? undefined
        : legacyDraft.templateId,
      importId: legacyDraft.importId ?? crypto.randomUUID(),
      templateId: liveDemoOriginTemplateId
    } satisfies GuestDemoDraft;
    window.localStorage.setItem(guestDemoDraftStorageKey, JSON.stringify(migratedDraft));
    legacyGuestDemoDraftStorageKeys.forEach((key) => window.localStorage.removeItem(key));
    return migratedDraft;
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
  const draft: GuestDemoDraft = {
    createdAt: timestamp,
    id,
    importId: crypto.randomUUID(),
    source,
    templateId,
    title,
    updatedAt: timestamp
  };
  try {
    window.localStorage.setItem(guestDemoDraftStorageKey, JSON.stringify(draft));
  } catch {
    // The editor can still open; save and sign-in actions will surface the storage failure.
  }
  return draft;
}

export function updateGuestDemoDraft(source: string, title: string, templateId?: string) {
  const draft = readGuestDemoDraft();
  if (!draft) throw new Error("This browser could not store the Live Demo draft.");

  const updatedDraft = {
    ...draft,
    editorTemplateId: templateId ?? draft.editorTemplateId,
    source,
    title: title.trim() || draft.title,
    updatedAt: new Date().toISOString()
  } satisfies GuestDemoDraft;
  window.localStorage.setItem(guestDemoDraftStorageKey, JSON.stringify(updatedDraft));
  return updatedDraft;
}

export function clearGuestDemoDraft(importId: string) {
  const draft = readGuestDemoDraft();
  if (draft?.importId !== importId) return;
  window.localStorage.removeItem(guestDemoDraftStorageKey);
}
