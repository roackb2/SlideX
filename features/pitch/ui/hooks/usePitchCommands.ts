"use client";

import { useState, type Dispatch, type MouseEvent as ReactMouseEvent, type SetStateAction } from "react";
import { cloneBlock } from "@/core/motion-doc/application/motionDocSerialize";
import type { MotionDocBlock, MotionDocProps, MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import {
  deleteTableColumn,
  deleteTableRow,
  tableSizeFromProps
} from "@/core/motion-doc/application/tableBlock";
import {
  appendBlockToSlide,
  appendTextBlockAtPosition,
  applySelectionMdxSource,
  deleteBlockAt,
  deleteBlocks,
  duplicateBlockAt,
  imageBlockAsSlideBackground,
  isPositionLocked,
  groupBlocks,
  moveBlockByDirection,
  moveBlocksToEdge,
  nudgeBlocks,
  pasteBlocksIntoSlide,
  renameLayer,
  reorderBlocks,
  replaceSlideSource,
  selectedLayerIndices,
  toggleBlocksPositionLock,
  ungroupBlocks,
  updateBlockInSlide,
  updatePositionedBlockFrames as buildPositionedBlockFramesSlide,
  type AddBlockOptions
} from "@/features/pitch/application/motionDocCommands";
import type { BlockFramePatch } from "@/features/pitch/application/pitchGeometry";
import {
  clearTableEditorSelectionProps,
  tableEditorSelectionFromProps
} from "@/features/pitch/application/tableEditorSelection";
import type { BlockUpdateOptions } from "@/features/pitch/application/pitchCommandTypes";
import { type AddBlockType } from "@/features/pitch/ui/pitchOptions";
import { usePitchAssetCommands } from "@/features/pitch/ui/hooks/usePitchAssetCommands";
import { usePitchSlideCommands } from "@/features/pitch/ui/hooks/usePitchSlideCommands";

type UsePitchCommandsArgs = {
  activeSlide: MotionDocScene | undefined;
  activeSlideIndex: number;
  commitSource: (nextSource: string | ((current: string) => string)) => void;
  markProjectDirty: () => void;
  onImageUploadAuthRequired: () => void;
  onImageRemovalAuthRequired: () => void;
  presentationId?: string;
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
  setSelectedTemplateId: Dispatch<SetStateAction<string>>;
  setSource: Dispatch<SetStateAction<string>>;
  source: string;
};

export function usePitchCommands({
  activeSlide,
  activeSlideIndex,
  commitSource,
  markProjectDirty,
  onImageUploadAuthRequired,
  onImageRemovalAuthRequired,
  presentationId,
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
  setSelectedTemplateId,
  setSource,
  source
}: UsePitchCommandsArgs) {
  const [copiedBlocks, setCopiedBlocks] = useState<MotionDocBlock[]>([]);
  const slideCommands = usePitchSlideCommands({
    activeSlide,
    activeSlideIndex,
    commitSource,
    scenes,
    selectSingleBlock,
    setActiveSlideIndex,
    setIsTemplateModalOpen,
    setNotice,
    setSelectedTemplateId
  });
  const assetCommands = usePitchAssetCommands({
    activeSlide,
    activeSlideIndex,
    commitSource,
    onImageUploadAuthRequired,
    onImageRemovalAuthRequired,
    presentationId,
    scenes,
    selectedBlockIndex,
    selectSingleBlock,
    setNotice,
    updateBlock
  });

  function selectBlockFromLayer(index: number, event: ReactMouseEvent<HTMLDivElement>) {
    selectBlock(index, {
      additive: event.metaKey || event.ctrlKey,
      range: event.shiftKey
    });
  }

  function beginBlockTransform() {
    pushUndoSnapshot();
  }

  function deleteBlock(blockIndex: number) {
    if (!activeSlide) return;

    const nextSlide = deleteBlockAt(activeSlide, blockIndex);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    selectSingleBlock(null);
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
      setNotice("Layers duplicated");
      return;
    }

    const result = duplicateBlockAt(activeSlide, selectedBlockIndex);

    if (!result) {
      return;
    }

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, result.slide));
    selectSingleBlock(result.blockIndex);
    setNotice("Layer duplicated");
  }

  function moveBlock(blockIndex: number, direction: -1 | 1) {
    if (!activeSlide) return;
    const nextSlide = moveBlockByDirection(activeSlide, blockIndex, direction);
    if (!nextSlide) return;

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
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
    setNotice(blockIndices.length > 1 ? `${blockIndices.length} layers pasted` : "Layer pasted");
  }

  function moveSelectedBlocksToEdge(edge: "back" | "front") {
    if (!activeSlide) return;
    const indices = selectedLayerIndices(selectedBlockIndices, selectedBlockIndex);
    if (indices.length === 0) return;
    const result = moveBlocksToEdge(activeSlide, indices, edge);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, result.slide));
    selectBlocks(result.blockIndices);
    setNotice(edge === "front" ? "Moved to front" : "Moved to back");
  }

  function moveBlockToEdge(blockIndex: number, edge: "back" | "front") {
    if (!activeSlide) return;
    const result = moveBlocksToEdge(activeSlide, [blockIndex], edge);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, result.slide));
    selectSingleBlock(result.blockIndices[0]);
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
    setNotice("Image used as background");
  }

  function addBlockToActiveSlide(type: AddBlockType, options?: AddBlockOptions) {
    if (!activeSlide) return;
    const { blockIndex, slide } = appendBlockToSlide(activeSlide, type, options);

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
    selectSingleBlock(blockIndex);
    setNotice(`${type} added`);
  }

  function addTextAtPosition(position: { x: number; y: number }) {
    if (!activeSlide) return;

    const { blockIndex, slide } = appendTextBlockAtPosition(activeSlide, position);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
    selectSingleBlock(blockIndex);
    setNotice("Text added");
  }

  function updatePositionedBlockFrames(updates: BlockFramePatch[]) {
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

  function updateBlock(blockIndex: number, newProps: MotionDocProps, newText?: string, options?: BlockUpdateOptions) {
    if (!activeSlide) return;

    const nextSlide = updateBlockInSlide(activeSlide, blockIndex, newProps, newText);
    if (!nextSlide) return;

    if (options?.transient) {
      setSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
      markProjectDirty();
      return;
    }

    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    setNotice("Block updated");
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
    setNotice(result.notice);
  }

  return {
    ...assetCommands,
    ...slideCommands,
    addBlockToActiveSlide,
    addTextAtPosition,
    beginBlockTransform,
    copySelectedBlock,
    cutSelectedBlocks,
    deleteBlock,
    deleteSelectedBlocks,
    duplicateSelectedBlock,
    groupSelectedBlocks,
    hasCopiedBlock: copiedBlocks.length > 0,
    moveBlock,
    moveBlockToEdge,
    nudgeSelectedBlocks,
    moveSelectedBlocksToEdge,
    pasteCopiedBlock,
    reorderBlock,
    renameBlock,
    selectBlockFromLayer,
    selectedBlocksLocked: selectedLayerIndices(selectedBlockIndices, selectedBlockIndex).some((index) => {
      const block = activeSlide?.blocks[index];
      return Boolean(block && isPositionLocked(block));
    }),
    toggleSelectedBlocksPositionLock,
    toggleBlockPositionLock,
    ungroupSelectedBlocks,
    updateBlock,
    updatePositionedBlockFrames,
    updateSelectionMdx,
    useSelectedImageAsBackground
  };
}
