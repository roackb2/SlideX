import type PptxGenJS from "pptxgenjs";
import { lucideIconSvgDataUri } from "@/core/motion-doc/application/lucideIconSvg";
import { shapeNeedsExactSvgExport, shapeVectorSvgDataUri } from "@/core/motion-doc/application/shapeVectorSvg";
import { getPaperImageFilterDefinition } from "@/core/motion-doc/application/shaders/paperImageFilterCatalog";
import { resolveSlideThemeColors } from "@/core/motion-doc/application/slideTheme";
import {
  tableCellsFromProps,
  tableColumnTrackValuesFromProps,
  tableSizeFromProps
} from "@/core/motion-doc/application/tableBlock";
import type { MotionDocBlock, ParsedMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import { blockFrame } from "@/features/pitch/application/previewCanvas";
import { portablePptxImageData } from "@/features/pitch/infrastructure/pptxImageExport";
import { addPptxVideo } from "@/features/pitch/infrastructure/pptxVideoExport";

const SLIDE_HEIGHT = 7.5;
const SLIDE_WIDTH = 13.333;

type PptxSlide = ReturnType<PptxGenJS["addSlide"]>;
type PropsBlock = Extract<MotionDocBlock, { props: Record<string, string | number> }>;
type PptxShapeFillProps = PptxGenJS.ShapeFillProps;
type PptxShapeLineProps = PptxGenJS.ShapeLineProps;
type PptxShapeName = PptxGenJS.SHAPE_NAME;

const NATIVE_PPTX_BLOCK_TYPES = new Set([
  "Title",
  "Text",
  "heading",
  "Icon",
  "ImageBlock",
  "Shape",
  "Table",
  "VideoBlock"
]);

const POLYGON_SHAPES: Record<number, PptxShapeName> = {
  3: "triangle",
  4: "diamond",
  5: "pentagon",
  6: "hexagon",
  7: "heptagon",
  8: "octagon",
  9: "decagon",
  10: "decagon",
  11: "dodecagon",
  12: "dodecagon"
};

const STAR_SHAPES: Record<number, PptxShapeName> = {
  3: "star4",
  4: "star4",
  5: "star5",
  6: "star6",
  7: "star7",
  8: "star8",
  9: "star10",
  10: "star10",
  11: "star12",
  12: "star12"
};

export async function addEditableSlides(
  pptx: PptxGenJS,
  document: ParsedMotionDoc,
  renderedBackgrounds: readonly string[],
  filteredImagesBySlide: readonly (readonly string[])[] = [],
  chartImagesBySlide: readonly (readonly string[])[] = []
) {
  for (let sceneIndex = 0; sceneIndex < document.scenes.length; sceneIndex += 1) {
    const scene = document.scenes[sceneIndex];
    const slide = pptx.addSlide();
    const theme = resolveSlideThemeColors(scene.props);
    const renderedBackground = renderedBackgrounds[sceneIndex];
    const hasVisualFallback = Boolean(renderedBackground && needsVisualFallback(scene.blocks, scene.props));

    slide.background = { color: pptxColor(theme.background, "0F172A") };

    if (hasVisualFallback) {
      slide.background = { data: renderedBackground };
    }

    let filteredImageIndex = 0;
    let chartImageIndex = 0;

    for (const block of scene.blocks) {
      if (block.type === "Title" || block.type === "Text" || block.type === "heading") {
        addEditableText(slide, block, theme.foreground, theme.muted);
      } else if (block.type === "ImageBlock") {
        const needsFilterRasterization = imageNeedsPptxFilterRasterization(block);
        const filteredImageData = needsFilterRasterization
          ? filteredImagesBySlide[sceneIndex]?.[filteredImageIndex++]
          : undefined;

        if (needsFilterRasterization && !filteredImageData) {
          throw new Error(`Filtered image ${filteredImageIndex} on slide ${sceneIndex + 1} could not be rendered`);
        }

        await addEditableImage(slide, block, filteredImageData);
      } else if (block.type === "Icon") {
        await addEditableIcon(slide, block, theme.isLight);
      } else if (block.type === "Shape") {
        await addEditableShape(slide, block);
      } else if (block.type === "Table") {
        addEditableTable(slide, block, theme.foreground);
      } else if (block.type === "Chart") {
        const chartImageData = chartImagesBySlide[sceneIndex]?.[chartImageIndex++];
        if (!chartImageData) {
          throw new Error(`Chart ${chartImageIndex} on slide ${sceneIndex + 1} could not be rendered`);
        }
        addPptxChartImage(slide, block, chartImageData);
      } else if (block.type === "VideoBlock") {
        await addPptxVideo(slide, block.props, pptxFrame(blockFrame(block)));
      }
    }
  }
}

export function documentNeedsPptxVisualFallback(document: ParsedMotionDoc) {
  return document.scenes.some((scene) => needsVisualFallback(scene.blocks, scene.props));
}

export function documentNeedsPptxFilteredImages(document: ParsedMotionDoc) {
  return document.scenes.some((scene) => scene.blocks.some(imageNeedsPptxFilterRasterization));
}

export function documentNeedsPptxChartImages(document: ParsedMotionDoc) {
  return document.scenes.some((scene) => scene.blocks.some((block) => block.type === "Chart"));
}

function addEditableText(
  slide: PptxSlide,
  block: Extract<MotionDocBlock, { text: string }>,
  foreground: string,
  muted: string
) {
  const frame = block.type === "heading" ? { x: 8, y: 18, w: 52, h: 10 } : blockFrame(block);
  const props = "props" in block ? block.props : {};
  const isTitle = block.type === "Title";
  const fontSize = numericProp(props.fontSize, isTitle ? 54 : block.type === "heading" ? 20 : 24);
  const background = stringProp(props.background ?? props.backgroundColor ?? props.bg);

  slide.addText(block.text, {
    ...pptxFrame(frame),
    align: textAlign(props.textAlign),
    bold: numericProp(props.fontWeight, isTitle ? 600 : 400) >= 600,
    breakLine: false,
    color: pptxColor(stringProp(props.color ?? props.textColor) ?? (isTitle ? foreground : muted), "FFFFFF"),
    fill: background ? { color: pptxColor(background, "FFFFFF"), transparency: colorTransparency(background) } : undefined,
    fontFace: stringProp(props.fontFamily) ?? "Aptos",
    fontSize: Math.max(fontSize * 0.75, 8),
    margin: background ? 0.1 : 0,
    valign: verticalAlign(props.textVerticalAlign)
  });
}

async function addEditableImage(slide: PptxSlide, block: PropsBlock, renderedData?: string) {
  const src = stringProp(block.props.src);
  if (!src) return;

  const frame = pptxFrame(blockFrame(block));
  const data = renderedData ?? await portablePptxImageData(src, frame);

  slide.addImage({
    data,
    ...frame,
    transparency: 0
  });
}

async function addEditableIcon(slide: PptxSlide, block: PropsBlock, isLightBackground: boolean) {
  const iconName = stringProp(block.props.icon) ?? "Sparkles";
  const svgData = lucideIconSvgDataUri(
    iconName,
    {
      color: isLightBackground ? "#000000" : "#ffffff",
      strokeWidth: numericProp(block.props.strokeWidth, 2)
    }
  );

  if (!svgData) return;

  const frame = pptxFrame(blockFrame(block));
  const data = await portablePptxImageData(svgData, frame);

  slide.addImage({
    altText: `${iconName} icon`,
    data,
    ...frame,
    transparency: 0
  });
}

function addPptxChartImage(slide: PptxSlide, block: PropsBlock, data: string) {
  slide.addImage({
    altText: stringProp(block.props.title) ?? "Chart",
    data,
    ...pptxFrame(blockFrame(block)),
    transparency: 0
  });
}

async function addEditableShape(slide: PptxSlide, block: PropsBlock) {
  const props = block.props;
  const sourceShape = stringProp(props.shape) ?? "rectangle";
  const opacity = clamp(numericProp(props.opacity, 1), 0, 1);
  const frame = pptxFrame(blockFrame(block));

  if (shapeNeedsExactSvgExport(props)) {
    const data = await portablePptxImageData(
      shapeVectorSvgDataUri(props, `pptx-${sourceShape}`),
      frame
    );
    slide.addImage({
      altText: `${sourceShape} vector shape`,
      data,
      ...frame,
      transparency: 0
    });
    return;
  }

  if (sourceShape === "line") {
    slide.addShape("line", {
      ...frame,
      h: 0,
      y: frame.y + frame.h / 2,
      line: shapeLineOptions(props, opacity)
    });
    return;
  }

  const fillSource = stringProp(props.fill) ?? "rgba(142,165,255,0.72)";
  const sourceStroke = stringProp(props.stroke) ?? "#FFFFFF";
  const shapeName = shapeNameForPptx(sourceShape, props);
  const radius = clamp(numericProp(props.radius ?? props.borderRadius, 0), 0, 50);

  slide.addShape(shapeName, {
    ...frame,
    fill: shapeFillOptions(fillSource, opacity, "8EA5FF"),
    line: shapeLineOptions(props, opacity, sourceStroke),
    ...(shapeName === "roundRect" ? { rectRadius: radius / 50 } : {})
  });
}

function addEditableTable(
  slide: PptxSlide,
  block: PropsBlock,
  foreground: string
) {
  const { columns, rows } = tableSizeFromProps(block.props);
  const cells = tableCellsFromProps(block.props, rows, columns);
  const columnTracks = tableColumnTrackValuesFromProps(block.props, columns);
  const frame = blockFrame(block);
  const totalTrack = columnTracks.reduce((sum, value) => sum + value, 0) || columns;
  const fontSize = Math.max(numericProp(block.props.fontSize, 18) * 0.75, 8);
  const textColor = pptxColor(stringProp(block.props.color ?? block.props.textColor) ?? foreground, "111827");
  const fillColor = pptxColor(stringProp(block.props.cellBackground ?? block.props.background) ?? "FFFFFF", "FFFFFF");
  const borderColor = pptxColor(stringProp(block.props.borderColor) ?? "D1D5DB", "D1D5DB");

  slide.addTable(
    cells.map((row) => row.map((text) => ({
      text,
      options: {
        color: textColor,
        fill: { color: fillColor },
        fontFace: stringProp(block.props.fontFamily) ?? "Aptos",
        fontSize
      }
    }))),
    {
      ...pptxFrame(frame),
      border: { color: borderColor, pt: Math.max(numericProp(block.props.borderWidth, 1) * 0.75, 0.5) },
      colW: columnTracks.map((value) => (frame.w / 100 * SLIDE_WIDTH * value) / totalTrack),
      margin: 0.06,
      valign: verticalAlign(block.props.textVerticalAlign)
    }
  );
}

function needsVisualFallback(blocks: readonly MotionDocBlock[], props: Record<string, string | number>) {
  const background = stringProp(props.background);
  return Boolean(
    props.shader ||
    props.backgroundImage ||
    (background && !isSimpleColor(background)) ||
    blocks.some((block) => !isNativePptxBlock(block))
  );
}

function imageNeedsPptxFilterRasterization(block: MotionDocBlock) {
  return block.type === "ImageBlock" && Boolean(
    getPaperImageFilterDefinition(stringProp(block.props.filter))
  );
}

function isNativePptxBlock(block: MotionDocBlock) {
  if (block.type === "Chart") return true;
  return NATIVE_PPTX_BLOCK_TYPES.has(block.type);
}

function shapeNameForPptx(shape: string, props: Record<string, string | number>): PptxShapeName {
  if (shape === "circle") return "ellipse";
  if (shape === "triangle") return "triangle";
  if (shape === "diamond") return "diamond";
  if (shape === "arrow") return "rightArrow";
  if (shape === "chevron") return "chevron";
  if (shape === "corner") return "corner";
  if (shape === "hexagon") return "hexagon";
  if (shape === "parallelogram") return "parallelogram";
  if (shape === "polygon") return POLYGON_SHAPES[clamp(Math.round(numericProp(props.sides, 3)), 3, 12)];
  if (shape === "star") return STAR_SHAPES[clamp(Math.round(numericProp(props.points, 5)), 3, 12)];

  const radius = numericProp(props.radius ?? props.borderRadius, 0);
  return radius > 0 ? "roundRect" : "rect";
}

function shapeFillOptions(
  value: string | undefined,
  opacity: number,
  fallback: string
): PptxShapeFillProps {
  if (isTransparentColor(value)) return { type: "none" };

  return {
    color: pptxColor(value ?? fallback, fallback),
    transparency: combinedTransparency(value, opacity)
  };
}

function shapeLineOptions(
  props: Record<string, string | number>,
  opacity: number,
  colorOverride?: string
): PptxShapeLineProps {
  const stroke = colorOverride ?? stringProp(props.stroke) ?? "#FFFFFF";
  const width = numericProp(props.strokeWidth, 2);

  if (width <= 0 || isTransparentColor(stroke)) return { type: "none" };

  return {
    beginArrowType: lineArrowType(props.arrowStart),
    color: pptxColor(stroke, "FFFFFF"),
    dashType: lineDashType(props.lineStyle),
    endArrowType: lineArrowType(props.arrowEnd),
    transparency: combinedTransparency(stroke, opacity),
    width: Math.max(width * 0.75, 0.25)
  };
}

function lineDashType(value: string | number | undefined): PptxShapeLineProps["dashType"] {
  if (value === "dashed") return "dash";
  if (value === "dotted") return "sysDot";
  return "solid";
}

function lineArrowType(value: string | number | undefined): PptxShapeLineProps["beginArrowType"] {
  if (value === "arrow") return "arrow";
  if (value === "circle") return "oval";
  return "none";
}

function pptxFrame(frame: { h: number; w: number; x: number; y: number }) {
  return {
    x: frame.x / 100 * SLIDE_WIDTH,
    y: frame.y / 100 * SLIDE_HEIGHT,
    w: frame.w / 100 * SLIDE_WIDTH,
    h: frame.h / 100 * SLIDE_HEIGHT
  };
}

function stringProp(value: string | number | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numericProp(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function textAlign(value: string | number | undefined): "center" | "left" | "right" {
  return value === "center" || value === "right" ? value : "left";
}

function verticalAlign(value: string | number | undefined): "bottom" | "middle" | "top" {
  if (value === "bottom") return "bottom";
  if (value === "middle" || value === "center") return "middle";
  return "top";
}

function isSimpleColor(value: string) {
  return /^#?[0-9a-f]{3,8}$/i.test(value.trim()) || /^rgba?\(/i.test(value.trim());
}

function colorTransparency(value: string) {
  return combinedTransparency(value, 1);
}

function combinedTransparency(value: string | undefined, opacity: number) {
  return Math.round((1 - colorAlpha(value) * opacity) * 100);
}

function colorAlpha(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || normalized === "transparent") return 0;

  const rgbaAlpha = normalized.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\s*\)$/i)?.[1];
  if (rgbaAlpha !== undefined) return clamp(Number(rgbaAlpha), 0, 1);

  const hexAlpha = normalized.match(/^#?[0-9a-f]{6}([0-9a-f]{2})$/i)?.[1];
  if (hexAlpha) return parseInt(hexAlpha, 16) / 255;

  return 1;
}

function isTransparentColor(value: string | undefined) {
  return colorAlpha(value) === 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function pptxColor(value: string, fallback: string) {
  const normalized = value.trim();
  const hex = normalized.match(/^#?([0-9a-f]{6})(?:[0-9a-f]{2})?$/i)?.[1];
  if (hex) return hex.toUpperCase();

  const shortHex = normalized.match(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (shortHex) return `${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`.toUpperCase();

  const rgb = normalized.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) return rgb.slice(1, 4).map((channel) => Math.min(Number(channel), 255).toString(16).padStart(2, "0")).join("").toUpperCase();

  return fallback;
}
