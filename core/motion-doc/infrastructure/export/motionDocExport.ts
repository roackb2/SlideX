import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import type { MotionDocBlock, MotionDocProps, MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import { renderLucideIconSvg } from "@/core/motion-doc/application/lucideIconSvg";
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
import { youtubeEmbedUrl } from "@/core/motion-doc/domain/videoSource";
import { motionDocExportStyles } from "@/core/motion-doc/infrastructure/export/motionDocExportStyles";

export const MOTION_DOC_PNG_HEIGHT = MOTION_DOC_CANVAS_HEIGHT;
export const MOTION_DOC_PNG_WIDTH = MOTION_DOC_CANVAS_WIDTH;

type RenderSceneHtmlOptions = {
  active?: boolean;
  rasterMode?: boolean;
};

export function buildMotionDocHtml(source: string, customTitle?: string) {
  const security = exportRuntimeSecurity();
  const document = parseMotionDoc(source);
  const displayTitle = customTitle || document.title;
  const slidesHtml = document.scenes
    .map((scene) => renderSceneHtml(scene))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${security.policy}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(displayTitle)}</title>
    <style>${motionDocExportStyles}</style>
  </head>
  <body>
    <script id="slidex-motion-doc-source" nonce="${security.nonce}" type="application/json">${serializeMotionDocSource(source)}</script>
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
    <script nonce="${security.nonce}">${makeMotionDocExportRuntime()}</script>
  </body>
</html>`;
}

function serializeMotionDocSource(source: string) {
  return JSON.stringify(source).replaceAll("<", "\\u003c");
}

function exportRuntimeSecurity() {
  const nonce = `slidex-${globalThis.crypto.randomUUID()}`;
  const policy = [
    "default-src 'none'",
    "connect-src https:",
    "font-src https: data:",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    "img-src https: blob: data:",
    "media-src https: blob: data:",
    "object-src 'none'",
    `script-src 'nonce-${nonce}'`,
    "style-src 'unsafe-inline'"
  ].join("; ");

  return { nonce, policy };
}

export function buildMotionDocRasterHtml(
  source: string,
  customTitle?: string,
  slideIndices?: readonly number[]
) {
  const security = exportRuntimeSecurity();
  const document = parseMotionDoc(source);
  const displayTitle = customTitle || document.title;
  const scenes = slideIndices
    ? slideIndices
        .map((slideIndex) => document.scenes[slideIndex])
        .filter((scene): scene is MotionDocScene => Boolean(scene))
    : document.scenes;
  const slidesHtml = scenes
    .map((scene) => renderSceneHtml(scene, { active: true }))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${security.policy}" />
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
    <main class="player" data-export-mode="raster" data-slide-count="${scenes.length}">
      <div class="stage">
        <div class="viewport">
          <div class="frame">
            ${slidesHtml}
          </div>
        </div>
      </div>
    </main>
    <script nonce="${security.nonce}">${makeMotionDocExportRuntime()}</script>
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
        icon ? `<div class="block-card__icon">${renderLucideIconSvg(icon)}</div>` : ""
      }<div class="block-card__content"><h3>${escapeHtml(String(block.props.title ?? "Card"))}</h3><p>${escapeHtml(String(block.props.text ?? ""))}</p></div></article>`
    );
  }

  if (block.type === "ImageBlock") {
    const fit = fitProp(block.props.fit);
    const imageCropX = clampExportImageCropPosition(optionalNumberProp(block.props.cropX));
    const imageCropY = clampExportImageCropPosition(optionalNumberProp(block.props.cropY));
    const imageScaleX = clampExportImageScale(optionalNumberProp(block.props.scaleX));
    const imageScaleY = clampExportImageScale(optionalNumberProp(block.props.scaleY));
    const imageTransform = `translate(${imageCropX}%, ${imageCropY}%) scale(${imageScaleX}, ${imageScaleY})`;
    const hasImageCropTransform = imageCropX !== 0 || imageCropY !== 0 || imageScaleX !== 1 || imageScaleY !== 1;
    const imageScaleStyle = {
      "object-fit": fit,
      "transform": imageTransform,
      "transform-origin": "center"
    };
    const filterDefinition = getPaperImageFilterDefinition(stringProp(block.props.filter));
    const needsExactImageRaster = Boolean(filterDefinition) || hasImageCropTransform;
    const exactRasterAttr = needsExactImageRaster ? ` data-exact-image-raster="true"` : "";

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
      const cropFilterClass = hasImageCropTransform ? " block-image__crop-filter" : "";
      const filterStyle = hasImageCropTransform
        ? inlineCss({
            "height": "100%",
            "left": "50%",
            "position": "absolute",
            "top": "50%",
            "transform": "translate(-50%, -50%)",
            "width": "100%"
          })
        : inlineCss({
            "height": "100%",
            "inset": "0",
            "object-fit": fit,
            "position": "absolute",
            "transform": imageTransform,
            "transform-origin": "center",
            "width": "100%"
          });
      const filterCanvas = `<canvas class="image-filter-canvas${cropFilterClass}" data-shader="${escapeAttribute(filterDefinition.id)}"${fPresetAttr}${fFitAttr}${fDistortionAttr}${fSizeAttr}${fAngleAttr}${fContrastAttr}${fSpeedAttr}${fDetailAttr} style="${escapeAttribute(filterStyle)}" data-shader-image="${escapeAttribute(String(block.props.src ?? ""))}"></canvas>`;
      const filteredImageContent = hasImageCropTransform
        ? renderCroppedImageMedia(
            String(block.props.src ?? ""),
            String(block.props.alt ?? ""),
            fit,
            imageCropX,
            imageCropY,
            imageScaleX,
            imageScaleY,
            filterCanvas
          )
        : `<img src="${escapeAttribute(String(block.props.src ?? ""))}" alt="${escapeAttribute(String(block.props.alt ?? ""))}" style="${escapeAttribute(inlineCss(imageScaleStyle))}" />${filterCanvas}`;

      return renderMotionBlock(
        block,
        `<figure class="block-image"${exactRasterAttr}>${filteredImageContent}</figure>`
      );
    }

    const imageContent = hasImageCropTransform
      ? renderCroppedImageMedia(
          String(block.props.src ?? ""),
          String(block.props.alt ?? ""),
          fit,
          imageCropX,
          imageCropY,
          imageScaleX,
          imageScaleY
        )
      : `<img src="${escapeAttribute(String(block.props.src ?? ""))}" alt="${escapeAttribute(String(block.props.alt ?? ""))}" style="${escapeAttribute(inlineCss(imageScaleStyle))}" />`;

    return renderMotionBlock(
      block,
      `<figure class="block-image"${exactRasterAttr}>${imageContent}</figure>`
    );
  }

  if (block.type === "VideoBlock") {
    const fit = fitProp(block.props.fit);
    const poster = stringProp(block.props.poster);
    const src = stringProp(block.props.src);

    if (options.rasterMode) {
      return renderMotionBlock(
        block,
        `<figure class="block-image block-video">${poster ? `<img src="${escapeAttribute(poster)}" alt="" style="${escapeAttribute(inlineCss({ "object-fit": fit }))}" />` : ""}</figure>`
      );
    }

    if (!src) {
      return renderMotionBlock(
        block,
        `<figure class="block-image block-video">${poster ? `<img src="${escapeAttribute(poster)}" alt="" style="${escapeAttribute(inlineCss({ "object-fit": fit }))}" />` : ""}</figure>`
      );
    }

    const controlsEnabled = boolProp(block.props.controls, true);
    const loopEnabled = boolProp(block.props.loop, true);
    const mutedEnabled = boolProp(block.props.muted, true);
    const youtubeSrc = youtubeEmbedUrl(src, {
      autoplay: mutedEnabled,
      controls: controlsEnabled,
      loop: loopEnabled,
      muted: mutedEnabled
    });

    if (youtubeSrc) {
      return renderMotionBlock(
        block,
        `<figure class="block-image block-video"><iframe src="${escapeAttribute(youtubeSrc)}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" allowfullscreen></iframe></figure>`
      );
    }

    const controls = controlsEnabled ? " controls" : "";
    const loop = loopEnabled ? " loop" : "";
    const muted = mutedEnabled ? " muted autoplay playsinline" : "";
    const posterAttr = poster ? ` poster="${escapeAttribute(poster)}"` : "";

    return renderMotionBlock(
      block,
      `<figure class="block-image block-video"><video src="${escapeAttribute(src)}"${posterAttr}${controls}${loop}${muted} style="${escapeAttribute(inlineCss({ "object-fit": fit }))}"></video></figure>`
    );
  }

  if (block.type === "Metric") {
    const metricWidthClass = metricWidthClassName(block.props.width);

    return renderMotionBlock(
      block,
      `<article class="block-metric${metricWidthClass}"><p class="block-metric__label">${escapeHtml(String(block.props.label ?? "Metric"))}</p><p class="block-metric__value">${escapeHtml(String(block.props.value ?? "0"))}</p><p class="block-metric__caption">${escapeHtml(String(block.props.caption ?? ""))}</p></article>`
    );
  }

  if (block.type === "Icon") {
    const strokeWidth = numberProp(block.props.strokeWidth, 2);
    return renderMotionBlock(
      block,
      `<div class="block-icon">${renderLucideIconSvg(String(block.props.icon ?? "Sparkles"), { strokeWidth })}</div>`
    );
  }

  if (block.type === "Shape") {
    return renderMotionBlock(
      block,
      `<div class="block-shape">${renderShapeSvg(block.props, blockIndex)}</div>`
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

function renderCroppedImageMedia(
  source: string,
  alt: string,
  fit: string,
  cropX: number,
  cropY: number,
  scaleX: number,
  scaleY: number,
  overlay = ""
) {
  return `<div class="block-image__crop-media" data-image-crop-x="${cropX}" data-image-crop-y="${cropY}" data-image-fit="${escapeAttribute(fit)}" data-image-layout-ready="false" data-image-scale-x="${scaleX}" data-image-scale-y="${scaleY}" style="${escapeAttribute(inlineCss({
    "transform": `translate(${cropX}%, ${cropY}%) scale(${scaleX}, ${scaleY})`,
    "transform-origin": "center"
  }))}"><img class="block-image__crop-image" src="${escapeAttribute(source)}" alt="${escapeAttribute(alt)}" />${overlay}</div>`;
}

function renderTableBlock(props: MotionDocProps) {
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

function tableCellBackground(props: MotionDocProps, rowIndex: number) {
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

function flexAlignVars(props: MotionDocProps): Record<string, string> {
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

function isPositionedProps(props: MotionDocProps) {
  return Number.isFinite(Number(props.x)) || Number.isFinite(Number(props.y));
}

function positionVars(props: MotionDocProps): Record<string, string> {
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

function fontSizeVars(props: MotionDocProps): Record<string, string> {
  const fontSize = numberProp(props.fontSize, 0);

  if (fontSize <= 0) {
    return {};
  }

  return {
    "--motion-font-size": `${fontSize}px`
  };
}

function textStyleVars(props: MotionDocProps): Record<string, string> {
  const fontWeight = props.fontWeight;
  const lineHeight = props.lineHeight;

  return {
    ...(fontWeight === undefined || fontWeight === "" ? {} : { "--motion-font-weight": String(fontWeight) }),
    ...(lineHeight === undefined || lineHeight === "" ? {} : { "--motion-line-height": String(lineHeight) })
  };
}

function radiusVars(props: MotionDocProps): Record<string, string> {
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

function colorVars(props: MotionDocProps): Record<string, string> {
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

function textAlignVars(props: MotionDocProps): Record<string, string> {
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
  return Math.min(Math.max(value ?? 1, 0.1), 8);
}

function clampExportImageCropPosition(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value ?? 0, -350), 350);
}

function cssImageUrl(value: string) {
  return `url("${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;
}

function renderShapeSvg(props: MotionDocProps, blockIndex: number) {
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
  const geometry = endpoint === "circle"
    ? `<circle cx="10" cy="10" fill="${escapeAttribute(color)}" r="9"/>`
    : endpoint === "bar"
      ? `<path d="M10 1V19" fill="none" stroke="${escapeAttribute(color)}" stroke-linecap="round" stroke-width="3" vector-effect="non-scaling-stroke"/>`
      : `<path d="${side === "start" ? "M19 1L1 10 19 19Z" : "M1 1L19 10 1 19Z"}" fill="${escapeAttribute(color)}"/>`;
  const width = endpoint === "bar" ? 4 * scale : endpoint === "circle" ? 10 * scale : 11 * scale;
  const height = endpoint === "bar" ? 16 * scale : endpoint === "circle" ? 10 * scale : 12 * scale;
  return `<svg aria-hidden="true" class="shape-line-vector-endpoint shape-line-vector-endpoint--${side}" preserveAspectRatio="none" viewBox="0 0 20 20" style="${escapeAttribute(inlineCss({ height: `${height}px`, width: `${width}px` }))}">${geometry}</svg>`;
}

function shapeSvg(shape: string, fill: string, stroke: string, strokeWidth: number, sides: number, points: number, lineStyle: string, arrowStart: string, arrowEnd: string, radius: number) {
  if (shape === "circle") {
    return `<circle cx="50" cy="50" fill="${escapeAttribute(fill)}" r="48" stroke="${escapeAttribute(stroke)}" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" />`;
  }

  if (shape === "triangle" || shape === "polygon") {
    return `<path d="${escapeAttribute(generatePolygonPath(shape === "triangle" ? 3 : sides))}" fill="${escapeAttribute(fill)}" stroke="${escapeAttribute(stroke)}" stroke-linejoin="round" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" />`;
  }

  if (shape === "line") {
    const resolvedStroke = escapeAttribute(stroke === "transparent" ? "#e5e7eb" : stroke);
    const dash = lineStyle === "dashed" ? ` stroke-dasharray="8 6"` : lineStyle === "dotted" ? ` stroke-dasharray="1 6"` : "";
    const isPlainLine = arrowStart === "none" && arrowEnd === "none";
    return `<g stroke="${resolvedStroke}" stroke-linecap="${isPlainLine && lineStyle === "solid" ? "butt" : "round"}" stroke-linejoin="round" stroke-width="${strokeWidth}"><path d="M0 10H100" fill="none"${dash} vector-effect="non-scaling-stroke" /></g>`;
  }

  if (shape === "arrow") {
    const arrowStroke = escapeAttribute(stroke === "transparent" ? fill : stroke);
    return `<path d="M2 22H58V2L98 50 58 98V78H2Z" fill="${escapeAttribute(fill)}" stroke="${arrowStroke}" stroke-linejoin="round" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" />`;
  }

  if (shape === "star") {
    return `<path d="${escapeAttribute(generateStarPath(points))}" fill="${escapeAttribute(fill)}" stroke="${escapeAttribute(stroke)}" stroke-linejoin="round" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" />`;
  }

  const customPaths: Record<string, string> = {
    chevron: "M1 1H68L99 50 68 99H1L32 50Z",
    corner: "M1 1H72L99 28V99H1Z",
    diamond: "M50 1L99 50 50 99 1 50Z",
    hexagon: "M20 1H80L99 50 80 99H20L1 50Z",
    parallelogram: "M24 1H99L76 99H1Z"
  };
  if (customPaths[shape]) return `<path d="${customPaths[shape]}" fill="${escapeAttribute(fill)}" stroke="${escapeAttribute(stroke)}" stroke-linejoin="round" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" />`;

  return `<rect fill="${escapeAttribute(fill)}" height="100" rx="${radius}" stroke="${escapeAttribute(stroke)}" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" width="100" x="0" y="0" />`;
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
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "slidex-deck";
}
