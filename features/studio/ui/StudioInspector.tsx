"use client";

import { useState } from "react";
import { Code2, ChevronDown, ChevronRight, Type, Sliders, List } from "lucide-react";
import { BlockLayerIcon } from "@/features/studio/ui/LayerRow";
import { CardFields } from "@/features/studio/ui/inspector/CardFields";
import { ChartFields } from "@/features/studio/ui/inspector/ChartFields";
import { IconFields } from "@/features/studio/ui/inspector/IconFields";
import { ImageFields } from "@/features/studio/ui/inspector/ImageFields";
import { MetricFields } from "@/features/studio/ui/inspector/MetricFields";
import { MotionFields } from "@/features/studio/ui/inspector/MotionFields";
import { ShapeFields } from "@/features/studio/ui/inspector/ShapeFields";
import { SlideSettings } from "@/features/studio/ui/inspector/SlideSettings";
import { SlideLayoutSelector } from "@/features/studio/ui/inspector/SlideLayoutSelector";
import { StackFields } from "@/features/studio/ui/inspector/StackFields";
import { VideoFields } from "@/features/studio/ui/inspector/VideoFields";
import { Field, type PropRecord } from "@/features/studio/ui/inspector/InspectorControls";
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
    <div className="rounded-[1.25rem] border border-white/[0.04] bg-white/[0.01] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05),0_8px_32px_-8px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 hover:border-white/[0.06] hover:bg-white/[0.02]">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3.5 bg-transparent hover:bg-white/[0.02] text-left transition-colors cursor-pointer select-none active:scale-[0.99]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">
          {icon}
          {title}
        </span>
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.03] text-neutral-400 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
          {isOpen ? (
            <ChevronDown size={12} className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
          ) : (
            <ChevronRight size={12} className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
          )}
        </div>
      </button>
      
      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="p-4 flex flex-col gap-5 border-t border-white/[0.03] bg-gradient-to-b from-white/[0.01] to-transparent">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudioInspector({
  activeSlide,
  activeSlideAccent,
  activeSlideAlignX,
  activeSlideAlignY,
  activeSlideBackground,
  activeSlideLayout,
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
  addSlideWithLayout,
  isGridVisible,
  onOpenMdxEditor,
  selectedBlockIndex,
  selectedBlockIndices = [],
  setIsGridVisible,
  setSelectedBlockIndex,
  updateAllSlidesStyle,
  updateActiveSlideStyle,
  updateBlock,
  uploadImageForBlock,
  uploadVideoForBlock
}: {
  activeSlide: MotionDocScene | undefined;
  activeSlideAccent: string;
  activeSlideAlignX: string;
  activeSlideAlignY: string;
  activeSlideBackground: string;
  activeSlideLayout: string;
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
  addSlideWithLayout: (layoutSource: string) => void;
  isGridVisible: boolean;
  onOpenMdxEditor: () => void;
  selectedBlockIndex: number | null;
  selectedBlockIndices?: number[];
  setIsGridVisible: (value: boolean) => void;
  setSelectedBlockIndex: (index: number | null) => void;
  updateAllSlidesStyle: (updates: PropRecord) => void;
  updateActiveSlideStyle: (updates: PropRecord) => void;
  updateBlock: (blockIndex: number, newProps: PropRecord, newText?: string) => void;
  uploadImageForBlock: (blockIndex: number, file: File | undefined) => void;
  uploadVideoForBlock: (blockIndex: number, file: File | undefined) => void;
}) {
  const isMultiSelection = selectedBlockIndices.length >= 2;

  // Try to determine the layout ID of the current slide, fallback to 'blank' or null
  // We can just use the first block to guess or let the selector use default if layout name unknown.
  // We can pass activeSlideLayout to it or just pass null.
  // Actually, we can add layoutId tracking later. For now, pass null so it says "Slide Layout".
  
  return (
    <div id="inspector-v4" className="flex w-full sm:w-[290px] md:w-[320px] shrink-0 flex-col overflow-hidden border border-white/[0.06] rounded-[2rem] mr-4 mb-4 bg-[#050505]/45 backdrop-blur-[32px] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_20px_40px_-10px_rgba(0,0,0,0.8)] select-none h-full relative z-10 transition-all duration-700">
      
      {/* Inspector Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.04] px-5 py-4 bg-white/[0.01]">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Properties</span>
        <button
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-white px-2.5 text-xs font-semibold transition-all cursor-pointer active:scale-95 duration-400 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]"
          onClick={onOpenMdxEditor}
          type="button"
        >
          <Code2 size={11} />
          MDX Editor
        </button>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          {isMultiSelection ? (
            <div className="rounded-xl border border-white/[0.04] bg-neutral-900/20 px-3.5 py-3 text-sm font-semibold text-neutral-300">
              {selectedBlockIndices.length} layers selected
            </div>
          ) : selectedBlockIndex === null ? (
            <div className="flex flex-col gap-4">
              <SlideLayoutSelector 
                currentLayoutId={null} 
                onSelectLayout={(source) => addSlideWithLayout(source)} 
              />
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
            </div>
          ) : (
            <ElementSettings
              activeSlide={activeSlide}
              selectedBlockIndex={selectedBlockIndex as number}
              setSelectedBlockIndex={setSelectedBlockIndex}
              updateBlock={updateBlock}
              uploadImageForBlock={uploadImageForBlock}
              uploadVideoForBlock={uploadVideoForBlock}
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
  uploadImageForBlock,
  uploadVideoForBlock
}: {
  activeSlide: MotionDocScene | undefined;
  selectedBlockIndex: number;
  setSelectedBlockIndex: (index: number | null) => void;
  updateBlock: (blockIndex: number, newProps: PropRecord, newText?: string) => void;
  uploadImageForBlock: (blockIndex: number, file: File | undefined) => void;
  uploadVideoForBlock: (blockIndex: number, file: File | undefined) => void;
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
  const inheritedBackgroundColor = block.type === "Card" || block.type === "Metric" || block.type === "Chart" || block.type === "Stack"
    ? defaultCardBackground(slideTheme, slideBackground)
    : "transparent";
  return (
    <div className="flex flex-col gap-4 animate-[bubble-appear_0.2s_ease-out]">
      <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-neutral-400">Element Properties</h3>
        <button
          className="rounded-lg border border-white/[0.04] bg-white/[0.01] px-2.5 py-1 text-xs font-medium text-neutral-400 transition-all hover:border-white/[0.08] hover:bg-white/[0.02] hover:text-white cursor-pointer active:scale-95 duration-150"
          onClick={() => setSelectedBlockIndex(null)}
          type="button"
        >
          Deselect
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {/* Layer active type display badge */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-neutral-900/20 px-3.5 py-2.5">
          <span className="flex items-center gap-2.5 text-sm font-bold text-neutral-200">
            <BlockLayerIcon block={block} className="text-[#788bfd]" />
            {block.type} Layer
          </span>
        </div>

        {isTextType && (
          <AccordionSection title="Text" icon={<Type size={13} className="text-white" />} defaultOpen={true}>
            {"props" in block ? (
              <TextTypeFields
                block={block}
                selectedBlockIndex={selectedBlockIndex}
                updateBlock={updateBlock}
              />
            ) : null}
            <textarea
              className="w-full resize-none rounded-xl border border-white/[0.04] bg-neutral-950/45 px-3.5 py-2.5 text-sm leading-relaxed text-neutral-200 outline-none transition-all placeholder:text-neutral-700 hover:border-white/[0.08] focus:border-[#788bfd]/50 focus:ring-1 focus:ring-[#788bfd]/15 font-medium shadow-inner"
              onChange={(event) => {
                event.target.style.height = "auto";
                event.target.style.height = `${event.target.scrollHeight}px`;
                updateBlock(selectedBlockIndex, "props" in block ? block.props : {}, event.target.value);
              }}
              onFocus={(event) => {
                event.target.style.height = "auto";
                event.target.style.height = `${event.target.scrollHeight}px`;
              }}
              placeholder="Enter text content..."
              style={{ minHeight: block.type === "Title" ? "64px" : "100px", overflow: "hidden" }}
              value={textValue}
            />
          </AccordionSection>
        )}

        {(block.type === "Card" || block.type === "Chart" || block.type === "Icon" || block.type === "ImageBlock" || block.type === "Metric" || block.type === "Shape" || block.type === "Stack" || block.type === "VideoBlock") && (
          <AccordionSection title={`${block.type} Properties`} icon={<Sliders size={13} className="text-[#8ea5ff]" />} defaultOpen={true}>
            <div className="flex flex-col gap-4">
              {block.type === "Card" && <CardFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
              {block.type === "ImageBlock" && <ImageFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} uploadImageForBlock={uploadImageForBlock} />}
              {block.type === "Metric" && <MetricFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
              {block.type === "Chart" && <ChartFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
              {block.type === "VideoBlock" && <VideoFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} uploadVideoForBlock={uploadVideoForBlock} />}
              {block.type === "Icon" && <IconFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
              {block.type === "Shape" && <ShapeFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
              {block.type === "Stack" && <StackFields block={block} selectedBlockIndex={selectedBlockIndex} updateBlock={updateBlock} />}
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

const textStyleOptions = [
  { label: "Title · 96", size: 96, role: "title" },
  { label: "Header 1 · 60", size: 60, role: "title" },
  { label: "Header 2 · 48", size: 48, role: "title" },
  { label: "Header 3 · 36", size: 36, role: "title" },
  { label: "Body 1 · 36", size: 36, role: "content" },
  { label: "Body 2 · 30", size: 30, role: "content" },
  { label: "Body 3 · 24", size: 24, role: "content" },
  { label: "Note · 20", size: 20, role: "content" }
];

function TextTypeFields({
  block,
  selectedBlockIndex,
  updateBlock
}: {
  block: { type: string; props?: Record<string, string | number>; text?: string };
  selectedBlockIndex: number;
  updateBlock: (blockIndex: number, newProps: Record<string, string | number>, newText?: string) => void;
}) {
  const props = "props" in block && block.props ? block.props : {};
  const text = "text" in block ? (block as { text: string }).text : "";
  const currentRole = String(props.role || (block.type === "Title" ? "title" : "content"));
  const currentFontSize = Number(props.fontSize) || (block.type === "Title" ? 72 : 24);

  const currentValue = `${currentRole}_${currentFontSize}`;
  
  // Find if current matches any option, otherwise default to first
  const isValidOption = textStyleOptions.some(opt => `${opt.role}_${opt.size}` === currentValue);
  const displayValue = isValidOption ? currentValue : `${textStyleOptions[0].role}_${textStyleOptions[0].size}`;

  const selectOptions = textStyleOptions.map(opt => ({
    label: opt.label,
    value: `${opt.role}_${opt.size}`
  }));

  function setTextStyle(value: string) {
    const [role, sizeStr] = value.split("_");
    const size = parseInt(sizeStr, 10);
    const isTitle = role === "title";
    
    const nextProps = {
      ...props,
      fontSize: size,
      fontWeight: isTitle ? 700 : (Number(props.fontWeight) || 560),
      lineHeight: isTitle ? (size >= 60 ? 1 : 1.12) : (Number(props.lineHeight) || 1.45),
      role
    };
    updateBlock(selectedBlockIndex, nextProps, text);
  }

  function toggleList() {
    const isBullet = props.listType === "bullet";
    
    // Auto-add bullets to text if turning on
    let nextText = text;
    if (!isBullet) {
      nextText = text.split("\n").map(line => line.startsWith("• ") ? line : `• ${line}`).join("\n");
    } else {
      nextText = text.split("\n").map(line => line.startsWith("• ") ? line.slice(2) : line).join("\n");
    }

    const nextProps = { ...props };
    if (isBullet) {
      delete nextProps.listType;
    } else {
      nextProps.listType = "bullet";
    }

    updateBlock(selectedBlockIndex, nextProps, nextText);
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Text Style">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative rounded-[1rem] border border-white/[0.05] bg-[#020202] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.03)] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/[0.1] focus-within:border-white/[0.2] focus-within:ring-1 focus-within:ring-white/[0.1]">
            <select
              className="w-full cursor-pointer appearance-none bg-transparent pl-3.5 pr-8 py-2.5 text-sm font-semibold text-neutral-300 outline-none"
              onChange={(event) => setTextStyle(event.target.value)}
              value={displayValue}
            >
              {selectOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0e0e12] text-neutral-200">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={12}
            />
          </div>
          <button
            type="button"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 ${
              props.listType === "bullet"
                ? "border-[#788bfd]/50 bg-[#788bfd]/20 text-[#788bfd] shadow-[0_0_12px_-2px_rgba(120,139,253,0.3)]"
                : "border-white/[0.05] bg-[#020202] text-neutral-400 hover:border-white/[0.1] hover:text-white"
            }`}
            onClick={toggleList}
            title="Toggle Bulleted List"
          >
            <List size={16} />
          </button>
        </div>
      </Field>
    </div>
  );
}
