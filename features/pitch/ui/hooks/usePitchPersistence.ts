"use client";

import { useEffect } from "react";
import { embedPitchLocalImagesForPersistence } from "@/features/pitch/infrastructure/pitchLocalAssets";

type UsePitchPersistenceOptions = {
  enabled: boolean;
  onProjectSourceChange?: (source: string, title: string) => Promise<void> | void;
  projectName: string;
  setNotice: (notice: string) => void;
  source: string;
};

export function usePitchPersistence({
  enabled,
  onProjectSourceChange,
  projectName,
  setNotice,
  source
}: UsePitchPersistenceOptions) {
  useEffect(() => {
    if (!enabled || !onProjectSourceChange) return;

    let isCancelled = false;
    const saveTimer = window.setTimeout(() => {
      void (async () => {
        try {
          const persistedSource = await embedPitchLocalImagesForPersistence(source);
          if (!isCancelled) await onProjectSourceChange(persistedSource, projectName);
        } catch (error) {
          if (!isCancelled) {
            setNotice(error instanceof Error && error.name === "PresentationRevisionConflictError"
              ? "This presentation changed in another editor or Agent session. Reload before saving again."
              : "This browser could not save the presentation");
          }
        }
      })();
    }, 450);

    return () => {
      isCancelled = true;
      window.clearTimeout(saveTimer);
    };
  }, [enabled, onProjectSourceChange, projectName, setNotice, source]);
}
