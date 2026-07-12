import { parseMotionDoc, type MotionDocBlock, type MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import { isSlideXIconName, lucideIconPaths } from "@/core/motion-doc/domain/lucideIconRegistry";
import { getPaperImageFilterDefinition } from "@/core/motion-doc/application/shaders/paperImageFilterCatalog";
import { resolveSlideThemeColors } from "@/core/motion-doc/application/slideTheme";
import { MOTION_DOC_CANVAS_HEIGHT, MOTION_DOC_CANVAS_WIDTH } from "@/core/motion-doc/domain/viewport";
import {
  parseColOverrides,
  parseRowOverrides,
  tableCellsFromProps,
  tableColumnTrackValuesFromProps,
  tableRowTrackValuesFromProps,
  tableSizeFromProps,
  tableTrackTemplate
} from "@/core/motion-doc/application/tableBlock";
import { makeMotionDocExportRuntime } from "@/core/motion-doc/infrastructure/export/motionDocExportRuntime";
import { normalizeChartType, type ChartType } from "@/core/motion-doc/domain/chartCatalog";
import { chartAxisBounds, chartAxisMaximum, chartAxisTicks, normalizeChartAxisStep } from "@/core/motion-doc/domain/chartAxis";
import { formatChartValue, formatSignedChartValue, normalizeChartValueFormat, type ChartValueFormat } from "@/core/motion-doc/domain/chartValue";
import { motionDocExportStyles } from "@/core/motion-doc/infrastructure/export/motionDocExportStyles";
import { resolveContrastingTextColor } from "@/common/util/colorContrast";

export const MOTION_DOC_PNG_HEIGHT = MOTION_DOC_CANVAS_HEIGHT;
export const MOTION_DOC_PNG_WIDTH = MOTION_DOC_CANVAS_WIDTH;

type RenderSceneHtmlOptions = {
  active?: boolean;
  rasterMode?: boolean;
};

export function buildMotionDocHtml(source: string, customTitle?: string) {
  const document = parseMotionDoc(source);
  const displayTitle = customTitle || document.title;
  const slidesHtml = document.scenes
    .map((scene) => renderSceneHtml(scene))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(displayTitle)}</title>
    <style>${motionDocExportStyles}</style>
  </head>
  <body>
    <script id="slidex-motion-doc-source" type="application/json">${serializeMotionDocSource(source)}</script>
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
          <button class="control-button" data-action="prev" type="button" aria-label="Previous slide" title="Previous"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>
          <button class="control-button" data-action="next" type="button" aria-label="Next slide" title="Next"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
          <button class="control-button" data-action="replay" type="button" aria-label="Replay slide" title="Replay"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
          <button class="control-button" data-action="play" type="button" aria-label="Play slides" title="Play"><svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg></button>
        </div>
        <div class="counter" aria-hidden="true"><span data-current>1</span> / <span data-total>${document.scenes.length}</span></div>
        <div class="progress" aria-hidden="true"><span></span></div>
        <div class="button-group">
          <button class="control-button" data-action="fullscreen" type="button" aria-label="Toggle fullscreen" title="Fullscreen"><svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg></button>
        </div>
      </nav>
    </main>
    <script>${makeMotionDocExportRuntime()}</script>
  </body>
</html>`;
}

function serializeMotionDocSource(source: string) {
  return JSON.stringify(source).replaceAll("<", "\\u003c");
}

/**
 * Build a lightweight HTML document optimized for PDF printing.
 * Strips the shader runtime, disables GPU-heavy effects, and renders all slides
 * statically without any JavaScript animation loops.
 */
export function buildMotionDocPdfHtml(source: string, customTitle?: string) {
  const document = parseMotionDoc(source);
  const displayTitle = customTitle || document.title;
  const slidesHtml = document.scenes
    .map((scene) => renderSceneHtml(scene))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(displayTitle)}</title>
    <style>${motionDocExportStyles}</style>
    <style>
      /* PDF-specific overrides: strip GPU-heavy effects */
      * { animation: none !important; transition: none !important; }
      .shader-bg { display: none !important; }
      .slide::before { display: none !important; }
      .controls { display: none !important; }
      .player { display: block; height: auto; padding: 0; }
      .stage { display: block; height: auto; }
      .viewport { width: 100%; max-width: none; height: auto; aspect-ratio: auto; border-radius: 0; background: transparent; box-shadow: none; overflow: visible; }
      .frame { position: relative; width: 100%; height: auto; transform: none; overflow: visible; }
      .slide {
        position: relative; display: block !important;
        width: 1024px; height: 576px;
        page-break-after: always; page-break-inside: avoid;
        overflow: hidden;
      }
      .motion-block {
        opacity: 1 !important;
        transform: translate3d(0,0,0) scale(1) !important;
        filter: none !important;
        clip-path: none !important;
      }
      .block-card, .block-metric, .block-chart, .block-image, .block-icon, .block-stack, .block-table {
        backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        box-shadow: none !important;
        filter: none !important;
      }
      @page { size: 1024px 576px; margin: 0; }
      html, body {
        width: 1024px; margin: 0; padding: 0;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
        overflow: visible;
      }
    </style>
  </head>
  <body>
    <main class="player" data-slide-count="${document.scenes.length}">
      <div class="stage">
        <div class="viewport">
          <div class="frame">
            ${slidesHtml}
          </div>
        </div>
      </div>
    </main>
  </body>
</html>`;
}



export function buildMotionDocRasterHtml(source: string, customTitle?: string) {
  const document = parseMotionDoc(source);
  const displayTitle = customTitle || document.title;
  const slidesHtml = document.scenes
    .map((scene) => renderSceneHtml(scene, { active: true }))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=1024, initial-scale=1" />
    <title>${escapeHtml(displayTitle)}</title>
    <style>${motionDocExportStyles}</style>
    <style>
      html, body {
        background: #000000;
        height: ${MOTION_DOC_PNG_HEIGHT}px;
        margin: 0;
        overflow: hidden;
        padding: 0;
        width: ${MOTION_DOC_PNG_WIDTH}px;
      }
      * {
        animation: none !important;
        transition: none !important;
      }
      .player,
      .stage,
      .viewport,
      .frame {
        border-radius: 0 !important;
        box-shadow: none !important;
        height: ${MOTION_DOC_PNG_HEIGHT}px !important;
        margin: 0 !important;
        max-width: none !important;
        overflow: hidden !important;
        padding: 0 !important;
        width: ${MOTION_DOC_PNG_WIDTH}px !important;
      }
      .player,
      .stage {
        display: block !important;
      }
      .viewport,
      .frame {
        position: relative !important;
      }
      .slide {
        display: block !important;
        height: ${MOTION_DOC_PNG_HEIGHT}px !important;
        inset: 0 !important;
        opacity: 1 !important;
        position: absolute !important;
        transform: none !important;
        width: ${MOTION_DOC_PNG_WIDTH}px !important;
      }
      .motion-block {
        clip-path: none !important;
        filter: none !important;
        opacity: 1 !important;
        transform: translate3d(0, 0, 0) scale(1) !important;
      }
      .shader-still-image {
        display: block !important;
      }
    </style>
  </head>
  <body>
    <main class="player" data-export-mode="raster" data-slide-count="${document.scenes.length}">
      <div class="stage">
        <div class="viewport">
          <div class="frame">
            ${slidesHtml}
          </div>
        </div>
      </div>
    </main>
    <script>${makeMotionDocExportRuntime()}</script>
  </body>
</html>`;
}

export function buildMotionDocPngSvg(source: string, slideIndex = 0, customTitle?: string) {
  const document = parseMotionDoc(source);
  const displayTitle = customTitle || document.title;
  const safeSlideIndex = Math.min(Math.max(Math.floor(slideIndex), 0), Math.max(document.scenes.length - 1, 0));
  const scene = document.scenes[safeSlideIndex];
  const slideHtml = scene
    ? renderSceneHtml(scene, { active: true, rasterMode: true })
    : `<section class="slide is-active" style="background:#ffffff;color:#111827;"></section>`;

  return buildMotionDocPngSvgFromSlideHtml(slideHtml, displayTitle);
}

export function buildMotionDocPngSvgFromSlideHtml(slideHtml: string, customTitle?: string) {
  const displayTitle = customTitle || "SlideX PNG";
  const pngCss = `${motionDocExportStyles}
    .png-export-root {
      background: #000000;
      color: #ffffff;
      height: ${MOTION_DOC_PNG_HEIGHT}px;
      margin: 0;
      overflow: hidden;
      width: ${MOTION_DOC_PNG_WIDTH}px;
    }
    .png-export-root *,
    .png-export-root *::before,
    .png-export-root *::after {
      animation: none !important;
      transition: none !important;
    }
    .png-export-root .player,
    .png-export-root .stage,
    .png-export-root .viewport,
    .png-export-root .frame {
      border-radius: 0 !important;
      box-shadow: none !important;
      height: ${MOTION_DOC_PNG_HEIGHT}px !important;
      margin: 0 !important;
      max-width: none !important;
      overflow: hidden !important;
      padding: 0 !important;
      width: ${MOTION_DOC_PNG_WIDTH}px !important;
    }
    .png-export-root .player,
    .png-export-root .stage {
      display: block !important;
    }
    .png-export-root .viewport,
    .png-export-root .frame {
      position: relative !important;
    }
    .png-export-root .slide {
      display: block !important;
      height: ${MOTION_DOC_PNG_HEIGHT}px !important;
      inset: 0 !important;
      opacity: 1 !important;
      position: absolute !important;
      transform: none !important;
      width: ${MOTION_DOC_PNG_WIDTH}px !important;
    }
    .png-export-root .motion-block {
      clip-path: none !important;
      filter: none !important;
      opacity: 1 !important;
      transform: translate3d(0, 0, 0) scale(1) !important;
    }
    .png-export-root .shader-bg:not(.shader-still-image),
    .png-export-root .image-filter-canvas:not(.shader-still-image) {
      display: none !important;
    }
    .png-export-root .shader-still-image {
      display: block !important;
    }
    .png-export-root .controls {
      display: none !important;
    }`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${MOTION_DOC_PNG_WIDTH}" height="${MOTION_DOC_PNG_HEIGHT}" viewBox="0 0 ${MOTION_DOC_PNG_WIDTH} ${MOTION_DOC_PNG_HEIGHT}">
  <title>${escapeHtml(displayTitle)}</title>
  <foreignObject width="${MOTION_DOC_PNG_WIDTH}" height="${MOTION_DOC_PNG_HEIGHT}" x="0" y="0">
    <div xmlns="http://www.w3.org/1999/xhtml" class="png-export-root">
      <style><![CDATA[${escapeCdata(pngCss)}]]></style>
      <main class="player" data-slide-count="1">
        <div class="stage">
          <div class="viewport">
            <div class="frame">
              ${slideHtml}
            </div>
          </div>
        </div>
      </main>
    </div>
  </foreignObject>
</svg>`;
}

