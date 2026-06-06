import type { BusinessTemplateConfig, MotionTemplate } from "@/core/motion-doc/presets/templates/templateTypes";

function getCoverSlideOptions(templateId: string) {
  const options = {
    shader: "aurora",
    shaderIntensity: 0.55,
    shaderColor1: "#ffffff",
    shaderColor2: "#030303",
    shaderColor3: "#27272a",
    textColor: "#ffffff"
  };

  if (templateId === "revenue-command") {
    options.shaderColor1 = "#72a7ff";
    options.shaderColor2 = "#07111f";
    options.shaderColor3 = "#0b2347";
    options.textColor = "#ffffff";
    options.shaderIntensity = 0.6;
  } else if (templateId === "investor-update") {
    options.shaderColor1 = "#7a4f24";
    options.shaderColor2 = "#fff8ef";
    options.shaderColor3 = "#efe5d7";
    options.textColor = "#1a120b";
    options.shaderIntensity = 0.5;
  } else if (templateId === "product-launch-board") {
    options.shaderColor1 = "#7dd3a8";
    options.shaderColor2 = "#07120f";
    options.shaderColor3 = "#0b271f";
    options.textColor = "#ffffff";
    options.shaderIntensity = 0.6;
  } else if (templateId === "customer-success-qbr") {
    options.shaderColor1 = "#145c49";
    options.shaderColor2 = "#f6faf8";
    options.shaderColor3 = "#c8d8d2";
    options.textColor = "#08241c";
    options.shaderIntensity = 0.55;
  } else if (templateId === "saas-operating-review") {
    options.shaderColor1 = "#7dd3fc";
    options.shaderColor2 = "#081018";
    options.shaderColor3 = "#1e3b50";
    options.textColor = "#ffffff";
    options.shaderIntensity = 0.6;
  } else if (templateId === "market-entry-strategy") {
    options.shaderColor1 = "#183b68";
    options.shaderColor2 = "#f7fbff";
    options.shaderColor3 = "#c3d5eb";
    options.textColor = "#0a1c33";
    options.shaderIntensity = 0.5;
  } else if (templateId === "brand-partnership-pitch") {
    options.shaderColor1 = "#f0a6ca";
    options.shaderColor2 = "#120815";
    options.shaderColor3 = "#3d203f";
    options.textColor = "#ffffff";
    options.shaderIntensity = 0.65;
  } else if (templateId === "digital-transformation-roadmap") {
    options.shaderColor1 = "#3157ff";
    options.shaderColor2 = "#f8faff";
    options.shaderColor3 = "#cbd6f3";
    options.textColor = "#050a24";
    options.shaderIntensity = 0.55;
  }

  return options;
}

