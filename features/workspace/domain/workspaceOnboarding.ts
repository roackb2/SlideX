export type WorkspaceOnboardingCompletion = {
  completedAt: string;
  status: "completed";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseWorkspaceOnboardingCompletion(value: unknown): WorkspaceOnboardingCompletion | null {
  if (!isRecord(value) || value.status !== "completed" || typeof value.completedAt !== "string") {
    return null;
  }

  return {
    completedAt: value.completedAt,
    status: "completed"
  };
}
