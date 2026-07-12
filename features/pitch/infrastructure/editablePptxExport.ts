import type PptxGenJS from "pptxgenjs";
import { resolveSlideThemeColors } from "@/core/motion-doc/application/slideTheme";
import {
  tableCellsFromProps,
  tableColumnTrackValuesFromProps,
  tableSizeFromProps
} from "@/core/motion-doc/application/tableBlock";
import type { MotionDocBlock, ParsedMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import { blockFrame } from "@/features/pitch/application/previewCanvas";

const SLIDE_HEIGHT = 7.5;
const SLIDE_WIDTH = 13.333;

type PptxSlide = ReturnType<PptxGenJS["addSlide"]>;
type PropsBlock = Extract<MotionDocBlock, { props: Record<string, string | number> }>;

export function addEditableSlides(
  pptx: PptxGenJS,
  document: ParsedMotionDoc,
  renderedSlides: readonly string[]
) {
  document.scenes.forEach((scene, sceneIndex) => {
    const slide = pptx.addSlide();
    const theme = resolveSlideThemeColors(scene.props);

    slide.background = { color: pptxColor(theme.background, "0F172A") };

    if (needsVisualFallback(scene.blocks, scene.props)) {
      slide.addImage({
        data: renderedSlides[sceneIndex],
        x: 0,
        y: 0,
        w: SLIDE_WIDTH,
        h: SLIDE_HEIGHT
      });
    }

    scene.blocks.forEach((block) => {
      if (block.type === "Title" || block.type === "Text" || block.type === "heading") {
        addEditableText(slide, block, theme.foreground, theme.muted);
      } else if (block.type === "ImageBlock") {
        addEditableImage(slide, block);
      } else if (block.type === "Table") {
        addEditableTable(slide, block, theme.foreground);
      }
    });
  });
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

function addEditableImage(slide: PptxSlide, block: PropsBlock) {
  const src = stringProp(block.props.src);
  if (!src) return;

  slide.addImage({
    data: src,
    ...pptxFrame(blockFrame(block)),
    transparency: 0
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
    blocks.some((block) => !["Title", "Text", "heading", "ImageBlock", "Table"].includes(block.type)) ||
    blocks.some((block) => block.type === "ImageBlock" && Boolean(block.props.filter ?? block.props.filterPreset))
  );
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
  const alpha = value.match(/^rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\s*\)$/i)?.[1];
  return alpha === undefined ? 0 : Math.round((1 - Math.min(Math.max(Number(alpha), 0), 1)) * 100);
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
