import type { MotionDocBlock, MotionDocScene } from "@/lib/motionDocParser";

export function replaceSlideOpeningTag(source: string, slideIndex: number, props: Record<string, string | number>) {
  const pattern = /<Slide\b[^>]*>/g;
  let currentIndex = 0;

  for (const match of source.matchAll(pattern)) {
    if (currentIndex === slideIndex && match.index !== undefined) {
      const nextTag = formatSlideTag(props);
      return `${source.slice(0, match.index)}${nextTag}${source.slice(match.index + match[0].length)}`;
    }

    currentIndex += 1;
  }

  return source;
}

export function explicitGroupFlowProps(slide: MotionDocScene, props: Record<string, string | number> = slide.props) {
  const nextProps = { ...props };
  const hasCard = slide.blocks.some((block) => block.type === "Card");
  const hasMetric = slide.blocks.some((block) => block.type === "Metric");
  const hasChart = slide.blocks.some((block) => block.type === "Chart");

  if (hasCard && nextProps.cardFlow === undefined) {
    nextProps.cardFlow = "stack";
  }

  if (hasMetric && nextProps.metricFlow === undefined) {
    nextProps.metricFlow = stringProp(nextProps.cardFlow) ?? "stack";
  }

  if (hasChart && nextProps.chartFlow === undefined) {
    nextProps.chartFlow = "stack";
  }

  return nextProps;
}

export function cloneBlock(block: MotionDocBlock): MotionDocBlock {
  if ("props" in block) {
    return {
      ...block,
      props: { ...block.props }
    } as MotionDocBlock;
  }

  return { ...block };
}

export function replaceSlideContent(source: string, slideIndex: number, newSlideString: string) {
  const pattern = /<(Slide|Scene)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let currentIndex = 0;

  for (const match of source.matchAll(pattern)) {
    if (currentIndex === slideIndex && match.index !== undefined) {
      return `${source.slice(0, match.index)}${newSlideString}${source.slice(match.index + match[0].length)}`;
    }
    currentIndex += 1;
  }

  return source;
}

export function generateSlideString(slide: MotionDocScene) {
  const tag = formatSlideTag(explicitGroupFlowProps(slide));
  const blockStrings = slide.blocks.map((block) => `  ${generateBlockString(block)}`);
  return `${tag}\n${blockStrings.join("\n")}\n</Slide>`;
}

export function generateBlockString(block: MotionDocBlock) {
  return generateBlockStringWithProps(block, "props" in block ? block.props : undefined);
}

export function generateLayerBlockString(block: MotionDocBlock, slide: MotionDocScene) {
  if (!("props" in block) || !isGroupableType(block.type)) {
    return generateBlockString(block);
  }

  return generateBlockStringWithProps(block, {
    ...block.props,
    flow: groupFlowForBlock(slide, block.type)
  });
}

function generateBlockStringWithProps(block: MotionDocBlock, overrideProps: Record<string, string | number> | undefined) {
  if (block.type === "Title" || block.type === "Text") {
    const propsStr = formatProps(overrideProps ?? block.props);
    return `<${block.type}${propsStr ? " " + propsStr : ""}>${block.text}</${block.type}>`;
  }

  if (block.type === "heading") {
    return `## ${block.text}`;
  }

  if ("props" in block) {
    const propsStr = formatProps(overrideProps ?? block.props);
    return `<${block.type}${propsStr ? " " + propsStr : ""} />`;
  }

  return "";
}

export function getSelectionMdx(slide: MotionDocScene | undefined, selectedBlockIndex: number | null, activeSlideIndex: number) {
  if (!slide) {
    return { label: "selection.mdx", source: "" };
  }

  if (selectedBlockIndex === null) {
    return {
      label: `slide-${activeSlideIndex + 1}.mdx`,
      source: generateSlideString(slide)
    };
  }

  const block = slide.blocks[selectedBlockIndex];

  return {
    label: block ? `${block.type.toLowerCase()}-${selectedBlockIndex + 1}.mdx` : "layer.mdx",
    source: block ? generateLayerBlockString(block, slide) : ""
  };
}

export function getSlideTitle(blocks: MotionDocBlock[], fallbackIndex: number) {
  const titleBlock = blocks.find((block) => block.type === "Title" && "text" in block);

  if (titleBlock && "text" in titleBlock) {
    return titleBlock.text;
  }

  const cardBlock = blocks.find((block) => "props" in block && (block.props.title || block.props.text));

  if (cardBlock && "props" in cardBlock) {
    return String(cardBlock.props.title ?? cardBlock.props.text);
  }

  return `Slide ${fallbackIndex + 1}`;
}

function formatProps(props: Record<string, string | number>) {
  const entries = Object.entries(props).filter(([key, value]) => key !== "duration" && key !== "mb" && key !== "marginBottom" && value !== undefined && value !== "");
  return entries
    .map(([key, value]) => (typeof value === "number" ? `${key}={${value}}` : `${key}="${value}"`))
    .join(" ");
}

function formatSlideTag(props: Record<string, string | number>) {
  const duration = typeof props.duration === "number" ? props.duration : 5;
  const rest = formatProps(props);
  return `<Slide duration={${duration}}${rest ? ` ${rest}` : ""}>`;
}

function stringProp(value: string | number | undefined) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function isGroupableType(type: MotionDocBlock["type"]) {
  return type === "Card" || type === "Metric" || type === "Chart";
}

function groupFlowForBlock(slide: MotionDocScene, type: MotionDocBlock["type"]) {
  if (type === "Card") {
    return stringProp(slide.props.cardFlow) ?? "stack";
  }

  if (type === "Metric") {
    return stringProp(slide.props.metricFlow ?? slide.props.cardFlow) ?? "stack";
  }

  if (type === "Chart") {
    return stringProp(slide.props.chartFlow) ?? "stack";
  }

  return "stack";
}
