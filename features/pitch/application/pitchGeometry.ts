import type { MotionDocFrame, MotionDocFramePatch } from "@/core/motion-doc/domain/frame";

export type PositionDelta = {
  x: number;
  y: number;
};

export type BlockFramePatch = {
  blockIndex: number;
  frame: MotionDocFramePatch;
};

export type ResolvedBlockFrameUpdate = {
  blockIndex: number;
  frame: MotionDocFrame;
};
