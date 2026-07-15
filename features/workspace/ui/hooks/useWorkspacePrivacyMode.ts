"use client";

import { useCallback, useEffect, useState } from "react";

const storageKeyPrefix = "slidex-workspace-privacy-mode";

function storageKey(userId: string) {
  return `${storageKeyPrefix}:${userId}`;
}

export function useWorkspacePrivacyMode(userId: string | undefined) {
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsPrivacyModeEnabled(true);
      return;
    }
    setIsPrivacyModeEnabled(window.localStorage.getItem(storageKey(userId)) === "true");
  }, [userId]);

  const updatePrivacyMode = useCallback((enabled: boolean) => {
    if (!userId) return;
    window.localStorage.setItem(storageKey(userId), String(enabled));
    setIsPrivacyModeEnabled(enabled);
  }, [userId]);

  return { isPrivacyModeEnabled, updatePrivacyMode };
}
