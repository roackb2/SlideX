import { parseMotionDoc, type MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";
import { isSlideXIconName, lucideIconPaths } from "@/core/motion-doc/domain/lucideIconRegistry";
import { materializeFreeformScene } from "@/core/motion-doc/application/motionDocFreeform";
import { shaderVariantForId } from "@/core/motion-doc/application/shaders/premiumShaderBodies";
import { resolveSlideThemeColors } from "@/core/motion-doc/application/slideTheme";
import { motionDocExportRuntime } from "@/core/motion-doc/infrastructure/export/motionDocExportRuntime";
import { motionDocExportStyles } from "@/core/motion-doc/infrastructure/export/motionDocExportStyles";

const FRAME_WIDTH = 1024;
const FRAME_HEIGHT = 576;

export function buildMotionDocHtml(source: string) {
  const document = parseMotionDoc(source);
  const slidesHtml = document.scenes
    .map((scene) => renderSceneHtml(materializeFreeformScene(scene)))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(document.title)}</title>
    <style>${motionDocExportStyles}</style>
  </head>
  <body>
    <main class="player" data-slide-count="${document.scenes.length}">
      <div class="stage">
        <div class="viewport" aria-live="polite">
          <div class="frame">
            ${slidesHtml}
          </div>
        </div>
      </div>
      <nav class="controls" aria-label="Slide controls">
        <div class="button-group">
          <button class="control-button" data-action="prev" type="button" aria-label="Previous slide">←</button>
          <button class="control-button" data-action="next" type="button" aria-label="Next slide">→</button>
          <button class="control-button" data-action="replay" type="button" aria-label="Replay slide">↻</button>
          <button class="control-button" data-action="play" type="button" aria-label="Play slides">▶</button>
          <button class="control-button" data-action="fullscreen" type="button" aria-label="Toggle fullscreen">⛶</button>
        </div>
        <div class="progress" aria-hidden="true"><span></span></div>
        <div class="counter"><span data-current>1</span> / <span data-total>${document.scenes.length}</span></div>
      </nav>
    </main>
    <script>${motionDocExportRuntime}</script>
  </body>
</html>`;
}

function renderSceneHtml(
  scene: ReturnType<typeof materializeFreeformScene>
) {
  const { blocks, duration, props } = scene;
  const theme = typeof props.theme === "string" ? props.theme : "dark";
  const declaredLight = theme === "light" || theme === "paper";
  const themeColors = resolveSlideThemeColors(props, {
    accentFallback: declaredLight ? "#111111" : "#ffffff",
    backgroundFallback: declaredLight ? "#ffffff" : "#050505",
    themeFallback: theme
  });
  const shader = stringProp(props.shader);
  const shaderHtml = shader ? `<canvas class="shader-bg" data-shader="${escapeAttribute(shader)}" data-shader-engine="${escapeAttribute(themeColors.shaderEngine)}" data-shader-variant="${shaderVariantForId(shader)}" data-shader-color1="${escapeAttribute(themeColors.shaderColor1)}" data-shader-color2="${escapeAttribute(themeColors.shaderColor2)}" data-shader-color3="${escapeAttribute(themeColors.shaderColor3)}" data-shader-intensity="${numberProp(props.shaderIntensity, 0.5)}" data-shader-speed="${numberProp(props.shaderSpeed, 1)}" data-shader-softness="${numberProp(props.shaderSoftness, 0.5)}" data-shader-scale="${numberProp(props.shaderScale, 0.5)}" data-shader-detail="${numberProp(props.shaderDetail, 0.5)}"></canvas>` : '';

  return `<section class="slide" data-duration="${Math.max(duration, 1)}" data-has-shader="${shader ? "true" : "false"}" data-theme-tone="${themeColors.tone}" style="${escapeAttribute(inlineCss({
    "--slide-accent": themeColors.accent,
    "--slide-bg": themeColors.background,
    "--slide-border": themeColors.borderColor,
    "--slide-card": themeColors.cardBackground,
    "--slide-fg": themeColors.foreground,
    "--slide-muted": themeColors.muted,
    "--slide-overlay-opacity": shader ? "0.3" : "0.72"
  }))}">
    ${shaderHtml}
    ${blocks.map((block) => renderBlock(block)).join("")}
  </section>`;
}

function renderBlock(block: MotionDocBlock) {
  if (block.type === "Title") {
    return renderMotionBlock(block, `<h1 class="block-title">${escapeHtml(block.text)}</h1>`);
  }

  if (block.type === "Text" || block.type === "heading") {
    return renderMotionBlock(block, `<p class="block-text">${escapeHtml(block.text)}</p>`);
  }

  if (block.type === "Card") {
    const icon = String(block.props.icon ?? "");
    const cardLayoutClass = block.props.layout === "horizontal" ? " block-card--horizontal" : "";
    const cardWidthClass = cardWidthClassName(block.props.width);

    return renderMotionBlock(
      block,
      `<article class="block-card${cardLayoutClass}${cardWidthClass}">${
        icon ? `<div class="block-card__icon">${renderLucideIcon(icon)}</div>` : ""
      }<div class="block-card__content"><h3>${escapeHtml(String(block.props.title ?? "Card"))}</h3><p>${escapeHtml(String(block.props.text ?? ""))}</p></div></article>`
    );
  }

  if (block.type === "ImageBlock") {
    const fit = fitProp(block.props.fit);

    return renderMotionBlock(
      block,
      `<figure class="block-image"><img src="${escapeAttribute(String(block.props.src ?? ""))}" alt="${escapeAttribute(String(block.props.alt ?? ""))}" style="${escapeAttribute(inlineCss({ "object-fit": fit }))}" /></figure>`
    );
  }

  if (block.type === "Metric") {
    const metricWidthClass = metricWidthClassName(block.props.width);

    return renderMotionBlock(
      block,
      `<article class="block-metric${metricWidthClass}"><p class="block-metric__label">${escapeHtml(String(block.props.label ?? "Metric"))}</p><p class="block-metric__value">${escapeHtml(String(block.props.value ?? "0"))}</p><p class="block-metric__caption">${escapeHtml(String(block.props.caption ?? ""))}</p></article>`
    );
  }

  if (block.type === "Chart") {
    const values = chartValues(String(block.props.values ?? ""));
    const labels = String(block.props.labels ?? "").split(",").map((label) => label.trim()).filter(Boolean);
    const maxValue = Math.max(...values, 1);
    const chartWidthClass = chartWidthClassName(block.props.width);
    const chartHeight = chartHeightProp(block.props.height);
    const bars = values
      .map((value, index) => `<div class="block-chart__bar-wrap"><div class="block-chart__track"><div class="block-chart__bar" style="${escapeAttribute(inlineCss({ height: `${Math.max((value / maxValue) * 100, 4)}%` }))}"></div></div><span class="block-chart__label">${escapeHtml(labels[index] ?? `D${index + 1}`)}</span></div>`)
      .join("");

    return renderMotionBlock(
      block,
      `<article class="block-chart${chartWidthClass}" style="${escapeAttribute(inlineCss({ "--chart-height": `${chartHeight}px` }))}"><h3>${escapeHtml(String(block.props.title ?? "Chart"))}</h3><div class="block-chart__bars">${bars}</div></article>`
    );
  }

  return "";
}

function renderMotionBlock(block: MotionDocBlock, content: string) {
  const props = "props" in block ? block.props : {};
  const enter = animationClass(props.enter);
  const delay = numberProp(props.delay, 0);
  const duration = numberProp(props.duration, 0.6);
  const fullClass = props.full === "true" || props.full === 1 ? " motion-block--full" : "";
  const positionClass = isPositionedProps(props) ? " motion-block--positioned" : "";

  return `<div class="motion-block ${enter}${fullClass}${positionClass}" style="${escapeAttribute(inlineCss({
    "--motion-delay": `${delay}s`,
    "--motion-duration": `${duration}s`,
    ...fontSizeVars(props),
    ...textStyleVars(props),
    ...positionVars(props),
    ...radiusVars(props),
    ...colorVars(props),
    ...textAlignVars(props)
  }))}">${content}</div>`;
}

