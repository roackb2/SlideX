import type { BusinessTemplateConfig, MotionTemplate } from "@/core/motion-doc/presets/templates/templateTypes";

export function createBusinessTemplate(config: BusinessTemplateConfig): MotionTemplate {
  const theme = config.theme;
  const mutedBackground = config.mutedBackground;
  const deepBackground = config.surfaceBackground;

  return {
    id: config.id,
    name: config.name,
    category: config.category,
    duration: "60s",
    description: config.description,
    useCase: config.useCase,
    source: `# ${escapeText(config.name)}

${slide(theme, config.background, config.accent, [
  title(config.hero, { w: 68, x: 8, y: 14 }),
  text(config.subtitle, { w: 56, x: 8, y: 45 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Executive snapshot", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  metric(config.metrics[0], { x: 8, y: 35 }),
  metric(config.metrics[1], { x: 37, y: 35 }),
  metric(config.metrics[2], { x: 66, y: 35 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Strategic thesis", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  card(config.thesis[0], { h: 25, w: 40, x: 8, y: 36 }),
  card(config.thesis[1], { h: 25, w: 40, x: 52, y: 36 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Momentum signal", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  chart(config.chart, { h: 42, w: 78, x: 10, y: 34 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Customer evidence", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  card(config.evidence[0], { h: 25, w: 40, x: 8, y: 36 }),
  card(config.evidence[1], { h: 25, w: 40, x: 52, y: 36 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Strategic response", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  card(config.strategy[0], { h: 29, w: 27, x: 8, y: 36 }),
  card(config.strategy[1], { h: 29, w: 27, x: 37, y: 36 }),
  card(config.strategy[2], { h: 29, w: 27, x: 66, y: 36 })
])}

${slide(theme, deepBackground, config.accent, [
  image(config.image, { h: 40, w: 38, x: 9, y: 28 }),
  text(config.proofText, { fontSize: 24, h: 28, w: 36, x: 52, y: 31 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Economic impact", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  metric(config.economics[0], { h: 30, w: 38, x: 8, y: 38 }),
  metric(config.economics[1], { h: 30, w: 38, x: 52, y: 38 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Operating readiness", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  chart({ ...config.chart, title: "Readiness by function" }, { h: 42, w: 76, x: 10, y: 34 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Risks and controls", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  card(config.risks[0], { h: 25, w: 40, x: 8, y: 36 }),
  card(config.risks[1], { h: 25, w: 40, x: 52, y: 36 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Execution plan", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  card({ icon: "Calendar", ...config.plan[0] }, { h: 29, w: 27, x: 8, y: 36 }),
  card({ icon: "Settings", ...config.plan[1] }, { h: 29, w: 27, x: 37, y: 36 }),
  card({ icon: "ArrowUpRight", ...config.plan[2] }, { h: 29, w: 27, x: 66, y: 36 })
])}

${slide(theme, config.background, config.accent, [
  title("Decision requested", { enter: "zoomIn", fontSize: 66, h: 16, w: 68, x: 16, y: 28 }),
  text("Approve the focused plan, validate the operating impact, and scale the system through the next executive review cycle.", { h: 16, w: 54, x: 23, y: 52 })
])}`
  };
}

function slide(theme: string, background: string, accent: string, blocks: string[]) {
  return `<Slide duration={5} theme="${theme}" background="${background}" accent="${accent}">
${blocks.map((block) => `  ${block}`).join("\n")}
</Slide>`;
}

function title(value: string, frame: Partial<Frame> = {}) {
  const next = { fontSize: 72, h: 18, w: 64, x: 8, y: 12, ...frame };
  return `<Title enter="${frame.enter ?? "fadeUp"}" fontSize={${next.fontSize}} radius={0} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}}>${escapeText(value)}</Title>`;
}

function text(value: string, frame: Partial<Frame> = {}) {
  const next = { fontSize: 24, h: 16, w: 52, x: 8, y: 38, ...frame };
  return `<Text enter="${frame.enter ?? "fadeUp"}" delay={0.2} fontSize={${next.fontSize}} radius={0} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}}>${escapeText(value)}</Text>`;
}

function card(item: { icon?: string; text: string; title: string }, frame: Frame) {
  return `<Card icon="${item.icon ?? "Sparkles"}" layout="horizontal" width="full" title="${attr(item.title)}" text="${attr(item.text)}" enter="fadeUp" delay={0.16} radius={16} x={${frame.x}} y={${frame.y}} w={${frame.w}} h={${frame.h}} />`;
}

function metric(item: { caption: string; label: string; value: string }, frame: Partial<Frame> = {}) {
  const next = { h: 32, w: 26, x: 8, y: 38, ...frame };
  return `<Metric label="${attr(item.label)}" value="${attr(item.value)}" caption="${attr(item.caption)}" width="full" enter="fadeUp" delay={0.16} radius={16} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

function chart(item: { labels: string; title: string; values: string }, frame: Partial<Frame> = {}) {
  const next = { h: 42, w: 76, x: 10, y: 34, ...frame };
  return `<Chart title="${attr(item.title)}" labels="${attr(item.labels)}" values="${attr(item.values)}" width="full" height={144} enter="fadeUp" delay={0.18} radius={16} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

function image(item: { alt: string; src: string }, frame: Frame) {
  return `<ImageBlock fit="cover" src="${attr(item.src)}" alt="${attr(item.alt)}" enter="fadeIn" delay={0.1} radius={16} x={${frame.x}} y={${frame.y}} w={${frame.w}} h={${frame.h}} />`;
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
