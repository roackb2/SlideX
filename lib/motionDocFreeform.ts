import { generateSlideString } from "@/lib/motionDocSerialize";
import { parseMotionDoc, type MotionDocBlock, type MotionDocScene } from "@/lib/motionDocParser";

type PositionProps = {
  h: number;
  w: number;
  x: number;
  y: number;
};

export function materializeFreeformSource(source: string) {
  const document = parseMotionDoc(source);
  const title = source.match(/^#\s+(.+)$/m)?.[0] ?? `# ${document.title}`;
  const slides = document.scenes.map((scene) => generateSlideString(materializeFreeformScene(scene)));

  return `${title}\n\n${slides.join("\n\n")}`;
}

export function materializeFreeformScene(scene: MotionDocScene): MotionDocScene {
  const blocksWithProps = scene.blocks.filter((block) => "props" in block);
  const hasCenteredCopy = scene.props.alignX === "center" || scene.props.textAlign === "center";

  return {
    ...scene,
    blocks: scene.blocks.map((block, index) => {
      if (!("props" in block)) {
        return block;
      }

      const layout = layoutBlock(block, index, blocksWithProps, hasCenteredCopy);

      return {
        ...block,
        props: {
          ...block.props,
          ...(defaultFontSize(block) === undefined || block.props.fontSize !== undefined ? {} : { fontSize: defaultFontSize(block) }),
          ...(block.props.radius !== undefined || block.props.borderRadius !== undefined ? {} : { radius: defaultRadius(block) }),
          x: block.props.x ?? layout.x,
          y: block.props.y ?? layout.y,
          w: block.props.w ?? layout.w,
          h: block.props.h ?? layout.h
        }
      } as MotionDocBlock;
    })
  };
}

export function defaultBlockFrame(block: MotionDocBlock): PositionProps {
  if (block.type === "Title") return { x: 8, y: 12, w: 62, h: 18 };
  if (block.type === "Text") return { x: 8, y: 38, w: 52, h: 16 };
  if (block.type === "Card") return { x: 8, y: 38, w: 40, h: 32 };
  if (block.type === "Metric") return { x: 8, y: 38, w: 32, h: 36 };
  if (block.type === "Chart") return { x: 8, y: 36, w: 70, h: 42 };
  if (block.type === "ImageBlock") return { x: 8, y: 16, w: 72, h: 52 };

  return { x: 8, y: 12, w: 42, h: 18 };
}

function layoutBlock(
  block: MotionDocBlock,
  originalIndex: number,
  blocksWithProps: Extract<MotionDocBlock, { props: Record<string, string | number> }>[],
  hasCenteredCopy: boolean
): PositionProps {
  const defaults = defaultBlockFrame(block);
  const propIndex = blocksWithProps.findIndex((item) => item === block);
  const titleIndex = blocksWithProps.findIndex((item) => item.type === "Title");
  const titleOffset = titleIndex >= 0 && propIndex > titleIndex ? 1 : 0;
  const contentIndex = Math.max(propIndex - titleOffset, 0);
  const contentBlocks = blocksWithProps.filter((item) => item.type !== "Title");

  if (block.type === "Title") {
    return hasCenteredCopy
      ? { x: 18, y: contentBlocks.length > 0 ? 26 : 34, w: 64, h: 18 }
      : { x: 8, y: 12, w: 64, h: 18 };
  }

  if (hasCenteredCopy && block.type === "Text") {
    return { x: 22, y: 54, w: 56, h: 16 };
  }

  if (contentBlocks.length === 1) {
    return singleBlockFrame(block, defaults);
  }

  if (contentBlocks.length === 2) {
    const x = contentIndex === 0 ? 8 : 52;
    return { ...defaults, x, y: 38, w: 40 };
  }

  if (contentBlocks.length === 3) {
    return { ...defaults, x: 8 + contentIndex * 30, y: 38, w: 28 };
  }

  const column = contentIndex % 2;
  const row = Math.floor(contentIndex / 2);

  return {
    ...defaults,
    x: column === 0 ? 8 : 52,
    y: 34 + row * 28,
    w: 40,
    h: Math.min(defaults.h, 32)
  };
}

function singleBlockFrame(block: MotionDocBlock, defaults: PositionProps): PositionProps {
  if (block.type === "ImageBlock") {
    return { x: 10, y: 20, w: 80, h: 54 };
  }

  if (block.type === "Chart") {
    return { x: 10, y: 36, w: 76, h: 42 };
  }

  if (block.type === "Metric") {
    return { x: 10, y: 40, w: 34, h: 36 };
  }

  return { ...defaults, x: 8, y: 38 };
}

function defaultFontSize(block: MotionDocBlock) {
  if (block.type === "Title") return 72;
  if (block.type === "Text") return 24;

  return undefined;
}

function defaultRadius(block: MotionDocBlock) {
  if (block.type === "Card" || block.type === "Chart" || block.type === "ImageBlock" || block.type === "Metric") {
    return 16;
  }

  return 0;
}