function renderSceneHtml(scene: MotionDocScene, options: RenderSceneHtmlOptions = {}) {
  const { blocks, duration, props } = scene;
  const theme = typeof props.theme === "string" ? props.theme : "dark";
  const declaredLight = theme === "light" || theme === "paper";
  const themeColors = resolveSlideThemeColors(props, {
    accentFallback: declaredLight ? "#111111" : "#ffffff",
    backgroundFallback: declaredLight ? "#ffffff" : "#000000",
    themeFallback: theme
  });
  const shader = stringProp(props.shader);
  const shaderPreset = stringProp(props.shaderPreset) ?? "Default";
  const shaderHtml = shader ? `<canvas class="shader-bg" data-shader="${escapeAttribute(shader)}" data-shader-engine="${escapeAttribute(themeColors.shaderEngine)}" data-shader-preset="${escapeAttribute(shaderPreset)}" data-shader-variant="0" data-shader-color1="${escapeAttribute(themeColors.shaderColor1)}" data-shader-color2="${escapeAttribute(themeColors.shaderColor2)}" data-shader-color3="${escapeAttribute(themeColors.shaderColor3)}" data-shader-color4="${escapeAttribute(themeColors.shaderColor4)}" data-shader-color5="${escapeAttribute(themeColors.shaderColor5)}" data-shader-color6="${escapeAttribute(themeColors.shaderColor6)}" data-shader-angle="${numberProp(props.shaderAngle, 0)}" data-shader-intensity="${numberProp(props.shaderIntensity, 0.5)}" data-shader-speed="${numberProp(props.shaderSpeed, 1)}" data-shader-softness="${numberProp(props.shaderSoftness, 0.5)}" data-shader-scale="${numberProp(props.shaderScale, 0.5)}" data-shader-detail="${numberProp(props.shaderDetail, 0.5)}"></canvas>` : '';
  const backgroundImage = stringProp(props.backgroundImage);
  const backgroundImageHtml = backgroundImage
    ? `<div class="slide-bg-image" style="${escapeAttribute(inlineCss({
        "background-image": cssImageUrl(backgroundImage),
        "background-size": backgroundSizeFromFit(stringProp(props.backgroundFit))
      }))}"></div>`
    : "";
  const slideTransition = slideTransitionClass(props.slideTransition);
  const transitionDuration = numberProp(props.transitionDuration, 0.72);
  const hasPositionedBlocks = blocks.some((block) => "props" in block && isPositionedProps(block.props));
  const layout = slideLayoutProp(props.layout);
  const imageBlocks = blocks.filter((block) => block.type === "ImageBlock");
  const contentBlocks = blocks.filter((block) => block.type !== "ImageBlock");
  const shouldSplit = !hasPositionedBlocks && layout !== "default" && imageBlocks.length > 0;
  const contentHtml = shouldSplit
    ? renderSplitSceneContent(contentBlocks, imageBlocks, layout, options)
    : blocks.map((block, index) => renderBlock(block, index, options)).join("");
  const contentClass = [
    "slide-content",
    hasPositionedBlocks ? "slide-content--freeform" : "",
    shouldSplit ? "slide-content--split" : ""
  ].filter(Boolean).join(" ");

  return `<section class="slide ${slideTransition}${options.active ? " is-active" : ""}" data-duration="${Math.max(duration, 1)}" data-has-shader="${shader ? "true" : "false"}" data-theme-tone="${themeColors.tone}" style="${escapeAttribute(inlineCss({
    "--slide-align-x": alignXCss(props.alignX),
    "--slide-align-y": alignYCss(props.alignY),
    "--slide-accent": themeColors.accent,
    "--slide-bg": themeColors.background,
    "--slide-border": themeColors.borderColor,
    "--slide-card": themeColors.cardBackground,
    "--slide-fg": themeColors.foreground,
    "--slide-muted": themeColors.muted,
    "--slide-overlay-opacity": shader ? "0.3" : "0",
    "--slide-padding": hasPositionedBlocks ? "0" : "clamp(16px, 3%, 32px)",
    "--slide-text-align": textAlignCss(props.textAlign),
    "--slide-transition-duration": `${transitionDuration}s`
  }))}">
    ${backgroundImageHtml}
    ${shaderHtml}
    <div class="${contentClass}" data-layout="${escapeAttribute(layout)}" data-freeform="${hasPositionedBlocks ? "true" : "false"}">
      ${contentHtml}
    </div>
  </section>`;
}

function renderSplitSceneContent(
  contentBlocks: MotionDocBlock[],
  imageBlocks: MotionDocBlock[],
  layout: "split-left" | "split-right",
  options: RenderSceneHtmlOptions
) {
  const textOrder = layout === "split-left" ? 1 : 2;
  const imageOrder = layout === "split-left" ? 2 : 1;
  const contentHtml = contentBlocks.length > 0
    ? contentBlocks.map((block, index) => renderBlock(block, index, options)).join("")
    : `<div class="motion-block enter-none"><p class="block-text">Add a text layer for this side.</p></div>`;
  const imageHtml = imageBlocks.map((block, index) => renderBlock(block, contentBlocks.length + index, options)).join("");

  return `<div class="slide-split-pane slide-split-pane--content" style="order:${textOrder}">${contentHtml}</div><div class="slide-split-pane slide-split-pane--media" style="order:${imageOrder}">${imageHtml}</div>`;
}

