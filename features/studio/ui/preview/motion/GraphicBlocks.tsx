"use client";

import { useId, type CSSProperties } from "react";
import { isSlideXIconName, lucideIconPaths } from "@/core/motion-doc/domain/lucideIconRegistry";
import { MotionBlock, type AnimationProps, type ColorProps, type RadiusProps } from "@/features/studio/ui/preview/motion/MotionBlock";
import { cssColor, surfaceVars } from "@/features/studio/ui/preview/motion/blockStyles";

export function IconBlock({
  background,
  backgroundColor,
  color,
  icon = "Sparkles",
  mutedColor,
  size = 96,
  strokeWidth = 2,
  textColor,
  ...animation
}: AnimationProps & {
  icon?: string;
  size?: number | string;
  strokeWidth?: number | string;
} & RadiusProps & ColorProps) {
  const iconSize = normalizePixelValue(size, 96);
  const hasSurface = Boolean(cssColor(background ?? backgroundColor));

  return (
    <MotionBlock
      className={`inline-flex h-full w-full items-center justify-center text-[var(--slide-fg)] ${
        hasSurface
          ? "border border-[var(--slide-border)] bg-[var(--slide-card)] p-4 shadow-xl shadow-black/20 backdrop-blur"
          : "bg-transparent p-0"
      }`}
      style={surfaceVars({ background, backgroundColor, color, mutedColor, textColor })}
      {...animation}
    >
      <LucideSvg name={icon} size={iconSize} strokeWidth={normalizePixelValue(strokeWidth, 2)} />
    </MotionBlock>
  );
}

