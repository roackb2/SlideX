"use client";

import type { ReactNode } from "react";
import { MotionBlock, type AnimationProps, type ColorProps, type RadiusProps } from "@/features/pitch/ui/preview/motion/MotionBlock";
import { surfaceStyle, textStyle } from "@/features/pitch/ui/preview/motion/blockStyles";
import { useDynamicFont } from "@/features/pitch/ui/hooks/useDynamicFont";

type TextBlockProps = AnimationProps & {
  children: ReactNode;
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  listType?: string;
  textVerticalAlign?: string;
} & RadiusProps & ColorProps;

export function Title({
  background,
  backgroundColor,
  children,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textAlign,
  textColor,
  textVerticalAlign,
  listType,
  ...animation
}: TextBlockProps) {
  useDynamicFont(fontFamily);

  return (
    <MotionBlock
      className={`w-full text-5xl font-semibold leading-[1.02] tracking-normal text-[var(--slide-fg)] md:text-7xl`}
      style={{
        ...textStyle({ fontFamily, fontSize, fontWeight, lineHeight }, 1.02, textAlign),
        ...textBoxAlignment(textVerticalAlign),
        ...surfaceStyle({ background, backgroundColor, color, textColor }, true)
      }}
      {...animation}
    >
      {renderContent(children, listType)}
    </MotionBlock>
  );
}

export function Text({
  background,
  backgroundColor,
  children,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textAlign,
  textColor,
  textVerticalAlign,
  listType,
  ...animation
}: TextBlockProps) {
  useDynamicFont(fontFamily);

  return (
    <MotionBlock
      className={`w-full text-lg leading-8 text-[var(--slide-muted)] md:text-2xl md:leading-9`}
      style={{
        ...textStyle({ fontFamily, fontSize, fontWeight, lineHeight }, 1.45, textAlign),
        ...textBoxAlignment(textVerticalAlign),
        ...surfaceStyle({ background, backgroundColor, color, textColor }, true)
      }}
      {...animation}
    >
      {renderContent(children, listType)}
    </MotionBlock>
  );
}

function renderContent(children: ReactNode, listType?: string) {
  if (typeof children === "string") {
    return children.split("\n").map((line, i) => (
      <span key={i} className={listType === "bullet" ? "block pl-[1.2em] -indent-[1.2em]" : "block whitespace-pre-wrap"}>
        {line === "" ? "\u200B" : line}
      </span>
    ));
  }
  return children;
}

function textBoxAlignment(value: string | undefined) {
  const justifyContent = value === "bottom"
    ? "flex-end"
    : value === "middle" || value === "center"
      ? "center"
      : "flex-start";

  return {
    alignItems: "stretch",
    display: "flex",
    flexDirection: "column",
    justifyContent
  } as const;
}
