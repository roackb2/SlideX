import { createMotionDocBlock, type AddBlockType } from "@/core/motion-doc/application/motionDocBlockFactory";
import { cloneBlock, explicitGroupFlowProps, generateSlideString, replaceSlideContent, replaceSlideOpeningTag } from "@/core/motion-doc/application/motionDocSerialize";
import { clampFramePosition, defaultBlockHeight, defaultBlockWidth, defaultBlockX, defaultBlockY, groupFrameFor, numberValue, percentFrameValue } from "@/core/motion-doc/domain/frame";
import { parseMotionDoc, type MotionDocBlock, type MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import { normalizeLayerFlowProps } from "@/features/studio/application/layerFlow";

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

type ApplySelectionMdxResult =
  | {
      error: string;
    }
  | {
      notice: string;
      source: string;
    };

export function appendBlankSlideSource(
  source: string,
  style: {
    accent: string;
    background: string;
    theme: string;
  }
) {
  return `${source.trimEnd()}\n\n<Slide duration={5} theme="${style.theme}" background="${style.background}" accent="${style.accent}">\n</Slide>`;
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

export function appendBlockToSlide(slide: MotionDocScene, type: AddBlockType) {
  const blocks = [...slide.blocks];
  const block = createMotionDocBlock(type);

  blocks.push(block);

  return {
    blockIndex: blocks.length - 1,
    slide: { ...slide, blocks }
  };
}

export function appendTextBlockAtPosition(slide: MotionDocScene, position: { x: number; y: number }) {
  const blocks = [...slide.blocks];
  const block: MotionDocBlock = {
    type: "Text",
    props: {
      enter: "fadeIn",
      fontSize: 24,
      radius: 0,
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

    if (!currentBlock || !("props" in currentBlock)) {
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

    if (!currentBlock || !("props" in currentBlock)) {
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

export function applySlideStyleSource(source: string, slide: MotionDocScene, slideIndex: number, updates: Record<string, string | number>) {
  const nextProps = {
    ...slide.props,
    duration: slide.duration,
    ...updates
  };

  return replaceSlideOpeningTag(source, slideIndex, explicitGroupFlowProps(slide, nextProps));
}

export function applyAllSlidesStyleSource(source: string, slides: MotionDocScene[], updates: Record<string, string | number>) {
  return slides.reduce((nextSource, slide, index) => applySlideStyleSource(nextSource, slide, index, updates), source);
}

export function updateBlockGroupFlow(slide: MotionDocScene, blockType: "Card" | "Chart" | "Metric", flow: string, gap?: number) {
  const flowProp = blockType === "Card" ? "cardFlow" : blockType === "Chart" ? "chartFlow" : "metricFlow";
  const gapProp = blockType === "Card" ? "cardGap" : blockType === "Chart" ? "chartGap" : "metricGap";
  const resolvedGap = gap ?? numberValue(slide.props[gapProp]) ?? 3;
  const blocksWithLayout = slide.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.type === blockType && "props" in block);
  const blocks = [...slide.blocks];
  const props = { ...slide.props, [flowProp]: flow, [gapProp]: resolvedGap };

  blocksWithLayout.forEach(({ block, index }, order) => {
    if (!("props" in block)) {
      return;
    }

    blocks[index] = {
      ...block,
      props: {
        ...block.props,
        ...groupFrameFor(blockType, flow, resolvedGap, order, blocksWithLayout.length, block.props)
      }
    } as MotionDocBlock;
  });

  return { ...slide, blocks, props };
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
    blocks[blockIndex] = {
      type: currentBlock.type,
      props: newProps,
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

  const { block: normalizedBlock, flowUpdates } = normalizeLayerFlowProps(nextBlock);
  const blocks = [...activeSlide.blocks];
  blocks[selectedBlockIndex] = normalizedBlock;

  return {
    notice: "Layer MDX updated",
    source: replaceSlideSource(source, activeSlideIndex, {
      ...activeSlide,
      blocks,
      props: { ...activeSlide.props, ...flowUpdates }
    })
  };
}