function animationClass(value: string | number | undefined) {
  if (value === "fadeIn") return "enter-fade-in";
  if (value === "zoomIn") return "enter-zoom-in";
  if (value === "slideLeft") return "enter-slide-left";

  return "enter-fade-up";
}

function numberProp(value: string | number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isPositionedProps(props: Record<string, string | number>) {
  return Number.isFinite(Number(props.x)) || Number.isFinite(Number(props.y));
}

function positionVars(props: Record<string, string | number>): Record<string, string> {
  if (!isPositionedProps(props)) {
    return {};
  }

  return {
    "--motion-h": `${framePx(props.h, FRAME_HEIGHT, 18)}px`,
    "--motion-x": `${framePx(props.x, FRAME_WIDTH, 8)}px`,
    "--motion-y": `${framePx(props.y, FRAME_HEIGHT, 12)}px`,
    "--motion-w": `${framePx(props.w, FRAME_WIDTH, 42)}px`
  };
}

function fontSizeVars(props: Record<string, string | number>): Record<string, string> {
  const fontSize = numberProp(props.fontSize, 0);

  if (fontSize <= 0) {
    return {};
  }

  return {
    "--motion-font-size": `${fontSize}px`
  };
}

function textStyleVars(props: Record<string, string | number>): Record<string, string> {
  const fontWeight = props.fontWeight;
  const lineHeight = props.lineHeight;

  return {
    ...(fontWeight === undefined || fontWeight === "" ? {} : { "--motion-font-weight": String(fontWeight) }),
    ...(lineHeight === undefined || lineHeight === "" ? {} : { "--motion-line-height": String(lineHeight) })
  };
}

function radiusVars(props: Record<string, string | number>): Record<string, string> {
  const value = props.radius ?? props.borderRadius;

  if (value === undefined || value === "") {
    return {};
  }

  const parsed = typeof value === "number" ? value : Number(value);

  if (Number.isFinite(parsed)) {
    return { "--motion-radius": `${Math.max(parsed, 0)}px` };
  }

  return { "--motion-radius": String(value) };
}

function colorVars(props: Record<string, string | number>): Record<string, string> {
  const background = stringProp(props.background ?? props.backgroundColor ?? props.bg);
  const color = stringProp(props.color ?? props.textColor);
  const mutedColor = stringProp(props.mutedColor);

  return {
    ...(background ? { "--motion-bg": background } : {}),
    ...(background ? { "--motion-text-padding": "0.12em 0.18em" } : {}),
    ...(color ? { "--motion-fg": color } : {}),
    ...(mutedColor || color ? { "--motion-muted": mutedColor ?? color } : {})
  };
}

function textAlignVars(props: Record<string, string | number>): Record<string, string> {
  if (props.textAlign === "center" || props.textAlign === "right") {
    return { "--motion-text-align": props.textAlign };
  }

  if (props.textAlign === "left") {
    return { "--motion-text-align": "left" };
  }

  return {};
}

function stringProp(value: string | number | undefined) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue || undefined;
}

