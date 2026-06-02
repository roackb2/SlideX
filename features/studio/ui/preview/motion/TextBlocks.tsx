"use client";

import type { ReactNode } from "react";
import { MotionBlock, type AnimationProps, type ColorProps, type RadiusProps } from "@/features/studio/ui/preview/motion/MotionBlock";
import { surfaceStyle, textStyle } from "@/features/studio/ui/preview/motion/blockStyles";

type TextBlockProps = AnimationProps & {
  children: ReactNode;
  fontSize?: number | string;
  fontWeight?: number | string;
  lineHeight?: number | string;
} & RadiusProps & ColorProps;

export function Title({
  background,
  backgroundColor,
  children,
  color,
  fontSize,
  fontWeight,
  lineHeight,
  textAlign,
  textColor,
  ...animation
}: TextBlockProps) {
  return (
    <MotionBlock
      className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-[var(--slide-fg)] md:text-7xl"
      style={{
        ...textStyle({ fontSize, fontWeight, lineHeight }, 1.02, textAlign),
        ...surfaceStyle({ background, backgroundColor, color, textColor }, true)
      }}
      {...animation}
    >
      {children}
    </MotionBlock>
  );
}

export function Text({
  background,
  backgroundColor,
  children,
  color,
  fontSize,
  fontWeight,
  lineHeight,
  textAlign,
  textColor,
  ...animation
}: TextBlockProps) {
  return (
    <MotionBlock
      className="max-w-2xl text-lg leading-8 text-[var(--slide-muted)] md:text-2xl md:leading-9"
      style={{
        ...textStyle({ fontSize, fontWeight, lineHeight }, 1.45, textAlign),
        ...surfaceStyle({ background, backgroundColor, color, textColor }, true)
      }}
      {...animation}
    >
      {children}
    </MotionBlock>
  );
}
