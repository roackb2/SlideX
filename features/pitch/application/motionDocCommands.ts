import { createMotionDocBlock, type AddBlockType } from "@/core/motion-doc/application/motionDocBlockFactory";
import { cloneBlock, generateBlockString, generateSlideString, replaceSlideContent, replaceSlideOpeningTag } from "@/core/motion-doc/application/motionDocSerialize";
import { clampFramePosition, defaultBlockHeight, defaultBlockWidth, defaultBlockX, defaultBlockY, percentFrameValue } from "@/core/motion-doc/domain/frame";
import { parseMotionDoc, type MotionDocBlock, type MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";

export type FrameUpdate = {
  blockIndex: number;
  frame: {
    h?: number;
    w?: number;
    x?: number;
    y?: number;
  };
};

export type PositionDelta = {
  x: number;
  y: number;
};

export type AddBlockOptions = {
  position?: { x: number; y: number };
  props?: Record<string, string | number>;
};

type ApplySelectionMdxResult =
  | {
      error: string;
    }
  | {
      notice: string;
      source: string;
    };

export function appendBlankSlideSource(source: string, slideIndex: number) {
  const pattern = /<(Slide|Scene)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  let currentIndex = 0;
  let theme = "dark";
  let bg = "#050505";
  let acc = "#ffffff";
  let txt = "";

  for (const match of source.matchAll(pattern)) {
    if (currentIndex === slideIndex && match.index !== undefined) {
      const attrsStr = match[2];
      const getAttr = (name: string) => {
        const m = attrsStr.match(new RegExp(`\\b${name}="([^"]*)"`));
        return m ? m[1] : null;
      };
      theme = getAttr("theme") ?? theme;
      bg = getAttr("background") ?? bg;
      acc = getAttr("accent") ?? acc;
      txt = getAttr("textColor") ?? txt;
      break;
    }
    currentIndex += 1;
  }

  const txtAttr = txt ? ` textColor="${txt}"` : "";
  const startTag = `<Slide duration={5} theme="${theme}" background="${bg}" accent="${acc}"${txtAttr}>`;
  const endTag = '</Slide>';

  return `${source.trimEnd()}\n\n${startTag}\n${endTag}`;
}

export function appendLayoutSlideSource(source: string, slideIndex: number, layoutSource: string) {
  const pattern = /<(Slide|Scene)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  let currentIndex = 0;
  let theme = "dark";
  let bg = "#050505";
  let acc = "#ffffff";
  let txt = "";

  for (const match of source.matchAll(pattern)) {
    if (currentIndex === slideIndex && match.index !== undefined) {
      const attrsStr = match[2];
      const getAttr = (name: string) => {
        const m = attrsStr.match(new RegExp(`\\b${name}="([^"]*)"`));
        return m ? m[1] : null;
      };
      theme = getAttr("theme") ?? theme;
      bg = getAttr("background") ?? bg;
      acc = getAttr("accent") ?? acc;
      txt = getAttr("textColor") ?? txt;
      break;
    }
    currentIndex += 1;
  }

  const txtAttr = txt ? ` textColor="${txt}"` : "";
  const startTag = `<Slide duration={5} theme="${theme}" background="${bg}" accent="${acc}"${txtAttr}>`;
  const endTag = '</Slide>';

  return `${source.trimEnd()}\n\n${startTag}\n${normalizeLayoutSourceTextMotion(layoutSource)}\n${endTag}`;
}

export function applyLayoutToSlide(slide: MotionDocScene, layoutSource: string, layoutId: string) {
  const parsed = parseMotionDoc(`<Slide duration={${slide.duration}}>\n${layoutSource}\n</Slide>`);
  const layoutSlide = parsed.scenes[0];

  return {
    ...slide,
    blocks: normalizeLayoutBlocksTextMotion(layoutSlide?.blocks ?? []),
    props: {
      ...slide.props,
      layoutPreset: layoutId
    }
  };
}

function normalizeLayoutSourceTextMotion(layoutSource: string) {
  const parsed = parseMotionDoc(`<Slide duration={5}>\n${layoutSource}\n</Slide>`);
  const layoutSlide = parsed.scenes[0];

  if (!layoutSlide) {
    return layoutSource;
  }

  return normalizeLayoutBlocksTextMotion(layoutSlide.blocks)
    .map((block) => generateBlockString(block))
    .join("\n");
}

function normalizeLayoutBlocksTextMotion(blocks: MotionDocBlock[]) {
  return blocks.map((block) => {
    if ((block.type !== "Title" && block.type !== "Text") || !("props" in block)) {
      return block;
    }

    const nextProps: Record<string, string | number> = { ...block.props, enter: "none" };
    delete nextProps.borderRadius;
    delete nextProps.delay;
    delete nextProps.duration;
    delete nextProps.radius;

    return {
      ...block,
      props: nextProps
    } as MotionDocBlock;
  });
}

export function deleteSlideSource(source: string, slideIndex: number) {
  const pattern = /<(Slide|Scene)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let currentIndex = 0;
  let nextSource = source;

  for (const match of source.matchAll(pattern)) {
    if (currentIndex === slideIndex && match.index !== undefined) {
      nextSource = source.slice(0, match.index) + source.slice(match.index + match[0].length);
      break;
    }
    currentIndex += 1;
  }

  return nextSource.replace(/\n{3,}/g, "\n\n").trim();
}

export function replaceSlideSource(source: string, slideIndex: number, slide: MotionDocScene) {
  return replaceSlideContent(source, slideIndex, generateSlideString(slide));
}

export function reorderSlideSource(source: string, fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return source;

  const pattern = /<(Slide|Scene)\b[^>]*>([\s\S]*?)<\/\1>/g;
  const matches = [...source.matchAll(pattern)];

  if (fromIndex < 0 || fromIndex >= matches.length || toIndex < 0 || toIndex >= matches.length) {
    return source;
  }

  const slideStrings = matches.map((m) => m[0]);
  const [movedSlide] = slideStrings.splice(fromIndex, 1);
  slideStrings.splice(toIndex, 0, movedSlide);

  let currentIndex = 0;
  return source.replace(pattern, () => {
    const replacement = slideStrings[currentIndex];
    currentIndex += 1;
    return replacement;
  });
}

export function selectedLayerIndices(selectedBlockIndices: number[], selectedBlockIndex: number | null, sort: "asc" | "desc" = "asc") {
  const indices = selectedBlockIndices.length > 0 ? selectedBlockIndices : selectedBlockIndex === null ? [] : [selectedBlockIndex];

  return indices
    .filter((index, offset, items) => items.indexOf(index) === offset)
    .sort((a, b) => (sort === "desc" ? b - a : a - b));
}

export function deleteBlockAt(slide: MotionDocScene, blockIndex: number) {
  const blocks = [...slide.blocks];
  blocks.splice(blockIndex, 1);

  return { ...slide, blocks };
}

export function deleteBlocks(slide: MotionDocScene, blockIndices: number[]) {
  const blocks = [...slide.blocks];

  for (const index of blockIndices) {
    blocks.splice(index, 1);
  }

  return { ...slide, blocks };
}

export function duplicateBlockAt(slide: MotionDocScene, blockIndex: number) {
  const block = slide.blocks[blockIndex];

  if (!block) {
    return null;
  }

  const blocks = [...slide.blocks];
  const duplicate = offsetDuplicatedBlock(cloneBlock(block));
  const insertIndex = Math.min(blockIndex + 1, blocks.length);

  blocks.splice(insertIndex, 0, duplicate);

  return {
    blockIndex: insertIndex,
    slide: { ...slide, blocks }
  };
}

export function moveBlockByDirection(slide: MotionDocScene, blockIndex: number, direction: -1 | 1) {
  const nextIndex = blockIndex + direction;

  if (nextIndex < 0 || nextIndex >= slide.blocks.length) {
    return null;
  }

  const blocks = [...slide.blocks];
  const temp = blocks[blockIndex];
  blocks[blockIndex] = blocks[nextIndex];
  blocks[nextIndex] = temp;

  return { ...slide, blocks };
}

export function pasteBlockIntoSlide(slide: MotionDocScene, copiedBlock: MotionDocBlock, selectedBlockIndex: number | null) {
  const blocks = [...slide.blocks];
  const insertIndex = selectedBlockIndex === null ? blocks.length : Math.min(selectedBlockIndex + 1, blocks.length);

  blocks.splice(insertIndex, 0, cloneBlock(copiedBlock));

  return {
    blockIndex: insertIndex,
    slide: { ...slide, blocks }
  };
}

export function reorderBlocks(slide: MotionDocScene, fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) {
    return null;
  }

  const blocks = [...slide.blocks];
  const [movedItem] = blocks.splice(fromIndex, 1);
  blocks.splice(toIndex, 0, movedItem);

  return { ...slide, blocks };
}

