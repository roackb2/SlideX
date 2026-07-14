import type { MotionDocProps } from "@/core/motion-doc/domain/motionDocTypes";

export type BlockUpdateOptions = {
  skipReplay?: boolean;
  transient?: boolean;
};

export type BlockUpdater = (
  blockIndex: number,
  newProps: MotionDocProps,
  newText?: string,
  options?: BlockUpdateOptions
) => void;
