import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";

export type MotionDocFrame = {
  h: number;
  w: number;
  x: number;
  y: number;
};

export function defaultBlockWidth(type: MotionDocBlock["type"]) {
  if (type === "Title") return 52;
  if (type === "Text") return 42;
  if (type === "Icon") return 16;
  if (type === "Metric") return 32;
  if (type === "Chart") return 70;
  if (type === "Shape") return 28;
  if (type === "Stack") return 80;
  if (type === "ImageBlock" || type === "VideoBlock") return 80;

  return 40;
}

export function defaultBlockHeight(type: MotionDocBlock["type"]) {
  if (type === "Title") return 18;
  if (type === "Text") return 9;
  if (type === "Icon") return 28;
  if (type === "Metric") return 36;
  if (type === "Chart") return 42;
  if (type === "Shape") return 28;
  if (type === "Stack") return 20;
  if (type === "ImageBlock" || type === "VideoBlock") return 54;

  return 32;
}

export function defaultBlockX(type: MotionDocBlock["type"]) {
  if (type === "Icon") return 42;
  if (type === "ImageBlock" || type === "VideoBlock" || type === "Chart" || type === "Stack") return 10;
  if (type === "Shape") return 34;

  return 8;
}

export function defaultBlockY(type: MotionDocBlock["type"]) {
  if (type === "Title") return 18;
  if (type === "Chart") return 36;
  if (type === "Icon" || type === "Shape") return 30;
  if (type === "Stack") return 64;
  if (type === "ImageBlock" || type === "VideoBlock") return 20;

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
