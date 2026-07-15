const guestDemoDraftStorageKey = "slidex_guest_demo_draft_v3";
const legacyGuestDemoDraftStorageKey = "slidex_guest_demo_draft_v2";

export type GuestDemoDraft = {
  createdAt: string;
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
    "id" in value && typeof value.id === "string" &&
    "importId" in value && typeof value.importId === "string" &&
    "source" in value && typeof value.source === "string" &&
    "templateId" in value && typeof value.templateId === "string" &&
    "title" in value && typeof value.title === "string" &&
    "updatedAt" in value && typeof value.updatedAt === "string"
  );
}

function isLegacyGuestDemoDraft(value: unknown): value is Omit<GuestDemoDraft, "importId"> {
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
    if (storedValue) {
      const parsedValue: unknown = JSON.parse(storedValue);
      return isGuestDemoDraft(parsedValue) ? parsedValue : null;
    }

    const legacyValue = window.localStorage.getItem(legacyGuestDemoDraftStorageKey);
    if (!legacyValue) return null;
    const legacyDraft: unknown = JSON.parse(legacyValue);
    if (!isLegacyGuestDemoDraft(legacyDraft)) return null;

    const migratedDraft = {
      ...legacyDraft,
      importId: crypto.randomUUID()
    } satisfies GuestDemoDraft;
    window.localStorage.setItem(guestDemoDraftStorageKey, JSON.stringify(migratedDraft));
    window.localStorage.removeItem(legacyGuestDemoDraftStorageKey);
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
  const draft = {
    createdAt: timestamp,
    id,
    importId: crypto.randomUUID(),
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

export function updateGuestDemoDraft(source: string, title: string, templateId?: string) {
  const draft = readGuestDemoDraft();
  if (!draft) throw new Error("This browser could not store the Live Demo draft.");

  const updatedDraft = {
    ...draft,
    source,
    templateId: templateId ?? draft.templateId,
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