export function createBusinessTemplate(config: BusinessTemplateConfig): MotionTemplate {
  const theme = config.theme;
  const mutedBackground = config.mutedBackground;
  const deepBackground = config.surfaceBackground;
  const coverOptions = getCoverSlideOptions(config.id);

  return {
    id: config.id,
    name: config.name,
    category: config.category,
    duration: "60s",
    description: config.description,
    useCase: config.useCase,
    source: `# ${escapeText(config.name)}

${slide(theme, config.background, config.accent, [
  text(config.hero, { fontSize: 78, fontWeight: 800, h: 24, w: 84, x: 8, y: 20 }),
  text(config.subtitle, { fontSize: 22, lineHeight: 1.5, h: 20, w: 64, x: 8, y: 50 })
], coverOptions)}

${slide(theme, mutedBackground, config.accent, [
  text("Executive snapshot", { enter: "slideLeft", fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  metric(config.metrics[0], { h: 36, w: 26, x: 8, y: 32 }),
  metric(config.metrics[1], { h: 36, w: 26, x: 37, y: 32 }),
  metric(config.metrics[2], { h: 36, w: 26, x: 66, y: 32 })
])}

${slide(theme, deepBackground, config.accent, [
  text("Strategic thesis", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  card({ ...config.thesis[0], layout: "vertical" }, { h: 42, w: 40, x: 8, y: 32 }),
  card({ ...config.thesis[1], layout: "vertical" }, { h: 42, w: 40, x: 50, y: 32 })
])}

${slide(theme, mutedBackground, config.accent, [
  text("Momentum signal", { enter: "slideLeft", fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  chart(config.chart, { h: 52, w: 84, x: 8, y: 30, height: 180 })
])}

${slide(theme, deepBackground, config.accent, [
  text("Customer evidence", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  card({ ...config.evidence[0], layout: "vertical" }, { h: 40, w: 40, x: 8, y: 32 }),
  card({ ...config.evidence[1], layout: "vertical" }, { h: 40, w: 40, x: 50, y: 32 })
])}

${slide(theme, mutedBackground, config.accent, [
  text("Strategic response", { enter: "slideLeft", fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  card({ ...config.strategy[0], layout: "vertical" }, { h: 44, w: 26, x: 8, y: 32 }),
  card({ ...config.strategy[1], layout: "vertical" }, { h: 44, w: 26, x: 37, y: 32 }),
  card({ ...config.strategy[2], layout: "vertical" }, { h: 44, w: 26, x: 66, y: 32 })
])}

${slide(theme, deepBackground, config.accent, [
  image(config.image, { h: 60, w: 42, x: 8, y: 20 }),
  text(config.proofText, { fontSize: 24, lineHeight: 1.5, h: 52, w: 36, x: 56, y: 24 })
])}

${slide(theme, mutedBackground, config.accent, [
  text("Economic impact", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  metric(config.economics[0], { h: 40, w: 40, x: 8, y: 32 }),
  metric(config.economics[1], { h: 40, w: 40, x: 50, y: 32 })
])}

${slide(theme, deepBackground, config.accent, [
  text("Operating readiness", { enter: "slideLeft", fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  chart({ ...config.chart, title: "Readiness by function" }, { h: 52, w: 84, x: 8, y: 30, height: 180 })
])}

${slide(theme, mutedBackground, config.accent, [
  text("Risks and controls", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  card({ ...config.risks[0], layout: "vertical" }, { h: 42, w: 40, x: 8, y: 32 }),
  card({ ...config.risks[1], layout: "vertical" }, { h: 42, w: 40, x: 50, y: 32 })
])}

${slide(theme, deepBackground, config.accent, [
  text("Execution plan", { enter: "slideLeft", fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  card({ icon: "Calendar", ...config.plan[0], layout: "vertical" }, { h: 44, w: 26, x: 8, y: 32 }),
  card({ icon: "Settings", ...config.plan[1], layout: "vertical" }, { h: 44, w: 26, x: 37, y: 32 }),
  card({ icon: "ArrowUpRight", ...config.plan[2], layout: "vertical" }, { h: 44, w: 26, x: 66, y: 32 })
])}

${slide(theme, config.background, config.accent, [
  text("Decision requested", { enter: "zoomIn", fontSize: 72, fontWeight: 800, h: 20, w: 80, x: 10, y: 24, textAlign: "center" }),
  text("Approve the focused plan, validate the operating impact, and scale the system through the next executive review cycle.", { fontSize: 24, lineHeight: 1.6, h: 24, w: 70, x: 15, y: 52, textAlign: "center" })
])}`
  };
}

type SlideOptions = {
  shader?: string;
  shaderIntensity?: number;
  shaderColor1?: string;
  shaderColor2?: string;
  shaderColor3?: string;
  textColor?: string;
};

function slide(
  theme: string,
  background: string,
  accent: string,
  blocks: string[],
  options: SlideOptions = {}
) {
  const shaderAttr = options.shader ? ` shader="${options.shader}"` : "";
  const intensityAttr = options.shaderIntensity !== undefined ? ` shaderIntensity={${options.shaderIntensity}}` : "";
  const c1Attr = options.shaderColor1 ? ` shaderColor1="${options.shaderColor1}"` : "";
  const c2Attr = options.shaderColor2 ? ` shaderColor2="${options.shaderColor2}"` : "";
  const c3Attr = options.shaderColor3 ? ` shaderColor3="${options.shaderColor3}"` : "";
  const textAttr = options.textColor ? ` textColor="${options.textColor}"` : "";

  return `<Slide duration={5} theme="${theme}" background="${background}" accent="${accent}"${shaderAttr}${intensityAttr}${c1Attr}${c2Attr}${c3Attr}${textAttr}>
${blocks.map((block) => `  ${block}`).join("\n")}
</Slide>`;
}

