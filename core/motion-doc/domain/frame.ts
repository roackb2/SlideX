import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";

export type MotionDocFrame = {
  h: number;
  w: number;
  x: number;
  y: number;
};

export type GroupableBlockType = Extract<MotionDocBlock["type"], "Card" | "Chart" | "Metric">;

export function defaultBlockWidth(type: MotionDocBlock["type"]) {
  if (type === "Title") return 52;
  if (type === "Text") return 42;
  if (type === "Metric") return 32;
  if (type === "Chart") return 70;
  if (type === "ImageBlock") return 80;

  return 40;
}

export function defaultBlockHeight(type: MotionDocBlock["type"]) {
  if (type === "Title") return 18;
  if (type === "Text") return 16;
  if (type === "Metric") return 36;
  if (type === "Chart") return 42;
  if (type === "ImageBlock") return 54;

  return 32;
}

export function defaultBlockX(type: MotionDocBlock["type"]) {
  if (type === "ImageBlock" || type === "Chart") return 10;

  return 8;
}

export function defaultBlockY(type: MotionDocBlock["type"]) {
  if (type === "Title") return 18;
  if (type === "Chart") return 36;
  if (type === "ImageBlock") return 20;

  return 38;
}

export function percentFrameValue(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 0), 100);
}

export function numberValue(value: string | number | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function clampFramePosition(value: number, size: number) {
  return Math.round(Math.min(Math.max(value, 0), Math.max(100 - size, 0)) * 10) / 10;
}

export function roundFrameValue(value: number) {
  return Math.round(Math.min(Math.max(value, 0), 100) * 10) / 10;
}

export function clampPercent(value: number) {
  return roundFrameValue(value);
}

export function groupFrameFor(
  type: GroupableBlockType,
  flow: string,
  gap: number,
  index: number,
  count: number,
  props: Record<string, string | number>
) {
  const defaultW = defaultBlockWidth(type);
  const defaultH = defaultBlockHeight(type);
  const currentW = percentFrameValue(props.w, defaultW);
  const currentH = percentFrameValue(props.h, defaultH);

  if (flow === "row") {
    const normalizedGap = Math.min(Math.max(gap, 0), 16);
    const width = Math.max((84 - normalizedGap * Math.max(count - 1, 0)) / Math.max(count, 1), 8);
    const groupWidth = Math.min(width * count + normalizedGap * Math.max(count - 1, 0), 96);

    return {
      h: roundFrameValue(currentH),
      w: roundFrameValue(width),
      x: roundFrameValue((100 - groupWidth) / 2 + index * (width + normalizedGap)),
      y: type === "Chart" ? 34 : 38
    };
  }

  const stackWidth = type === "Chart" ? Math.max(currentW, 64) : Math.max(currentW, defaultW);
  const stackHeight = Math.min(currentH, type === "Chart" ? 42 : defaultH);

  return {
    h: roundFrameValue(stackHeight),
    w: roundFrameValue(stackWidth),
    x: type === "Chart" ? 10 : 8,
    y: clampFramePosition((type === "Chart" ? 28 : 30) + index * (stackHeight + 4), stackHeight)
  };
}
