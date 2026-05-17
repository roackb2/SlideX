"use client";

import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Card, Chart, ImageBlock, Metric, Scene, Text, Title } from "@/components/motion-blocks";
import { parseMotionDoc, type MotionDocBlock } from "@/lib/motionDocParser";

type PreviewPaneProps = {
  source: string;
  replayNonce: number;
  activeSlideIndex?: number;
  autoHeight?: boolean;
};

type EnterAnimation = "fadeIn" | "fadeUp" | "zoomIn" | "slideLeft";
type SlideLayout = "default" | "split-left" | "split-right";
type AlignX = "left" | "center" | "right" | "stretch";
type AlignY = "top" | "center" | "bottom";
type TextAlign = "left" | "center" | "right";
type CardFlow = "stack" | "row" | "grid";
type FlowBlockType = "Card" | "Metric";

export function PreviewPane({ source, replayNonce, activeSlideIndex = 0, autoHeight = false }: PreviewPaneProps) {
  const document = useMemo(() => parseMotionDoc(source), [source]);
  const activeSlide = document.scenes[activeSlideIndex] ?? document.scenes[0];
  const hasSlides = document.scenes.length > 0;

  if (!hasSlides) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ borderRadius: 12, border: "1px solid rgba(220,38,38,0.3)", background: "rgba(127,29,29,0.15)", padding: 16, maxWidth: 420, fontFamily: "monospace", fontSize: 13, color: "#f87171" }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Compile Error</p>
          <p style={{ whiteSpace: "pre-wrap" }}>No &lt;Slide&gt; blocks found. Add a slide or load one of the presets.</p>
        </div>
      </div>
    );
  }

  if (!activeSlide) return null;

  const layout = layoutProp(activeSlide.props.layout);
  const imageBlocks = activeSlide.blocks.filter((block) => block.type === "ImageBlock");
  const contentBlocks = activeSlide.blocks.filter((block) => block.type !== "ImageBlock");
  const shouldSplit = layout !== "default" && imageBlocks.length > 0;
  const textOrder = layout === "split-left" ? 1 : 2;
  const imageOrder = layout === "split-left" ? 2 : 1;
  const cardFlow = groupFlowProp(activeSlide.props.cardFlow);
  const metricFlow = groupFlowProp(activeSlide.props.metricFlow ?? activeSlide.props.cardFlow);

  return (
    <div key={replayNonce} style={autoHeight ? { minHeight: "100%", position: "relative" } : { position: "absolute", inset: 0 }}>
      <Scene
        accent={stringProp(activeSlide.props.accent)}
        alignX={alignXProp(activeSlide.props.alignX)}
        alignY={alignYProp(activeSlide.props.alignY)}
        autoHeight={autoHeight}
        background={stringProp(activeSlide.props.background)}
        duration={activeSlide.duration}
        key={`${replayNonce}-${activeSlideIndex}-${activeSlide.duration}`}
        layout={shouldSplit ? layout : "default"}
        textAlign={textAlignProp(activeSlide.props.textAlign)}
        theme={stringProp(activeSlide.props.theme)}
      >
        {shouldSplit ? (
          <>
            <div style={{ ...splitContentStyle, order: textOrder }}>
              {contentBlocks.length > 0 ? (
                <PreviewBlockList blocks={contentBlocks} cardFlow={cardFlow} metricFlow={metricFlow} />
              ) : (
                <Text enter="fadeIn">Add a text layer for this side.</Text>
              )}
            </div>
            <div style={{ ...splitImageStyle, order: imageOrder }}>
              {imageBlocks.map((block, blockIndex) => (
                <div key={`${block.type}-image-${blockIndex}`} style={{ width: "100%" }}>
                  <PreviewBlock block={block} />
                </div>
              ))}
            </div>
          </>
        ) : activeSlide.blocks.length > 0 ? (
          <PreviewBlockList blocks={activeSlide.blocks} cardFlow={cardFlow} metricFlow={metricFlow} />
        ) : (
          <Text enter="fadeIn">This slide is empty.</Text>
        )}
      </Scene>
    </div>
  );
}

const splitContentStyle: CSSProperties = {
  display: "flex",
  flex: "1 1 0",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: 0,
  minWidth: 0
};

const splitImageStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  flex: "1 1 0",
  justifyContent: "center",
  minHeight: 0,
  minWidth: 0
};

