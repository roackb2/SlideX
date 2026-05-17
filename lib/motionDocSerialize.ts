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
  const tag = formatSlideTag(slide.props);
  const blockStrings = slide.blocks.map((block) => `  ${generateBlockString(block)}`);
  return `${tag}\n${blockStrings.join("\n")}\n</Slide>`;
}

export function generateBlockString(block: MotionDocBlock) {
  if (block.type === "Title" || block.type === "Text") {
    const propsStr = formatProps(block.props);
    return `<${block.type}${propsStr ? " " + propsStr : ""}>${block.text}</${block.type}>`;
  }

  if (block.type === "heading") {
    return `## ${block.text}`;
  }

  if ("props" in block) {
    const propsStr = formatProps(block.props);
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
    source: block ? generateBlockString(block) : ""
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
  const entries = Object.entries(props).filter(([key, value]) => key !== "duration" && value !== undefined && value !== "");
  return entries
    .map(([key, value]) => (typeof value === "number" ? `${key}={${value}}` : `${key}="${value}"`))
    .join(" ");
}

function formatSlideTag(props: Record<string, string | number>) {
  const duration = typeof props.duration === "number" ? props.duration : 5;
  const rest = formatProps(props);
  return `<Slide duration={${duration}}${rest ? ` ${rest}` : ""}>`;
}
