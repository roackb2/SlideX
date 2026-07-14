"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MotionDocFrame } from "@/core/motion-doc/domain/frame";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import {
  findAlignmentGuides,
  type AlignmentGuide
} from "@/features/pitch/application/previewCanvas";
import type { ResolvedBlockFrameUpdate } from "@/features/pitch/application/pitchGeometry";

type UseTransientFramePreviewArgs = {
  blocks: MotionDocScene["blocks"];
  onCommit: (updates: ResolvedBlockFrameUpdate[]) => void;
};

const emptyFrameOverrides: ReadonlyMap<number, MotionDocFrame> = new Map();

export function useTransientFramePreview({ blocks, onCommit }: UseTransientFramePreviewArgs) {
  const rafRef = useRef<number | null>(null);
  const pendingUpdatesRef = useRef<ResolvedBlockFrameUpdate[] | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [frameOverrides, setFrameOverrides] = useState<ReadonlyMap<number, MotionDocFrame>>(emptyFrameOverrides);

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

  const preview = useCallback((updates: ResolvedBlockFrameUpdate[]) => {
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

  const commit = useCallback((updates: ResolvedBlockFrameUpdate[]) => {
    cancelScheduledPreview();
    setAlignmentGuides([]);
    setFrameOverrides(emptyFrameOverrides);
    onCommit(updates);
  }, [cancelScheduledPreview, onCommit]);

  useEffect(() => () => cancelScheduledPreview(), [cancelScheduledPreview]);

  return { alignmentGuides, commit, frameOverrides, preview, reset };
}
