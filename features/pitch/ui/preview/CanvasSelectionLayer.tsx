"use client";

import type { PointerEvent } from "react";
import type { ImageCropRect } from "@/core/motion-doc/application/imageCrop";
import type { MotionDocFrame } from "@/core/motion-doc/domain/frame";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import {
  combinedSelectionFrame,
  minimumCanvasFrameSize,
  selectedCanvasIndices
} from "@/features/pitch/application/canvasSelection";
import type { CanvasTool } from "@/features/pitch/application/canvasTools";
import { isPositionLocked } from "@/features/pitch/application/motionDocCommands";
import type { BlockUpdater } from "@/features/pitch/application/pitchCommandTypes";
import {
  blockFrame,
  isEditableTableBlock,
  isEditableTextBlock,
  isMovableBlock,
  isTextOnlySelection,
  selectionSpacingGuides,
  type AlignmentGuide,
  type MarqueeSelection,
  type ResizeHandle
} from "@/features/pitch/application/previewCanvas";
import { tableEditorSelectionProps } from "@/features/pitch/application/tableEditorSelection";
import { visualFrameToolbarPlacement } from "@/features/pitch/application/visualFrameToolbar";
import {
  AlignmentGuideLine,
  FrameInteractionHalo,
  MarqueeOverlay,
  MultiSelectionFrame,
  SelectedFrameControls
} from "@/features/pitch/ui/preview/CanvasSelectionChrome";
import { TableFrameEditor } from "@/features/pitch/ui/preview/TableFrameEditor";
import { TextFrameEditor } from "@/features/pitch/ui/preview/TextFrameEditor";
import { VisualFrameEditor } from "@/features/pitch/ui/preview/VisualFrameEditor";
import { ImageCropEditor } from "@/features/pitch/ui/preview/ImageCropEditor";
import type { CanvasInteractionMode } from "@/features/pitch/ui/preview/interaction/useCanvasInteractionEngine";

type CanvasSelectionLayerProps = {
  activeCanvasTool: CanvasTool;
  activeSlide: MotionDocScene | undefined;
  alignmentGuides: AlignmentGuide[];
  canvasScale: number;
  frameOverrides: ReadonlyMap<number, MotionDocFrame>;
  interactionBlockIndex: number | null;
  interactionMode: CanvasInteractionMode;
  imageCropBlockIndex: number | null;
  imageCropRect: ImageCropRect | null;
  marqueeSelection: MarqueeSelection | null;
  onCancelMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  onEndInteraction: (event: PointerEvent<HTMLDivElement>, blockIndex: number) => void;
  onEndMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  onBeginTextEdit: (blockIndex: number) => void;
  onBeginBlockTransform: () => void;
  onImageCropRectChange: (rect: ImageCropRect) => void;
  onSelectBlock: (index: number) => void;
  onStartMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  onStartMove: (event: PointerEvent<HTMLDivElement>, blockIndex: number, frame: MotionDocFrame) => void;
  onStartResize: (event: PointerEvent<HTMLSpanElement>, blockIndex: number, handle: ResizeHandle, frame: MotionDocFrame, blockIndices?: readonly number[]) => void;
  onToggleImageCrop: (blockIndex: number) => void;
  onUpdateBlock: BlockUpdater;
  onUpdateInteraction: (event: PointerEvent<HTMLDivElement>) => void;
  onUpdateMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
};

