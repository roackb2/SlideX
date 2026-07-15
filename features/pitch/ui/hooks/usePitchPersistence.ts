"use client";

import { useEffect } from "react";
import { embedPitchLocalImagesForPersistence } from "@/features/pitch/infrastructure/pitchLocalAssets";

type UsePitchPersistenceOptions = {
  enabled: boolean;
  onProjectSourceChange?: (source: string, title: string, templateId?: string) => Promise<void> | void;
  projectName: string;
  projectVersion?: number;
  setNotice: (notice: string) => void;
  source: string;
  templateId?: string;
};

export function usePitchPersistence({
  enabled,
  onProjectSourceChange,
  projectName,
  projectVersion,
  setNotice,
  source,
  templateId
}: UsePitchPersistenceOptions) {
  useEffect(() => {
    if (!enabled || !onProjectSourceChange) return;

    let isCancelled = false;
    const saveTimer = window.setTimeout(() => {
      void (async () => {
        try {
          const persistedSource = await embedPitchLocalImagesForPersistence(source);
          if (!isCancelled) await onProjectSourceChange(persistedSource, projectName, templateId);
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
  }, [enabled, onProjectSourceChange, projectName, projectVersion, setNotice, source, templateId]);
}
