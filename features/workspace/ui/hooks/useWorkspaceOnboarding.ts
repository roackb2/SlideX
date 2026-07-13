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

    setShouldShow(!hasCompletedWorkspaceOnboarding(ownerId));
    setIsReady(true);
  }, [ownerId]);

  const complete = useCallback(() => {
    if (!ownerId) return;
    completeWorkspaceOnboarding(ownerId);
    setShouldShow(false);
  }, [ownerId]);

  return { complete, isReady, shouldShow };
}