function renderBlock(block: MotionDocBlock, blockIndex: number, options: RenderSceneHtmlOptions = {}) {
  if (block.type === "Title") {
    return renderMotionBlock(block, `<h1 class="block-title">${renderTextLines(String(block.text ?? ""), block.props?.listType)}</h1>`);
  }

  if (block.type === "Text" || block.type === "heading") {
    const listType = "props" in block ? block.props?.listType : undefined;
    return renderMotionBlock(block, `<p class="block-text">${renderTextLines(String(block.text ?? ""), listType)}</p>`);
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
    const imageScaleX = clampExportImageScale(optionalNumberProp(block.props.scaleX));
    const imageScaleY = clampExportImageScale(optionalNumberProp(block.props.scaleY));
    const imageScaleStyle = {
      "object-fit": fit,
      "transform": `scale(${imageScaleX}, ${imageScaleY})`,
      "transform-origin": "center"
    };
    const filterDefinition = getPaperImageFilterDefinition(stringProp(block.props.filter));

    if (filterDefinition && !options.rasterMode) {
      const fPreset = stringProp(block.props.filterPreset) || filterDefinition.defaultPreset;
      const fDistortion = optionalNumberProp(block.props.filterDistortion);
      const fSize = optionalNumberProp(block.props.filterSize);
      const fAngle = optionalNumberProp(block.props.filterAngle);
      const fContrast = optionalNumberProp(block.props.filterContrast);
      const fSpeed = optionalNumberProp(block.props.filterSpeed);
      const fDetail = optionalNumberProp(block.props.filterDetail);

      const fPresetAttr = fPreset ? ` data-filter-preset="${escapeAttribute(fPreset)}"` : "";
      const fDistortionAttr = fDistortion !== undefined ? ` data-filter-distortion="${fDistortion}"` : "";
      const fSizeAttr = fSize !== undefined ? ` data-filter-size="${fSize}"` : "";
      const fAngleAttr = fAngle !== undefined ? ` data-filter-angle="${fAngle}"` : "";
      const fContrastAttr = fContrast !== undefined ? ` data-filter-contrast="${fContrast}"` : "";
      const fSpeedAttr = fSpeed !== undefined ? ` data-filter-speed="${fSpeed}"` : "";
      const fDetailAttr = fDetail !== undefined ? ` data-filter-detail="${fDetail}"` : "";
      const fFitAttr = ` data-filter-fit="${escapeAttribute(shaderFitProp(fit))}"`;

      return renderMotionBlock(
        block,
        `<figure class="block-image"><img src="${escapeAttribute(String(block.props.src ?? ""))}" alt="${escapeAttribute(String(block.props.alt ?? ""))}" style="${escapeAttribute(inlineCss(imageScaleStyle))}" /><canvas class="image-filter-canvas" data-shader="${escapeAttribute(filterDefinition.id)}"${fPresetAttr}${fFitAttr}${fDistortionAttr}${fSizeAttr}${fAngleAttr}${fContrastAttr}${fSpeedAttr}${fDetailAttr} style="${escapeAttribute(inlineCss({ "object-fit": fit, "position": "absolute", "inset": "0", "width": "100%", "height": "100%", "transform": `scale(${imageScaleX}, ${imageScaleY})`, "transform-origin": "center" }))}" data-shader-image="${escapeAttribute(String(block.props.src ?? ""))}"></canvas></figure>`
      );
    }

    return renderMotionBlock(
      block,
      `<figure class="block-image"><img src="${escapeAttribute(String(block.props.src ?? ""))}" alt="${escapeAttribute(String(block.props.alt ?? ""))}" style="${escapeAttribute(inlineCss(imageScaleStyle))}" /></figure>`
    );
  }

  if (block.type === "VideoBlock") {
    const fit = fitProp(block.props.fit);
    const poster = stringProp(block.props.poster);

    if (options.rasterMode) {
      return renderMotionBlock(
        block,
        `<figure class="block-image block-video">${poster ? `<img src="${escapeAttribute(poster)}" alt="" style="${escapeAttribute(inlineCss({ "object-fit": fit }))}" />` : ""}</figure>`
      );
    }

    const controls = boolProp(block.props.controls, true) ? " controls" : "";
    const loop = boolProp(block.props.loop, true) ? " loop" : "";
    const muted = boolProp(block.props.muted, true) ? " muted autoplay playsinline" : "";
    const posterAttr = poster ? ` poster="${escapeAttribute(poster)}"` : "";

    return renderMotionBlock(
      block,
      `<figure class="block-image block-video"><video src="${escapeAttribute(String(block.props.src ?? ""))}"${posterAttr}${controls}${loop}${muted} style="${escapeAttribute(inlineCss({ "object-fit": fit }))}"></video></figure>`
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
    const chartType = chartTypeProp(block.props.chartType ?? block.props.type);
    const values = chartValues(String(block.props.values ?? ""), chartType === "waterfall");
    const labels = String(block.props.labels ?? "").split(",").map((label) => label.trim()).filter(Boolean);
    const colors = String(block.props.colors ?? "").split(",").map((color) => color.trim()).filter(Boolean);
    const sizes = String(block.props.sizes ?? "").split(",").map(Number).filter(Number.isFinite);
    const xValues = String(block.props.xValues ?? "").split(",").map(Number).filter(Number.isFinite);
    const xAxisStep = normalizeChartAxisStep(block.props.xAxisStep);
    const yAxisStep = normalizeChartAxisStep(block.props.yAxisStep);
    const valueFormat = normalizeChartValueFormat(block.props.valueFormat);
    const maxValue = Math.max(...values.map(Math.abs), 1);
    const chartWidthClass = chartWidthClassName(block.props.width);
    const chartHeight = chartHeightProp(block.props.height);
    const chartColor = stringProp(block.props.chartColor) ?? colors[0] ?? "#3b82f6";
    const chartFontSize = Math.min(Math.max(numberProp(block.props.fontSize, 18), 10), 32);
    const chartTextColor = resolveContrastingTextColor(
      stringProp(block.props.background ?? block.props.backgroundColor ?? block.props.bg),
      stringProp(block.props.color ?? block.props.textColor)
    );
    const chartBody = renderChartBody({
      chartHeight,
      chartType,
      colors,
      labels,
      maxValue,
      sizes,
      strokeWidth: Math.min(Math.max(numberProp(block.props.strokeWidth, 16), 2), 32),
      valueFormat,
      values,
      xAxisStep,
      xValues,
      yAxisStep
    });

    return renderMotionBlock(
      block,
      `<article class="block-chart${chartWidthClass}" style="${escapeAttribute(inlineCss({ "--chart-color": chartColor, "--chart-font-size": `${chartFontSize}px`, "--chart-height": `${chartHeight}px`, "--chart-weight": String(Math.min(Math.max(numberProp(block.props.strokeWidth, 16), 2), 32)), ...(chartTextColor ? { "--motion-fg": chartTextColor, "--motion-muted": chartTextColor } : {}) }))}"><h3>${escapeHtml(String(block.props.title ?? "Chart"))}</h3>${chartBody}</article>`
    );
  }

  if (block.type === "Icon") {
    const strokeWidth = numberProp(block.props.strokeWidth, 2);
    return renderMotionBlock(
      block,
      `<div class="block-icon">${renderLucideIcon(String(block.props.icon ?? "Sparkles"), strokeWidth)}</div>`
    );
  }

  if (block.type === "Shape") {
    const shapeText = String(block.props.text ?? "");
    const textLayer = shapeText
      ? `<span class="block-shape__text" style="${escapeAttribute(inlineCss({ color: stringProp(block.props.textColor ?? block.props.color) ?? "#ffffff", fontSize: `${numberProp(block.props.fontSize, 18)}px`, fontWeight: String(numberProp(block.props.fontWeight, 650)) }))}">${escapeHtml(shapeText)}</span>`
      : "";
    return renderMotionBlock(
      block,
      `<div class="block-shape">${renderShapeSvg(block.props, blockIndex)}${textLayer}</div>`
    );
  }

  if (block.type === "Stack") {
    const items = String(block.props.items ?? "Panel A|Panel B|Panel C")
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
    const direction = block.props.layout === "column" ? "column" : "row";
    const align = block.props.align === "center" ? "center" : block.props.align === "end" ? "flex-end" : "stretch";
    const stackItems = (items.length > 0 ? items : ["Item 1", "Item 2"])
      .map((item) => `<div class="block-stack__item">${escapeHtml(item)}</div>`)
      .join("");

    return renderMotionBlock(
      block,
      `<div class="block-stack" style="${escapeAttribute(inlineCss({
        "--stack-align": align,
        "--stack-direction": direction,
        "--stack-gap": `${numberProp(block.props.gap, 16)}px`,
        "--stack-padding": `${numberProp(block.props.padding, 20)}px`,
        "--stack-stroke": stringProp(block.props.stroke) ?? "var(--slide-border)"
      }))}">${stackItems}</div>`
    );
  }

  if (block.type === "Table") {
    return renderMotionBlock(block, renderTableBlock(block.props));
  }

  return "";
}

function renderTableBlock(props: Record<string, string | number>) {
  const { columns, rows } = tableSizeFromProps(props);
  const cells = tableCellsFromProps(props, rows, columns);
  const columnTracks = tableColumnTrackValuesFromProps(props, columns);
  const rowTracks = tableRowTrackValuesFromProps(props, rows);
  const rowOverrides = parseRowOverrides(props);
  const colOverrides = parseColOverrides(props);
  const borderColor = stringProp(props.borderColor) ?? "#d1d5db";
  const borderWidth = numberProp(props.borderWidth, 1);
  const tableStyle = inlineCss({
    "--table-border": borderColor,
    "--table-border-style": tableBorderStyle(props.borderStyle),
    "--table-border-width": `${borderWidth}px`,
    "--table-cell-justify": tableCellJustify(props.textAlign),
    "--table-font-size": `${numberProp(props.fontSize, 16)}px`,
    "--table-padding-x": `${numberProp(props.cellPaddingX, 10)}px`,
    "--table-padding-y": `${numberProp(props.cellPaddingY, 8)}px`,
    "--table-text-align": tableTextAlign(props.textAlign),
    "--table-vertical-align": tableVerticalAlign(props.textVerticalAlign),
    background: stringProp(props.background ?? props.backgroundColor ?? props.bg) ?? "#ffffff",
    color: stringProp(props.color ?? props.textColor) ?? "#000000",
    "grid-template-columns": tableTrackTemplate(columnTracks),
    "grid-template-rows": tableTrackTemplate(rowTracks)
  });

  const cellHtml = cells.flatMap((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      const rowOverride = rowOverrides[rowIndex];
      const colOverride = colOverrides[columnIndex];
      const cellBackground =
        rowOverride?.background ??
        colOverride?.background ??
        tableCellBackground(props, rowIndex);
      const cellBorderColor = rowOverride?.borderColor ?? colOverride?.borderColor;
      const cellTextAlign = rowOverride?.textAlign ?? colOverride?.textAlign ?? tableTextAlign(props.textAlign);
      const cellColor = rowOverride?.textColor ?? colOverride?.textColor ?? stringProp(props.color ?? props.textColor);
      const cellFontFamily = rowOverride?.fontFamily ?? colOverride?.fontFamily;
      const cellFontSize = rowOverride?.fontSize ?? colOverride?.fontSize;
      const cellFontWeight = rowOverride?.fontWeight ?? colOverride?.fontWeight;
      const cellStyle = inlineCss({
        ...(cellBackground ? { background: cellBackground } : {}),
        ...(cellBorderColor ? {
          "border-bottom-color": cellBorderColor,
          "border-right-color": cellBorderColor
        } : {}),
        ...(cellColor ? { color: cellColor } : {}),
        ...(cellFontFamily ? { "font-family": cellFontFamily } : {}),
        ...(cellFontSize ? { "font-size": `${cellFontSize}px` } : {}),
        ...(cellFontWeight ? { "font-weight": String(cellFontWeight) } : {}),
        "justify-content": tableCellJustify(cellTextAlign),
        "text-align": cellTextAlign
      });

      return `<div class="block-table__cell" style="${escapeAttribute(cellStyle)}">${escapeHtml(cell)}</div>`;
    })
  ).join("");

  return `<div class="block-table" style="${escapeAttribute(tableStyle)}">${cellHtml}</div>`;
}