export function toggleBlocksPositionLock(slide: MotionDocScene, blockIndices: number[]) {
  const blocks = [...slide.blocks];
  const shouldLock = blockIndices.some((blockIndex) => {
    const block = blocks[blockIndex];
    return block && "props" in block && !isPositionLocked(block);
  });
  let didUpdate = false;

  for (const blockIndex of blockIndices) {
    const currentBlock = blocks[blockIndex];

    if (!currentBlock || !("props" in currentBlock)) {
      continue;
    }

    const nextProps = { ...currentBlock.props };

    if (shouldLock) {
      nextProps.lockPosition = "true";
    } else {
      delete nextProps.lockPosition;
      delete nextProps.locked;
    }

    blocks[blockIndex] = {
      ...currentBlock,
      props: nextProps
    } as MotionDocBlock;
    didUpdate = true;
  }

  return {
    didUpdate,
    locked: shouldLock,
    slide: { ...slide, blocks }
  };
}

export function imageBlockAsSlideBackground(slide: MotionDocScene, blockIndex: number) {
  const block = slide.blocks[blockIndex];

  if (!block || block.type !== "ImageBlock") {
    return null;
  }

  const src = typeof block.props.src === "string" ? block.props.src.trim() : "";

  if (!src) {
    return null;
  }

  const fit = typeof block.props.fit === "string" && block.props.fit ? block.props.fit : "cover";
  const blocks = [...slide.blocks];
  blocks.splice(blockIndex, 1);

  return {
    slide: {
      ...slide,
      blocks,
      props: {
        ...slide.props,
        backgroundFit: fit,
        backgroundImage: src,
        shader: ""
      }
    }
  };
}

