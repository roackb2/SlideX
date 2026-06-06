"use client";

import type { CSSProperties } from "react";
import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";
import {
  blockWidthProp,
  booleanProp,
  cardLayoutProp,
  cardWidthProp,
  enterProp,
  fitProp,
  isPositionedBlock,
  numberProp,
  optionalTextAlignProp,
  sizeNumberProp,
  spacingProp,
  stringProp
} from "@/features/studio/application/previewProps";
import { blockFrame } from "@/features/studio/application/previewCanvas";
import { Card, Chart, IconBlock, ImageBlock, Metric, ShapeBlock, StackBlock, Text, Title, VideoBlock } from "@/features/studio/ui/preview/motion-blocks";

export type PreviewBlockItem = {
  block: MotionDocBlock;
  originalIndex: number;
};

type PreviewBlockListProps = {
  hiddenBlockIndices: Set<number>;
  items: PreviewBlockItem[];
};

export function PreviewBlockList({
  hiddenBlockIndices,
  items
}: PreviewBlockListProps) {
  const visibleItems = items.filter(({ originalIndex }) => !hiddenBlockIndices.has(originalIndex));
  const flowBlocks = visibleItems.filter(({ block }) => !isPositionedBlock(block));
  const positionedBlocks = visibleItems.filter(({ block }) => isPositionedBlock(block));

  return (
    <>
      {flowBlocks.map(({ block, originalIndex }) => (
        <div key={`${block.type}-${originalIndex}`}>
          <PreviewBlock block={block} />
        </div>
      ))}
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
        fontFamily={stringProp(block.props.fontFamily)}
        fontSize={sizeNumberProp(block.props.fontSize, undefined)}
        fontWeight={spacingProp(block.props.fontWeight)}
        lineHeight={spacingProp(block.props.lineHeight)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        textAlign={optionalTextAlignProp(block.props.textAlign)}
        textColor={stringProp(block.props.color ?? block.props.textColor)}
        textVerticalAlign={stringProp(block.props.textVerticalAlign)}
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
        fontFamily={stringProp(block.props.fontFamily)}
        fontSize={sizeNumberProp(block.props.fontSize, undefined)}
        fontWeight={spacingProp(block.props.fontWeight)}
        lineHeight={spacingProp(block.props.lineHeight)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        textAlign={optionalTextAlignProp(block.props.textAlign)}
        textColor={stringProp(block.props.color ?? block.props.textColor)}
        textVerticalAlign={stringProp(block.props.textVerticalAlign)}
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

  if (block.type === "VideoBlock") {
    return (
      <VideoBlock
        background={stringProp(block.props.background ?? block.props.backgroundColor ?? block.props.bg)}
        controls={booleanProp(block.props.controls ?? "true")}
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fillFrame={fillFrame}
        fit={fitProp(block.props.fit)}
        full={booleanProp(block.props.full)}
        loop={booleanProp(block.props.loop ?? "true")}
        muted={booleanProp(block.props.muted ?? "true")}
        poster={stringProp(block.props.poster)}
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
        chartType={stringProp(block.props.chartType ?? block.props.type)}
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

  if (block.type === "Icon") {
    return (
      <IconBlock
        background={stringProp(block.props.background ?? block.props.backgroundColor ?? block.props.bg)}
        color={stringProp(block.props.color ?? block.props.textColor)}
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fillFrame={fillFrame}
        icon={stringProp(block.props.icon)}
        mutedColor={stringProp(block.props.mutedColor)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        size={sizeNumberProp(block.props.size, 96)}
        strokeWidth={spacingProp(block.props.strokeWidth)}
      />
    );
  }

  if (block.type === "Shape") {
    return (
      <ShapeBlock
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fill={stringProp(block.props.fill)}
        fillFrame={fillFrame}
        mask={stringProp(block.props.mask)}
        operation={stringProp(block.props.operation)}
        opacity={spacingProp(block.props.opacity)}
        points={spacingProp(block.props.points)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        shape={stringProp(block.props.shape)}
        sides={spacingProp(block.props.sides)}
        stroke={stringProp(block.props.stroke)}
        strokeWidth={spacingProp(block.props.strokeWidth)}
      />
    );
  }

  if (block.type === "Stack") {
    return (
      <StackBlock
        align={stringProp(block.props.align)}
        background={stringProp(block.props.background ?? block.props.backgroundColor ?? block.props.bg)}
        color={stringProp(block.props.color ?? block.props.textColor)}
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fillFrame={fillFrame}
        gap={spacingProp(block.props.gap)}
        items={stringProp(block.props.items)}
        layout={stringProp(block.props.layout)}
        mutedColor={stringProp(block.props.mutedColor)}
        padding={spacingProp(block.props.padding)}
        radius={spacingProp(block.props.radius ?? block.props.borderRadius)}
        stroke={stringProp(block.props.stroke)}
      />
    );
  }

  return null;
}

function positionedBlockStyle(block: MotionDocBlock, index: number): CSSProperties {
  const frame = blockFrame(block);
  const h = "props" in block ? block.props.h : undefined;

  return {
    left: `${frame.x}%`,
    position: "absolute",
    top: `${frame.y}%`,
    width: `${frame.w}%`,
    ...(h === undefined ? {} : { height: `${frame.h}%` }),
    zIndex: 20 + index
  };
}
