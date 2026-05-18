import { parseMotionDoc, type MotionDocBlock } from "@/lib/motionDocParser";
import { isSlideXIconName, lucideIconPaths } from "@/lib/lucideIconRegistry";
import { motionDocExportRuntime } from "@/lib/motionDocExportRuntime";
import { motionDocExportStyles } from "@/lib/motionDocExportStyles";

export function buildMotionDocHtml(source: string) {
  const document = parseMotionDoc(source);
  const slidesHtml = document.scenes
    .map((scene, index) => renderSceneHtml(scene.blocks, scene.props, scene.duration, index, document.scenes.length))
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
          ${slidesHtml}
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
  blocks: MotionDocBlock[],
  props: Record<string, string | number>,
  duration: number,
  index: number,
  total: number
) {
  const theme = typeof props.theme === "string" ? props.theme : "dark";
  const isLight = theme === "light" || theme === "paper";
  const layout = props.layout === "split-left" || props.layout === "split-right" ? props.layout : "default";
  const background =
    typeof props.background === "string"
      ? props.background
      : isLight
        ? "#ffffff"
        : "#050505";
  const accent = typeof props.accent === "string" ? props.accent : isLight ? "#111111" : "#ffffff";
  const borderColor = isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.12)";
  const cardBackground = isLight ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.075)";
  const foreground = isLight ? "#111827" : "#ffffff";
  const muted = isLight ? "#475569" : "#cbd5e1";
  const hasPositionedBlocks = blocks.some((block) => "props" in block && isPositionedProps(block.props));
  const imageBlocks = blocks.filter((block) => block.type === "ImageBlock");
  const contentBlocks = blocks.filter((block) => block.type !== "ImageBlock");
  const shouldSplit = !hasPositionedBlocks && layout !== "default" && imageBlocks.length > 0;
  const textOrder = layout === "split-left" ? 1 : 2;
  const imageOrder = layout === "split-left" ? 2 : 1;
  const alignX = props.alignX === "center" || props.alignX === "right" || props.alignX === "stretch" ? props.alignX : "left";
  const alignY = props.alignY === "top" || props.alignY === "bottom" ? props.alignY : "center";
  const textAlign = props.textAlign === "center" || props.textAlign === "right" ? props.textAlign : "left";

  return `<section class="slide${hasPositionedBlocks ? " slide--freeform" : ""}" data-duration="${Math.max(duration, 1)}" style="${escapeAttribute(inlineCss({
    "--slide-accent": accent,
    "--slide-align-x": shouldSplit ? "stretch" : alignXToFlex(alignX),
    "--slide-align-y": alignYToFlex(alignY),
    "--slide-bg": background,
    "--slide-border": borderColor,
    "--slide-card": cardBackground,
    "--slide-direction": shouldSplit ? "row" : "column",
    "--slide-fg": foreground,
    "--slide-gap": shouldSplit ? "48px" : "20px",
    "--slide-muted": muted,
    "--slide-text-align": textAlign
  }))}">
    <div class="slide-meta">Slide ${index + 1} / ${total}</div>
    <div class="slide__content">
      ${
        shouldSplit
          ? `<div class="slide__column" style="${escapeAttribute(inlineCss({ order: String(textOrder) }))}">${renderBlocks(contentBlocks, cardFlowProp(props.cardFlow), cardFlowProp(props.metricFlow ?? props.cardFlow))}</div>
             <div class="slide__image-column" style="${escapeAttribute(inlineCss({ order: String(imageOrder) }))}">${renderBlocks(imageBlocks, "stack")}</div>`
          : renderBlocks(blocks, cardFlowProp(props.cardFlow), cardFlowProp(props.metricFlow ?? props.cardFlow))
      }
    </div>
  </section>`;
}

function renderBlocks(blocks: MotionDocBlock[], cardFlow: "stack" | "row" | "grid", metricFlow: "stack" | "row" | "grid" = "stack") {
  const rendered: string[] = [];
  const flowBlocks = blocks.filter((block) => !("props" in block) || !isPositionedProps(block.props));
  const positionedBlocks = blocks.filter((block) => "props" in block && isPositionedProps(block.props));
  let index = 0;

  while (index < flowBlocks.length) {
    const block = flowBlocks[index];
    const flowType = flowBlockType(block);
    const flow = flowType === "Card" ? cardFlow : flowType === "Metric" ? metricFlow : "stack";

    if (flowType && flow !== "stack") {
      const cards: string[] = [];
      let cursor = index;

      while (cursor < flowBlocks.length && flowBlocks[cursor].type === flowType) {
        cards.push(renderBlock(flowBlocks[cursor]));
        cursor += 1;
      }

      rendered.push(
        `<div class="card-group card-group--${flow}">${cards
          .map((card) => `<div class="card-group__item">${card}</div>`)
          .join("")}</div>`
      );
      index = cursor;
      continue;
    }

    rendered.push(renderBlock(block));
    index += 1;
  }

  for (const block of positionedBlocks) {
    rendered.push(renderBlock(block));
  }

  return rendered.join("");
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

function flowBlockType(block: MotionDocBlock) {
  if (block.type === "Card" || block.type === "Metric") {
    return block.type;
  }

  return null;
}

function renderMotionBlock(block: MotionDocBlock, content: string) {
  const props = "props" in block ? block.props : {};
  const enter = animationClass(props.enter);
  const delay = numberProp(props.delay, 0);
  const duration = numberProp(props.duration, 0.6);
  const marginBottom = spacingProp(props.marginBottom ?? props.mb);
  const fullClass = props.full === "true" || props.full === 1 ? " motion-block--full" : "";
  const positionClass = isPositionedProps(props) ? " motion-block--positioned" : "";

  return `<div class="motion-block ${enter}${fullClass}${positionClass}" style="${escapeAttribute(inlineCss({
    "--motion-delay": `${delay}s`,
    "--motion-duration": `${duration}s`,
    "--motion-mb": marginBottom,
    ...fontSizeVars(props),
    ...positionVars(props)
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

function spacingProp(value: string | number | undefined) {
  if (typeof value === "number") return `${value}px`;
  if (typeof value === "string" && value.trim() !== "") return value;

  return "18px";
}

function isPositionedProps(props: Record<string, string | number>) {
  return Number.isFinite(Number(props.x)) || Number.isFinite(Number(props.y));
}

function positionVars(props: Record<string, string | number>): Record<string, string> {
  if (!isPositionedProps(props)) {
    return {};
  }

  return {
    "--motion-h": `${percentProp(props.h, 18)}%`,
    "--motion-x": `${percentProp(props.x, 8)}%`,
    "--motion-y": `${percentProp(props.y, 12)}%`,
    "--motion-w": `${percentProp(props.w, 42)}%`
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

function percentProp(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 0), 100);
}

function chartValues(value: string) {
  const values = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item >= 0);

  return values.length > 0 ? values : [24, 42, 68, 54];
}

function cardFlowProp(value: string | number | undefined): "stack" | "row" | "grid" {
  if (value === "row" || value === "grid") {
    return value;
  }

  return "stack";
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

function alignXToFlex(value: string) {
  if (value === "center") return "center";
  if (value === "right") return "flex-end";
  if (value === "stretch") return "stretch";

  return "flex-start";
}

function alignYToFlex(value: string) {
  if (value === "top") return "flex-start";
  if (value === "bottom") return "flex-end";

  return "center";
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