function text(value: string, frame: Partial<Frame> & { fontWeight?: number; textAlign?: string; lineHeight?: number } = {}) {
  const next = { fontSize: 24, h: 16, w: 52, x: 8, y: 38, ...frame };
  const fontAttr = frame.fontWeight ? ` fontWeight={${frame.fontWeight}}` : "";
  const lineAttr = frame.lineHeight ? ` lineHeight={${frame.lineHeight}}` : "";
  const alignAttr = frame.textAlign ? ` textAlign="${frame.textAlign}"` : "";
  return `<Text enter="${frame.enter ?? "fadeUp"}" delay={${frame.delay ?? 0.2}} fontSize={${next.fontSize}}${fontAttr}${lineAttr}${alignAttr} radius={0} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}}>${escapeText(value)}</Text>`;
}

function icon(name: string, frame: Partial<Frame> & { size?: number, strokeWidth?: number } = {}) {
  const next = { h: 8, w: 5, x: 8, y: 38, ...frame };
  const sizeAttr = ` size={${frame.size ?? 42}}`;
  const strokeAttr = ` strokeWidth={${frame.strokeWidth ?? 1.5}}`;
  return `<Icon icon="${attr(name)}" enter="zoomIn" delay={0.16} radius={0}${sizeAttr}${strokeAttr} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

function card(item: { icon?: string; layout?: string; text: string; title: string }, frame: Partial<Frame> = {}) {
  const isVertical = item.layout !== "horizontal";
  const x = frame.x ?? 8;
  const y = frame.y ?? 38;
  const w = frame.w ?? 40;
  const contentWidth = Math.max(14, isVertical ? w : w - 9);
  const contentX = isVertical ? x : x + 9;
  const titleY = isVertical ? y + 12 : y;
  const textY = isVertical ? y + 24 : y + 12;
  
  return [
    icon(item.icon ?? "Sparkles", { x, y, w: 5, h: 8, size: 42 }),
    text(item.title, { fontSize: 24, fontWeight: 700, x: contentX, y: titleY, w: contentWidth, h: 8 }),
    text(item.text, { fontSize: 18, lineHeight: 1.5, x: contentX, y: textY, w: contentWidth, h: 18 })
  ].join("\n  ");
}

function metric(item: { caption: string; label: string; value: string }, frame: Partial<Frame> = {}) {
  const x = frame.x ?? 8;
  const y = frame.y ?? 38;
  const w = frame.w ?? 32;

  return [
    text(item.value, { fontSize: 64, fontWeight: 800, x, y, w, h: 14 }),
    text(item.label, { fontSize: 20, fontWeight: 600, x, y: y + 18, w, h: 8 }),
    text(item.caption, { fontSize: 16, lineHeight: 1.4, x, y: y + 30, w, h: 14 })
  ].join("\n  ");
}

function chart(item: { labels: string; title: string; values: string }, frame: Partial<Frame> & { height?: number } = {}) {
  const next = { h: 42, w: 76, x: 10, y: 34, ...frame };
  const hVal = frame.height ?? 144;
  return `<Chart title="${attr(item.title)}" labels="${attr(item.labels)}" values="${attr(item.values)}" width="full" height={${hVal}} enter="fadeUp" delay={0.18} radius={24} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

function image(item: { alt: string; src: string }, frame: Partial<Frame> = {}) {
  const next = { h: 42, w: 40, x: 8, y: 32, ...frame };
  return `<ImageBlock fit="cover" src="${attr(item.src)}" alt="${attr(item.alt)}" enter="fadeIn" delay={0.1} radius={24} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

type Frame = {
  enter?: "fadeUp" | "zoomIn" | "slideLeft" | "fadeIn";
  delay?: number;
  fontSize?: number;
  h: number;
  w: number;
  x?: number;
  y?: number;
};

function attr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