function framePx(value: string | number | undefined, dimension: number, fallbackPercent: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return roundPx((fallbackPercent / 100) * dimension);
  }

  return roundPx((Math.min(Math.max(parsed, 0), 100) / 100) * dimension);
}

function roundPx(value: number) {
  return Math.round(value * 100) / 100;
}

function chartValues(value: string) {
  const values = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item >= 0);

  return values.length > 0 ? values : [24, 42, 68, 54];
}

function cardWidthClassName(value: string | number | undefined) {
  if (value === "sm") return " block-card--sm";
  if (value === "lg") return " block-card--lg";
  if (value === "full") return " block-card--full";

  return "";
}

function metricWidthClassName(value: string | number | undefined) {
  if (value === "md") return " block-metric--md";
  if (value === "lg") return " block-metric--lg";
  if (value === "full") return " block-metric--full";

  return "";
}

function chartWidthClassName(value: string | number | undefined) {
  if (value === "sm") return " block-chart--sm";
  if (value === "md") return " block-chart--md";
  if (value === "full") return " block-chart--full";

  return "";
}

function chartHeightProp(value: string | number | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return 156;
  }

  return Math.min(Math.max(parsed, 80), 320);
}

function fitProp(value: string | number | undefined) {
  if (value === "cover" || value === "contain" || value === "fill" || value === "scale-down") {
    return value;
  }

  return "cover";
}

function renderLucideIcon(name: string) {
  if (!isSlideXIconName(name)) {
    return "";
  }

  const children = lucideIconPaths[name]
    .map((path) => {
      const [shape, ...parts] = path.split(" ");

      if (shape === "circle") {
        return `<circle cx="${parts[0]}" cy="${parts[1]}" r="${parts[2]}" />`;
      }

      if (shape === "ellipse") {
        return `<ellipse cx="${parts[0]}" cy="${parts[1]}" rx="${parts[2]}" ry="${parts[3]}" />`;
      }

      if (shape === "rect") {
        return `<rect x="${parts[0]}" y="${parts[1]}" width="${parts[2]}" height="${parts[3]}" rx="${parts[4]}" ry="${parts[5]}" />`;
      }

      return `<path d="${escapeAttribute(shape === "path" ? parts.join(" ") : path)}" />`;
    })
    .join("");

  return `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">${children}</svg>`;
}

function inlineCss(styles: Record<string, string>) {
  return Object.entries(styles)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}

export function slugifyFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "slidex-deck";
}
