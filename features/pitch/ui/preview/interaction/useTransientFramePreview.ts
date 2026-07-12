"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import {
  findAlignmentGuides,
  type AlignmentGuide,
  type Frame,
  type FrameUpdate
} from "@/features/pitch/application/previewCanvas";

type UseTransientFramePreviewArgs = {
  blocks: MotionDocScene["blocks"];
  onCommit: (updates: FrameUpdate[]) => void;
};

const emptyFrameOverrides: ReadonlyMap<number, Frame> = new Map();

export function useTransientFramePreview({ blocks, onCommit }: UseTransientFramePreviewArgs) {
  const rafRef = useRef<number | null>(null);
  const pendingUpdatesRef = useRef<FrameUpdate[] | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [frameOverrides, setFrameOverrides] = useState<ReadonlyMap<number, Frame>>(emptyFrameOverrides);

  const cancelScheduledPreview = useCallback(() => {
    if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    pendingUpdatesRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cancelScheduledPreview();
    setAlignmentGuides([]);
    setFrameOverrides(emptyFrameOverrides);
  }, [cancelScheduledPreview]);

  const preview = useCallback((updates: FrameUpdate[]) => {
    pendingUpdatesRef.current = updates;
    if (rafRef.current !== null) return;

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const pendingUpdates = pendingUpdatesRef.current;
      pendingUpdatesRef.current = null;
      if (!pendingUpdates) return;
      setAlignmentGuides(findAlignmentGuides(blocks, pendingUpdates));
      setFrameOverrides(new Map(pendingUpdates.map((update) => [update.blockIndex, update.frame])));
    });
  }, [blocks]);

  const commit = useCallback((updates: FrameUpdate[]) => {
    cancelScheduledPreview();
    setAlignmentGuides([]);
    setFrameOverrides(emptyFrameOverrides);
    onCommit(updates);
  }, [cancelScheduledPreview, onCommit]);

  useEffect(() => () => cancelScheduledPreview(), [cancelScheduledPreview]);

  return { alignmentGuides, commit, frameOverrides, preview, reset };
}
