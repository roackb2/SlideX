"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, type MotionProps } from "framer-motion";
import { isSlideXIconName, lucideIconPaths } from "@/lib/lucideIconRegistry";

type EnterAnimation = "fadeIn" | "fadeUp" | "zoomIn" | "slideLeft";
type ImageFit = NonNullable<CSSProperties["objectFit"]>;

type AnimationProps = {
  enter?: EnterAnimation;
  delay?: number;
  duration?: number;
  fillFrame?: boolean;
};

type RadiusProps = {
  borderRadius?: number | string;
  radius?: number | string;
};

type ColorProps = {
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

function getMotionProps({
  enter = "fadeUp",
  delay = 0,
  duration = 0.6
}: AnimationProps): MotionProps {
  const shared = {
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
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

function MotionBlock({ borderRadius, children, className, fillFrame, radius, style, ...animation }: MotionBlockProps) {
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

export function Scene({
  duration,
  theme = "dark",
  background,
  accent = "#7c3aed",
  textColor,
  mutedColor,
  layout = "default",
  alignX = "left",
  alignY = "center",
  textAlign = "left",
  autoHeight = false,
  freeform = false,
  children
}: {
  duration: number;
  theme?: string;
  background?: string;
  accent?: string;
  textColor?: string;
  mutedColor?: string;
  layout?: "default" | "split-left" | "split-right";
  alignX?: "left" | "center" | "right" | "stretch";
  alignY?: "top" | "center" | "bottom";
  textAlign?: "left" | "center" | "right";
  autoHeight?: boolean;
  freeform?: boolean;
  children: ReactNode;
}) {
  const isLight = theme === "light" || theme === "paper";
  const slideBackground =
    background ??
    (theme === "light"
      ? "#f8fafc"
      : theme === "paper"
        ? "#f3eadf"
        : theme === "blue"
          ? "#0b1f3a"
          : "#0f172a");
  const foreground = isLight ? "#111827" : "#ffffff";
  const muted = cssColor(mutedColor) ?? (isLight ? "#475569" : "#cbd5e1");
  const textForeground = cssColor(textColor) ?? foreground;
  const cardBackground = isLight ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.075)";
  const borderColor = isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.12)";

  return (
    <section
      data-motion-scene
      data-duration={duration}
      style={
        {
          "--slide-accent": accent,
          "--slide-bg": slideBackground,
          "--slide-border": borderColor,
          "--slide-card": cardBackground,
          "--slide-fg": textForeground,
          "--slide-muted": muted,
          "--slide-text-align": textAlign,
          position: autoHeight ? "relative" : "absolute",
          inset: autoHeight ? undefined : 0,
          minHeight: autoHeight ? "100%" : undefined,
          height: autoHeight ? "auto" : undefined,
          overflow: "hidden",
          borderRadius: 20,
          border: `1px solid ${borderColor}`,
          padding: freeform ? 0 : "clamp(16px, 3%, 32px)",
          background: slideBackground,
          display: "flex",
          flexDirection: "column",
        } as CSSProperties
      }
    >
      {/* Future export: this duration can map directly to a timeline segment,
      so <Scene duration={5}> becomes a five-second video scene. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.7,
          background: `radial-gradient(circle at 20% 10%, ${accent}38, transparent 28rem), radial-gradient(circle at 90% 70%, ${accent}24, transparent 24rem)`
        }}
      />
      <div style={{ 
        position: "relative", 
        zIndex: 10, 
        display: "flex", 
        flex: autoHeight ? "0 0 auto" : 1, 
        flexDirection: layout === "default" ? "column" : "row", 
        justifyContent: alignYToFlex(alignY), 
        alignItems: layout === "default" ? alignXToFlex(alignX) : "stretch",
        gap: layout === "default" ? 20 : 48, 
        minHeight: autoHeight ? "calc(100% - clamp(32px, 6%, 64px))" : 0, 
        width: "100%",
        height: freeform ? "100%" : undefined,
        overflow: "visible",
        textAlign 
      }}>
        {children}
      </div>
    </section>
  );
}

export function Title({
  background,
  backgroundColor,
  children,
  color,
  fontSize,
  textAlign,
  textColor,
  ...animation
}: AnimationProps & {
  children: ReactNode;
  fontSize?: number | string;
} & RadiusProps & ColorProps) {
  return (
    <MotionBlock className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-[var(--slide-fg)] md:text-7xl" style={{ ...textStyle(fontSize, 1.02, textAlign), ...surfaceStyle({ background, backgroundColor, color, textColor }, true) }} {...animation}>
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
  textAlign,
  textColor,
  ...animation
}: AnimationProps & {
  children: ReactNode;
  fontSize?: number | string;
} & RadiusProps & ColorProps) {
  return (
    <MotionBlock className="max-w-2xl text-lg leading-8 text-[var(--slide-muted)] md:text-2xl md:leading-9" style={{ ...textStyle(fontSize, 1.45, textAlign), ...surfaceStyle({ background, backgroundColor, color, textColor }, true) }} {...animation}>
      {children}
    </MotionBlock>
  );
}

function textStyle(fontSize: number | string | undefined, lineHeight: number, textAlign: ColorProps["textAlign"]): CSSProperties | undefined {
  return {
    ...(fontSize === undefined || fontSize === "" ? {} : { fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize }),
    lineHeight,
    ...(textAlign ? { textAlign } : {})
  };
}

function cssColor(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function surfaceStyle(props: Pick<ColorProps, "background" | "backgroundColor" | "color" | "textColor">, padWhenFilled = false): CSSProperties {
  const background = cssColor(props.background ?? props.backgroundColor);
  const color = cssColor(props.color ?? props.textColor);

  return {
    ...(background ? { background, padding: padWhenFilled ? "0.12em 0.18em" : undefined } : {}),
    ...(color ? { color } : {})
  };
}

function surfaceVars(props: ColorProps): CSSProperties {
  const background = cssColor(props.background ?? props.backgroundColor);
  const color = cssColor(props.color ?? props.textColor);
  const mutedColor = cssColor(props.mutedColor);

  return {
    ...(background ? { "--block-bg": background, background } : {}),
    ...(color ? { "--block-fg": color } : {}),
    ...(mutedColor || color ? { "--block-muted": mutedColor ?? color } : {})
  } as CSSProperties;
}

export function Card({
  background,
  backgroundColor,
  color,
  icon,
  layout = "vertical",
  mutedColor,
  textColor,
  title,
  text,
  width = "md",
  ...animation
}: AnimationProps & {
  icon?: string;
  layout?: string;
  title: string;
  text: string;
  width?: string;
} & RadiusProps & ColorProps) {
  const isHorizontal = layout === "horizontal";
  const colors = surfaceVars({ background, backgroundColor, color, mutedColor, textColor });

  return (
    <MotionBlock
      className={`${cardWidthClass(width)} overflow-hidden rounded-2xl border border-[var(--slide-border)] bg-[var(--slide-card)] p-5 shadow-xl shadow-black/20 backdrop-blur ${
        isHorizontal ? "flex items-start gap-4" : ""
      }`}
      style={colors}
      {...animation}
    >
      {icon ? (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--slide-border)] bg-white/[0.08] text-[var(--slide-fg)] ${
          isHorizontal ? "" : "mb-4"
        }`} style={{ color: "var(--block-fg, var(--slide-fg))" }}>
          <LucideSvg name={icon} />
        </div>
      ) : null}
      <div className="min-w-0">
        <h3 className="text-xl font-semibold text-[var(--slide-fg)]" style={{ color: "var(--block-fg, var(--slide-fg))" }}>{title}</h3>
        <p className="mt-2 text-base leading-7 text-[var(--slide-muted)]" style={{ color: "var(--block-muted, var(--slide-muted))" }}>{text}</p>
      </div>
    </MotionBlock>
  );
}

function cardWidthClass(value: string) {
  if (value === "sm") return "w-full max-w-sm";
  if (value === "lg") return "w-full max-w-3xl";
  if (value === "full") return "w-full max-w-none";

  return "w-full max-w-2xl";
}

export function Metric({
  background,
  backgroundColor,
  caption,
  color,
  label,
  mutedColor,
  textColor,
  value,
  width = "sm",
  ...animation
}: AnimationProps & {
  caption?: string;
  label: string;
  value: string;
  width?: string;
} & RadiusProps & ColorProps) {
  return (
    <MotionBlock className={`${metricWidthClass(width)} rounded-2xl border border-[var(--slide-border)] bg-[var(--slide-card)] p-5 shadow-xl shadow-black/20 backdrop-blur`} style={surfaceVars({ background, backgroundColor, color, mutedColor, textColor })} {...animation}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slide-muted)]" style={{ color: "var(--block-muted, var(--slide-muted))" }}>{label}</p>
      <p className="mt-3 text-5xl font-semibold leading-none text-[var(--slide-fg)]" style={{ color: "var(--block-fg, var(--slide-fg))" }}>{value}</p>
      {caption ? <p className="mt-3 text-sm leading-6 text-[var(--slide-muted)]" style={{ color: "var(--block-muted, var(--slide-muted))" }}>{caption}</p> : null}
    </MotionBlock>
  );
}

export function Chart({
  background,
  backgroundColor,
  color,
  height = 144,
  labels = "",
  mutedColor,
  textColor,
  title,
  values = "",
  width = "lg",
  ...animation
}: AnimationProps & {
  height?: number | string;
  labels?: string;
  title: string;
  values?: string;
  width?: string;
} & RadiusProps & ColorProps) {
  const chartValues = parseChartValues(values);
  const chartLabels = labels.split(",").map((item) => item.trim()).filter(Boolean);
  const maxValue = Math.max(...chartValues, 1);
  const chartHeight = normalizeChartHeight(height);

  return (
    <MotionBlock className={`${chartWidthClass(width)} rounded-2xl border border-[var(--slide-border)] bg-[var(--slide-card)] p-5 shadow-xl shadow-black/20 backdrop-blur`} style={surfaceVars({ background, backgroundColor, color, mutedColor, textColor })} {...animation}>
      <h3 className="text-xl font-semibold text-[var(--slide-fg)]" style={{ color: "var(--block-fg, var(--slide-fg))" }}>{title}</h3>
      <div className="mt-5 flex items-end gap-3" style={{ minHeight: chartHeight + 48 }}>
        {chartValues.map((value, index) => (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={`${value}-${index}`}>
            <div className="flex w-full items-end rounded-md bg-white/[0.08]" style={{ height: chartHeight }}>
              <div
                className="w-full rounded-md bg-[var(--slide-fg)]"
                style={{ height: `${Math.max((value / maxValue) * 100, 4)}%`, background: "var(--block-fg, var(--slide-fg))" }}
              />
            </div>
            <span className="max-w-full truncate text-[10px] uppercase tracking-wide text-[var(--slide-muted)]" style={{ color: "var(--block-muted, var(--slide-muted))" }}>
              {chartLabels[index] ?? `D${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    </MotionBlock>
  );
}

function metricWidthClass(value: string) {
  if (value === "md") return "w-full max-w-md";
  if (value === "lg") return "w-full max-w-2xl";
  if (value === "full") return "w-full max-w-none";

  return "w-full max-w-sm";
}

function chartWidthClass(value: string) {
  if (value === "sm") return "w-full max-w-xl";
  if (value === "md") return "w-full max-w-2xl";
  if (value === "full") return "w-full max-w-none";

  return "w-full max-w-3xl";
}

function normalizeChartHeight(value: number | string | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return 144;
  }

  return Math.min(Math.max(parsed, 80), 320);
}

export function ImageBlock({
  alt,
  background,
  backgroundColor,
  fit = "cover",
  full = false,
  src,
  ...animation
}: AnimationProps & {
  src: string;
  alt: string;
  fit?: string;
  full?: boolean;
} & RadiusProps & Pick<ColorProps, "background" | "backgroundColor">) {
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
        className={full || fillFrame ? "h-full w-full" : "aspect-video w-full"}
        src={src}
        alt={alt}
        style={{ objectFit: normalizeImageFit(fit) }}
      />
    </MotionBlock>
  );
}

function parseChartValues(values: string) {
  const parsed = values
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isFinite(value) && value >= 0);

  return parsed.length > 0 ? parsed : [24, 42, 68, 54];
}

function normalizeImageFit(value: string | undefined): ImageFit {
  if (value === "contain" || value === "fill" || value === "scale-down") {
    return value;
  }

  return "cover";
}

function alignXToFlex(value: "left" | "center" | "right" | "stretch") {
  if (value === "center") return "center";
  if (value === "right") return "flex-end";
  if (value === "stretch") return "stretch";

  return "flex-start";
}

function alignYToFlex(value: "top" | "center" | "bottom") {
  if (value === "top") return "flex-start";
  if (value === "bottom") return "flex-end";

  return "center";
}

function LucideSvg({ name }: { name: string }) {
  if (!isSlideXIconName(name)) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {lucideIconPaths[name].map((path, index) => {
        const [shape, ...parts] = path.split(" ");

        if (shape === "circle") {
          return <circle cx={parts[0]} cy={parts[1]} key={path + index} r={parts[2]} />;
        }

        if (shape === "ellipse") {
          return <ellipse cx={parts[0]} cy={parts[1]} key={path + index} rx={parts[2]} ry={parts[3]} />;
        }

        if (shape === "rect") {
          return <rect height={parts[3]} key={path + index} rx={parts[4]} ry={parts[5]} width={parts[2]} x={parts[0]} y={parts[1]} />;
        }

        return <path d={shape === "path" ? parts.join(" ") : path} key={path + index} />;
      })}
    </svg>
  );
}
