"use client";

import type { CSSProperties, ReactNode } from "react";
import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";
import {
  blockWidthProp,
  booleanProp,
  cardLayoutProp,
  cardWidthProp,
  enterProp,
  fitProp,
  flowBlockType,
  isPositionedBlock,
  numberProp,
  optionalTextAlignProp,
  percentProp,
  sizeNumberProp,
  spacingProp,
  stringProp,
  type CardFlow
} from "@/features/studio/application/previewProps";
import { Card, Chart, ImageBlock, Metric, Text, Title } from "@/features/studio/ui/preview/motion-blocks";

export type PreviewBlockItem = {
  block: MotionDocBlock;
  originalIndex: number;
};

type PreviewBlockListProps = {
  cardFlow: CardFlow;
  chartFlow: CardFlow;
  hiddenBlockIndices: Set<number>;
  items: PreviewBlockItem[];
  metricFlow: CardFlow;
};

export function PreviewBlockList({
  cardFlow,
  chartFlow,
  hiddenBlockIndices,
  items,
  metricFlow
}: PreviewBlockListProps) {
  const rendered: ReactNode[] = [];
  const visibleItems = items.filter(({ originalIndex }) => !hiddenBlockIndices.has(originalIndex));
  const flowBlocks = visibleItems.filter(({ block }) => !isPositionedBlock(block));
  const positionedBlocks = visibleItems.filter(({ block }) => isPositionedBlock(block));
  let index = 0;

  while (index < flowBlocks.length) {
    const { block, originalIndex } = flowBlocks[index];
    const flowType = flowBlockType(block);
    const flow = flowType === "Card" ? cardFlow : flowType === "Metric" ? metricFlow : flowType === "Chart" ? chartFlow : "stack";

    if (flowType && flow !== "stack") {
      const cards: PreviewBlockItem[] = [];
      const groupStartIndex = originalIndex;
      let cursor = index;

      while (cursor < flowBlocks.length && flowBlocks[cursor].block.type === flowType) {
        cards.push(flowBlocks[cursor]);
        cursor += 1;
      }

      rendered.push(
        <div
          key={`${flowType.toLowerCase()}-group-${groupStartIndex}`}
          style={{
            alignItems: "stretch",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            width: "100%"
          }}
        >
          {cards.map(({ block: card, originalIndex: cardOriginalIndex }) => (
            <div
              key={`card-${groupStartIndex}-${cardOriginalIndex}`}
              style={{
                flex: flow === "grid" ? "1 1 min(240px, 100%)" : "0 1 auto",
                minWidth: 0
              }}
            >
              <PreviewBlock block={card} />
            </div>
          ))}
        </div>
      );
      index = cursor;
      continue;
    }

    rendered.push(
      <div key={`${block.type}-${originalIndex}`}>
        <PreviewBlock block={block} />
      </div>
    );
    index += 1;
  }

  return (
    <>
      {rendered}
      {positionedBlocks.map(({ block, originalIndex }) => (
        <div
          className="motion-positioned-block"
          key={`${block.type}-positioned-${originalIndex}`}
          style={positionedBlockStyle(block, originalIndex)}
        >
          <PreviewBlock block={block} fillFrame />
        </div>
      ))}
    </>
  );
}

export function PreviewBlock({ block, fillFrame = false }: { block: MotionDocBlock; fillFrame?: boolean }) {
  if (block.type === "heading") {
    return (
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
        {block.text}
      </h2>
    );
  }

  if (block.type === "Title") {
    return (
      <Title
        background={stringProp(block.props.background ?? block.props.backgroundColor ?? block.props.bg)}
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fillFrame={fillFrame}
        fontSize={sizeNumberProp(block.props.fontSize, undefined)}
        fontWeight={spacingProp(block.props.fontWeight)}
        lineHeight={spacingProp(block.props.lineHeight)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        textAlign={optionalTextAlignProp(block.props.textAlign)}
        textColor={stringProp(block.props.color ?? block.props.textColor)}
      >
        {block.text}
      </Title>
    );
  }

  if (block.type === "Text") {
    return (
      <Text
        background={stringProp(block.props.background ?? block.props.backgroundColor ?? block.props.bg)}
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fillFrame={fillFrame}
        fontSize={sizeNumberProp(block.props.fontSize, undefined)}
        fontWeight={spacingProp(block.props.fontWeight)}
        lineHeight={spacingProp(block.props.lineHeight)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        textAlign={optionalTextAlignProp(block.props.textAlign)}
        textColor={stringProp(block.props.color ?? block.props.textColor)}
      >
        {block.text}
      </Text>
    );
  }

  if (block.type === "Card") {
    return (
      <Card
        background={stringProp(block.props.background ?? block.props.backgroundColor ?? block.props.bg)}
        color={stringProp(block.props.color ?? block.props.textColor)}
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fillFrame={fillFrame}
        icon={stringProp(block.props.icon)}
        layout={cardLayoutProp(block.props.layout)}
        mutedColor={stringProp(block.props.mutedColor)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        text={String(block.props.text ?? "")}
        title={String(block.props.title ?? "Card")}
        width={cardWidthProp(block.props.width)}
      />
    );
  }

  if (block.type === "ImageBlock") {
    return (
      <ImageBlock
        alt={String(block.props.alt ?? "")}
        background={stringProp(block.props.background ?? block.props.backgroundColor ?? block.props.bg)}
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fillFrame={fillFrame}
        fit={fitProp(block.props.fit)}
        full={booleanProp(block.props.full)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        src={String(block.props.src ?? "")}
      />
    );
  }

  if (block.type === "Metric") {
    return (
      <Metric
        background={stringProp(block.props.background ?? block.props.backgroundColor ?? block.props.bg)}
        caption={stringProp(block.props.caption)}
        color={stringProp(block.props.color ?? block.props.textColor)}
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fillFrame={fillFrame}
        label={String(block.props.label ?? "Metric")}
        mutedColor={stringProp(block.props.mutedColor)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        value={String(block.props.value ?? "0")}
        width={blockWidthProp(block.props.width, "sm")}
      />
    );
  }

  if (block.type === "Chart") {
    return (
      <Chart
        background={stringProp(block.props.background ?? block.props.backgroundColor ?? block.props.bg)}
        color={stringProp(block.props.color ?? block.props.textColor)}
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fillFrame={fillFrame}
        height={sizeNumberProp(block.props.height, 144)}
        labels={stringProp(block.props.labels)}
        mutedColor={stringProp(block.props.mutedColor)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        title={String(block.props.title ?? "Chart")}
        values={stringProp(block.props.values)}
        width={blockWidthProp(block.props.width, "lg")}
      />
    );
  }

  return null;
}

function positionedBlockStyle(block: MotionDocBlock, index: number): CSSProperties {
  const props = "props" in block ? block.props : {};
  const x = percentProp(props.x, 8);
  const y = percentProp(props.y, 12);
  const w = percentProp(props.w, block.type === "Title" ? 52 : 42);
  const h = percentProp(props.h);

  return {
    left: `${x}%`,
    position: "absolute",
    top: `${y}%`,
    width: `${w}%`,
    ...(h === undefined ? {} : { height: `${h}%` }),
    zIndex: 20 + index
  };
}