export function appendBlockToSlide(slide: MotionDocScene, type: AddBlockType, options: AddBlockOptions = {}) {
  const blocks = [...slide.blocks];
  const block = blockWithOptions(createMotionDocBlock(type), options);

  blocks.push(block);

  return {
    blockIndex: blocks.length - 1,
    slide: { ...slide, blocks }
  };
}

function blockWithOptions(block: MotionDocBlock, options: AddBlockOptions): MotionDocBlock {
  if (!("props" in block)) {
    return block;
  }

  return {
    ...block,
    props: {
      ...block.props,
      ...options.props,
      ...(options.position ? { x: Math.min(Math.max(options.position.x, 0), 92), y: Math.min(Math.max(options.position.y, 0), 92) } : {})
    }
  } as MotionDocBlock;
}

export function appendTextBlockAtPosition(slide: MotionDocScene, position: { x: number; y: number }) {
  const blocks = [...slide.blocks];
  const block: MotionDocBlock = {
    type: "Text",
    props: {
      enter: "none",
      fontSize: 24,
      h: 9,
      x: Math.min(Math.max(position.x, 0), 70),
      y: Math.min(Math.max(position.y, 0), 88),
      w: 30
    },
    text: "Double-click text"
  };

  blocks.push(block);

  return {
    blockIndex: blocks.length - 1,
    slide: { ...slide, blocks }
  };
}

export function updatePositionedBlockFrames(slide: MotionDocScene, updates: FrameUpdate[]) {
  const blocks = [...slide.blocks];

  for (const { blockIndex, frame } of updates) {
    const currentBlock = blocks[blockIndex];

    if (!currentBlock || !("props" in currentBlock) || isPositionLocked(currentBlock)) {
      continue;
    }

    blocks[blockIndex] = {
      ...currentBlock,
      props: {
        ...currentBlock.props,
        w: currentBlock.props.w ?? defaultBlockWidth(currentBlock.type),
        h: currentBlock.props.h ?? defaultBlockHeight(currentBlock.type),
        ...frame
      }
    };
  }

  return { ...slide, blocks };
}

export function nudgeBlocks(slide: MotionDocScene, blockIndices: number[], delta: PositionDelta) {
  const blocks = [...slide.blocks];
  let didMove = false;

  for (const blockIndex of blockIndices) {
    const currentBlock = blocks[blockIndex];

    if (!currentBlock || !("props" in currentBlock) || isPositionLocked(currentBlock)) {
      continue;
    }

    const w = percentFrameValue(currentBlock.props.w, defaultBlockWidth(currentBlock.type));
    const h = percentFrameValue(currentBlock.props.h, defaultBlockHeight(currentBlock.type));
    const x = percentFrameValue(currentBlock.props.x, defaultBlockX(currentBlock.type));
    const y = percentFrameValue(currentBlock.props.y, defaultBlockY(currentBlock.type));

    blocks[blockIndex] = {
      ...currentBlock,
      props: {
        ...currentBlock.props,
        h: currentBlock.props.h ?? h,
        w: currentBlock.props.w ?? w,
        x: clampFramePosition(x + delta.x, w),
        y: clampFramePosition(y + delta.y, h)
      }
    } as MotionDocBlock;
    didMove = true;
  }

  return {
    didMove,
    slide: { ...slide, blocks }
  };
}

