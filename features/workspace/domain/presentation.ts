export const workspacePresentationKinds = ["presentation", "template"] as const;

export type WorkspacePresentationKind = (typeof workspacePresentationKinds)[number];

export type WorkspacePresentation = {
  createdAt: string;
  id: string;
  kind: WorkspacePresentationKind;
  lastOpenedAt: string;
  ownerId: string;
  source: string;
  templateId?: string;
  title: string;
  updatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWorkspacePresentationKind(value: unknown): value is WorkspacePresentationKind {
  return workspacePresentationKinds.some((kind) => kind === value);
}

export function canDeleteWorkspacePresentation(presentation: WorkspacePresentation) {
  return presentation.kind !== "template";
}

export function parseWorkspacePresentations(value: unknown): WorkspacePresentation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.ownerId !== "string" ||
      typeof item.title !== "string" ||
      typeof item.source !== "string" ||
      typeof item.createdAt !== "string" ||
      typeof item.updatedAt !== "string" ||
      typeof item.lastOpenedAt !== "string"
    ) {
      return [];
    }

    return [{
      ...item,
      kind: isWorkspacePresentationKind(item.kind) ? item.kind : "presentation",
      templateId: typeof item.templateId === "string" ? item.templateId : undefined
    } as WorkspacePresentation];
  });
}