function tableCellBackground(props: Record<string, string | number>, rowIndex: number) {
  const stripeBackground = stringProp(props.stripeBackground);

  if (stripeBackground && rowIndex % 2 === 1) {
    return stripeBackground;
  }

  return stringProp(props.cellBackground) ?? "transparent";
}

function tableBorderStyle(value: string | number | undefined) {
  return value === "dashed" || value === "dotted" ? value : "solid";
}

function tableTextAlign(value: string | number | undefined) {
  if (value === "left" || value === "right") {
    return value;
  }

  return "center";
}

function tableCellJustify(value: string | number | undefined) {
  if (value === "left") return "flex-start";
  if (value === "right") return "flex-end";

  return "center";
}

function tableVerticalAlign(value: string | number | undefined) {
  if (value === "top") return "flex-start";
  if (value === "bottom") return "flex-end";

  return "center";
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
    ...textAlignVars(props),
    ...flexAlignVars(props)
  }))}">${content}</div>`;
}

function renderTextLines(text: string, listType?: string | unknown) {
  if (!text) return "";
  
  return text.split('\n').map(line => {
    const isBullet = listType === "bullet";
    const className = isBullet ? "block-line block-line--bullet" : "block-line";
    const content = line === "" ? "&#8203;" : escapeHtml(line);
    return `<span class="${className}">${content}</span>`;
  }).join("");
}

function flexAlignVars(props: Record<string, string | number>): Record<string, string> {
  const value = props.textVerticalAlign;
  if (!value) return {};

  const justifyContent = value === "bottom"
    ? "flex-end"
    : value === "middle" || value === "center"
      ? "center"
      : "flex-start";

  return {
    "display": "flex",
    "flex-direction": "column",
    "justify-content": justifyContent
  };
}

function animationClass(value: string | number | undefined) {
  if (value === "none" || value === "") return "enter-none";
  if (value === "blurIn") return "enter-blur-in";
  if (value === "fadeIn") return "enter-fade-in";
  if (value === "pop") return "enter-pop";
  if (value === "reveal") return "enter-reveal";
  if (value === "rise") return "enter-rise";
  if (value === "zoomIn") return "enter-zoom-in";
  if (value === "slideLeft") return "enter-slide-left";

  return "enter-fade-up";
}

function slideTransitionClass(value: string | number | undefined) {
  if (value === "curtain") return "slide-transition-curtain";
  if (value === "fade") return "slide-transition-fade";
  if (value === "pushLeft") return "slide-transition-push-left";
  if (value === "rise") return "slide-transition-rise";
  if (value === "scale") return "slide-transition-scale";
  if (value === "wipe") return "slide-transition-wipe";

  return "slide-transition-none";
}

function slideLayoutProp(value: string | number | undefined): "default" | "split-left" | "split-right" {
  if (value === "split-left" || value === "split-right") {
    return value;
  }

  return "default";
}

function alignXCss(value: string | number | undefined) {
  if (value === "center") return "center";
  if (value === "right") return "flex-end";
  if (value === "stretch") return "stretch";

  return "flex-start";
}

function alignYCss(value: string | number | undefined) {
  if (value === "top") return "flex-start";
  if (value === "bottom") return "flex-end";

  return "center";
}

function textAlignCss(value: string | number | undefined) {
  if (value === "center" || value === "right") {
    return value;
  }

  return "left";
}

function numberProp(value: string | number | undefined): number | undefined;
function numberProp(value: string | number | undefined, fallback: number): number;
function numberProp(value: string | number | undefined, fallback?: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function optionalNumberProp(value: string | number | undefined) {
  if (value === "" || value === undefined) {
    return undefined;
  }

  return numberProp(value);
}

function boolProp(value: string | number | undefined, fallback: boolean) {
  if (value === "false" || value === 0) return false;
  if (value === "true" || value === 1) return true;

  return fallback;
}

function isPositionedProps(props: Record<string, string | number>) {
  return Number.isFinite(Number(props.x)) || Number.isFinite(Number(props.y));
}

function positionVars(props: Record<string, string | number>): Record<string, string> {
  if (!isPositionedProps(props)) {
    return {};
  }

  return {
    "--motion-h": `${framePercent(props.h, 18)}%`,
    "--motion-x": `${framePercent(props.x, 8)}%`,
    "--motion-y": `${framePercent(props.y, 12)}%`,
    "--motion-w": `${framePercent(props.w, 42)}%`
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

function framePercent(value: string | number | undefined, fallbackPercent: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return roundValue(fallbackPercent);
  }

  return roundValue(Math.min(Math.max(parsed, 0), 100));
}

function roundValue(value: number) {
  return Math.round(value * 100) / 100;
}

function chartValues(value: string, allowNegative = false) {
  const values = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item))
    .map((item) => allowNegative ? item : Math.max(item, 0));

  return values.length > 0 ? values : [24, 42, 68, 54];
}