export function CanvasSelectionLayer({
  activeCanvasTool,
  activeSlide,
  alignmentGuides,
  canvasScale,
  frameOverrides,
  interactionBlockIndex,
  interactionMode,
  imageCropBlockIndex,
  imageCropRect,
  marqueeSelection,
  onCancelMarquee,
  onEndInteraction,
  onEndMarquee,
  onBeginTextEdit,
  onBeginBlockTransform,
  onImageCropRectChange,
  onSelectBlock,
  onStartMarquee,
  onStartMove,
  onStartResize,
  onToggleImageCrop,
  onUpdateBlock,
  onUpdateInteraction,
  onUpdateMarquee,
  selectedBlockIndex,
  selectedBlockIndices
}: CanvasSelectionLayerProps) {
  const selectedIndices = selectedCanvasIndices(activeSlide, selectedBlockIndex, selectedBlockIndices);
  const isMultiSelection = selectedIndices.length > 1;
  const isTextMultiSelection = isMultiSelection && isTextOnlySelection(activeSlide?.blocks ?? [], selectedIndices);
  const multiSelectionFrame = isMultiSelection ? combinedSelectionFrame(activeSlide, selectedIndices, frameOverrides) : null;
  const spacingGuides = isMultiSelection
    ? selectionSpacingGuides(selectedIndices.map((index) => frameOverrides.get(index) ?? blockFrame(activeSlide?.blocks[index])))
    : [];
  const unlockedSelectedIndices = selectedIndices.filter((index) => {
    const block = activeSlide?.blocks[index];
    return block ? !isPositionLocked(block) : false;
  });
  const groupInteractionIndex = unlockedSelectedIndices.includes(selectedBlockIndex ?? -1)
    ? selectedBlockIndex
    : unlockedSelectedIndices[0] ?? null;

  return (
    <div
      className={`absolute inset-0 z-40 ${activeCanvasTool === "select" ? "" : "pointer-events-none"}`}
      data-canvas-tool={activeCanvasTool}
      data-canvas-interaction-mode={interactionMode}
      onPointerCancel={onCancelMarquee}
      onPointerDown={onStartMarquee}
      onPointerMove={onUpdateMarquee}
      onPointerUp={onEndMarquee}
    >
      {alignmentGuides.map((guide, index) => (
        <AlignmentGuideLine guide={guide} index={index} key={`${guide.orientation}-${guide.position}-${index}`} />
      ))}
      {marqueeSelection ? <MarqueeOverlay marqueeSelection={marqueeSelection} /> : null}
      {activeSlide?.blocks.map((block, blockIndex) => {
        if (!isMovableBlock(block)) return null;

        const isSelected = selectedIndices.includes(blockIndex);
        const isPrimarySelection = selectedBlockIndex === blockIndex || (selectedBlockIndex === null && selectedIndices[0] === blockIndex);
        const isLocked = isPositionLocked(block);
        const tableBlock = isEditableTableBlock(block) ? block : null;
        const isTextBlock = isEditableTextBlock(block);
        const isVisualBlock = block.type === "Icon" || block.type === "ImageBlock" || block.type === "VideoBlock";
        const isImageCropActive = block.type === "ImageBlock" && imageCropBlockIndex === blockIndex;
        const isLineShape = block.type === "Shape" && block.props.shape === "line";
        const showIndividualTextEditor = isSelected && isTextBlock && (isTextMultiSelection || (!isMultiSelection && isPrimarySelection));
        const showIndividualControls = !isMultiSelection && isPrimarySelection || isTextMultiSelection && isTextBlock;
        const frame = frameOverrides.get(blockIndex) ?? blockFrame(block);
        const minFrameSize = minimumCanvasFrameSize(block, canvasScale);

        return (
          <div
            aria-label={`Move ${block.type} layer ${blockIndex + 1}`}
            className={frameControlClass({
              isInteracting: interactionBlockIndex === blockIndex,
              isLineShape,
              isLocked,
              isPrimarySelection: isPrimarySelection || isTextMultiSelection && isTextBlock,
              isSelected,
              isTextBlock,
              isImageCropActive
            })}
            data-block-index={blockIndex}
            data-frame-control
            key={`${block.type}-control-${blockIndex}`}
            onPointerDown={(event) => {
              if (!isImageCropActive) onStartMove(event, blockIndex, frame);
            }}
            onPointerMove={(event) => {
              if (interactionBlockIndex === blockIndex) onUpdateInteraction(event);
            }}
            onPointerUp={(event) => onEndInteraction(event, blockIndex)}
            role="button"
            style={{
              height: `${frame.h}%`,
              left: `${frame.x}%`,
              minHeight: minFrameSize.height,
              minWidth: minFrameSize.width,
              top: `${frame.y}%`,
              width: `${frame.w}%`
            }}
            tabIndex={0}
          >
            {isImageCropActive && imageCropRect && block.type === "ImageBlock" ? (
              <ImageCropEditor
                block={block}
                blockIndex={blockIndex}
                cropRect={imageCropRect}
                onBeginBlockTransform={onBeginBlockTransform}
                onCropRectChange={onImageCropRectChange}
                onUpdateBlock={onUpdateBlock}
              />
            ) : null}
            {isSelected && showIndividualControls && !isLocked && !isLineShape && !isVisualBlock ? <FrameInteractionHalo isTextBlock={isTextBlock} /> : null}
            {showIndividualTextEditor ? (
              <TextFrameEditor
                block={block}
                blockIndex={blockIndex}
                canvasScale={canvasScale}
                toolbarAlignment={frame.x + frame.w / 2 >= 50 ? "right" : "left"}
                toolbarPlacement={frame.y < 11 ? "below" : "above"}
                onBeginTextEdit={() => onBeginTextEdit(blockIndex)}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
              />
            ) : null}
            {isSelected && isPrimarySelection && !isMultiSelection && isVisualBlock && !isLocked ? (
              <VisualFrameEditor
                block={block}
                blockIndex={blockIndex}
                isImageCropActive={isImageCropActive}
                onSelectBlock={onSelectBlock}
                onToggleImageCrop={onToggleImageCrop}
                onUpdateBlock={onUpdateBlock}
                placement={visualFrameToolbarPlacement(frame, canvasScale)}
              />
            ) : null}
            {isSelected && isPrimarySelection && !isMultiSelection && tableBlock ? (
              <TableFrameEditor
                block={tableBlock}
                blockIndex={blockIndex}
                onSelectionChange={(selection) => onUpdateBlock(blockIndex, tableEditorSelectionProps(tableBlock.props, selection), undefined, { transient: true })}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
              />
            ) : null}
            {isSelected && !isImageCropActive ? (
              <SelectedFrameControls
                frame={frame}
                interactionMode={interactionBlockIndex === blockIndex ? interactionMode : "idle"}
                isTextBlock={isTextBlock}
                isLineShape={isLineShape}
                isLocked={isLocked}
                showHandles={showIndividualControls}
                onStartResize={(event, handle) => onStartResize(event, blockIndex, handle, frame)}
              />
            ) : null}
          </div>
        );
      })}
      {multiSelectionFrame && groupInteractionIndex !== null && !isTextMultiSelection ? (
        <MultiSelectionFrame
          blockIndex={groupInteractionIndex}
          canResize={unlockedSelectedIndices.length === selectedIndices.length}
          count={selectedIndices.length}
          frame={multiSelectionFrame}
          interactionMode={interactionMode}
          isTransforming={interactionBlockIndex === groupInteractionIndex}
          lockedCount={selectedIndices.length - unlockedSelectedIndices.length}
          onEndInteraction={(event) => onEndInteraction(event, groupInteractionIndex)}
          onPointerMove={onUpdateInteraction}
          onStartMove={(event) => onStartMove(event, groupInteractionIndex, multiSelectionFrame)}
          onStartResize={(event, handle) => onStartResize(event, groupInteractionIndex, handle, multiSelectionFrame, unlockedSelectedIndices)}
          spacingGuides={spacingGuides}
        />
      ) : null}
    </div>
  );
}

