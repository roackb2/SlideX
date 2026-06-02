"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, type MotionProps } from "framer-motion";

export type EnterAnimation = "fadeIn" | "fadeUp" | "zoomIn" | "slideLeft";

export type AnimationProps = {
  delay?: number;
  duration?: number;
  enter?: EnterAnimation;
  fillFrame?: boolean;
};

export type RadiusProps = {
  borderRadius?: number | string;
  radius?: number | string;
};

export type ColorProps = {
  background?: string;
  backgroundColor?: string;
  color?: string;
  mutedColor?: string;
  textAlign?: "left" | "center" | "right";
  textColor?: string;
};

type MotionBlockProps = AnimationProps & {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & RadiusProps;

export function MotionBlock({
  borderRadius,
  children,
  className,
  fillFrame,
  radius,
  style,
  ...animation
}: MotionBlockProps) {
  return (
    <motion.div
      className={className}
      style={{
        ...radiusStyle({ borderRadius, radius }),
        ...(fillFrame ? { height: "100%", maxWidth: "none", width: "100%" } : {}),
        ...style
      }}
      {...getMotionProps(animation)}
    >
      {children}
    </motion.div>
  );
}

function getMotionProps({
  delay = 0,
  duration = 0.6,
  enter = "fadeUp"
}: AnimationProps): MotionProps {
  const shared = {
    animate: { opacity: 1, scale: 1, x: 0, y: 0 },
    transition: { delay, duration, ease: [0.22, 1, 0.36, 1] }
  } satisfies MotionProps;

  if (enter === "fadeIn") {
    return { ...shared, initial: { opacity: 0 } };
  }

  if (enter === "zoomIn") {
    return { ...shared, initial: { opacity: 0, scale: 0.88 } };
  }

  if (enter === "slideLeft") {
    return { ...shared, initial: { opacity: 0, x: 54 } };
  }

  return { ...shared, initial: { opacity: 0, y: 28 } };
}

function radiusStyle({ borderRadius, radius }: RadiusProps): CSSProperties | undefined {
  const value = borderRadius ?? radius;

  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);

  if (Number.isFinite(parsed)) {
    return { borderRadius: `${Math.max(parsed, 0)}px` };
  }

  return { borderRadius: value };
}
