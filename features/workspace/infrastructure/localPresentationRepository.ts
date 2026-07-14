import {
  canDeleteWorkspacePresentation,
  parseWorkspacePresentations,
  type WorkspacePresentation,
  type WorkspacePresentationKind
} from "@/features/workspace/domain/presentation";

function storageKey(ownerId: string) {
  return `slidex_local_presentations_v1:${ownerId}`;
}

function seedStorageKey(ownerId: string, seedId: string) {
  return `slidex_workspace_seed_v1:${ownerId}:${seedId}`;
}

type LocalPresentationSeedState = {
  presentationId: string;
  version: number;
};

function parseSeedState(value: string | null): LocalPresentationSeedState | null {
  if (!value) return null;

  try {
    const parsedValue: unknown = JSON.parse(value);
    if (
      typeof parsedValue !== "object" ||
      parsedValue === null ||
      !("presentationId" in parsedValue) ||
      !("version" in parsedValue) ||
      typeof parsedValue.presentationId !== "string" ||
      typeof parsedValue.version !== "number"
    ) {
      return null;
    }

    return {
      presentationId: parsedValue.presentationId,
      version: parsedValue.version
    };
  } catch {
    return null;
  }
}

function createLocalPresentationId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const randomPart = Math.random().toString(36).slice(2, 12);
  return `local-${Date.now().toString(36)}-${randomPart}`;
}

function createSeedPresentationId(seedId: string) {
  const normalizedSeedId = seedId.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `slidex-template-${normalizedSeedId}`;
}

function writePresentations(ownerId: string, presentations: WorkspacePresentation[]) {
  window.localStorage.setItem(storageKey(ownerId), JSON.stringify(presentations));
}

export function listLocalPresentations(ownerId: string): WorkspacePresentation[] {
  try {
    const storedValue = window.localStorage.getItem(storageKey(ownerId));
    const presentations = storedValue ? parseWorkspacePresentations(JSON.parse(storedValue)) : [];
    return presentations.sort((left, right) => right.lastOpenedAt.localeCompare(left.lastOpenedAt));
  } catch {
    return [];
  }
}

export function getLocalPresentation(ownerId: string, presentationId: string) {
  return listLocalPresentations(ownerId).find((presentation) => presentation.id === presentationId) ?? null;
}

export function createLocalPresentation({
  kind = "presentation",
  ownerId,
  source,
  templateId,
  title
}: Pick<WorkspacePresentation, "ownerId" | "source" | "title"> & { kind?: WorkspacePresentationKind; templateId?: string }): WorkspacePresentation {
  const timestamp = new Date().toISOString();
  const presentation = {
    createdAt: timestamp,
    id: createLocalPresentationId(),
    kind,
    lastOpenedAt: timestamp,
    ownerId,
    source,
    sourceRevision: 0,
    templateId,
    title,
    updatedAt: timestamp
  } satisfies WorkspacePresentation;
  const presentations = listLocalPresentations(ownerId);
  writePresentations(ownerId, [presentation, ...presentations]);
  return presentation;
}

type LocalPresentationSeed = Pick<WorkspacePresentation, "ownerId" | "source" | "title"> & {
  kind: "template";
  seedId: string;
  templateId?: string;
  version: number;
};

