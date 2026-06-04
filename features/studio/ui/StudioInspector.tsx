"use client";

import { useState } from "react";
import { Code2, Columns3, Rows3, ChevronDown, ChevronRight, Type, Sliders } from "lucide-react";
import { BlockLayerIcon } from "@/features/studio/ui/LayerRow";
import { CardFields } from "@/features/studio/ui/inspector/CardFields";
import { ChartFields } from "@/features/studio/ui/inspector/ChartFields";
import { ImageFields } from "@/features/studio/ui/inspector/ImageFields";
import { MetricFields } from "@/features/studio/ui/inspector/MetricFields";
import { MotionFields } from "@/features/studio/ui/inspector/MotionFields";
import { SlideSettings } from "@/features/studio/ui/inspector/SlideSettings";
import { Field, IconSegmentedControl, NumberInput, type PropRecord } from "@/features/studio/ui/inspector/InspectorControls";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";

function AccordionSection({
  title,
  icon,
  children,
  defaultOpen = true
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/[0.05] bg-[#090a0f]/40 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:border-white/[0.1]">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3.5 py-3 bg-white/[0.015] hover:bg-white/[0.035] text-left transition-all duration-200 cursor-pointer select-none active:scale-[0.99]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-300">
          {icon}
          {title}
        </span>
        {isOpen ? (
          <ChevronDown size={13} className="text-neutral-500 transition-transform duration-200" />
        ) : (
          <ChevronRight size={13} className="text-neutral-500 transition-transform duration-200" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 flex flex-col gap-4.5 border-t border-white/[0.04] bg-black/20 animate-[bubble-appear_0.15s_ease-out]">
          {children}
        </div>
      )}
    </div>
  );
}

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
  activeSlideShader,
  activeSlideShaderColor1,
  activeSlideShaderColor2,
  activeSlideShaderColor3,
  activeSlideShaderIntensity,
  activeSlideShaderEngine,
  activeSlideShaderSpeed,
  activeSlideShaderSoftness,
  activeSlideShaderScale,
  activeSlideShaderDetail,
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
  activeSlideShader: string;
  activeSlideShaderColor1: string;
  activeSlideShaderColor2: string;
  activeSlideShaderColor3: string;
  activeSlideShaderEngine: string;
  activeSlideShaderIntensity: number;
  activeSlideShaderSpeed: number;
  activeSlideShaderSoftness: number;
  activeSlideShaderScale: number;
  activeSlideShaderDetail: number;
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
    <div id="inspector-v4" className="premium-glass-panel flex w-full sm:w-[290px] md:w-[315px] shrink-0 flex-col overflow-hidden rounded-2xl m-3 ml-1.5 shadow-black/90 select-none animate-[bubble-appear_0.2s_ease-out]">
      
      {/* Inspector Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.04] px-4 py-3.5 bg-white/[0.01]">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">Properties</span>
        <button
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[#8ea5ff]/20 bg-[#8ea5ff]/10 hover:bg-[#8ea5ff]/25 text-[#8ea5ff] hover:text-white px-2.5 text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer active:scale-95 duration-250 shadow-sm"
          onClick={onOpenMdxEditor}
          type="button"
        >
          <Code2 size={11} />
          MDX Editor
        </button>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-3 bg-gradient-to-b from-[#07080b]/50 to-[#050608]/50">
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
              shader={activeSlideShader}
              shaderColor1={activeSlideShaderColor1}
              shaderColor2={activeSlideShaderColor2}
              shaderColor3={activeSlideShaderColor3}
              shaderEngine={activeSlideShaderEngine}
              shaderIntensity={activeSlideShaderIntensity}
              shaderSpeed={activeSlideShaderSpeed}
              shaderSoftness={activeSlideShaderSoftness}
              shaderScale={activeSlideShaderScale}
              shaderDetail={activeSlideShaderDetail}
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
    return <div className="p-4 text-center text-[11px] italic text-neutral-500">Element no longer exists.</div>;
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
    <div className="flex flex-col gap-4 animate-[bubble-appear_0.2s_ease-out]">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-neutral-500">Element Properties</h3>
        <button
          className="rounded-lg border border-white/[0.08] bg-white/[0.015] px-2.5 py-1 text-[10px] font-bold text-neutral-400 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white cursor-pointer active:scale-95 duration-200"
          onClick={() => setSelectedBlockIndex(null)}
          type="button"
        >
          Deselect
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {/* Layer active type display badge */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.01] px-3.5 py-2.5">
          <span className="flex items-center gap-2.5 text-[11.5px] font-bold text-neutral-300">
            <BlockLayerIcon block={block} className="text-[#8ea5ff]" />
            {block.type} Layer
          </span>
        </div>

        {isTextType && (
          <AccordionSection title="Text Content" icon={<Type size={13} className="text-[#8ea5ff]" />} defaultOpen={true}>
            <textarea
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/40 px-3.5 py-2.5 text-[12px] leading-relaxed text-neutral-200 outline-none transition-all placeholder:text-neutral-700 focus:border-[#8ea5ff]/50 focus:ring-1 focus:ring-[#8ea5ff]/20 font-medium"
              onChange={(event) => updateBlock(selectedBlockIndex, "props" in block ? block.props : {}, event.target.value)}
              placeholder="Enter text content..."
              rows={block.type === "Title" ? 2 : 4}
              value={textValue}
            />
          </AccordionSection>
        )}

        {(block.type === "Card" || block.type === "ImageBlock" || block.type === "Metric" || block.type === "Chart") && (
          <AccordionSection title={`${block.type} Properties`} icon={<Sliders size={13} className="text-[#8ea5ff]" />} defaultOpen={true}>
            <div className="flex flex-col gap-4">
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
            </div>
          </AccordionSection>
        )}

        {"props" in block && (
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
