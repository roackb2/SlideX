"use client";

import { Code2, Columns3, Rows3 } from "lucide-react";
import { BlockLayerIcon } from "@/components/studio/LayerRow";
import { CardFields } from "@/components/studio/inspector/CardFields";
import { ChartFields } from "@/components/studio/inspector/ChartFields";
import { ImageFields } from "@/components/studio/inspector/ImageFields";
import { MetricFields } from "@/components/studio/inspector/MetricFields";
import { MotionFields } from "@/components/studio/inspector/MotionFields";
import { SlideSettings } from "@/components/studio/inspector/SlideSettings";
import { Field, IconSegmentedControl, NumberInput, type PropRecord } from "@/components/studio/inspector/InspectorControls";
import type { MotionDocScene } from "@/lib/motionDocParser";

export function StudioInspector({
  activeSlide,
  activeSlideAccent,
  activeSlideAlignX,
  activeSlideAlignY,
  activeSlideBackground,
  activeSlideCardFlow,
  activeSlideCardGap,
  activeSlideChartFlow,
  activeSlideChartGap,
  activeSlideLayout,
  activeSlideMetricFlow,
  activeSlideMetricGap,
  activeSlideMutedColor,
  activeSlideTextColor,
  activeSlideTheme,
  isGridVisible,
  onOpenMdxEditor,
  selectedBlockIndex,
  setIsGridVisible,
  setSelectedBlockIndex,
  updateAllSlidesStyle,
  updateActiveSlideStyle,
  updateBlockGroupFlow,
  updateBlock,
  uploadImageForBlock
}: {
  activeSlide: MotionDocScene | undefined;
  activeSlideAccent: string;
  activeSlideAlignX: string;
  activeSlideAlignY: string;
  activeSlideBackground: string;
  activeSlideCardFlow: string;
  activeSlideCardGap: number;
  activeSlideChartFlow: string;
  activeSlideChartGap: number;
  activeSlideLayout: string;
  activeSlideMetricFlow: string;
  activeSlideMetricGap: number;
  activeSlideMutedColor: string;
  activeSlideTextColor: string;
  activeSlideTheme: string;
  isGridVisible: boolean;
  onOpenMdxEditor: () => void;
  selectedBlockIndex: number | null;
  setIsGridVisible: (value: boolean) => void;
  setSelectedBlockIndex: (index: number | null) => void;
  updateAllSlidesStyle: (updates: PropRecord) => void;
  updateActiveSlideStyle: (updates: PropRecord) => void;
  updateBlockGroupFlow: (blockType: "Card" | "Chart" | "Metric", flow: string, gap?: number) => void;
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
              duration={activeSlide?.duration ?? 5}
              isGridVisible={isGridVisible}
              layout={activeSlideLayout}
              mutedColor={activeSlideMutedColor}
              setIsGridVisible={setIsGridVisible}
              textColor={activeSlideTextColor}
              theme={activeSlideTheme}
              updateAllSlidesStyle={updateAllSlidesStyle}
              updateActiveSlideStyle={updateActiveSlideStyle}
            />
          ) : (
            <ElementSettings
              activeSlide={activeSlide}
              activeSlideCardFlow={activeSlideCardFlow}
              activeSlideCardGap={activeSlideCardGap}
              activeSlideChartFlow={activeSlideChartFlow}
              activeSlideChartGap={activeSlideChartGap}
              activeSlideMetricFlow={activeSlideMetricFlow}
              activeSlideMetricGap={activeSlideMetricGap}
              selectedBlockIndex={selectedBlockIndex}
              setSelectedBlockIndex={setSelectedBlockIndex}
              updateBlockGroupFlow={updateBlockGroupFlow}
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
  activeSlideCardFlow,
  activeSlideCardGap,
  activeSlideChartFlow,
  activeSlideChartGap,
  activeSlideMetricFlow,
  activeSlideMetricGap,
  selectedBlockIndex,
  setSelectedBlockIndex,
  updateBlockGroupFlow,
  updateBlock,
  uploadImageForBlock
}: {
  activeSlide: MotionDocScene | undefined;
  activeSlideCardFlow: string;
  activeSlideCardGap: number;
  activeSlideChartFlow: string;
  activeSlideChartGap: number;
  activeSlideMetricFlow: string;
  activeSlideMetricGap: number;
  selectedBlockIndex: number;
  setSelectedBlockIndex: (index: number | null) => void;
  updateBlockGroupFlow: (blockType: "Card" | "Chart" | "Metric", flow: string, gap?: number) => void;
  updateBlock: (blockIndex: number, newProps: PropRecord, newText?: string) => void;
  uploadImageForBlock: (blockIndex: number, file: File | undefined) => void;
}) {
  const block = activeSlide?.blocks[selectedBlockIndex];

  if (!block) {
    return <div className="p-4 text-center text-[11px] italic text-neutral-400">Element no longer exists.</div>;
  }

  const isTextType = block.type === "Title" || block.type === "Text" || block.type === "heading";
  const textValue = isTextType ? ("text" in block ? block.text : "") : "";
  const slideTheme = stringValue(activeSlide?.props.theme) ?? "dark";
  const slideBackground = stringValue(activeSlide?.props.background) ?? "#030303";
  const inheritedTextColor =
    stringValue(activeSlide?.props.textColor ?? activeSlide?.props.foreground ?? activeSlide?.props.color) ??
    (slideTheme === "light" || slideTheme === "paper" ? "#111827" : "#ffffff");
  const inheritedMutedColor = stringValue(activeSlide?.props.mutedColor) ?? (slideTheme === "light" || slideTheme === "paper" ? "#475569" : "#cbd5e1");
  const inheritedBackgroundColor = block.type === "Card" || block.type === "Metric" || block.type === "Chart"
    ? defaultCardBackground(slideTheme, slideBackground)
    : "transparent";

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
            <GroupLayoutControl
              blockType={block.type}
              cardFlow={activeSlideCardFlow}
              cardGap={activeSlideCardGap}
              chartFlow={activeSlideChartFlow}
              chartGap={activeSlideChartGap}
              metricFlow={activeSlideMetricFlow}
              metricGap={activeSlideMetricGap}
              updateBlockGroupFlow={updateBlockGroupFlow}
            />
            {block.type === "Card" && <CardFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
            {block.type === "ImageBlock" && <ImageFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} uploadImageForBlock={uploadImageForBlock} />}
            {block.type === "Metric" && <MetricFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
            {block.type === "Chart" && <ChartFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
            <MotionFields
              block={block}
              inheritedBackgroundColor={inheritedBackgroundColor}
              inheritedMutedColor={inheritedMutedColor}
              inheritedTextColor={inheritedTextColor}
              isTextType={isTextType}
              selectedBlockIndex={selectedBlockIndex}
              textValue={textValue}
              updateBlock={updateBlock}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function stringValue(value: string | number | undefined) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return undefined;
}

function defaultCardBackground(theme: string, background: string) {
  if (theme === "light" || theme === "paper" || isLightBackground(background)) {
    return "rgba(255,255,255,0.72)";
  }

  return "rgba(255,255,255,0.075)";
}

function isLightBackground(background: string) {
  const hex = background.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return false;
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);

  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255 > 0.62;
}

function GroupLayoutControl({
  blockType,
  cardFlow,
  cardGap,
  chartFlow,
  chartGap,
  metricFlow,
  metricGap,
  updateBlockGroupFlow
}: {
  blockType: string;
  cardFlow: string;
  cardGap: number;
  chartFlow: string;
  chartGap: number;
  metricFlow: string;
  metricGap: number;
  updateBlockGroupFlow: (blockType: "Card" | "Chart" | "Metric", flow: string, gap?: number) => void;
}) {
  if (blockType === "Card") {
    return <StackRowControl blockType="Card" flow={cardFlow} gap={cardGap} updateBlockGroupFlow={updateBlockGroupFlow} />;
  }

  if (blockType === "Metric") {
    return <StackRowControl blockType="Metric" flow={metricFlow} gap={metricGap} updateBlockGroupFlow={updateBlockGroupFlow} />;
  }

  if (blockType === "Chart") {
    return <StackRowControl blockType="Chart" flow={chartFlow} gap={chartGap} updateBlockGroupFlow={updateBlockGroupFlow} />;
  }

  return null;
}

const flowOptions = [
  { icon: <Rows3 size={14} />, label: "Stack", value: "stack" },
  { icon: <Columns3 size={14} />, label: "Row", value: "row" }
];

function StackRowControl({
  blockType,
  flow,
  gap,
  updateBlockGroupFlow
}: {
  blockType: "Card" | "Chart" | "Metric";
  flow: string;
  gap: number;
  updateBlockGroupFlow: (blockType: "Card" | "Chart" | "Metric", flow: string, gap?: number) => void;
}) {
  const normalizedFlow = flow === "row" ? "row" : "stack";

  return (
    <div className="grid gap-3">
      <IconSegmentedControl
        label="Stack"
        options={flowOptions}
        value={normalizedFlow}
        onChange={(value) => updateBlockGroupFlow(blockType, value, gap)}
      />
      {normalizedFlow === "row" ? (
        <Field label="Gap">
          <NumberInput
            max="16"
            min="0"
            onChange={(value) => updateBlockGroupFlow(blockType, "row", value === "" ? 3 : value)}
            step="0.5"
            suffix="%"
            value={gap}
          />
        </Field>
      ) : null}
    </div>
  );
}