export function ensureLocalPresentationSeed({ kind, ownerId, seedId, source, templateId, title, version }: LocalPresentationSeed) {
  const markerKey = seedStorageKey(ownerId, seedId);
  const presentations = listLocalPresentations(ownerId);
  const seedState = parseSeedState(window.localStorage.getItem(markerKey));
  const markedPresentation = seedState
    ? presentations.find((presentation) => presentation.id === seedState.presentationId)
    : null;

  if (seedState && seedState.version >= version && markedPresentation) {
    const duplicateTemplates = templateId
      ? presentations.filter((presentation) => (
          presentation.id !== markedPresentation.id &&
          presentation.kind === "template" &&
          presentation.templateId === templateId
        ))
      : [];

    if (duplicateTemplates.length > 0) {
      const duplicateIds = new Set(duplicateTemplates.map((presentation) => presentation.id));
      writePresentations(ownerId, presentations.filter((presentation) => !duplicateIds.has(presentation.id)));
      return listLocalPresentations(ownerId);
    }

    return presentations;
  }

  const legacySeed = templateId
    ? presentations
        .filter((presentation) => presentation.templateId === templateId)
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt))[0]
    : null;
  const existingSeed = markedPresentation ?? legacySeed ?? null;
  let presentationId: string;

  if (existingSeed) {
    const timestamp = new Date().toISOString();
    const nextPresentations = presentations
      .filter((presentation) => (
        presentation.id === existingSeed.id ||
        presentation.kind !== "template" ||
        presentation.templateId !== templateId
      ))
      .map((presentation) => (
        presentation.id === existingSeed.id
          ? {
              ...presentation,
              kind,
              source,
              sourceRevision: presentation.sourceRevision + 1,
              templateId,
              title,
              updatedAt: timestamp
            }
          : presentation
      ));
    writePresentations(ownerId, nextPresentations);
    presentationId = existingSeed.id;
  } else {
    const timestamp = new Date().toISOString();
    presentationId = createSeedPresentationId(seedId);
    const presentation = {
      createdAt: timestamp,
      id: presentationId,
      kind,
      lastOpenedAt: timestamp,
      ownerId,
      source,
      sourceRevision: 0,
      templateId,
      title,
      updatedAt: timestamp
    } satisfies WorkspacePresentation;
    const latestPresentations = listLocalPresentations(ownerId);
    writePresentations(ownerId, [
      presentation,
      ...latestPresentations.filter((item) => item.id !== presentationId)
    ]);
  }

  window.localStorage.setItem(markerKey, JSON.stringify({ presentationId, version } satisfies LocalPresentationSeedState));
  return listLocalPresentations(ownerId);
}

export function updateLocalPresentation(
  ownerId: string,
  presentationId: string,
  updates: Pick<WorkspacePresentation, "source"> & Partial<Pick<WorkspacePresentation, "title">>
): WorkspacePresentation | null {
  const timestamp = new Date().toISOString();
  let updatedPresentation: WorkspacePresentation | null = null;
  const presentations = listLocalPresentations(ownerId).map((presentation) => {
    if (presentation.id !== presentationId) {
      return presentation;
    }

    updatedPresentation = {
      ...presentation,
      source: updates.source,
      sourceRevision: presentation.sourceRevision + 1,
      title: updates.title?.trim() || presentation.title,
      updatedAt: timestamp
    };
    return updatedPresentation;
  });
  writePresentations(ownerId, presentations);
  return updatedPresentation;
}

export function markLocalPresentationOpened(ownerId: string, presentationId: string) {
  const timestamp = new Date().toISOString();
  const presentations = listLocalPresentations(ownerId).map((presentation) => (
    presentation.id === presentationId
      ? { ...presentation, lastOpenedAt: timestamp }
      : presentation
  ));
  writePresentations(ownerId, presentations);
}

export function duplicateLocalPresentation(ownerId: string, presentationId: string, title: string) {
  const sourcePresentation = getLocalPresentation(ownerId, presentationId);
  if (!sourcePresentation) {
    return null;
  }

  return createLocalPresentation({
    kind: "presentation",
    ownerId,
    source: sourcePresentation.source,
    templateId: sourcePresentation.templateId,
    title
  });
}

export function renameLocalPresentation(ownerId: string, presentationId: string, title: string) {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) {
    return listLocalPresentations(ownerId);
  }

  const timestamp = new Date().toISOString();
  const presentations = listLocalPresentations(ownerId).map((presentation) => (
    presentation.id === presentationId
      ? {
          ...presentation,
          sourceRevision: presentation.sourceRevision + 1,
          title: normalizedTitle,
          updatedAt: timestamp
        }
      : presentation
  ));
  writePresentations(ownerId, presentations);
  return presentations;
}

export function deleteLocalPresentation(ownerId: string, presentationId: string) {
  const presentations = listLocalPresentations(ownerId);
  const presentation = presentations.find((item) => item.id === presentationId);
  if (!presentation || !canDeleteWorkspacePresentation(presentation)) {
    return presentations;
  }

  const remainingPresentations = presentations.filter((item) => item.id !== presentationId);
  writePresentations(ownerId, remainingPresentations);
  return remainingPresentations;
}
