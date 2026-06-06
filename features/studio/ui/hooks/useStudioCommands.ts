"use client";

import { useState, type Dispatch, type MouseEvent as ReactMouseEvent, type SetStateAction } from "react";
import { cloneBlock } from "@/core/motion-doc/application/motionDocSerialize";
import type { MotionDocBlock, MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import { defaultTemplate, motionTemplates } from "@/core/motion-doc/presets/templates";
import {
  appendBlankSlideSource,
  appendLayoutSlideSource,
  appendBlockToSlide,
  appendTextBlockAtPosition,
  applyAllSlidesStyleSource,
  applySelectionMdxSource,
  applySlideStyleSource,
  deleteBlockAt,
  deleteBlocks,
  deleteSlideSource,
  moveBlockByDirection,
  nudgeBlocks,
  pasteBlockIntoSlide,
  reorderBlocks,
  reorderSlideSource,
  replaceSlideSource,
  selectedLayerIndices,
  updateBlockInSlide,
  updatePositionedBlockFrames as buildPositionedBlockFramesSlide,
  type AddBlockOptions,
  type FrameUpdate
} from "@/features/studio/application/motionDocCommands";
import { type AddBlockType } from "@/features/studio/ui/studioOptions";
import { stringValue } from "@/common/util/valueUtils";

type UseStudioCommandsArgs = {
  activeSlide: MotionDocScene | undefined;
  activeSlideIndex: number;
  commitSource: (nextSource: string | ((current: string) => string)) => void;
  markProjectDirty: () => void;
  pushUndoSnapshot: () => void;
  scenes: MotionDocScene[];
  selectBlock: (index: number, options?: { additive?: boolean; range?: boolean }) => void;
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
  selectSingleBlock: (index: number | null) => void;
  setActiveSlideIndex: Dispatch<SetStateAction<number>>;
  setIsTemplateModalOpen: Dispatch<SetStateAction<boolean>>;
  setNotice: Dispatch<SetStateAction<string>>;
  setReplayNonce: Dispatch<SetStateAction<number>>;
  setSelectedTemplateId: Dispatch<SetStateAction<string>>;
  setSource: Dispatch<SetStateAction<string>>;
  source: string;
};

export function useStudioCommands({
  activeSlide,
  activeSlideIndex,
  commitSource,
  markProjectDirty,
  pushUndoSnapshot,
  scenes,
  selectBlock,
  selectedBlockIndex,
  selectedBlockIndices,
  selectSingleBlock,
  setActiveSlideIndex,
  setIsTemplateModalOpen,
  setNotice,
  setReplayNonce,
  setSelectedTemplateId,
  setSource,
  source
}: UseStudioCommandsArgs) {
  const [copiedBlock, setCopiedBlock] = useState<MotionDocBlock | null>(null);

  function selectBlockFromLayer(index: number, event: ReactMouseEvent<HTMLDivElement>) {
    selectBlock(index, {
      additive: event.metaKey || event.ctrlKey,
      range: event.shiftKey
    });
  }

  function beginBlockTransform() {
    pushUndoSnapshot();
  }

  function applyTemplate(templateId: string) {
    const template = motionTemplates.find((item) => item.id === templateId) ?? defaultTemplate;
    setSelectedTemplateId(template.id);
    
    // Extract properties from the first Slide tag
    const match = template.source.match(/<(?:Slide|Scene)\b([^>]*)>/);
    if (match) {
      const attrsStr = match[1];
      const attrRegex = /([a-zA-Z0-9]+)="([^"]*)"/g;
      const updates: Record<string, string | number> = {};
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
        const key = attrMatch[1];
        const val = attrMatch[2];
        if (key !== "duration" && !key.startsWith("shader")) {
          // Parse numbers if possible
          const numVal = Number(val);
          updates[key] = !isNaN(numVal) && val.trim() !== "" ? numVal : val;
        }
      }
      updateAllSlidesStyle(updates);
      
      // Strip hardcoded colors from Title and Text blocks so the new theme takes effect properly
      commitSource(src => src.replace(/<(Text|Title)([^>]*?)\s+color="[^"]*"/g, '<$1$2'));
    }

    setIsTemplateModalOpen(false);
    setNotice(`${template.name} theme applied`);
  }

  function insertSnippet(code: string) {
    commitSource((current) => `${current.trimEnd()}\n\n${code}`);
    setReplayNonce((value) => value + 1);
    setNotice("Block inserted");
  }

  function addSlide() {
    commitSource((current) => appendBlankSlideSource(current, activeSlideIndex));
    setActiveSlideIndex(scenes.length);
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Blank slide added");
  }

  function addSlideWithLayout(layoutSource: string) {
    commitSource((current) => appendLayoutSlideSource(current, activeSlideIndex, layoutSource));
    setActiveSlideIndex(scenes.length);
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Slide added with layout");
  }

  function deleteSlide(slideIndex: number) {
    if (scenes.length <= 1) {
      setNotice("Cannot delete last slide");
      return;
    }

    commitSource((current) => deleteSlideSource(current, slideIndex));
    setActiveSlideIndex((current) => Math.min(current, scenes.length - 2));
    setReplayNonce((value) => value + 1);
    setNotice("Slide deleted");
  }

  function reorderSlide(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= scenes.length || toIndex >= scenes.length) return;

    commitSource((current) => reorderSlideSource(current, fromIndex, toIndex));
    
    // Update active slide index to follow the moved slide, or adjust if affected by the move
    setActiveSlideIndex((current) => {
      if (current === fromIndex) return toIndex;
      if (current > fromIndex && current <= toIndex) return current - 1;
      if (current < fromIndex && current >= toIndex) return current + 1;
      return current;
    });
  }

  function deleteBlock(blockIndex: number) {
    if (!activeSlide) return;

    const nextSlide = deleteBlockAt(activeSlide, blockIndex);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Layer deleted");
  }

  function deleteSelectedBlocks() {
    if (!activeSlide) return;

    const indices = selectedLayerIndices(selectedBlockIndices, selectedBlockIndex, "desc");

    if (indices.length === 0) {
      return;
    }

    const nextSlide = deleteBlocks(activeSlide, indices);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice(indices.length > 1 ? "Layers deleted" : "Layer deleted");
  }

  function moveBlock(blockIndex: number, direction: -1 | 1) {
    if (!activeSlide) return;
    const nextSlide = moveBlockByDirection(activeSlide, blockIndex, direction);
    if (!nextSlide) return;

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    setReplayNonce((value) => value + 1);
    setNotice("Layer reordered");
  }

  function copySelectedBlock() {
    if (!activeSlide || selectedBlockIndex === null) {
      return;
    }

    const block = activeSlide.blocks[selectedBlockIndex];

    if (!block) {
      return;
    }

    setCopiedBlock(cloneBlock(block));
    setNotice("Layer copied");
  }

  function pasteCopiedBlock() {
    if (!activeSlide || !copiedBlock) {
      return;
    }

    const { blockIndex, slide } = pasteBlockIntoSlide(activeSlide, copiedBlock, selectedBlockIndex);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
    selectSingleBlock(blockIndex);
    setReplayNonce((value) => value + 1);
    setNotice("Layer pasted");
  }

  function reorderBlock(fromIndex: number, toIndex: number) {
    if (!activeSlide) return;
    const nextSlide = reorderBlocks(activeSlide, fromIndex, toIndex);
    if (!nextSlide) return;

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    setReplayNonce((value) => value + 1);
    setNotice("Layer reordered");
  }

  function addBlockToActiveSlide(type: AddBlockType, options?: AddBlockOptions) {
    if (!activeSlide) return;
    const { blockIndex, slide } = appendBlockToSlide(activeSlide, type, options);

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
    selectSingleBlock(blockIndex);
    setReplayNonce((value) => value + 1);
    setNotice(`${type} added`);
  }

  function addTextAtPosition(position: { x: number; y: number }) {
    if (!activeSlide) return;

    const { blockIndex, slide } = appendTextBlockAtPosition(activeSlide, position);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
    selectSingleBlock(blockIndex);
    setReplayNonce((value) => value + 1);
    setNotice("Text added");
  }

  function updatePositionedBlockFrames(updates: FrameUpdate[], commit = false) {
    if (!activeSlide) return;

    const nextSlide = buildPositionedBlockFramesSlide(activeSlide, updates);
    setSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    markProjectDirty();

    if (commit) {
      setNotice(updates.length > 1 ? "Layers updated" : "Layer updated");
    }
  }

  function nudgeSelectedBlocks(delta: { x: number; y: number }) {
    if (!activeSlide) return;

    const indices = selectedLayerIndices(selectedBlockIndices, selectedBlockIndex);

    if (indices.length === 0) {
      return;
    }

    const { didMove, slide } = nudgeBlocks(activeSlide, indices, delta);
    if (!didMove) {
      return;
    }

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
    setNotice(indices.length > 1 ? "Layers nudged" : "Layer nudged");
  }

  function updateActiveSlideStyle(updates: Record<string, string | number>) {
    if (!activeSlide) {
      return;
    }

    commitSource((current) => applySlideStyleSource(current, activeSlide, activeSlideIndex, updates));
    setReplayNonce((value) => value + 1);
    setNotice("Slide style updated");
  }

  function updateAllSlidesStyle(updates: Record<string, string | number>) {
    if (scenes.length === 0) {
      return;
    }

    commitSource((current) => applyAllSlidesStyleSource(current, scenes, updates));
    setReplayNonce((value) => value + 1);
    setNotice("Theme applied to all slides");
  }

  function updateBlock(blockIndex: number, newProps: Record<string, string | number>, newText?: string) {
    if (!activeSlide) return;

    const nextSlide = updateBlockInSlide(activeSlide, blockIndex, newProps, newText);
    if (!nextSlide) return;

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    setReplayNonce((value) => value + 1);
    setNotice("Block updated");
  }

  async function uploadImageForBlock(blockIndex: number, file: File | undefined) {
    if (!activeSlide || !file) {
      return;
    }

    const block = activeSlide.blocks[blockIndex];

    if (!block || block.type !== "ImageBlock") {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setNotice("Choose an image file");
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      (window as any).__slidexLocalFiles = (window as any).__slidexLocalFiles || new Map();
      (window as any).__slidexLocalFiles.set(url, file);
      
      updateBlock(blockIndex, {
        ...block.props,
        alt: stringValue(block.props.alt) || file.name,
        fit: stringValue(block.props.fit) || "cover",
        src: url
      });
      setNotice("Local image loaded");
    } catch (e) {
      setNotice("Failed to load local image");
    }
  }

  async function uploadVideoForBlock(blockIndex: number, file: File | undefined) {
    if (!activeSlide || !file) {
      return;
    }

    const block = activeSlide.blocks[blockIndex];

    if (!block || block.type !== "VideoBlock") {
      return;
    }

    if (!file.type.startsWith("video/")) {
      setNotice("Choose a video file");
      return;
    }

    try {
      setNotice("Loading video...");
      const url = URL.createObjectURL(file);
      (window as any).__slidexLocalFiles = (window as any).__slidexLocalFiles || new Map();
      (window as any).__slidexLocalFiles.set(url, file);
      
      updateBlock(blockIndex, {
        ...block.props,
        controls: stringValue(block.props.controls) || "true",
        fit: stringValue(block.props.fit) || "cover",
        src: url
      });
      setNotice("Local video loaded");
    } catch (e) {
      setNotice("Failed to load local video");
    }
  }

  function goToPreviousSlide() {
    setActiveSlideIndex((current) => Math.max(current - 1, 0));
    setReplayNonce((value) => value + 1);
  }

  function goToNextSlide() {
    setActiveSlideIndex((current) => Math.min(current + 1, Math.max(scenes.length - 1, 0)));
    setReplayNonce((value) => value + 1);
  }

  function updateSelectionMdx(value: string) {
    if (!activeSlide) {
      return;
    }

    const result = applySelectionMdxSource({
      activeSlide,
      activeSlideIndex,
      selectedBlockIndex,
      source,
      value
    });

    if ("error" in result) {
      setNotice(result.error);
      return;
    }

    commitSource(result.source);
    setReplayNonce((current) => current + 1);
    setNotice(result.notice);
  }

  return {
    addBlockToActiveSlide,
    addSlide,
    addSlideWithLayout,
    addTextAtPosition,
    applyTemplate,
    beginBlockTransform,
    copySelectedBlock,
    deleteBlock,
    deleteSelectedBlocks,
    deleteSlide,
    goToNextSlide,
    goToPreviousSlide,
    insertSnippet,
    moveBlock,
    nudgeSelectedBlocks,
    pasteCopiedBlock,
    reorderBlock,
    reorderSlide,
    selectBlockFromLayer,
    updateActiveSlideStyle,
    updateAllSlidesStyle,
    updateBlock,
    updatePositionedBlockFrames,
    updateSelectionMdx,
    uploadImageForBlock,
    uploadVideoForBlock
  };
}
