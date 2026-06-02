"use client";

import type { CSSProperties } from "react";
import { MotionBlock, type AnimationProps, type RadiusProps } from "@/features/studio/ui/preview/motion/MotionBlock";
import { surfaceStyle } from "@/features/studio/ui/preview/motion/blockStyles";

type ImageFit = NonNullable<CSSProperties["objectFit"]>;

export function ImageBlock({
  alt,
  background,
  backgroundColor,
  fit = "cover",
  full = false,
  src,
  ...animation
}: AnimationProps & {
  alt: string;
  fit?: string;
  full?: boolean;
  src: string;
} & RadiusProps & {
  background?: string;
  backgroundColor?: string;
}) {
  const fillFrame = Boolean(animation.fillFrame);

  return (
    <MotionBlock
      className={
        full
          ? "absolute -inset-8 z-0 w-auto max-w-none overflow-hidden rounded-none border-0 bg-white/[0.08]"
          : "w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08]"
      }
      style={surfaceStyle({ background, backgroundColor })}
      {...animation}
    >
      <img
        alt={alt}
        className={full || fillFrame ? "h-full w-full" : "aspect-video w-full"}
        src={src}
        style={{ objectFit: normalizeImageFit(fit) }}
      />
    </MotionBlock>
  );
}

function normalizeImageFit(value: string | undefined): ImageFit {
  if (value === "contain" || value === "fill" || value === "scale-down") {
    return value;
  }

  return "cover";
}