function renderChartBody({
  chartHeight,
  chartType,
  colors,
  labels,
  maxValue,
  sizes,
  strokeWidth,
  valueFormat,
  values,
  xAxisStep,
  xValues,
  yAxisStep
}: {
  chartHeight: number;
  chartType: ChartType;
  colors: string[];
  labels: string[];
  maxValue: number;
  sizes: number[];
  strokeWidth: number;
  valueFormat: ChartValueFormat;
  values: number[];
  xAxisStep?: number;
  xValues: number[];
  yAxisStep?: number;
}) {
  if (chartType === "gauge") {
    const visibleValues = values.slice(0, 6);
    const axisMax = chartAxisMaximum(Math.max(...visibleValues, 1));
    const primaryValue = Math.max(visibleValues[0] ?? 0, 0);
    const angle = Math.PI * (1 - Math.min(primaryValue / axisMax, 1));
    const needleX = 150 + Math.cos(angle) * 64;
    const needleY = 130 - Math.sin(angle) * 64;
    const primaryColor = colors[0] || "var(--chart-color)";
    const arcWidth = Math.min(14, Math.max(5, strokeWidth));
    const arcs = visibleValues.map((value, index) => { const radius = 96 - index * (arcWidth + 4); const color = colors[index] || "var(--chart-color)"; const pct = Math.min(Math.max(value, 0) / axisMax * 100, 100); return `<path d="M${150 - radius} 130 A${radius} ${radius} 0 0 1 ${150 + radius} 130" fill="none" pathLength="100" stroke="rgba(255,255,255,.08)" stroke-linecap="round" stroke-width="${arcWidth}"/><path d="M${150 - radius} 130 A${radius} ${radius} 0 0 1 ${150 + radius} 130" fill="none" pathLength="100" stroke="${escapeAttribute(color)}" stroke-dasharray="${pct} 100" stroke-linecap="round" stroke-width="${arcWidth}"/>`; }).join("");
    const legend = visibleValues.map((value, index) => `<div><i style="${escapeAttribute(inlineCss({ background: colors[index] || "var(--chart-color)" }))}"></i><span>${escapeHtml(labels[index] ?? `Value ${index + 1}`)}</span><b>${formatChartValue(value, valueFormat)}</b></div>`).join("");
    return `<div class="block-chart__gauge"><svg viewBox="0 0 300 205">${arcs}<line x1="150" x2="${needleX}" y1="130" y2="${needleY}" stroke="var(--motion-fg,var(--slide-fg))" stroke-linecap="round" stroke-width="3"/><circle cx="150" cy="130" fill="var(--slide-card)" r="8" stroke="${escapeAttribute(primaryColor)}" stroke-width="4"/><text x="49" y="153">${formatChartValue(0, valueFormat)}</text><text x="251" y="153">${formatChartValue(axisMax, valueFormat)}</text><text class="block-chart__gauge-value" x="150" y="176" fill="var(--motion-fg,var(--slide-fg))">${formatChartValue(primaryValue, valueFormat)}</text><text class="block-chart__gauge-label" x="150" y="194">${escapeHtml(labels[0] ?? "Value")}</text></svg><div class="block-chart__gauge-legend">${legend}</div></div>`;
  }

  if (["pie", "donut", "polar-area"].includes(chartType)) {
    const total = values.reduce((sum, value) => sum + value, 0) || 1;
    let cursor = 0;
    const gradient = values.map((value, index) => {
      const start = cursor;
      cursor += value / total * 100;
      return `${colors[index] || "var(--chart-color)"} ${start}% ${cursor}%`;
    }).join(",");
    const donutInset = `${Math.min(40, Math.max(18, 44 - strokeWidth * 1.5))}%`;
    const center = chartType === "donut" ? `<span style="${escapeAttribute(inlineCss({ background: "var(--slide-card)", "border-radius": "999px", display: "grid", inset: donutInset, "place-items": "center", position: "absolute" }))}">${formatChartValue(total, valueFormat)}</span>` : "";
    const legend = values.map((value, index) => `<span><i style="${escapeAttribute(inlineCss({ background: colors[index] || "var(--chart-color)" }))}"></i>${escapeHtml(labels[index] ?? `Q${index + 1}`)} <b>${formatChartValue(value, valueFormat)}</b></span>`).join("");
    return `<div class="block-chart__radial"><div class="block-chart__radial-graphic" style="${escapeAttribute(inlineCss({ background: `conic-gradient(${gradient})` }))}">${center}</div><div class="block-chart__radial-legend">${legend}</div></div>`;
  }

  if (chartType === "treemap" || chartType === "heatmap") {
    return `<div class="block-chart__tiles">${values.map((value, index) => { const tileColor = colors[index] || "var(--chart-color)"; return `<div style="${escapeAttribute(inlineCss({ background: tileColor, color: resolveContrastingTextColor(tileColor) ?? "#ffffff", opacity: String(.35 + .65 * value / maxValue) }))}"><span>${escapeHtml(labels[index] ?? `Q${index + 1}`)}</span><b>${formatChartValue(value, valueFormat)}</b></div>`; }).join("")}</div>`;
  }

  if (chartType === "timeline") {
    return `<div class="block-chart__timeline">${values.map((value, index) => `<div><i style="${escapeAttribute(inlineCss({ background: colors[index] || "var(--chart-color)" }))}"></i><b>${escapeHtml(labels[index] ?? `Q${index + 1}`)}</b><span>${formatChartValue(value, valueFormat)}</span></div>`).join("")}</div>`;
  }

  if (chartType === "waterfall") {
    const running = values.reduce<number[]>((items, value, index) => [...items, (items[index - 1] ?? 0) + value], []);
    const finalTotal = running.at(-1) ?? 0;
    const levels = [0, ...running];
    const axisBounds = chartAxisBounds(Math.min(...levels), Math.max(...levels), yAxisStep);
    const minimum = axisBounds.minimum;
    const maximum = axisBounds.maximum;
    const range = Math.max(maximum - minimum, 1);
    const top = 30;
    const bottom = 34;
    const plotHeight = Math.max(chartHeight - top - bottom, 40);
    const yFor = (value: number) => top + (maximum - value) / range * plotHeight;
    const plotLeft = 68;
    const plotRight = 704;
    const itemCount = values.length + 1;
    const step = (plotRight - plotLeft) / Math.max(itemCount, 1);
    const barWidth = Math.min(64, Math.max(28, step * .55 + strokeWidth));
    const xFor = (index: number) => plotLeft + step * index + (step - barWidth) / 2;
    const yTicks = chartAxisTicks(minimum, maximum, yAxisStep);
    const xTicks = chartAxisTicks(0, itemCount, xAxisStep, itemCount <= 8 ? itemCount : 4);
    const yGrid = yTicks.map((tick) => `<line class="block-chart__axis-grid-line" x1="${plotLeft - 4}" x2="${plotRight}" y1="${yFor(tick)}" y2="${yFor(tick)}"/><text class="block-chart__axis-tick block-chart__axis-tick--y" x="${plotLeft - 10}" y="${yFor(tick)}">${formatChartValue(tick, valueFormat)}</text>`).join("");
    const xGrid = xTicks.map((tick) => { const x = plotLeft + tick / Math.max(itemCount, 1) * (plotRight - plotLeft); return `<line class="block-chart__axis-grid-line" x1="${x}" x2="${x}" y1="${top}" y2="${chartHeight - bottom}"/>`; }).join("");
    const bars = values.map((value, index) => {
      const previous = running[index - 1] ?? 0;
      const current = running[index];
      const barTop = yFor(Math.max(previous, current));
      const barBottom = yFor(Math.min(previous, current));
      const valueY = value >= 0 ? Math.max(barTop - 8, 14) : Math.min(barBottom + 17, chartHeight - bottom - 2);
      const connectorY = yFor(current);
      const signedValue = formatSignedChartValue(value, valueFormat, index === 0);
      return `<g><rect x="${xFor(index)}" y="${barTop}" width="${barWidth}" height="${Math.max(barBottom - barTop, 4)}" rx="3" fill="${escapeAttribute(colors[index] || "var(--chart-color)")}"/><line x1="${xFor(index) + barWidth}" x2="${xFor(index + 1)}" y1="${connectorY}" y2="${connectorY}"/><text class="block-chart__waterfall-value" x="${xFor(index) + barWidth / 2}" y="${valueY}">${signedValue}</text><text class="block-chart__waterfall-label" x="${xFor(index) + barWidth / 2}" y="${chartHeight - 8}">${index + 1} · ${escapeHtml(labels[index] ?? `Q${index + 1}`)}</text></g>`;
    }).join("");
    const totalTop = Math.min(yFor(finalTotal), yFor(0));
    const totalHeight = Math.max(Math.abs(yFor(finalTotal) - yFor(0)), 4);

    return `<div class="block-chart__waterfall"><svg viewBox="0 0 720 ${chartHeight}" preserveAspectRatio="none">${yGrid}${xGrid}<text class="block-chart__axis-name" x="8" y="16">Y</text>${bars}<rect x="${xFor(values.length)}" y="${totalTop}" width="${barWidth}" height="${totalHeight}" rx="3" fill="var(--chart-color)"/><text class="block-chart__waterfall-value" x="${xFor(values.length) + barWidth / 2}" y="${Math.max(totalTop - 8, 14)}">${formatChartValue(finalTotal, valueFormat)}</text><text class="block-chart__waterfall-label" x="${xFor(values.length) + barWidth / 2}" y="${chartHeight - 8}">${values.length + 1} · Total</text></svg></div>`;
  }

  if (chartType === "radar") {
    const safeHeight = Math.max(chartHeight, 96);
    const centerX = 360;
    const centerY = safeHeight / 2;
    const radius = Math.max(18, Math.min(118, safeHeight / 2 - 32));
    const count = Math.max(values.length, 1);
    const pointAt = (index: number, scale = 1) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / count;
      return { x: centerX + Math.cos(angle) * radius * scale, y: centerY + Math.sin(angle) * radius * scale };
    };
    const polygon = (scale: number) => values.map((_, index) => {
      const point = pointAt(index, scale);
      return `${point.x},${point.y}`;
    }).join(" ");
    const valuePoints = values.map((value, index) => pointAt(index, Math.max(value, 0) / maxValue));
    const axes = values.map((_, index) => { const point = pointAt(index); return `<line x1="${centerX}" y1="${centerY}" x2="${point.x}" y2="${point.y}"/>`; }).join("");
    const dots = valuePoints.map((point, index) => `<circle cx="${point.x}" cy="${point.y}" r="${Math.max(3.5, strokeWidth / 2)}" fill="${escapeAttribute(colors[index] || "var(--chart-color)")}"/>`).join("");
    const radarLabels = values.map((value, index) => {
      const outerPoint = pointAt(index, 1.22);
      const x = Math.min(Math.max(outerPoint.x, 42), 678);
      const y = Math.min(Math.max(outerPoint.y, 16), safeHeight - 16);
      return `<text x="${x}" y="${y}">${escapeHtml(labels[index] ?? `Q${index + 1}`)} · ${formatChartValue(value, valueFormat)}</text>`;
    }).join("");

    return `<div class="block-chart__radar"><svg viewBox="0 0 720 ${safeHeight}" preserveAspectRatio="xMidYMid meet"><g class="block-chart__radar-grid"><polygon points="${polygon(1)}"/><polygon points="${polygon(.66)}"/><polygon points="${polygon(.33)}"/>${axes}</g><polygon class="block-chart__radar-value" points="${valuePoints.map((point) => `${point.x},${point.y}`).join(" ")}"/>${dots}${radarLabels}</svg></div>`;
  }

  if (chartType === "sparkline") {
    const latest = values.at(-1) ?? 0;
    const first = values[0] ?? latest;
    const change = first === 0 ? 0 : (latest - first) / Math.abs(first) * 100;
    const rawMin = values.length ? Math.min(...values) : 0;
    const rawMax = values.length ? Math.max(...values) : 1;
    const bounds = chartAxisBounds(rawMin, rawMax, yAxisStep);
    const min = bounds.minimum;
    const max = bounds.maximum;
    const range = Math.max(max - min, 1);
    const points = values.map((value, index) => ({ x: values.length === 1 ? 314 : 44 + index * 540 / (values.length - 1), y: 12 + (max - value) / range * 62 }));
    const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
    const areaPath = points.length ? `M ${points[0].x} 82 L ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} L ${points.at(-1)?.x} 82 Z` : "";
    const dots = points.map((point, index) => `<circle cx="${point.x}" cy="${point.y}" r="${index === points.length - 1 ? 5 : 3.5}" fill="${escapeAttribute(colors[index] || "var(--chart-color)")}"/>`).join("");
    const yTicks = chartAxisTicks(min, max, yAxisStep, 2);
    const xTicks = chartAxisTicks(1, Math.max(values.length, 1), xAxisStep, Math.max(values.length - 1, 1));
    const miniGrid = yTicks.map((tick) => { const y = 12 + (max - tick) / range * 62; return `<line class="block-chart__axis-grid-line" x1="36" x2="590" y1="${y}" y2="${y}"/><text class="block-chart__sparkline-axis" x="31" y="${y}">${formatChartValue(tick, valueFormat)}</text>`; }).join("");
    const miniXGrid = xTicks.map((tick) => { const x = values.length <= 1 ? 314 : 44 + (tick - 1) * 540 / (values.length - 1); return `<line class="block-chart__axis-grid-line" x1="${x}" x2="${x}" y1="10" y2="82"/><text class="block-chart__sparkline-x-axis" x="${x}" y="89">${formatExportChartNumber(tick)}</text>`; }).join("");
    const valueItems = values.map((value, index) => `<div><i style="${escapeAttribute(inlineCss({ background: colors[index] || "var(--chart-color)" }))}"></i><span>X ${index + 1} · ${escapeHtml(labels[index] ?? `Q${index + 1}`)}</span><b>Y ${formatChartValue(value, valueFormat)}</b></div>`).join("");
    return `<div class="block-chart__sparkline"><div class="block-chart__sparkline-head"><div><small>Latest</small><strong>${formatChartValue(latest, valueFormat)}</strong></div><em class="${change >= 0 ? "is-positive" : "is-negative"}">${change >= 0 ? "+" : ""}${change.toFixed(1)}%</em></div><svg viewBox="0 0 600 90" preserveAspectRatio="none">${miniGrid}${miniXGrid}<path class="block-chart__sparkline-area" d="${escapeAttribute(areaPath)}"/><polyline points="${escapeAttribute(pointString)}"/>${dots}</svg><div class="block-chart__sparkline-values" style="${escapeAttribute(inlineCss({ "grid-template-columns": `repeat(${Math.max(values.length, 1)},minmax(0,1fr))` }))}">${valueItems}</div></div>`;
  }

  if (chartType === "scatter" || chartType === "bubble") {
    const resolvedXValues = values.map((_, index) => xValues[index] ?? index + 1);
    const maxX = Math.max(...resolvedXValues, 1);
    const maxSize = Math.max(...sizes, 1);
    const scale = exportCartesianScale(chartHeight, maxX, maxValue, xAxisStep, yAxisStep);
    const points = values.map((value, index) => {
      const xValue = resolvedXValues[index];
      const x = scale.x(xValue);
      const y = scale.y(value);
      const diameter = chartType === "bubble" ? 14 + (sizes[index] ?? 10) / maxSize * (30 + strokeWidth) : Math.max(8, strokeWidth + 3);
      const pointColor = colors[index] || "var(--chart-color)";
      const innerLabel = chartType === "bubble" && diameter > 34 ? `<text class="block-chart__point-inner" x="${x}" y="${y}" fill="${escapeAttribute(resolveContrastingTextColor(pointColor) ?? "#ffffff")}">${escapeHtml(labels[index]?.slice(0, 3) ?? "")}</text>` : "";
      return `<g><circle cx="${x}" cy="${y}" r="${diameter / 2}" style="${escapeAttribute(inlineCss({ fill: pointColor }))}"/><text class="block-chart__point-value" x="${x}" y="${Math.max(y - diameter / 2 - 7, 13)}">(${formatExportChartNumber(xValue)}, ${formatChartValue(value, valueFormat)})</text>${innerLabel}</g>`;
    }).join("");

    return `<div class="block-chart__line"><svg viewBox="0 0 720 ${chartHeight}" preserveAspectRatio="none">${renderExportCartesianAxes(chartHeight, maxX, maxValue, valueFormat, xAxisStep, yAxisStep)}${points}</svg></div>`;
  }

  if (chartType === "line" || chartType === "area" || chartType === "step") {
    const scale = exportCartesianScale(chartHeight, Math.max(values.length, 1), maxValue, xAxisStep, yAxisStep);
    const points = values.map((value, index) => ({ x: scale.x(index + 1), y: scale.y(value) }));
    const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
    const stepPath = points.reduce((path, point, index) => index ? `${path} H ${point.x} V ${point.y}` : `M ${point.x} ${point.y}`, "");
    const areaPath = points.length ? `M ${points[0].x} ${scale.y(0)} L ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} L ${points.at(-1)?.x} ${scale.y(0)} Z` : "";
    const marks = points.map((point, index) => `<g><circle cx="${point.x}" cy="${point.y}" r="${Math.max(4, strokeWidth * .62)}" style="${escapeAttribute(inlineCss({ fill: colors[index] || "var(--chart-color)" }))}"/><text class="block-chart__point-value" x="${point.x}" y="${Math.max(point.y - 11, 14)}">${formatChartValue(values[index], valueFormat)}</text><text class="block-chart__category-value" x="${point.x}" y="${chartHeight - 3}">${escapeHtml(labels[index] ?? `Q${index + 1}`)}</text></g>`).join("");
    const series = chartType === "step" ? `<path class="block-chart__step" d="${escapeAttribute(stepPath)}"/>` : `<polyline points="${escapeAttribute(pointString)}"/>`;

    return `<div class="block-chart__line"><svg viewBox="0 0 720 ${chartHeight}" preserveAspectRatio="none" style="${escapeAttribute(inlineCss({ "--chart-stroke-width": String(strokeWidth) }))}">${renderExportCartesianAxes(chartHeight, Math.max(values.length, 1), maxValue, valueFormat, xAxisStep, yAxisStep)}${chartType === "area" ? `<path class="block-chart__area" d="${escapeAttribute(areaPath)}"/>` : ""}${series}${marks}</svg></div>`;
  }

  const isColumn = chartType === "column" || chartType === "lollipop";
  if (isColumn) {
    const scale = exportCartesianScale(chartHeight, Math.max(values.length, 1), maxValue, xAxisStep, yAxisStep);
    const barWidth = Math.min(72, Math.max(24, scale.plotWidth / Math.max(values.length, 1) * .48));
    const marks = values.map((value, index) => { const x = scale.x(index + 1); const y = scale.y(value); const baseY = scale.y(0); const mark = chartType === "lollipop" ? `<line class="block-chart__lollipop-line" x1="${x}" x2="${x}" y1="${baseY}" y2="${y}" stroke="${escapeAttribute(colors[index] || "var(--chart-color)")}"/><circle cx="${x}" cy="${y}" r="${Math.max(6, strokeWidth * .72)}" style="${escapeAttribute(inlineCss({ fill: colors[index] || "var(--chart-color)" }))}"/>` : `<rect x="${x - barWidth / 2}" y="${Math.min(y, baseY - 4)}" width="${barWidth}" height="${Math.max(baseY - y, 4)}" rx="4" fill="${escapeAttribute(colors[index] || "var(--chart-color)")}"/>`; return `<g>${mark}<text class="block-chart__point-value" x="${x}" y="${Math.max(y - 9, 14)}">${formatChartValue(value, valueFormat)}</text><text class="block-chart__category-value" x="${x}" y="${chartHeight - 3}">${escapeHtml(labels[index] ?? `Q${index + 1}`)}</text></g>`; }).join("");
    return `<div class="block-chart__line"><svg viewBox="0 0 720 ${chartHeight}" preserveAspectRatio="none">${renderExportCartesianAxes(chartHeight, Math.max(values.length, 1), maxValue, valueFormat, xAxisStep, yAxisStep)}${marks}</svg></div>`;
  }

  if (chartType === "bar") {
    const width = 720;
    const left = 112;
    const right = 42;
    const top = 18;
    const bottom = 38;
    const axisMax = chartAxisMaximum(maxValue, xAxisStep);
    const plotWidth = width - left - right;
    const rowHeight = (chartHeight - top - bottom) / Math.max(values.length, 1);
    const xFor = (value: number) => left + Math.max(value, 0) / axisMax * plotWidth;
    const grid = chartAxisTicks(0, axisMax, xAxisStep).map((tick) => `<line class="block-chart__axis-grid-line" x1="${xFor(tick)}" x2="${xFor(tick)}" y1="${top}" y2="${chartHeight - bottom}"/><text class="block-chart__axis-tick" x="${xFor(tick)}" y="${chartHeight - 15}">${formatChartValue(tick, valueFormat)}</text>`).join("");
    const rowGrid = chartAxisTicks(0, values.length, yAxisStep, Math.min(values.length, 8)).map((tick) => { const y = top + tick / Math.max(values.length, 1) * (chartHeight - top - bottom); return `<line class="block-chart__axis-grid-line" x1="${left}" x2="${left + plotWidth}" y1="${y}" y2="${y}"/>`; }).join("");
    const bars = values.map((value, index) => { const centerY = top + rowHeight * (index + .5); const barHeight = Math.min(Math.max(strokeWidth, 12), rowHeight * .56); return `<g><text class="block-chart__bar-category" x="${left - 10}" y="${centerY}">${index + 1} · ${escapeHtml(labels[index] ?? `Q${index + 1}`)}</text><line class="block-chart__bar-track-line" x1="${left}" x2="${left + plotWidth}" y1="${centerY}" y2="${centerY}" stroke-width="${barHeight}"/><line class="block-chart__bar-value-line" x1="${left}" x2="${Math.max(xFor(value), left + 4)}" y1="${centerY}" y2="${centerY}" stroke="${escapeAttribute(colors[index] || "var(--chart-color)")}" stroke-width="${barHeight}"/><text class="block-chart__bar-number" x="${Math.min(xFor(value) + 10, width - right + 4)}" y="${centerY}">${formatChartValue(value, valueFormat)}</text></g>`; }).join("");
    return `<div class="block-chart__line"><svg viewBox="0 0 ${width} ${chartHeight}" preserveAspectRatio="none">${grid}${rowGrid}<text class="block-chart__axis-name" x="712" y="${chartHeight - 3}" text-anchor="end">X</text>${bars}</svg></div>`;
  }

  const bars = values
    .map((value, index) => `<div class="block-chart__bar-wrap"><span class="block-chart__label">${escapeHtml(labels[index] ?? `Q${index + 1}`)}</span><div class="block-chart__track" style="${escapeAttribute(inlineCss({ height: `${strokeWidth}px` }))}"><div class="block-chart__bar" style="${escapeAttribute(inlineCss({ background: colors[index] || "var(--chart-color)", width: `${Math.max((value / maxValue) * 100, 4)}%` }))}"></div></div><strong>${formatChartValue(value, valueFormat)}</strong></div>`)
    .join("");

  return `<div class="block-chart__bars">${bars}</div>`;
}