function PreviewBlockList({ blocks, cardFlow, metricFlow }: { blocks: MotionDocBlock[]; cardFlow: CardFlow; metricFlow: CardFlow }) {
  const rendered: ReactNode[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    const flowType = flowBlockType(block);
    const flow = flowType === "Card" ? cardFlow : flowType === "Metric" ? metricFlow : "stack";

    if (flowType && flow !== "stack") {
      const cards: MotionDocBlock[] = [];
      let cursor = index;

      while (cursor < blocks.length && blocks[cursor].type === flowType) {
        cards.push(blocks[cursor]);
        cursor += 1;
      }

      rendered.push(
        <div
          key={`${flowType.toLowerCase()}-group-${index}`}
          style={{
            alignItems: "stretch",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            width: "100%"
          }}
        >
          {cards.map((card, cardIndex) => (
            <div
              key={`card-${index}-${cardIndex}`}
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
      <div key={`${block.type}-${index}`}>
        <PreviewBlock block={block} />
      </div>
    );
    index += 1;
  }

  return <>{rendered}</>;
}

function PreviewBlock({ block }: { block: MotionDocBlock }) {
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
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        marginBottom={spacingProp(block.props.marginBottom ?? block.props.mb)}
      >
        {block.text}
      </Title>
    );
  }

  if (block.type === "Text") {
    return (
      <Text
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        marginBottom={spacingProp(block.props.marginBottom ?? block.props.mb)}
      >
        {block.text}
      </Text>
    );
  }

  if (block.type === "Card") {
    return (
      <Card
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        icon={stringProp(block.props.icon)}
        layout={cardLayoutProp(block.props.layout)}
        marginBottom={spacingProp(block.props.marginBottom ?? block.props.mb)}
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
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        fit={fitProp(block.props.fit)}
        full={booleanProp(block.props.full)}
        marginBottom={spacingProp(block.props.marginBottom ?? block.props.mb)}
        src={String(block.props.src ?? "")}
      />
    );
  }

  if (block.type === "Metric") {
    return (
      <Metric
        caption={stringProp(block.props.caption)}
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        label={String(block.props.label ?? "Metric")}
        marginBottom={spacingProp(block.props.marginBottom ?? block.props.mb)}
        value={String(block.props.value ?? "0")}
        width={blockWidthProp(block.props.width, "sm")}
      />
    );
  }

  if (block.type === "Chart") {
    return (
      <Chart
        delay={numberProp(block.props.delay)}
        duration={numberProp(block.props.duration)}
        enter={enterProp(block.props.enter)}
        height={sizeNumberProp(block.props.height, 144)}
        labels={stringProp(block.props.labels)}
        marginBottom={spacingProp(block.props.marginBottom ?? block.props.mb)}
        title={String(block.props.title ?? "Chart")}
        values={stringProp(block.props.values)}
        width={blockWidthProp(block.props.width, "lg")}
      />
    );
  }

  return null;
}

function flowBlockType(block: MotionDocBlock): FlowBlockType | null {
  if (block.type === "Card" || block.type === "Metric") {
    return block.type;
  }

  return null;
}

function numberProp(value: string | number | undefined) {
  return typeof value === "number" ? value : undefined;
}

function stringProp(value: string | number | undefined) {
  return typeof value === "string" ? value : undefined;
}

function spacingProp(value: string | number | undefined) {
  return value;
}

function enterProp(value: string | number | undefined): EnterAnimation | undefined {
  if (
    value === "fadeIn" ||
    value === "fadeUp" ||
    value === "zoomIn" ||
    value === "slideLeft"
  ) {
    return value;
  }

  return undefined;
}

function layoutProp(value: string | number | undefined): SlideLayout {
  if (value === "split-left" || value === "split-right") {
    return value;
  }

  return "default";
}

function fitProp(value: string | number | undefined) {
  if (value === "cover" || value === "contain" || value === "fill" || value === "scale-down") {
    return value;
  }

  return "cover";
}

function booleanProp(value: string | number | undefined) {
  return value === "true" || value === 1;
}

function alignXProp(value: string | number | undefined): AlignX {
  if (value === "center" || value === "right" || value === "stretch") {
    return value;
  }

  return "left";
}

function alignYProp(value: string | number | undefined): AlignY {
  if (value === "top" || value === "bottom") {
    return value;
  }

  return "center";
}

function textAlignProp(value: string | number | undefined): TextAlign {
  if (value === "center" || value === "right") {
    return value;
  }

  return "left";
}

function cardLayoutProp(value: string | number | undefined) {
  return value === "horizontal" ? "horizontal" : "vertical";
}

function groupFlowProp(value: string | number | undefined): CardFlow {
  if (value === "row" || value === "grid") {
    return value;
  }

  return "stack";
}

function cardWidthProp(value: string | number | undefined) {
  return blockWidthProp(value, "md");
}

function blockWidthProp(value: string | number | undefined, fallback: "sm" | "md" | "lg" | "full") {
  if (value === "sm" || value === "md" || value === "lg" || value === "full") {
    return value;
  }

  return fallback;
}

function sizeNumberProp(value: string | number | undefined, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}