export function ShapeBlock({
  fill = "rgba(142,165,255,0.72)",
  mask = "none",
  operation = "none",
  opacity = 1,
  points,
  shape = "rectangle",
  sides,
  stroke = "#ffffff",
  strokeWidth = 2,
  ...animation
}: AnimationProps & {
  fill?: string;
  mask?: string;
  operation?: string;
  opacity?: number | string;
  points?: number | string;
  shape?: string;
  sides?: number | string;
  stroke?: string;
  strokeWidth?: number | string;
} & RadiusProps) {
  const maskId = useId();
  const normalizedShape = normalizeShape(shape);
  const normalizedMask = normalizeMask(mask);
  const normalizedOperation = normalizeOperation(operation);
  const shapeFill = cssColor(fill) ?? "rgba(142,165,255,0.72)";
  const shapeStroke = cssColor(stroke) ?? "transparent";
  const lineWidth = normalizePixelValue(strokeWidth, normalizedShape === "line" ? 4 : 2);
  const normalizedSides = normalizeIntValue(sides, 3);
  const normalizedPoints = normalizeIntValue(points, 5);

  return (
    <MotionBlock className="h-full w-full" style={{ opacity: normalizeOpacity(opacity) }} {...animation}>
      <svg aria-hidden="true" className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <mask id={maskId}>
            {normalizedMask === "alpha" ? (
              <linearGradient id={`${maskId}-fade`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                <stop offset="45%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0.2" />
              </linearGradient>
            ) : null}
            {normalizedMask === "luma" ? (
              <radialGradient id={`${maskId}-radial`} cx="50%" cy="45%" r="58%">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0.08" />
              </radialGradient>
            ) : null}
            {normalizedMask === "clip" ? (
              <rect fill="white" height="72" rx="14" width="72" x="14" y="14" />
            ) : null}
            {normalizedMask === "alpha" ? <rect fill={`url(#${maskId}-fade)`} height="100" width="100" /> : null}
            {normalizedMask === "luma" ? <rect fill={`url(#${maskId}-radial)`} height="100" width="100" /> : null}
          </mask>
        </defs>
        <g mask={normalizedMask === "none" ? undefined : `url(#${maskId})`}>
          {renderShape(normalizedShape, shapeFill, shapeStroke, lineWidth, normalizedSides, normalizedPoints)}
          {normalizedOperation === "subtract" ? <circle cx="68" cy="34" fill="var(--slide-bg, #030303)" r="22" /> : null}
          {normalizedOperation === "intersect" ? <circle cx="62" cy="44" fill={shapeFill} opacity="0.45" r="30" stroke={shapeStroke} strokeWidth={lineWidth} /> : null}
          {normalizedOperation === "exclude" ? <circle cx="62" cy="44" fill="transparent" opacity="0.9" r="30" stroke={shapeStroke} strokeDasharray="7 7" strokeWidth={lineWidth} /> : null}
        </g>
      </svg>
    </MotionBlock>
  );
}

export function StackBlock({
  align = "stretch",
  background,
  backgroundColor,
  color,
  gap = 16,
  items = "Panel A|Panel B|Panel C",
  layout = "row",
  mutedColor,
  padding = 20,
  stroke = "rgba(255,255,255,0.16)",
  textColor,
  ...animation
}: AnimationProps & {
  align?: string;
  gap?: number | string;
  items?: string;
  layout?: string;
  padding?: number | string;
  stroke?: string;
} & RadiusProps & ColorProps) {
  const stackItems = parseStackItems(items);
  const direction = layout === "column" ? "column" : "row";
  const normalizedGap = normalizePixelValue(gap, 16);
  const normalizedPadding = normalizePixelValue(padding, 20);
  const justifyItems = align === "center" ? "center" : align === "end" ? "flex-end" : "stretch";

  return (
    <MotionBlock
      className="flex h-full w-full border bg-[var(--slide-card)] shadow-xl shadow-black/20 backdrop-blur"
      style={{
        ...surfaceVars({ background, backgroundColor, color, mutedColor, textColor }),
        alignItems: justifyItems,
        borderColor: cssColor(stroke) ?? "var(--slide-border)",
        flexDirection: direction,
        gap: normalizedGap,
        padding: normalizedPadding
      } as CSSProperties}
      {...animation}
    >
      {stackItems.map((item, index) => (
        <div
          className="flex min-h-0 min-w-0 flex-1 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-center text-[12px] font-semibold text-[var(--slide-fg)]"
          key={`${item}-${index}`}
          style={{ color: "var(--block-fg, var(--slide-fg))" }}
        >
          <span className="truncate">{item}</span>
        </div>
      ))}
    </MotionBlock>
  );
}

function generatePolygonPath(sides: number, cx = 50, cy = 50, r = 40) {
  const angleOffset = -Math.PI / 2;
  const points: string[] = [];

  for (let i = 0; i < sides; i++) {
    const angle = angleOffset + (2 * Math.PI * i) / sides;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return `M${points.join(" L")} Z`;
}

function generateStarPath(numPoints: number, cx = 50, cy = 50, outerR = 42, innerR?: number) {
  const resolvedInnerR = innerR ?? outerR * 0.42;
  const angleOffset = -Math.PI / 2;
  const points: string[] = [];
  const totalVertices = numPoints * 2;

  for (let i = 0; i < totalVertices; i++) {
    const angle = angleOffset + (2 * Math.PI * i) / totalVertices;
    const r = i % 2 === 0 ? outerR : resolvedInnerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return `M${points.join(" L")} Z`;
}

function renderShape(
  shape: "arrow" | "circle" | "line" | "polygon" | "rectangle" | "star" | "triangle",
  fill: string,
  stroke: string,
  strokeWidth: number,
  sides: number,
  starPoints: number
) {
  if (shape === "circle") {
    return <circle cx="50" cy="50" fill={fill} r="38" stroke={stroke} strokeWidth={strokeWidth} />;
  }

  if (shape === "triangle") {
    return <path d={generatePolygonPath(3)} fill={fill} stroke={stroke} strokeLinejoin="round" strokeWidth={strokeWidth} />;
  }

  if (shape === "polygon") {
    return <path d={generatePolygonPath(sides)} fill={fill} stroke={stroke} strokeLinejoin="round" strokeWidth={strokeWidth} />;
  }

  if (shape === "line") {
    return <path d="M8 50 H92" fill="none" stroke={stroke === "transparent" ? fill : stroke} strokeLinecap="round" strokeWidth={strokeWidth} />;
  }

  if (shape === "arrow") {
    const resolvedStroke = stroke === "transparent" ? fill : stroke;
    return (
      <g fill="none" stroke={resolvedStroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <path d="M10 74 L88 18" />
        <path d="M56 18 H88 V50" />
      </g>
    );
  }

  if (shape === "star") {
    return <path d={generateStarPath(starPoints)} fill={fill} stroke={stroke} strokeLinejoin="round" strokeWidth={strokeWidth} />;
  }

  return <rect fill={fill} height="76" rx="14" stroke={stroke} strokeWidth={strokeWidth} width="76" x="12" y="12" />;
}

function LucideSvg({ name, size, strokeWidth }: { name: string; size: number; strokeWidth: number }) {
  if (!isSlideXIconName(name)) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      {lucideIconPaths[name].map((path, index) => renderIconPath(path, `${name}-${index}`))}
    </svg>
  );
}

function renderIconPath(path: string, key: string) {
  const [shape, ...parts] = path.split(" ");

  if (shape === "circle") {
    return <circle cx={parts[0]} cy={parts[1]} key={key} r={parts[2]} />;
  }

  if (shape === "ellipse") {
    return <ellipse cx={parts[0]} cy={parts[1]} key={key} rx={parts[2]} ry={parts[3]} />;
  }

  if (shape === "rect") {
    return <rect height={parts[3]} key={key} rx={parts[4]} ry={parts[5]} width={parts[2]} x={parts[0]} y={parts[1]} />;
  }

  return <path d={shape === "path" ? parts.join(" ") : path} key={key} />;
}

function parseStackItems(value: string) {
  const items = value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : ["Item 1", "Item 2"];
}

function normalizePixelValue(value: number | string | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? Math.max(parsed, 0) : fallback;
}

function normalizeIntValue(value: number | string | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : parseInt(String(value), 10);

  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 3), 12) : fallback;
}

function normalizeOpacity(value: number | string | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 1;
}

function normalizeShape(value: string): "arrow" | "circle" | "line" | "polygon" | "rectangle" | "star" | "triangle" {
  if (value === "arrow" || value === "circle" || value === "triangle" || value === "line" || value === "star" || value === "polygon") {
    return value;
  }

  return "rectangle";
}

function normalizeMask(value: string) {
  if (value === "alpha" || value === "luma" || value === "clip") {
    return value;
  }

  return "none";
}

function normalizeOperation(value: string) {
  if (value === "subtract" || value === "intersect" || value === "exclude") {
    return value;
  }

  return "none";
}