function frameControlClass({
  isInteracting,
  isLocked,
  isPrimarySelection,
  isLineShape,
  isSelected,
  isTextBlock,
  isImageCropActive
}: {
  isInteracting: boolean;
  isLocked: boolean;
  isPrimarySelection: boolean;
  isLineShape: boolean;
  isSelected: boolean;
  isTextBlock: boolean;
  isImageCropActive: boolean;
}) {
  const cursorClass = isLocked ? "cursor-default" : "cursor-move";
  const baseClass = "group/frame absolute box-border touch-none overflow-visible border bg-transparent text-left outline-none transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  if (isLineShape) return `${baseClass} select-none border-transparent shadow-none ${cursorClass}`;
  if (!isSelected) return `${baseClass} select-none border-white/0 hover:border-violet-400/70 ${cursorClass}`;
  if (isImageCropActive) return `${baseClass} select-none cursor-default border-transparent shadow-none`;
  if (!isPrimarySelection) return `${baseClass} select-none border-violet-300/55 ${cursorClass}`;
  if (isInteracting) return `${baseClass} select-none border-violet-300 shadow-[0_0_0_2px_rgba(139,92,246,0.2),0_0_18px_rgba(88,55,170,0.22)] ${cursorClass}`;
  if (isTextBlock) return `${baseClass} select-text border-violet-500 shadow-[0_0_0_1px_rgba(139,92,246,0.28),0_0_0_3px_rgba(139,92,246,0.08)] ${cursorClass}`;
  return `${baseClass} select-none border-violet-400 shadow-[0_0_0_1px_rgba(17,7,31,0.52),0_0_10px_rgba(139,92,246,0.2)] ${cursorClass}`;
}
