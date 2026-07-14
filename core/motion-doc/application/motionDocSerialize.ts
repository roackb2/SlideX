import type { MotionDocBlock, MotionDocProps, MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import {
  replaceMotionDocSlideOpeningTag
} from "@/core/motion-doc/application/motionDocSourceEditor";

export function replaceSlideOpeningTag(source: string, slideIndex: number, props: MotionDocProps) {
  return replaceMotionDocSlideOpeningTag(source, slideIndex, formatSlideTag(props));
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

export function generateSlideString(slide: MotionDocScene) {
  const tag = formatSlideTag(slide.props);
  const blockStrings: string[] = [];

  for (let index = 0; index < slide.blocks.length;) {
    const block = slide.blocks[index];
    const groupId = groupIdOf(block);
    if (!groupId) {
      blockStrings.push(`  ${generateBlockString(block)}`);
      index += 1;
      continue;
    }

    const groupedBlocks: MotionDocBlock[] = [];
    while (index < slide.blocks.length && groupIdOf(slide.blocks[index]) === groupId) {
      groupedBlocks.push(slide.blocks[index]);
      index += 1;
    }
    blockStrings.push(indentGroupString(generateGroupString(groupedBlocks, groupId)));
  }
  return `${tag}\n${blockStrings.join("\n")}\n</Slide>`;
}

export function generateGroupString(blocks: MotionDocBlock[], groupId: string) {
  const namedBlock = blocks.find((block): block is Extract<MotionDocBlock, { props: MotionDocProps }> => (
    "props" in block && typeof block.props.groupName === "string"
  ));
  const groupName = namedBlock?.props.groupName;
  const nameAttr = typeof groupName === "string" && groupName.trim() ? ` name="${escapeMdxAttribute(groupName)}"` : "";
  const children = blocks.map((block) => `  ${generateBlockStringWithProps(block, withoutGroupProps("props" in block ? block.props : undefined))}`);
  return `<Group id="${escapeMdxAttribute(groupId)}"${nameAttr}>\n${children.join("\n")}\n</Group>`;
}

function indentGroupString(value: string) {
  return value.split("\n").map((line) => `  ${line}`).join("\n");
}

function groupIdOf(block: MotionDocBlock) {
  return "props" in block && typeof block.props.groupId === "string" && block.props.groupId.trim() ? block.props.groupId : "";
}

function withoutGroupProps(props: MotionDocProps | undefined) {
  if (!props) return props;
  const { groupId, groupName, ...rest } = props;
  void groupId;
  void groupName;
  return rest;
}

export function generateBlockString(block: MotionDocBlock) {
  return generateBlockStringWithProps(block, "props" in block ? block.props : undefined);
}

function generateBlockStringWithProps(block: MotionDocBlock, overrideProps: MotionDocProps | undefined) {
  if (block.type === "Title" || block.type === "Text") {
    const propsStr = formatTextProps(overrideProps ?? block.props);
    return `<${block.type}${propsStr ? " " + propsStr : ""}>${escapeMdxText(block.text)}</${block.type}>`;
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

export function getSelectionMdx(slide: MotionDocScene | undefined, selectedBlockIndex: number | null, activeSlideIndex: number, selectedBlockIndices: number[] = []) {
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
  const groupId = block ? groupIdOf(block) : "";
  if (groupId) {
    const groupBlocks = slide.blocks.filter((candidate) => groupIdOf(candidate) === groupId);
    return {
      label: `${groupId}.mdx`,
      source: generateGroupString(groupBlocks, groupId)
    };
  }

  if (selectedBlockIndices.length > 1) {
    const selected = selectedBlockIndices.map((index) => slide.blocks[index]).filter((candidate): candidate is MotionDocBlock => Boolean(candidate));
    return {
      label: `layers-${selected.length}.mdx`,
      source: selected.map(generateBlockString).join("\n")
    };
  }

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

function formatProps(props: MotionDocProps) {
  const entries = Object.entries(props).filter(
    ([key, value]) =>
      !key.startsWith("_") &&
      key !== "duration" &&
      key !== "mb" &&
      key !== "marginBottom" &&
      !removedGroupPropKeys.has(key) &&
      value !== undefined &&
      value !== ""
  );
  return entries
    .map(([key, value]) => (typeof value === "number" ? `${key}={${value}}` : `${key}="${escapeMdxAttribute(value)}"`))
    .join(" ");
}

function escapeMdxAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "&#10;");
}

function escapeMdxText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("{", "&#123;")
    .replaceAll("}", "&#125;");
}

function formatTextProps(props: MotionDocProps) {
  return formatProps(withoutTextFrameOnlyProps(props));
}

function withoutTextFrameOnlyProps(props: MotionDocProps) {
  const { borderRadius, radius, ...rest } = props;
  void borderRadius;
  void radius;

  return rest;
}

function formatSlideTag(props: MotionDocProps) {
  const duration = typeof props.duration === "number" ? props.duration : 5;
  const rest = formatProps(props);
  return `<Slide duration={${duration}}${rest ? ` ${rest}` : ""}>`;
}

const removedGroupPropKeys = new Set([
  "cardFlow",
  "cardGap",
  "flow",
  "groupFlow",
  "metricFlow",
  "metricGap",
  "stackAlign",
  "stackBackground",
  "stackClipContent",
  "stackColor",
  "stackDirection",
  "stackGap",
  "stackGroup",
  "stackPaddingBottom",
  "stackPaddingLeft",
  "stackPaddingRight",
  "stackPaddingTop",
  "stackPaddingX",
  "stackPaddingY"
]);
