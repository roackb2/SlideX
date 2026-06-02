"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeSwatches } from "@/features/studio/application/colorPalettes";
import {
  loadCustomSwatches,
  saveCustomSwatches,
  subscribeCustomSwatches
} from "@/features/studio/infrastructure/customSwatches";

export function useCustomSwatches() {
  const [customSwatches, setCustomSwatches] = useState<string[]>([]);

  useEffect(() => {
    function reloadSwatches() {
      setCustomSwatches(loadCustomSwatches());
    }

    reloadSwatches();
    return subscribeCustomSwatches(reloadSwatches);
  }, []);

  const persistSwatches = useCallback((nextSwatches: readonly string[]) => {
    const normalized = normalizeSwatches(nextSwatches);

    setCustomSwatches(normalized);
    saveCustomSwatches(normalized);
    return normalized;
  }, []);

  return {
    customSwatches,
    persistSwatches
  };
}
