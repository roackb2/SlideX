import type { BusinessTemplateConfig, MotionTemplate } from "@/core/motion-doc/presets/templates/templateTypes";

function getCoverSlideOptions(templateId: string) {
  const options = {
    shader: "mesh-gradient",
    shaderPreset: "Default",
    shaderIntensity: 0.55,
    shaderColor1: "#ffffff",
    shaderColor2: "#030303",
    shaderColor3: "#27272a",
    shaderColor4: "#52525b",
    shaderColor5: "#09090b",
    shaderColor6: "#a1a1aa",
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
  text(config.hero, { fontSize: 84, fontWeight: 800, h: 28, w: 90, x: 5, y: 18, textAlign: "center", enter: "zoomIn" }),
  text(config.subtitle, { fontSize: 24, lineHeight: 1.6, h: 22, w: 70, x: 15, y: 56, textAlign: "center", delay: 0.2 })
], coverOptions)}

${slide(theme, mutedBackground, config.accent, [
  text("Executive snapshot", { enter: "slideLeft", fontSize: 58, fontWeight: 700, h: 16, w: 86, x: 7, y: 12 }),
  metric(config.metrics[0], { h: 42, w: 27, x: 7, y: 36 }),
  metric(config.metrics[1], { h: 42, w: 27, x: 36.5, y: 36, delay: 0.25 }),
  metric(config.metrics[2], { h: 42, w: 27, x: 66, y: 36, delay: 0.3 })
])}

${slide(theme, deepBackground, config.accent, [
  text("Strategic thesis", { fontSize: 58, fontWeight: 700, h: 16, w: 86, x: 7, y: 12 }),
  card({ ...config.thesis[0], layout: "horizontal" }, { h: 28, w: 86, x: 7, y: 34 }),
  card({ ...config.thesis[1], layout: "horizontal" }, { h: 28, w: 86, x: 7, y: 64, delay: 0.25 })
])}

${slide(theme, mutedBackground, config.accent, [
  text("Momentum & Evidence", { enter: "slideLeft", fontSize: 58, fontWeight: 700, h: 16, w: 86, x: 7, y: 12 }),
  chart(config.chart, { h: 56, w: 86, x: 7, y: 34, height: 210 })
])}

${slide(theme, deepBackground, config.accent, [
  image(config.image, { h: 64, w: 46, x: 7, y: 18 }),
  text(config.proofText, { fontSize: 28, lineHeight: 1.6, h: 52, w: 36, x: 57, y: 26, enter: "fadeUp", delay: 0.2 })
])}

${slide(theme, mutedBackground, config.accent, [
  text("Operating strategy", { enter: "slideLeft", fontSize: 58, fontWeight: 700, h: 16, w: 86, x: 7, y: 12 }),
  card({ ...config.strategy[0], layout: "vertical" }, { h: 50, w: 27, x: 7, y: 34 }),
  card({ ...config.strategy[1], layout: "vertical" }, { h: 50, w: 27, x: 36.5, y: 34, delay: 0.25 }),
  card({ ...config.strategy[2], layout: "vertical" }, { h: 50, w: 27, x: 66, y: 34, delay: 0.3 })
])}

${slide(theme, deepBackground, config.accent, [
  text("Execution timeline", { enter: "slideLeft", fontSize: 58, fontWeight: 700, h: 16, w: 86, x: 7, y: 12 }),
  card({ icon: "CalendarClock", ...config.plan[0], layout: "horizontal" }, { h: 22, w: 86, x: 7, y: 30 }),
  card({ icon: "Settings", ...config.plan[1], layout: "horizontal" }, { h: 22, w: 86, x: 7, y: 54, delay: 0.25 }),
  card({ icon: "CheckCircle", ...config.plan[2], layout: "horizontal" }, { h: 22, w: 86, x: 7, y: 78, delay: 0.3 })
])}

${slide(theme, config.background, config.accent, [
  text("Decision requested", { enter: "zoomIn", fontSize: 80, fontWeight: 800, h: 22, w: 80, x: 10, y: 28, textAlign: "center" }),
  text("Approve the focused plan, validate the operating impact, and scale the system through the next executive review cycle.", { fontSize: 26, lineHeight: 1.6, h: 24, w: 74, x: 13, y: 56, textAlign: "center", delay: 0.2 })
])}`
  };
}

type SlideOptions = {
  shader?: string;
  shaderPreset?: string;
  shaderIntensity?: number;
  shaderColor1?: string;
  shaderColor2?: string;
  shaderColor3?: string;
  shaderColor4?: string;
  shaderColor5?: string;
  shaderColor6?: string;
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
  const shaderPresetAttr = options.shaderPreset ? ` shaderPreset="${options.shaderPreset}"` : "";
  const intensityAttr = options.shaderIntensity !== undefined ? ` shaderIntensity={${options.shaderIntensity}}` : "";
  const c1Attr = options.shaderColor1 ? ` shaderColor1="${options.shaderColor1}"` : "";
  const c2Attr = options.shaderColor2 ? ` shaderColor2="${options.shaderColor2}"` : "";
  const c3Attr = options.shaderColor3 ? ` shaderColor3="${options.shaderColor3}"` : "";
  const c4Attr = options.shaderColor4 ? ` shaderColor4="${options.shaderColor4}"` : "";
  const c5Attr = options.shaderColor5 ? ` shaderColor5="${options.shaderColor5}"` : "";
  const c6Attr = options.shaderColor6 ? ` shaderColor6="${options.shaderColor6}"` : "";
  const textAttr = options.textColor ? ` textColor="${options.textColor}"` : "";

  return `<Slide duration={5} theme="${theme}" background="${background}" accent="${accent}"${shaderAttr}${shaderPresetAttr}${intensityAttr}${c1Attr}${c2Attr}${c3Attr}${c4Attr}${c5Attr}${c6Attr}${textAttr}>
