"use client";

import { useId, type CSSProperties } from "react";
import { isSlideXIconName, lucideIconPaths } from "@/core/motion-doc/domain/lucideIconRegistry";
import { MotionBlock, type AnimationProps, type ColorProps, type RadiusProps } from "@/features/pitch/ui/preview/motion/MotionBlock";
import { cssColor, surfaceVars } from "@/features/pitch/ui/preview/motion/blockStyles";

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
  const hasSurface = Boolean(cssColor(background ?? backgroundColor));

  return (
    <MotionBlock
      className={`inline-flex h-full w-full items-center justify-center text-[var(--slide-fg)] ${
        hasSurface
          ? "border border-[var(--slide-border)] bg-[var(--slide-card)] p-4 shadow-xl shadow-black/20 backdrop-blur"
          : "bg-transparent p-0"
      }`}
      style={{ ...surfaceVars({ background, backgroundColor, color, mutedColor, textColor }), "--icon-declared-size": size } as CSSProperties}
      {...animation}
    >
      <LucideSvg name={icon} strokeWidth={normalizePixelValue(strokeWidth, 2)} />
    </MotionBlock>
  );
}

export function ShapeBlock({
  arrowEnd = "none",
  arrowEndSize = 100,
  arrowStart = "none",
  arrowStartSize = 100,
  fill = "rgba(142,165,255,0.72)",
  fontSize = 18,
  fontWeight = 650,
  lineStyle = "solid",
  mask = "none",
  operation = "none",
  opacity = 1,
  points,
  radius = 0,
  shape = "rectangle",
  sides,
  stroke = "#ffffff",
  strokeWidth = 2,
  text = "",
  textColor = "#ffffff",
  ...animation
}: AnimationProps & {
  arrowEnd?: string;
  arrowEndSize?: number | string;
  arrowStart?: string;
  arrowStartSize?: number | string;
  fill?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  lineStyle?: string;
  mask?: string;
  operation?: string;
  opacity?: number | string;
  points?: number | string;
  shape?: string;
  sides?: number | string;
  stroke?: string;
  strokeWidth?: number | string;
  text?: string;
  textColor?: string;
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
  const normalizedRadius = Math.min(normalizePixelValue(radius, 0), 50);

  return (
    <MotionBlock className="relative h-full w-full" style={{ opacity: normalizeOpacity(opacity) }} {...animation}>
      <svg aria-hidden="true" className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox={normalizedShape === "line" ? "0 0 100 20" : "0 0 100 100"}>
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
          {renderShape(normalizedShape, shapeFill, shapeStroke, lineWidth, normalizedSides, normalizedPoints, lineStyle, arrowStart, arrowEnd, normalizedRadius)}
          {normalizedOperation === "subtract" ? <circle cx="68" cy="34" fill="var(--slide-bg, #030303)" r="22" /> : null}
          {normalizedOperation === "intersect" ? <circle cx="62" cy="44" fill={shapeFill} opacity="0.45" r="30" stroke={shapeStroke} strokeWidth={lineWidth} /> : null}
          {normalizedOperation === "exclude" ? <circle cx="62" cy="44" fill="transparent" opacity="0.9" r="30" stroke={shapeStroke} strokeDasharray="7 7" strokeWidth={lineWidth} /> : null}
        </g>
      </svg>
      {normalizedShape === "line" ? <>
        <LineEndpoint color={shapeStroke === "transparent" ? "#e5e7eb" : shapeStroke} endpoint={arrowStart} side="start" size={arrowStartSize} />
        <LineEndpoint color={shapeStroke === "transparent" ? "#e5e7eb" : shapeStroke} endpoint={arrowEnd} side="end" size={arrowEndSize} />
      </> : null}
      {text && normalizedShape !== "line" ? (
        <span className="pointer-events-none absolute inset-[6%] flex items-center justify-center overflow-hidden text-center leading-tight" style={{ color: cssColor(textColor) ?? "#ffffff", fontSize: normalizePixelValue(fontSize, 18), fontWeight: normalizePixelValue(fontWeight, 650) }}>
          {text}
        </span>
      ) : null}
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

function generatePolygonPath(sides: number, cx = 50, cy = 50, r = 48) {
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

function generateStarPath(numPoints: number, cx = 50, cy = 50, outerR = 48, innerR?: number) {
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
  shape: ReturnType<typeof normalizeShape>,
  fill: string,
  stroke: string,
  strokeWidth: number,
  sides: number,
  starPoints: number,
  lineStyle: string,
  arrowStart: string,
  arrowEnd: string,
  radius: number
) {
  if (shape === "circle") {
    return <circle cx="50" cy="50" fill={fill} r="48" stroke={stroke} strokeWidth={strokeWidth} />;
  }

  if (shape === "triangle") {
    return <path d={generatePolygonPath(3)} fill={fill} stroke={stroke} strokeLinejoin="round" strokeWidth={strokeWidth} />;
  }

  if (shape === "polygon") {
    return <path d={generatePolygonPath(sides)} fill={fill} stroke={stroke} strokeLinejoin="round" strokeWidth={strokeWidth} />;
  }

  if (shape === "line") {
    const resolvedStroke = stroke === "transparent" ? "#e5e7eb" : stroke;
    const dashArray = lineStyle === "dashed" ? "8 6" : lineStyle === "dotted" ? "1 6" : undefined;
    const vectorStyle = { vectorEffect: "non-scaling-stroke" as const };
    const isPlainLine = arrowStart === "none" && arrowEnd === "none";
    return <g stroke={resolvedStroke} strokeLinecap={isPlainLine && lineStyle === "solid" ? "butt" : "round"} strokeLinejoin="round" strokeWidth={strokeWidth}><path d="M0 10H100" fill="none" strokeDasharray={dashArray} style={vectorStyle} /></g>;
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

  const customPaths: Partial<Record<ReturnType<typeof normalizeShape>, string>> = {
    chevron: "M1 1H68L99 50 68 99H1L32 50Z",
    corner: "M1 1H72L99 28V99H1Z",
    diamond: "M50 1L99 50 50 99 1 50Z",
    hexagon: "M20 1H80L99 50 80 99H20L1 50Z",
    parallelogram: "M24 1H99L76 99H1Z"
  };
  if (customPaths[shape]) return <path d={customPaths[shape]} fill={fill} stroke={stroke} strokeLinejoin="round" strokeWidth={strokeWidth} />;

  return <rect fill={fill} height="100" rx={radius} stroke={stroke} strokeWidth={strokeWidth} width="100" x="0" y="0" />;
}

function LineEndpoint({ color, endpoint, side, size }: { color: string; endpoint: string; side: "end" | "start"; size: number | string }) {
  if (endpoint === "none" || !endpoint) return null;
  const scale = Math.min(Math.max(Number(size) || 100, 25), 300) / 100;
  const sidePosition = side === "start" ? { left: 0 } : { right: 0 };
  if (endpoint === "circle") {
    return <span aria-hidden="true" className="pointer-events-none absolute top-1/2 rounded-full" style={{ ...sidePosition, background: color, height: 10 * scale, width: 10 * scale, transform: `translate(${side === "start" ? "-50%" : "50%"}, -50%)` }} />;
  }
  if (endpoint === "bar") {
    return <span aria-hidden="true" className="pointer-events-none absolute top-1/2" style={{ ...sidePosition, background: color, height: 16 * scale, width: Math.max(2 * scale, 1), transform: `translate(${side === "start" ? "-50%" : "50%"}, -50%)` }} />;
  }
  if (endpoint === "arrow") {
    return <span aria-hidden="true" className="pointer-events-none absolute top-1/2 h-0 w-0" style={{ ...sidePosition, borderBottom: `${6 * scale}px solid transparent`, borderTop: `${6 * scale}px solid transparent`, ...(side === "start" ? { borderRight: `${10 * scale}px solid ${color}` } : { borderLeft: `${10 * scale}px solid ${color}` }), transform: "translateY(-50%)" }} />;
  }
  return null;
}

function LucideSvg({ name, strokeWidth }: { name: string; strokeWidth: number }) {
  if (!isSlideXIconName(name)) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      className="h-full w-full"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
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

function normalizeOpacity(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return 1;
  }

  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 1;
}

function normalizeShape(value: string): "arrow" | "chevron" | "circle" | "corner" | "diamond" | "hexagon" | "line" | "parallelogram" | "polygon" | "rectangle" | "star" | "triangle" {
  if (value === "arrow" || value === "chevron" || value === "circle" || value === "corner" || value === "diamond" || value === "hexagon" || value === "triangle" || value === "line" || value === "parallelogram" || value === "star" || value === "polygon") {
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