function chartTypeProp(value: string | number | undefined): ChartType {
  return normalizeChartType(value);
}

function exportCartesianScale(height: number, maxX: number, maxY: number, xAxisStep?: number, yAxisStep?: number) {
  const left = 60;
  const right = 704;
  const top = 20;
  const bottom = height - 38;
  const xMax = xAxisStep ? chartAxisMaximum(maxX, xAxisStep) : Math.max(maxX, 1);
  const yMax = chartAxisMaximum(Math.max(maxY, 1), yAxisStep);
  const plotWidth = right - left;
  const plotHeight = Math.max(bottom - top, 1);

  return {
    bottom,
    left,
    plotHeight,
    plotWidth,
    right,
    top,
    x: (value: number) => left + Math.max(value, 0) / xMax * plotWidth,
    xMax,
    y: (value: number) => top + (yMax - Math.max(value, 0)) / yMax * plotHeight,
    yMax
  };
}

function renderExportCartesianAxes(height: number, maxX: number, maxY: number, valueFormat: ChartValueFormat, xAxisStep?: number, yAxisStep?: number) {
  const scale = exportCartesianScale(height, maxX, maxY, xAxisStep, yAxisStep);
  const xTickCount = Number.isInteger(scale.xMax) && scale.xMax <= 8 ? scale.xMax : 4;
  const yTicks = chartAxisTicks(0, scale.yMax, yAxisStep).map((tick) => `<line class="block-chart__axis-grid-line" x1="${scale.left}" x2="${scale.right}" y1="${scale.y(tick)}" y2="${scale.y(tick)}"/><text class="block-chart__axis-tick block-chart__axis-tick--y" x="${scale.left - 8}" y="${scale.y(tick)}">${formatChartValue(tick, valueFormat)}</text>`).join("");
  const xTicks = chartAxisTicks(0, scale.xMax, xAxisStep, xTickCount).map((tick) => `<line class="block-chart__axis-grid-line" x1="${scale.x(tick)}" x2="${scale.x(tick)}" y1="${scale.top}" y2="${scale.bottom}"/><text class="block-chart__axis-tick" x="${scale.x(tick)}" y="${height - 16}">${formatExportChartNumber(tick)}</text>`).join("");

  return `<g class="block-chart__axes">${yTicks}${xTicks}<text class="block-chart__axis-name" x="8" y="15">Y</text><text class="block-chart__axis-name" x="712" y="${height - 3}" text-anchor="end">X</text></g>`;
}

function formatExportChartNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
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
    return 240;
  }

  return Math.min(Math.max(parsed, 80), 320);
}

function fitProp(value: string | number | undefined) {
  if (value === "cover" || value === "contain" || value === "fill" || value === "scale-down") {
    return value;
  }

  return "cover";
}

function shaderFitProp(value: string) {
  if (value === "contain" || value === "scale-down") {
    return "contain";
  }

  return "cover";
}

function backgroundSizeFromFit(value: string | undefined) {
  if (value === "contain" || value === "scale-down") {
    return "contain";
  }

  if (value === "fill") {
    return "100% 100%";
  }

  return "cover";
}

function clampExportImageScale(value: number | undefined) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value ?? 1, 0.1), 4);
}

function cssImageUrl(value: string) {
  return `url("${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;
}

function renderShapeSvg(props: Record<string, string | number>, blockIndex: number) {
  const fill = stringProp(props.fill) ?? "rgba(142,165,255,0.72)";
  const mask = stringProp(props.mask) ?? "none";
  const operation = stringProp(props.operation) ?? "none";
  const shape = stringProp(props.shape) ?? "rectangle";
  const stroke = stringProp(props.stroke) ?? "#ffffff";
  const strokeWidth = numberProp(props.strokeWidth, 2);
  const opacity = Math.min(Math.max(numberProp(props.opacity, 1), 0), 1);
  const sides = Math.min(Math.max(Math.round(numberProp(props.sides, 3)), 3), 12);
  const points = Math.min(Math.max(Math.round(numberProp(props.points, 5)), 3), 12);
  const maskId = `shape-mask-${blockIndex}-${String(shape).replace(/[^a-z0-9]+/gi, "-")}-${String(mask).replace(/[^a-z0-9]+/gi, "-")}`;
  const maskDefs = mask === "alpha"
    ? `<linearGradient id="${maskId}-fade" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="white" stop-opacity="0.15" /><stop offset="45%" stop-color="white" stop-opacity="1" /><stop offset="100%" stop-color="white" stop-opacity="0.2" /></linearGradient><mask id="${maskId}"><rect width="100" height="100" fill="url(#${maskId}-fade)" /></mask>`
    : mask === "luma"
      ? `<radialGradient id="${maskId}-radial" cx="50%" cy="45%" r="58%"><stop offset="0%" stop-color="white" stop-opacity="1" /><stop offset="100%" stop-color="white" stop-opacity="0.08" /></radialGradient><mask id="${maskId}"><rect width="100" height="100" fill="url(#${maskId}-radial)" /></mask>`
      : mask === "clip"
        ? `<mask id="${maskId}"><rect fill="white" height="72" rx="14" width="72" x="14" y="14" /></mask>`
        : "";
  const maskAttr = mask === "none" ? "" : ` mask="url(#${maskId})"`;
  const booleanLayer = operation === "subtract"
    ? `<circle cx="68" cy="34" fill="var(--slide-bg, #030303)" r="22" />`
    : operation === "intersect"
      ? `<circle cx="62" cy="44" fill="${escapeAttribute(fill)}" opacity="0.45" r="30" stroke="${escapeAttribute(stroke)}" stroke-width="${strokeWidth}" />`
      : operation === "exclude"
        ? `<circle cx="62" cy="44" fill="transparent" opacity="0.9" r="30" stroke="${escapeAttribute(stroke)}" stroke-dasharray="7 7" stroke-width="${strokeWidth}" />`
        : "";

  const lineEndpoints = shape === "line" ? `${renderLineEndpoint(stringProp(props.arrowStart) ?? "none", "start", stroke, numberProp(props.arrowStartSize, 100))}${renderLineEndpoint(stringProp(props.arrowEnd) ?? "none", "end", stroke, numberProp(props.arrowEndSize, 100))}` : "";
  return `<svg aria-hidden="true" preserveAspectRatio="none" viewBox="${shape === "line" ? "0 0 100 20" : "0 0 100 100"}" style="${escapeAttribute(inlineCss({ opacity: String(opacity) }))}"><defs>${maskDefs}</defs><g${maskAttr}>${shapeSvg(shape, fill, stroke, strokeWidth, sides, points, stringProp(props.lineStyle) ?? "solid", stringProp(props.arrowStart) ?? "none", stringProp(props.arrowEnd) ?? "none", Math.min(Math.max(numberProp(props.radius ?? props.borderRadius, 0), 0), 50))}${booleanLayer}</g></svg>${lineEndpoints}`;
}

function renderLineEndpoint(endpoint: string, side: "end" | "start", stroke: string, size: number) {
  if (endpoint === "none" || !endpoint) return "";
  const color = stroke === "transparent" ? "#e5e7eb" : stroke;
  const scale = Math.min(Math.max(size, 25), 300) / 100;
  return `<span class="shape-line-endpoint shape-line-endpoint--${side} shape-line-endpoint--${escapeAttribute(endpoint)}" style="${escapeAttribute(inlineCss({ "--line-endpoint-color": color, "--line-endpoint-scale": String(scale) }))}"></span>`;
}

function shapeSvg(shape: string, fill: string, stroke: string, strokeWidth: number, sides: number, points: number, lineStyle: string, arrowStart: string, arrowEnd: string, radius: number) {
  if (shape === "circle") {
    return `<circle cx="50" cy="50" fill="${escapeAttribute(fill)}" r="48" stroke="${escapeAttribute(stroke)}" stroke-width="${strokeWidth}" />`;
  }

  if (shape === "triangle" || shape === "polygon") {
    return `<path d="${escapeAttribute(generatePolygonPath(shape === "triangle" ? 3 : sides))}" fill="${escapeAttribute(fill)}" stroke="${escapeAttribute(stroke)}" stroke-linejoin="round" stroke-width="${strokeWidth}" />`;
  }

  if (shape === "line") {
    const resolvedStroke = escapeAttribute(stroke === "transparent" ? "#e5e7eb" : stroke);
    const dash = lineStyle === "dashed" ? ` stroke-dasharray="8 6"` : lineStyle === "dotted" ? ` stroke-dasharray="1 6"` : "";
    const isPlainLine = arrowStart === "none" && arrowEnd === "none";
    return `<g stroke="${resolvedStroke}" stroke-linecap="${isPlainLine && lineStyle === "solid" ? "butt" : "round"}" stroke-linejoin="round" stroke-width="${strokeWidth}"><path d="M0 10H100" fill="none"${dash} vector-effect="non-scaling-stroke" /></g>`;
  }

  if (shape === "arrow") {
    const arrowStroke = escapeAttribute(stroke === "transparent" ? fill : stroke);
    return `<g fill="none" stroke="${arrowStroke}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${strokeWidth}"><path d="M10 74 L88 18" /><path d="M56 18 H88 V50" /></g>`;
  }

  if (shape === "star") {
    return `<path d="${escapeAttribute(generateStarPath(points))}" fill="${escapeAttribute(fill)}" stroke="${escapeAttribute(stroke)}" stroke-linejoin="round" stroke-width="${strokeWidth}" />`;
  }

  const customPaths: Record<string, string> = {
    chevron: "M1 1H68L99 50 68 99H1L32 50Z",
    corner: "M1 1H72L99 28V99H1Z",
    diamond: "M50 1L99 50 50 99 1 50Z",
    hexagon: "M20 1H80L99 50 80 99H20L1 50Z",
    parallelogram: "M24 1H99L76 99H1Z"
  };
  if (customPaths[shape]) return `<path d="${customPaths[shape]}" fill="${escapeAttribute(fill)}" stroke="${escapeAttribute(stroke)}" stroke-linejoin="round" stroke-width="${strokeWidth}" />`;

  return `<rect fill="${escapeAttribute(fill)}" height="100" rx="${radius}" stroke="${escapeAttribute(stroke)}" stroke-width="${strokeWidth}" width="100" x="0" y="0" />`;
}

function generatePolygonPath(sides: number, cx = 50, cy = 50, r = 48) {
  const angleOffset = -Math.PI / 2;
  const points: string[] = [];

  for (let index = 0; index < sides; index += 1) {
    const angle = angleOffset + (2 * Math.PI * index) / sides;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }

  return `M${points.join(" L")} Z`;
}

function generateStarPath(points: number, cx = 50, cy = 50, outerR = 48) {
  const innerR = outerR * 0.42;
  const angleOffset = -Math.PI / 2;
  const vertices: string[] = [];

  for (let index = 0; index < points * 2; index += 1) {
    const angle = angleOffset + (2 * Math.PI * index) / (points * 2);
    const radius = index % 2 === 0 ? outerR : innerR;
    vertices.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }

  return `M${vertices.join(" L")} Z`;
}

function renderLucideIcon(name: string, strokeWidth = 2) {
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

  return `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="${strokeWidth}" viewBox="0 0 24 24">${children}</svg>`;
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

function escapeCdata(value: string) {
  return value.replaceAll("]]>", "]]]]><![CDATA[>");
}

export function slugifyFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "slidex-deck";
}
