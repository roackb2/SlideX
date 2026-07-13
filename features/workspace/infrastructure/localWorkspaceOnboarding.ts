import { parseWorkspaceOnboardingCompletion } from "@/features/workspace/domain/workspaceOnboarding";

function onboardingStorageKey(ownerId: string) {
  return `slidex_workspace_onboarding_v1:${ownerId}`;
}

export function hasCompletedWorkspaceOnboarding(ownerId: string) {
  try {
    const storedValue = window.localStorage.getItem(onboardingStorageKey(ownerId));
    return storedValue ? parseWorkspaceOnboardingCompletion(JSON.parse(storedValue)) !== null : false;
  } catch {
    return false;
  }
}

export function completeWorkspaceOnboarding(ownerId: string) {
  window.localStorage.setItem(onboardingStorageKey(ownerId), JSON.stringify({
    completedAt: new Date().toISOString(),
    status: "completed"
  }));
}
