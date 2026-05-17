"use client";

import { Code2 } from "lucide-react";
import { BlockLayerIcon } from "@/components/studio/LayerRow";
import { CardFields } from "@/components/studio/inspector/CardFields";
import { ChartFields } from "@/components/studio/inspector/ChartFields";
import { ImageFields } from "@/components/studio/inspector/ImageFields";
import { MetricFields } from "@/components/studio/inspector/MetricFields";
import { MotionFields } from "@/components/studio/inspector/MotionFields";
import { SlideSettings } from "@/components/studio/inspector/SlideSettings";
import type { PropRecord } from "@/components/studio/inspector/InspectorControls";
import type { MotionDocScene } from "@/lib/motionDocParser";

export function StudioInspector({
  activeSlide,
  activeSlideAccent,
  activeSlideAlignX,
  activeSlideAlignY,
  activeSlideBackground,
  activeSlideCardFlow,
  activeSlideLayout,
  activeSlideMetricFlow,
  activeSlideTextAlign,
  activeSlideTheme,
  onOpenMdxEditor,
  selectedBlockIndex,
  setSelectedBlockIndex,
  updateActiveSlideStyle,
  updateBlock,
  uploadImageForBlock
}: {
  activeSlide: MotionDocScene | undefined;
  activeSlideAccent: string;
  activeSlideAlignX: string;
  activeSlideAlignY: string;
  activeSlideBackground: string;
  activeSlideCardFlow: string;
  activeSlideLayout: string;
  activeSlideMetricFlow: string;
  activeSlideTextAlign: string;
  activeSlideTheme: string;
  onOpenMdxEditor: () => void;
  selectedBlockIndex: number | null;
  setSelectedBlockIndex: (index: number | null) => void;
  updateActiveSlideStyle: (updates: PropRecord) => void;
  updateBlock: (blockIndex: number, newProps: PropRecord, newText?: string) => void;
  uploadImageForBlock: (blockIndex: number, file: File | undefined) => void;
}) {
  return (
    <div id="inspector-v4" className="flex w-full sm:w-[280px] md:w-[300px] shrink-0 flex-col overflow-hidden border-l border-neutral-800 bg-[#0a0a0a]">
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-300">Properties</span>
        <button
          className="inline-flex items-center gap-1 rounded-md border border-neutral-800 px-2 py-1 text-[10px] font-medium text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
          onClick={onOpenMdxEditor}
          type="button"
        >
          <Code2 size={11} />
          MDX Editor
        </button>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-4">
          {selectedBlockIndex === null ? (
            <SlideSettings
              accent={activeSlideAccent}
              alignX={activeSlideAlignX}
              alignY={activeSlideAlignY}
              background={activeSlideBackground}
              cardFlow={activeSlideCardFlow}
              duration={activeSlide?.duration ?? 5}
              layout={activeSlideLayout}
              metricFlow={activeSlideMetricFlow}
              textAlign={activeSlideTextAlign}
              theme={activeSlideTheme}
              updateActiveSlideStyle={updateActiveSlideStyle}
            />
          ) : (
            <ElementSettings
              activeSlide={activeSlide}
              selectedBlockIndex={selectedBlockIndex}
              setSelectedBlockIndex={setSelectedBlockIndex}
              updateBlock={updateBlock}
              uploadImageForBlock={uploadImageForBlock}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ElementSettings({
  activeSlide,
  selectedBlockIndex,
  setSelectedBlockIndex,
  updateBlock,
  uploadImageForBlock
}: {
  activeSlide: MotionDocScene | undefined;
  selectedBlockIndex: number;
  setSelectedBlockIndex: (index: number | null) => void;
  updateBlock: (blockIndex: number, newProps: PropRecord, newText?: string) => void;
  uploadImageForBlock: (blockIndex: number, file: File | undefined) => void;
}) {
  const block = activeSlide?.blocks[selectedBlockIndex];

  if (!block) {
    return <div className="p-4 text-center text-[11px] italic text-neutral-400">Element no longer exists.</div>;
  }

  const isTextType = block.type === "Title" || block.type === "Text" || block.type === "heading";
  const textValue = isTextType ? ("text" in block ? block.text : "") : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Element Settings</h3>
        <button
          className="rounded border border-neutral-800 px-2 py-1 text-[10px] text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          onClick={() => setSelectedBlockIndex(null)}
          type="button"
        >
          Deselect
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2">
          <span className="flex items-center gap-2 text-[11px] font-medium text-neutral-300">
            <BlockLayerIcon block={block} className="text-neutral-400" />
            {block.type}
          </span>
        </div>

        {isTextType && (
          <textarea
            className="w-full resize-none rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-[12px] leading-relaxed text-neutral-200 outline-none transition-all placeholder-neutral-700 focus:border-neutral-500"
            onChange={(event) => updateBlock(selectedBlockIndex, "props" in block ? block.props : {}, event.target.value)}
            placeholder="Enter text content..."
            rows={block.type === "Title" ? 2 : 4}
            value={textValue}
          />
        )}

        {"props" in block && (
          <div className="mt-2 flex flex-col gap-4">
            {block.type === "Card" && <CardFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
            {block.type === "ImageBlock" && <ImageFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} uploadImageForBlock={uploadImageForBlock} />}
            {block.type === "Metric" && <MetricFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
            {block.type === "Chart" && <ChartFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
            <MotionFields block={block} isTextType={isTextType} selectedBlockIndex={selectedBlockIndex} textValue={textValue} updateBlock={updateBlock} />
          </div>
        )}
      </div>
    </div>
  );
}
