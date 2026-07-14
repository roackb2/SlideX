"use client";

import { useCallback, useEffect, useState } from "react";
import {
  completeWorkspaceOnboarding,
  hasCompletedWorkspaceOnboarding
} from "@/features/workspace/infrastructure/localWorkspaceOnboarding";

export function useWorkspaceOnboarding(ownerId: string | null) {
  const [isReady, setIsReady] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!ownerId) {
      setIsReady(false);
      setShouldShow(false);
      return;
    }

    const controller = new AbortController();
    const completedLocally = hasCompletedWorkspaceOnboarding(ownerId);

    void fetch("/api/account/onboarding", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal
    }).then(async (response) => {
      const payload: unknown = await response.json().catch(() => null);
      const completedRemotely = typeof payload === "object" && payload !== null &&
        "completed" in payload && payload.completed === true;

      if (response.ok && completedLocally && !completedRemotely) {
        void fetch("/api/account/onboarding", {
          credentials: "same-origin",
          method: "POST"
        });
      }
      setShouldShow(response.ok ? !(completedRemotely || completedLocally) : !completedLocally);
      setIsReady(true);
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShouldShow(!completedLocally);
      setIsReady(true);
    });

    return () => controller.abort();
  }, [ownerId]);

  const complete = useCallback(() => {
    if (!ownerId) return;
    completeWorkspaceOnboarding(ownerId);
    setShouldShow(false);
    void fetch("/api/account/onboarding", {
      credentials: "same-origin",
      method: "POST"
    });
  }, [ownerId]);

  return { complete, isReady, shouldShow };
}
