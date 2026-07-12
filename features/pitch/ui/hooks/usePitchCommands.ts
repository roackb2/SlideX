"use client";

import { useState, type Dispatch, type MouseEvent as ReactMouseEvent, type SetStateAction } from "react";
import { cloneBlock } from "@/core/motion-doc/application/motionDocSerialize";
import type { MotionDocBlock, MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import { defaultTemplate, motionTemplates } from "@/core/motion-doc/presets/templates";
import {
  deleteTableColumn,
  deleteTableRow,
  tableSizeFromProps
} from "@/core/motion-doc/application/tableBlock";
import {
  appendBlankSlideSource,
  appendLayoutSlideSource,
  appendBlockToSlide,
  appendTextBlockAtPosition,
  applyAllSlidesStyleSource,
  applyLayoutToSlide,
  applySelectionMdxSource,
  applySlideStyleSource,
  deleteBlockAt,
  deleteBlocks,
  deleteSlideSource,
  duplicateBlockAt,
  imageBlockAsSlideBackground,
  insertBlankSlideSource,
  isPositionLocked,
  groupBlocks,
  moveBlockByDirection,
  moveBlocksToEdge,
  nudgeBlocks,
  pasteBlocksIntoSlide,
  renameLayer,
  reorderBlocks,
  reorderSlideSource,
  replaceSlideSource,
  selectedLayerIndices,
  toggleBlocksPositionLock,
  ungroupBlocks,
  updateBlockInSlide,
  updatePositionedBlockFrames as buildPositionedBlockFramesSlide,
  type AddBlockOptions,
  type FrameUpdate,
  type InsertSlidePlacement
} from "@/features/pitch/application/motionDocCommands";
import { registerPitchLocalFile } from "@/features/pitch/infrastructure/pitchLocalAssets";
import {
  clearTableEditorSelectionProps,
  tableEditorSelectionFromProps
} from "@/features/pitch/application/tableEditorSelection";
import type { BlockUpdateOptions } from "@/features/pitch/ui/pitchCommandTypes";
import { type AddBlockType } from "@/features/pitch/ui/pitchOptions";
import { stringValue } from "@/common/util/valueUtils";

type UsePitchCommandsArgs = {
  activeSlide: MotionDocScene | undefined;
  activeSlideIndex: number;
  commitSource: (nextSource: string | ((current: string) => string)) => void;
  markProjectDirty: () => void;
  pushUndoSnapshot: () => void;
  scenes: MotionDocScene[];
  selectBlock: (index: number, options?: { additive?: boolean; range?: boolean }) => void;
  selectBlocks: (indices: number[], options?: { additive?: boolean }) => void;
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

export function usePitchCommands({
  activeSlide,
  activeSlideIndex,
  commitSource,
  markProjectDirty,
  pushUndoSnapshot,
  scenes,
  selectBlock,
  selectBlocks,
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
}: UsePitchCommandsArgs) {
  const [copiedBlocks, setCopiedBlocks] = useState<MotionDocBlock[]>([]);

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

  function insertSlideNearActive(placement: InsertSlidePlacement) {
    commitSource((current) => insertBlankSlideSource(current, activeSlideIndex, placement));
    setActiveSlideIndex(placement === "before" ? activeSlideIndex : activeSlideIndex + 1);
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice(placement === "before" ? "Slide inserted before" : "Slide inserted after");
  }

  function addSlideWithLayout(layoutSource: string) {
    commitSource((current) => appendLayoutSlideSource(current, activeSlideIndex, layoutSource));
    setActiveSlideIndex(scenes.length);
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Slide added with layout");
  }

  function applyLayoutToActiveSlide(layoutSource: string, layoutId: string) {
    if (!activeSlide) {
      return;
    }

    const nextSlide = applyLayoutToSlide(activeSlide, layoutSource, layoutId);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Layout applied");
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

    if (deleteSelectedTablePart()) {
      return;
    }

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

  function deleteSelectedTablePart() {
    const isSingleSelectedBlock = selectedBlockIndices.length === 0 || (
      selectedBlockIndices.length === 1 && selectedBlockIndices[0] === selectedBlockIndex
    );

    if (!activeSlide || selectedBlockIndex === null || !isSingleSelectedBlock) {
      return false;
    }

    const block = activeSlide.blocks[selectedBlockIndex];

    if (!block || block.type !== "Table" || !("props" in block)) {
      return false;
    }

    const tableSelection = tableEditorSelectionFromProps(block.props);

    if (!tableSelection) {
      return false;
    }

    const beforeSize = tableSizeFromProps(block.props);
    const nextTableProps = tableSelection.kind === "row"
      ? deleteTableRow(block.props, tableSelection.index)
      : deleteTableColumn(block.props, tableSelection.index);
    const afterSize = tableSizeFromProps(nextTableProps);

    if (beforeSize.rows === afterSize.rows && beforeSize.columns === afterSize.columns) {
      setNotice(tableSelection.kind === "row" ? "Cannot delete last row" : "Cannot delete last column");
      return true;
    }

    const nextSlide = updateBlockInSlide(
      activeSlide,
      selectedBlockIndex,
      clearTableEditorSelectionProps(nextTableProps)
    );

    if (!nextSlide) {
      return true;
    }

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    setNotice(tableSelection.kind === "row" ? "Row deleted" : "Column deleted");
    return true;
  }

  function cutSelectedBlocks() {
    if (!activeSlide || selectedBlockIndex === null) {
      return;
    }

    copySelectedBlock();
    const indices = selectedLayerIndices(selectedBlockIndices, selectedBlockIndex, "desc");

    if (indices.length === 0) {
      return;
    }

    const nextSlide = deleteBlocks(activeSlide, indices);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice(indices.length > 1 ? "Layers cut" : "Layer cut");
  }

  function duplicateSelectedBlock() {
    if (!activeSlide || selectedBlockIndex === null) {
      return;
    }

    const indices = selectedLayerIndices(selectedBlockIndices, selectedBlockIndex);
    if (indices.length > 1) {
      const blocks = indices.map((index) => activeSlide.blocks[index]).filter((block): block is MotionDocBlock => Boolean(block));
      const result = pasteBlocksIntoSlide(activeSlide, blocks, indices[indices.length - 1], { offset: true });
      commitSource((current) => replaceSlideSource(current, activeSlideIndex, result.slide));
      selectBlocks(result.blockIndices);
      setReplayNonce((value) => value + 1);
      setNotice("Layers duplicated");
      return;
    }

    const result = duplicateBlockAt(activeSlide, selectedBlockIndex);

    if (!result) {
      return;
    }

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, result.slide));
    selectSingleBlock(result.blockIndex);
    setReplayNonce((value) => value + 1);
    setNotice("Layer duplicated");
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

    const indices = selectedLayerIndices(selectedBlockIndices, selectedBlockIndex);
    const blocks = indices.map((index) => activeSlide.blocks[index]).filter((block): block is MotionDocBlock => Boolean(block));
    if (blocks.length === 0) {
      return;
    }

    setCopiedBlocks(blocks.map(cloneBlock));
    setNotice(blocks.length > 1 ? `${blocks.length} layers copied` : "Layer copied");
  }

  function pasteCopiedBlock() {
    if (!activeSlide || copiedBlocks.length === 0) {
      return;
    }

    const { blockIndices, slide } = pasteBlocksIntoSlide(activeSlide, copiedBlocks, selectedBlockIndex);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
    selectBlocks(blockIndices);
    setReplayNonce((value) => value + 1);
    setNotice(blockIndices.length > 1 ? `${blockIndices.length} layers pasted` : "Layer pasted");
  }

  async function pasteImageFile(file: File) {
    if (!activeSlide || !file.type.startsWith("image/")) return;
    try {
      const src = registerPitchLocalFile(file);
      const selectedBlock = selectedBlockIndex === null ? undefined : activeSlide.blocks[selectedBlockIndex];
      if (selectedBlockIndex !== null && selectedBlock?.type === "ImageBlock") {
        const slide = updateBlockInSlide(activeSlide, selectedBlockIndex, {
          ...selectedBlock.props,
          alt: file.name || "Pasted image",
          fit: selectedBlock.props.fit || "contain",
          src
        });
        if (!slide) return;
        commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
        setReplayNonce((value) => value + 1);
        setNotice("Image pasted into selected layer");
        return;
      }
      const { blockIndex, slide } = appendBlockToSlide(activeSlide, "Image", {
        props: { alt: file.name || "Pasted image", fit: "contain", src }
      });
      commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
      selectSingleBlock(blockIndex);
      setReplayNonce((value) => value + 1);
      setNotice("Image pasted");
    } catch {
      setNotice("Unable to paste image");
    }
  }

  function moveSelectedBlocksToEdge(edge: "back" | "front") {
    if (!activeSlide) return;
    const indices = selectedLayerIndices(selectedBlockIndices, selectedBlockIndex);
    if (indices.length === 0) return;
    const result = moveBlocksToEdge(activeSlide, indices, edge);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, result.slide));
    selectBlocks(result.blockIndices);
    setReplayNonce((value) => value + 1);
    setNotice(edge === "front" ? "Moved to front" : "Moved to back");
  }

  function moveBlockToEdge(blockIndex: number, edge: "back" | "front") {
    if (!activeSlide) return;
    const result = moveBlocksToEdge(activeSlide, [blockIndex], edge);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, result.slide));
    selectSingleBlock(result.blockIndices[0]);
    setReplayNonce((value) => value + 1);
    setNotice(edge === "front" ? "Moved to front" : "Moved to back");
  }

  function groupSelectedBlocks() {
    if (!activeSlide) return;
    const indices = selectedLayerIndices(selectedBlockIndices, selectedBlockIndex);
    if (indices.length < 2) return;
    const groupId = `group-${Date.now().toString(36)}`;
    const result = groupBlocks(activeSlide, indices, groupId);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, result.slide));
    selectBlocks(result.blockIndices);
    setNotice(`${indices.length} layers grouped`);
  }

  function ungroupSelectedBlocks() {
    if (!activeSlide) return;
    const indices = selectedLayerIndices(selectedBlockIndices, selectedBlockIndex);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, ungroupBlocks(activeSlide, indices)));
    setNotice("Group released");
  }

  function renameBlock(blockIndex: number, name: string) {
    if (!activeSlide) return;
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, renameLayer(activeSlide, blockIndex, name)));
    setNotice(name.trim() ? "Layer renamed" : "Layer name reset");
  }

  function reorderBlock(fromIndex: number, toIndex: number) {
    if (!activeSlide) return;
    const nextSlide = reorderBlocks(activeSlide, fromIndex, toIndex);
    if (!nextSlide) return;

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    setReplayNonce((value) => value + 1);
    setNotice("Layer reordered");
  }

  function toggleSelectedBlocksPositionLock() {
    if (!activeSlide) {
      return;
    }

    const indices = selectedLayerIndices(selectedBlockIndices, selectedBlockIndex);

    if (indices.length === 0) {
      return;
    }

    const { didUpdate, locked, slide } = toggleBlocksPositionLock(activeSlide, indices);

    if (!didUpdate) {
      return;
    }

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
    setReplayNonce((value) => value + 1);
    setNotice(locked ? "Layer position locked" : "Layer position unlocked");
  }

  function toggleBlockPositionLock(blockIndex: number) {
    if (!activeSlide) return;
    const { didUpdate, locked, slide } = toggleBlocksPositionLock(activeSlide, [blockIndex]);
    if (!didUpdate) return;
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
    setNotice(locked ? "Layer position locked" : "Layer position unlocked");
  }

  function useSelectedImageAsBackground() {
    if (!activeSlide || selectedBlockIndex === null) {
      return;
    }

    const result = imageBlockAsSlideBackground(activeSlide, selectedBlockIndex);

    if (!result) {
      setNotice("Select an image layer first");
      return;
    }

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, result.slide));
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Image used as background");
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

  function updatePositionedBlockFrames(updates: FrameUpdate[]) {
    if (!activeSlide) return;

    const nextSlide = buildPositionedBlockFramesSlide(activeSlide, updates);
    setSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    markProjectDirty();
    setNotice(updates.length > 1 ? "Layers updated" : "Layer updated");
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

  function updateBlock(blockIndex: number, newProps: Record<string, string | number>, newText?: string, options?: BlockUpdateOptions) {
    if (!activeSlide) return;

    const nextSlide = updateBlockInSlide(activeSlide, blockIndex, newProps, newText);
    if (!nextSlide) return;

    if (options?.transient) {
      setSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
      markProjectDirty();
      return;
    }

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    if (!options?.skipReplay) {
      setReplayNonce((value) => value + 1);
    }
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
      const url = registerPitchLocalFile(file);
      
      updateBlock(blockIndex, {
        ...block.props,
        alt: stringValue(block.props.alt) || file.name,
        fit: stringValue(block.props.fit) || "cover",
        src: url
      });
      setNotice("Local image loaded");
    } catch {
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
      const url = registerPitchLocalFile(file);
      
      updateBlock(blockIndex, {
        ...block.props,
        controls: stringValue(block.props.controls) || "true",
        fit: stringValue(block.props.fit) || "cover",
        src: url
      });
      setNotice("Local video loaded");
    } catch {
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
      selectedBlockIndices,
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
    applyLayoutToActiveSlide,
    applyTemplate,
    beginBlockTransform,
    copySelectedBlock,
    cutSelectedBlocks,
    deleteBlock,
    deleteSelectedBlocks,
    deleteSlide,
    duplicateSelectedBlock,
    goToNextSlide,
    goToPreviousSlide,
    groupSelectedBlocks,
    hasCopiedBlock: copiedBlocks.length > 0,
    insertSnippet,
    insertSlideNearActive,
    moveBlock,
    moveBlockToEdge,
    nudgeSelectedBlocks,
    moveSelectedBlocksToEdge,
    pasteImageFile,
    pasteCopiedBlock,
    reorderBlock,
    reorderSlide,
    renameBlock,
    selectBlockFromLayer,
    selectedBlocksLocked: selectedLayerIndices(selectedBlockIndices, selectedBlockIndex).some((index) => {
      const block = activeSlide?.blocks[index];
      return Boolean(block && isPositionLocked(block));
    }),
    toggleSelectedBlocksPositionLock,
    toggleBlockPositionLock,
    ungroupSelectedBlocks,
    updateActiveSlideStyle,
    updateAllSlidesStyle,
    updateBlock,
    updatePositionedBlockFrames,
    updateSelectionMdx,
    useSelectedImageAsBackground,
    uploadImageForBlock,
    uploadVideoForBlock
  };
}
