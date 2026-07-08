"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import {
  alignXProp,
  alignYProp,
  isPositionedBlock,
  layoutProp,
  numberProp,
  stringProp,
  textAlignProp
} from "@/features/pitch/application/previewProps";
import { PreviewBlock, PreviewBlockList } from "@/features/pitch/ui/preview/PreviewBlock";
import { Scene, Text } from "@/features/pitch/ui/preview/motion-blocks";

type PreviewPaneProps = {
  activeSlideIndex?: number;
  autoHeight?: boolean;
  hiddenBlockIndices?: number[];
  replayNonce: number;
  source: string;
};

export function PreviewPane({
  activeSlideIndex = 0,
  autoHeight = false,
  hiddenBlockIndices = [],
  replayNonce,
  source
}: PreviewPaneProps) {
  const document = useMemo(() => parseMotionDoc(source), [source]);
  const hiddenBlockIndexSet = useMemo(() => new Set(hiddenBlockIndices), [hiddenBlockIndices]);
  const activeSlide = document.scenes[activeSlideIndex] ?? document.scenes[0];
  const hasSlides = document.scenes.length > 0;

  if (!hasSlides) {
    return <PreviewCompileError />;
  }

  if (!activeSlide) {
    return null;
  }

  const layout = layoutProp(activeSlide.props.layout);
  const blockItems = activeSlide.blocks.map((block, originalIndex) => ({ block, originalIndex }));
  const imageItems = blockItems.filter(({ block }) => block.type === "ImageBlock");
  const contentItems = blockItems.filter(({ block }) => block.type !== "ImageBlock");
  const hasPositionedBlocks = activeSlide.blocks.some(isPositionedBlock);
  const shouldSplit = !hasPositionedBlocks && layout !== "default" && imageItems.length > 0;
  const textOrder = layout === "split-left" ? 1 : 2;
  const imageOrder = layout === "split-left" ? 2 : 1;

  return (
    <div key={replayNonce} style={autoHeight ? { minHeight: "100%", position: "relative" } : { inset: 0, position: "absolute" }}>
      <Scene
        accent={stringProp(activeSlide.props.accent)}
        alignX={alignXProp(activeSlide.props.alignX)}
        alignY={alignYProp(activeSlide.props.alignY)}
        autoHeight={autoHeight}
        background={stringProp(activeSlide.props.background)}
        backgroundFit={stringProp(activeSlide.props.backgroundFit)}
        backgroundImage={stringProp(activeSlide.props.backgroundImage)}
        duration={activeSlide.duration}
        freeform={hasPositionedBlocks}
        key={`${replayNonce}-${activeSlideIndex}-${activeSlide.duration}`}
        layout={shouldSplit ? layout : "default"}
        mutedColor={stringProp(activeSlide.props.mutedColor)}
        shader={stringProp(activeSlide.props.shader)}
        shaderAngle={numberProp(activeSlide.props.shaderAngle)}
        shaderColor1={stringProp(activeSlide.props.shaderColor1)}
        shaderColor2={stringProp(activeSlide.props.shaderColor2)}
        shaderColor3={stringProp(activeSlide.props.shaderColor3)}
        shaderColor4={stringProp(activeSlide.props.shaderColor4)}
        shaderColor5={stringProp(activeSlide.props.shaderColor5)}
        shaderColor6={stringProp(activeSlide.props.shaderColor6)}
        shaderDetail={numberProp(activeSlide.props.shaderDetail)}
        shaderEngine={stringProp(activeSlide.props.shaderEngine)}
        shaderIntensity={numberProp(activeSlide.props.shaderIntensity)}
        shaderPreset={stringProp(activeSlide.props.shaderPreset)}
        shaderScale={numberProp(activeSlide.props.shaderScale)}
        shaderSoftness={numberProp(activeSlide.props.shaderSoftness)}
        shaderSpeed={numberProp(activeSlide.props.shaderSpeed)}
        slideTransition={stringProp(activeSlide.props.slideTransition)}
        textAlign={textAlignProp(activeSlide.props.textAlign)}
        textColor={stringProp(activeSlide.props.textColor ?? activeSlide.props.foreground ?? activeSlide.props.color)}
        theme={stringProp(activeSlide.props.theme)}
        transitionDuration={numberProp(activeSlide.props.transitionDuration)}
      >
        {shouldSplit ? (
          <>
            <div style={{ ...splitContentStyle, order: textOrder }}>
              {contentItems.length > 0 ? (
                <PreviewBlockList
                  hiddenBlockIndices={hiddenBlockIndexSet}
                  items={contentItems}
                />
              ) : (
                <Text>Add a text layer for this side.</Text>
              )}
            </div>
            <div style={{ ...splitImageStyle, order: imageOrder }}>
              {imageItems
                .filter(({ originalIndex }) => !hiddenBlockIndexSet.has(originalIndex))
                .map(({ block, originalIndex }) => (
                  <div key={`${block.type}-image-${originalIndex}`} style={{ width: "100%" }}>
                    <PreviewBlock block={block} />
                  </div>
                ))}
            </div>
          </>
        ) : activeSlide.blocks.length > 0 ? (
          <PreviewBlockList
            hiddenBlockIndices={hiddenBlockIndexSet}
            items={blockItems}
          />
        ) : null}
      </Scene>
    </div>
  );
}

function PreviewCompileError() {
  return (
    <div style={{ alignItems: "center", display: "flex", inset: 0, justifyContent: "center", padding: 32, position: "absolute" }}>
      <div style={{ background: "rgba(127,29,29,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 12, color: "#f87171", fontFamily: "monospace", fontSize: 13, maxWidth: 420, padding: 16 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>Compile Error</p>
        <p style={{ whiteSpace: "pre-wrap" }}>No &lt;Slide&gt; blocks found. Add a slide or load one of the presets.</p>
      </div>
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