export function isPositionLocked(block: MotionDocBlock) {
  if (!("props" in block)) {
    return false;
  }

  return block.props.lockPosition === "true" || block.props.lockPosition === 1 || block.props.locked === "true" || block.props.locked === 1;
}

function offsetDuplicatedBlock(block: MotionDocBlock): MotionDocBlock {
  if (!("props" in block)) {
    return block;
  }

  const frame = blockFrameFromProps(block);

  return {
    ...block,
    props: {
      ...block.props,
      x: clampFramePosition(frame.x + 3, frame.w),
      y: clampFramePosition(frame.y + 3, frame.h)
    }
  } as MotionDocBlock;
}

function blockFrameFromProps(block: Extract<MotionDocBlock, { props: Record<string, string | number> }>) {
  return {
    h: percentFrameValue(block.props.h, defaultBlockHeight(block.type)),
    w: percentFrameValue(block.props.w, defaultBlockWidth(block.type)),
    x: percentFrameValue(block.props.x, defaultBlockX(block.type)),
    y: percentFrameValue(block.props.y, defaultBlockY(block.type))
  };
}

export function applySlideStyleSource(source: string, slide: MotionDocScene, slideIndex: number, updates: Record<string, string | number>) {
  const nextProps = {
    ...slide.props,
    duration: slide.duration,
    ...updates
  };

  return replaceSlideOpeningTag(source, slideIndex, nextProps);
}

export function applyAllSlidesStyleSource(source: string, slides: MotionDocScene[], updates: Record<string, string | number>) {
  return slides.reduce((nextSource, slide, index) => applySlideStyleSource(nextSource, slide, index, updates), source);
}

export function updateBlockInSlide(
  slide: MotionDocScene,
  blockIndex: number,
  newProps: Record<string, string | number>,
  newText?: string
) {
  const blocks = [...slide.blocks];
  const currentBlock = blocks[blockIndex];

  if (!currentBlock) {
    return null;
  }

  if (currentBlock.type === "Title" || currentBlock.type === "Text" || currentBlock.type === "heading") {
    const nextProps = withoutTextFrameOnlyProps(newProps);

    blocks[blockIndex] = {
      type: currentBlock.type,
      props: nextProps,
      text: newText ?? ("text" in currentBlock ? currentBlock.text : "")
    } as MotionDocBlock;
  } else {
    blocks[blockIndex] = {
      type: currentBlock.type,
      props: newProps
    } as MotionDocBlock;
  }

  return {
    ...slide,
    blocks
  };
}

function withoutTextFrameOnlyProps(props: Record<string, string | number>) {
  const { borderRadius, radius, ...rest } = props;
  void borderRadius;
  void radius;

  return rest;
}

export function applySelectionMdxSource({
  activeSlide,
  activeSlideIndex,
  selectedBlockIndex,
  source,
  value
}: {
  activeSlide: MotionDocScene;
  activeSlideIndex: number;
  selectedBlockIndex: number | null;
  source: string;
  value: string;
}): ApplySelectionMdxResult {
  if (selectedBlockIndex === null) {
    const parsed = parseMotionDoc(value);
    const nextSlide = parsed.scenes[0];

    if (!nextSlide) {
      return { error: "Selection MDX needs one Slide" };
    }

    return {
      notice: "Scene MDX updated",
      source: replaceSlideSource(source, activeSlideIndex, nextSlide)
    };
  }

  const parsed = parseMotionDoc(`<Slide duration={5}>\n${value}\n</Slide>`);
  const nextBlock = parsed.scenes[0]?.blocks[0];

  if (!nextBlock) {
    return { error: "Selection MDX needs one layer" };
  }

  const blocks = [...activeSlide.blocks];
  blocks[selectedBlockIndex] = nextBlock;

  return {
    notice: "Layer MDX updated",
    source: replaceSlideSource(source, activeSlideIndex, {
      ...activeSlide,
      blocks
    })
  };
}
