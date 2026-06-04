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
  title(config.hero, { fontSize: 78, fontWeight: 800, h: 24, w: 84, x: 8, y: 20 }),
  text(config.subtitle, { fontSize: 22, lineHeight: 1.5, h: 20, w: 64, x: 8, y: 48 })
], coverOptions)}

${slide(theme, mutedBackground, config.accent, [
  title("Executive snapshot", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  metric(config.metrics[0], { h: 36, w: 26, x: 8, y: 32 }),
  metric(config.metrics[1], { h: 36, w: 26, x: 37, y: 32 }),
  metric(config.metrics[2], { h: 36, w: 26, x: 66, y: 32 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Strategic thesis", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  card({ ...config.thesis[0], layout: "vertical" }, { h: 42, w: 48, x: 8, y: 32 }),
  card({ ...config.thesis[1], layout: "vertical" }, { h: 42, w: 32, x: 60, y: 32 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Momentum signal", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  chart(config.chart, { h: 52, w: 84, x: 8, y: 30, height: 180 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Customer evidence", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  card({ ...config.evidence[0], layout: "vertical" }, { h: 40, w: 46, x: 8, y: 32 }),
  card({ ...config.evidence[1], layout: "vertical" }, { h: 40, w: 34, x: 58, y: 32 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Strategic response", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  card({ ...config.strategy[0], layout: "vertical" }, { h: 44, w: 25, x: 8, y: 32 }),
  card({ ...config.strategy[1], layout: "vertical" }, { h: 44, w: 28, x: 35, y: 32 }),
  card({ ...config.strategy[2], layout: "vertical" }, { h: 44, w: 25, x: 65, y: 32 })
])}

${slide(theme, deepBackground, config.accent, [
  image(config.image, { h: 70, w: 42, x: 8, y: 15 }),
  text(config.proofText, { fontSize: 24, lineHeight: 1.5, h: 52, w: 36, x: 56, y: 24 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Economic impact", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  metric(config.economics[0], { h: 40, w: 36, x: 12, y: 32 }),
  metric(config.economics[1], { h: 40, w: 36, x: 52, y: 32 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Operating readiness", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  chart({ ...config.chart, title: "Readiness by function" }, { h: 52, w: 84, x: 8, y: 30, height: 180 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Risks and controls", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  card({ ...config.risks[0], layout: "vertical" }, { h: 42, w: 34, x: 8, y: 32 }),
  card({ ...config.risks[1], layout: "vertical" }, { h: 42, w: 46, x: 46, y: 32 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Execution plan", { fontSize: 54, fontWeight: 700, h: 15, w: 84, x: 8, y: 10 }),
  card({ icon: "Calendar", ...config.plan[0], layout: "vertical" }, { h: 44, w: 25, x: 8, y: 32 }),
  card({ icon: "Settings", ...config.plan[1], layout: "vertical" }, { h: 44, w: 28, x: 35, y: 32 }),
  card({ icon: "ArrowUpRight", ...config.plan[2], layout: "vertical" }, { h: 44, w: 25, x: 65, y: 32 })
])}

${slide(theme, config.background, config.accent, [
  title("Decision requested", { enter: "zoomIn", fontSize: 72, fontWeight: 800, h: 20, w: 80, x: 10, y: 24, textAlign: "center" }),
  text("Approve the focused plan, validate the operating impact, and scale the system through the next executive review cycle.", { fontSize: 24, lineHeight: 1.6, h: 24, w: 70, x: 15, y: 50, textAlign: "center" })
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

function title(value: string, frame: Partial<Frame> & { fontWeight?: number; textAlign?: string } = {}) {
  const next = { fontSize: 72, h: 18, w: 64, x: 8, y: 12, ...frame };
  const fontAttr = frame.fontWeight ? ` fontWeight={${frame.fontWeight}}` : "";
  const alignAttr = frame.textAlign ? ` textAlign="${frame.textAlign}"` : "";
  return `<Title enter="${frame.enter ?? "fadeUp"}" fontSize={${next.fontSize}}${fontAttr}${alignAttr} radius={0} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}}>${escapeText(value)}</Title>`;
}

function text(value: string, frame: Partial<Frame> & { lineHeight?: number; textAlign?: string } = {}) {
  const next = { fontSize: 24, h: 16, w: 52, x: 8, y: 38, ...frame };
  const lineAttr = frame.lineHeight ? ` lineHeight={${frame.lineHeight}}` : "";
  const alignAttr = frame.textAlign ? ` textAlign="${frame.textAlign}"` : "";
  return `<Text enter="${frame.enter ?? "fadeUp"}" delay={0.2} fontSize={${next.fontSize}}${lineAttr}${alignAttr} radius={0} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}}>${escapeText(value)}</Text>`;
}

function card(item: { icon?: string; layout?: string; text: string; title: string }, frame: Frame) {
  const layout = item.layout ?? "horizontal";
  return `<Card icon="${item.icon ?? "Sparkles"}" layout="${layout}" width="full" title="${attr(item.title)}" text="${attr(item.text)}" enter="fadeUp" delay={0.16} radius={24} x={${frame.x}} y={${frame.y}} w={${frame.w}} h={${frame.h}} />`;
}

function metric(item: { caption: string; label: string; value: string }, frame: Partial<Frame> = {}) {
  const next = { h: 32, w: 26, x: 8, y: 38, ...frame };
  return `<Metric label="${attr(item.label)}" value="${attr(item.value)}" caption="${attr(item.caption)}" width="full" enter="fadeUp" delay={0.16} radius={24} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

function chart(item: { labels: string; title: string; values: string }, frame: Partial<Frame> & { height?: number } = {}) {
  const next = { h: 42, w: 76, x: 10, y: 34, ...frame };
  const hVal = frame.height ?? 144;
  return `<Chart title="${attr(item.title)}" labels="${attr(item.labels)}" values="${attr(item.values)}" width="full" height={${hVal}} enter="fadeUp" delay={0.18} radius={24} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

function image(item: { alt: string; src: string }, frame: Frame) {
  return `<ImageBlock fit="cover" src="${attr(item.src)}" alt="${attr(item.alt)}" enter="fadeIn" delay={0.1} radius={24} x={${frame.x}} y={${frame.y}} w={${frame.w}} h={${frame.h}} />`;
}

type Frame = {
  enter?: "fadeUp" | "zoomIn";
  fontSize?: number;
  h: number;
  w: number;
  x: number;
  y: number;
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
