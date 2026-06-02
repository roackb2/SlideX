import {
  clampFramePosition,
  clampPercent,
  defaultBlockHeight,
  defaultBlockWidth,
  defaultBlockY,
  percentFrameValue,
  type MotionDocFrame
} from "@/core/motion-doc/domain/frame";
import type { MotionDocBlock, MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";

export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 576;

const MIN_FRAME_WIDTH = 8;
const MIN_FRAME_HEIGHT = 6;
const GUIDE_THRESHOLD = 0.7;

export type ResizeHandle = "n" | "e" | "s" | "w" | "nw" | "ne" | "sw" | "se";
export type Frame = MotionDocFrame;
export type FrameUpdate = { blockIndex: number; frame: Frame };
export type CanvasPoint = { x: number; y: number };
export type CanvasInteraction = {
  blockIndex: number;
  handle?: ResizeHandle;
  mode: "move" | "resize";
  startFrame: Frame;
  startFrames: Array<{ blockIndex: number; frame: Frame }>;
  startPointer: CanvasPoint;
};
export type MarqueeSelection = {
  additive: boolean;
  current: CanvasPoint;
  pointerId: number;
  start: CanvasPoint;
};
export type AlignmentGuide = {
  orientation: "horizontal" | "vertical";
  position: number;
};

export type MovableBlock = Extract<MotionDocBlock, { props: Record<string, string | number> }>;
export type EditableTextBlock = Extract<MotionDocBlock, { props: Record<string, string | number>; text: string }>;

export const resizeHandles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const satisfies ReadonlyArray<ResizeHandle>;

export function canvasPointFromRect(
  event: { clientX: number; clientY: number },
  rect: { height: number; left: number; top: number; width: number } | undefined
): CanvasPoint {
  if (!rect) {
    return { x: 0, y: 0 };
  }

  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  return {
    x: clampPercent(Math.min(Math.max(x, 0), 100)),
    y: clampPercent(Math.min(Math.max(y, 0), 100))
  };
}

export function hiddenEditablePreviewBlockIndices(
  blocks: MotionDocScene["blocks"],
  selectedBlockIndex: number | null,
  selectedBlockIndices: readonly number[]
) {
  const selectedIndices = new Set(selectedBlockIndices);

  if (selectedBlockIndex !== null) {
    selectedIndices.add(selectedBlockIndex);
  }

  return blocks
    .map((block, blockIndex) => ({ block, blockIndex }))
    .filter(({ block, blockIndex }) => selectedIndices.has(blockIndex) && isMovableBlock(block) && isEditableTextBlock(block))
    .map(({ blockIndex }) => blockIndex);
}

export function isMovableBlock(block: MotionDocScene["blocks"][number]): block is MovableBlock {
  return (
    "props" in block &&
    (Number.isFinite(Number(block.props.x)) || Number.isFinite(Number(block.props.y)))
  );
}

export function isEditableTextBlock(block: MotionDocScene["blocks"][number]): block is EditableTextBlock {
  return (block.type === "Title" || block.type === "Text") && "props" in block && "text" in block;
}

export function blockFrame(block: MotionDocScene["blocks"][number] | undefined): Frame {
  if (!block || !("props" in block)) {
    return { h: 18, w: 42, x: 8, y: 12 };
  }

  return {
    h: percentFrameValue(block.props.h, defaultBlockHeight(block.type)),
    w: percentFrameValue(block.props.w, defaultBlockWidth(block.type)),
    x: percentFrameValue(block.props.x, 9),
    y: percentFrameValue(block.props.y, defaultBlockY(block.type))
  };
}

export function groupedMoveIndices(slide: MotionDocScene | undefined, blockIndex: number) {
  const block = slide?.blocks[blockIndex];

  if (!slide || !block || !isMovableBlock(block) || !isRowGroupedBlock(slide, block)) {
    return [blockIndex];
  }

  return slide.blocks
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.type === block.type && isMovableBlock(item))
    .map(({ index }) => index);
}

export function interactionFrameUpdates(interaction: CanvasInteraction, pointer: CanvasPoint): FrameUpdate[] {
  const dx = pointer.x - interaction.startPointer.x;
  const dy = pointer.y - interaction.startPointer.y;

  if (interaction.mode === "resize" && interaction.handle) {
    return [
      {
        blockIndex: interaction.blockIndex,
        frame: resizeFrame(interaction.startFrame, dx, dy, interaction.handle)
      }
    ];
  }

  return interaction.startFrames.map(({ blockIndex, frame }) => ({
    blockIndex,
    frame: {
      h: frame.h,
      w: frame.w,
      x: clampFramePosition(frame.x + dx, frame.w),
      y: clampFramePosition(frame.y + dy, frame.h)
    }
  }));
}