${blocks.map((block) => `  ${block}`).join("\n")}
</Slide>`;
}

function text(value: string, frame: Partial<Frame> & { fontWeight?: number; textAlign?: string; lineHeight?: number } = {}) {
  const next = { fontSize: 24, h: 16, w: 52, x: 8, y: 38, ...frame };
  const fontAttr = frame.fontWeight ? ` fontWeight={${frame.fontWeight}}` : "";
  const lineAttr = frame.lineHeight ? ` lineHeight={${frame.lineHeight}}` : "";
  const alignAttr = frame.textAlign ? ` textAlign="${frame.textAlign}"` : "";
  return `<Text enter="${frame.enter ?? "fadeUp"}" delay={${frame.delay ?? 0.2}} fontSize={${next.fontSize}}${fontAttr}${lineAttr}${alignAttr} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}}>${escapeText(value)}</Text>`;
}

function icon(name: string, frame: Partial<Frame> & { size?: number, strokeWidth?: number } = {}) {
  const next = { h: 8, w: 5, x: 8, y: 38, ...frame };
  const sizeAttr = ` size={${frame.size ?? 48}}`;
  const strokeAttr = ` strokeWidth={${frame.strokeWidth ?? 1.5}}`;
  return `<Icon icon="${attr(name)}" enter="zoomIn" delay={${frame.delay ?? 0.15}} radius={0}${sizeAttr}${strokeAttr} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

function card(item: { icon?: string; layout?: string; text: string; title: string }, frame: Partial<Frame> = {}) {
  const isVertical = item.layout !== "horizontal";
  const delay = frame.delay ?? 0.2;
  const x = frame.x ?? 7;
  const y = frame.y ?? 34;
  const w = frame.w ?? 40;
  
  if (isVertical) {
    return [
      icon(item.icon ?? "Sparkles", { x, y, w: 6, h: 10, size: 48, delay: delay - 0.05 }),
      text(item.title, { fontSize: 26, fontWeight: 700, x, y: y + 14, w, h: 10, delay }),
      text(item.text, { fontSize: 18, lineHeight: 1.6, x, y: y + 26, w, h: 22, delay: delay + 0.05 })
    ].join("\n  ");
  } else {
    // Horizontal layout
    return [
      icon(item.icon ?? "Sparkles", { x, y, w: 6, h: 10, size: 48, delay: delay - 0.05 }),
      text(item.title, { fontSize: 26, fontWeight: 700, x: x + 8, y, w: w - 8, h: 10, delay }),
      text(item.text, { fontSize: 19, lineHeight: 1.6, x: x + 8, y: y + 12, w: w - 8, h: 18, delay: delay + 0.05 })
    ].join("\n  ");
  }
}

function metric(item: { caption: string; label: string; value: string }, frame: Partial<Frame> = {}) {
  const x = frame.x ?? 7;
  const y = frame.y ?? 36;
  const w = frame.w ?? 27;
  const delay = frame.delay ?? 0.2;

  return [
    text(item.value, { fontSize: 72, fontWeight: 800, x, y, w, h: 16, delay }),
    text(item.label, { fontSize: 22, fontWeight: 600, x, y: y + 18, w, h: 8, delay: delay + 0.05 }),
    text(item.caption, { fontSize: 17, lineHeight: 1.5, x, y: y + 28, w, h: 16, delay: delay + 0.1 })
  ].join("\n  ");
}

function chart(item: { labels: string; title: string; values: string }, frame: Partial<Frame> & { height?: number } = {}) {
  const next = { h: 56, w: 86, x: 7, y: 34, ...frame };
  const hVal = frame.height ?? 210;
  return `<Chart title="${attr(item.title)}" labels="${attr(item.labels)}" values="${attr(item.values)}" width="full" height={${hVal}} enter="fadeUp" delay={0.25} radius={32} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

function image(item: { alt: string; src: string }, frame: Partial<Frame> = {}) {
  const next = { h: 64, w: 46, x: 7, y: 18, ...frame };
  return `<ImageBlock fit="cover" src="${attr(item.src)}" alt="${attr(item.alt)}" enter="fadeIn" delay={0.15} radius={32} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
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