export function resizeFrame(frame: Frame, dx: number, dy: number, handle: ResizeHandle): Frame {
  let nextX = frame.x;
  let nextY = frame.y;
  let nextW = frame.w;
  let nextH = frame.h;

  if (handle.includes("e")) {
    nextW = Math.min(Math.max(frame.w + dx, MIN_FRAME_WIDTH), 100 - frame.x);
  }

  if (handle.includes("s")) {
    nextH = Math.min(Math.max(frame.h + dy, MIN_FRAME_HEIGHT), 100 - frame.y);
  }

  if (handle.includes("w")) {
    const maxLeftDelta = frame.w - MIN_FRAME_WIDTH;
    const leftDelta = Math.min(Math.max(dx, -frame.x), maxLeftDelta);
    nextX = frame.x + leftDelta;
    nextW = frame.w - leftDelta;
  }

  if (handle.includes("n")) {
    const maxTopDelta = frame.h - MIN_FRAME_HEIGHT;
    const topDelta = Math.min(Math.max(dy, -frame.y), maxTopDelta);
    nextY = frame.y + topDelta;
    nextH = frame.h - topDelta;
  }

  return {
    h: clampPercent(nextH),
    w: clampPercent(nextW),
    x: clampPercent(nextX),
    y: clampPercent(nextY)
  };
}

export function marqueeRect(selection: MarqueeSelection): Frame {
  const x = Math.min(selection.start.x, selection.current.x);
  const y = Math.min(selection.start.y, selection.current.y);
  const right = Math.max(selection.start.x, selection.current.x);
  const bottom = Math.max(selection.start.y, selection.current.y);

  return {
    h: clampPercent(bottom - y),
    w: clampPercent(right - x),
    x: clampPercent(x),
    y: clampPercent(y)
  };
}

export function selectedMovableBlockIndices(blocks: MotionDocScene["blocks"], rect: Frame) {
  return blocks
    .map((block, blockIndex) => ({ block, blockIndex }))
    .filter(({ block }) => isMovableBlock(block))
    .filter(({ block }) => intersectsRect(blockFrame(block), rect))
    .map(({ blockIndex }) => blockIndex);
}

export function findAlignmentGuides(blocks: MotionDocScene["blocks"], updates: readonly FrameUpdate[]) {
  const targets = getAlignmentTargets(blocks, updates);
  const guides: AlignmentGuide[] = [];

  updates.forEach(({ frame }) => {
    const verticalGuide = nearestGuide([frame.x, frame.x + frame.w / 2, frame.x + frame.w], targets.vertical);
    const horizontalGuide = nearestGuide([frame.y, frame.y + frame.h / 2, frame.y + frame.h], targets.horizontal);

    if (verticalGuide !== null) {
      guides.push({ orientation: "vertical", position: verticalGuide });
    }

    if (horizontalGuide !== null) {
      guides.push({ orientation: "horizontal", position: horizontalGuide });
    }
  });

  return uniqueGuides(guides);
}

export function gridLineColor(slide: MotionDocScene | undefined) {
  const background = typeof slide?.props.background === "string" ? slide.props.background : "";
  const theme = typeof slide?.props.theme === "string" ? slide.props.theme : "dark";
  const isLight = isLightBackground(background) ?? (theme === "light" || theme === "paper");

  return isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.1)";
}

export function stringValue(value: string | number | undefined, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function isRowGroupedBlock(slide: MotionDocScene, block: MotionDocScene["blocks"][number]) {
  if (block.type === "Card") {
    return slide.props.cardFlow === "row";
  }

  if (block.type === "Metric") {
    return (slide.props.metricFlow ?? slide.props.cardFlow) === "row";
  }

  if (block.type === "Chart") {
    return slide.props.chartFlow === "row";
  }

  return false;
}

function intersectsRect(frame: Frame, rect: Frame) {
  const frameRight = frame.x + frame.w;
  const frameBottom = frame.y + frame.h;
  const rectRight = rect.x + rect.w;
  const rectBottom = rect.y + rect.h;

  return frame.x < rectRight && frameRight > rect.x && frame.y < rectBottom && frameBottom > rect.y;
}

function getAlignmentTargets(blocks: MotionDocScene["blocks"], movingFrames: readonly FrameUpdate[]) {
  const movingIndices = new Set(movingFrames.map(({ blockIndex }) => blockIndex));
  const verticalTargets = [0, 50, 100];
  const horizontalTargets = [0, 50, 100];

  blocks.forEach((block, index) => {
    if (movingIndices.has(index) || !isMovableBlock(block)) {
      return;
    }

    const frame = blockFrame(block);
    verticalTargets.push(frame.x, frame.x + frame.w / 2, frame.x + frame.w);
    horizontalTargets.push(frame.y, frame.y + frame.h / 2, frame.y + frame.h);
  });

  return {
    horizontal: horizontalTargets,
    vertical: verticalTargets
  };
}

function nearestGuide(points: readonly number[], targets: readonly number[]) {
  let nearest: number | null = null;
  let nearestDistance = GUIDE_THRESHOLD;

  for (const point of points) {
    for (const target of targets) {
      const distance = Math.abs(point - target);

      if (distance <= nearestDistance) {
        nearest = clampPercent(target);
        nearestDistance = distance;
      }
    }
  }

  return nearest;
}

function uniqueGuides(guides: readonly AlignmentGuide[]) {
  const seen = new Set<string>();

  return guides.filter((guide) => {
    const key = `${guide.orientation}-${guide.position}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isLightBackground(background: string) {
  const hex = background.trim().replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);

  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255 > 0.62;
}
