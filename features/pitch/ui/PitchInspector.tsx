"use client";

import { useState } from "react";
import { Code2, ChevronDown, ChevronRight, List, AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { CardFields } from "@/features/pitch/ui/inspector/CardFields";
import { ChartFields } from "@/features/pitch/ui/inspector/ChartFields";
import { IconFields } from "@/features/pitch/ui/inspector/IconFields";
import { ImageFields } from "@/features/pitch/ui/inspector/ImageFields";
import { MetricFields } from "@/features/pitch/ui/inspector/MetricFields";
import { MotionFields } from "@/features/pitch/ui/inspector/MotionFields";
import { ShapeFields } from "@/features/pitch/ui/inspector/ShapeFields";
import { SlideSettings } from "@/features/pitch/ui/inspector/SlideSettings";
import { SlideLayoutSelector } from "@/features/pitch/ui/inspector/SlideLayoutSelector";
import { StackFields } from "@/features/pitch/ui/inspector/StackFields";
import { VideoFields } from "@/features/pitch/ui/inspector/VideoFields";
import { autoSizeTextFrameProps } from "@/features/pitch/application/textFrameSizing";
import { Field, IconSegmentedControl, NumberInput, type PropRecord } from "@/features/pitch/ui/inspector/InspectorControls";
import { FontPicker } from "@/features/pitch/ui/preview/controls/FontPicker";
import { useDynamicFont } from "@/features/pitch/ui/hooks/useDynamicFont";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import type { BlockUpdater } from "@/features/pitch/ui/pitchCommandTypes";

function Section({
  title,
  children,
  defaultOpen = true,
  rightElement = null
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  rightElement?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col border-b border-white/[0.04] last:border-b-0">
      <div className="flex w-full items-center justify-between py-3">
        <button
          type="button"
          className="flex items-center gap-1.5 text-left transition-colors cursor-pointer select-none group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-center text-neutral-500 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:text-neutral-300">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          <span className="text-[13px] font-medium text-neutral-300 group-hover:text-white transition-colors">
            {title}
          </span>
        </button>
        {rightElement && (
          <div className="flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      
      <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PitchInspector({
  activeSlide,
  activeSlideAccent,
  activeSlideAlignX,
  activeSlideAlignY,
  activeSlideBackground,
  activeSlideLayout,
  activeSlideLayoutPreset,
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
  applyLayoutToActiveSlide,
  isGridVisible,
  onOpenMdxEditor,
  pushUndoSnapshot,
  selectedBlockIndex,
  selectedBlockIndices = [],
  setIsGridVisible,
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
  activeSlideLayoutPreset: string;
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
  applyLayoutToActiveSlide: (layoutSource: string, layoutId: string) => void;
  isGridVisible: boolean;
  onOpenMdxEditor: () => void;
  pushUndoSnapshot: () => void;
  selectedBlockIndex: number | null;
  selectedBlockIndices?: number[];
  setIsGridVisible: (value: boolean) => void;
  updateAllSlidesStyle: (updates: PropRecord) => void;
  updateActiveSlideStyle: (updates: PropRecord) => void;
  updateBlock: BlockUpdater;
  uploadImageForBlock: (blockIndex: number, file: File | undefined) => void;
  uploadVideoForBlock: (blockIndex: number, file: File | undefined) => void;
}) {
  const isMultiSelection = selectedBlockIndices.length >= 2;

  return (
    <div id="inspector-v4" className="flex w-full sm:w-[300px] md:w-[320px] shrink-0 flex-col overflow-hidden border-l border-white/[0.12] bg-[#111111] select-none h-full relative z-10 transition-all duration-700 font-sans antialiased">
      
      {/* Inspector Header */}
      <div className="flex shrink-0 items-center justify-between px-5 h-[52px]">
        <span className="text-[14px] font-medium text-neutral-200">
          {isMultiSelection ? "Multiple Items" : selectedBlockIndex === null ? "Slide" : activeSlide?.blocks[selectedBlockIndex]?.type || "Element"}
        </span>
        <button
          className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-transparent hover:bg-white/[0.05] text-neutral-500 hover:text-white px-2 text-xs font-medium transition-colors cursor-pointer"
          onClick={onOpenMdxEditor}
          type="button"
          title="MDX Editor"
        >
          <Code2 size={14} />
        </button>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col">
          {isMultiSelection ? (
            <div className="mb-5 rounded-lg bg-white/[0.03] px-3 py-3 text-sm font-medium text-neutral-300 text-center">
              {selectedBlockIndices.length} items selected
            </div>
          ) : selectedBlockIndex === null ? (
            <div className="flex flex-col">
              <SlideLayoutSelector 
                currentLayoutId={activeSlideLayoutPreset}
                onSelectLayout={applyLayoutToActiveSlide}
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
                slideTransition={activeSlide?.props.slideTransition}
                textColor={activeSlideTextColor}
                theme={activeSlideTheme}
                transitionDuration={activeSlide?.props.transitionDuration}
                updateAllSlidesStyle={updateAllSlidesStyle}
                updateActiveSlideStyle={updateActiveSlideStyle}
              />
            </div>
          ) : (
            <ElementSettings
              activeSlide={activeSlide}
              pushUndoSnapshot={pushUndoSnapshot}
              selectedBlockIndex={selectedBlockIndex as number}
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
  pushUndoSnapshot,
  selectedBlockIndex,
  updateBlock,
  uploadImageForBlock,
  uploadVideoForBlock
}: {
  activeSlide: MotionDocScene | undefined;
  pushUndoSnapshot: () => void;
  selectedBlockIndex: number;
  updateBlock: BlockUpdater;
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
    <div className="flex flex-col gap-0 animate-[bubble-appear_0.2s_ease-out]">
      <div className="flex flex-col gap-0">

        {isTextType && (
          <Section title="Text" defaultOpen={true}>
            {"props" in block ? (
              <TextTypeFields
                block={block}
                selectedBlockIndex={selectedBlockIndex}
                updateBlock={updateBlock}
              />
            ) : null}
            <textarea
              className="w-full resize-none rounded-lg bg-white/[0.03] px-3 py-2 text-[13px] leading-relaxed text-neutral-200 outline-none transition-colors placeholder:text-neutral-600 hover:bg-white/[0.05] focus:bg-white/[0.06] focus:ring-1 focus:ring-white/[0.12]"
              onChange={(event) => {
                event.target.style.height = "auto";
                event.target.style.height = `${event.target.scrollHeight}px`;
                updateBlock(selectedBlockIndex, "props" in block ? block.props : {}, event.target.value, { transient: true });
              }}
              onBlur={(event) => {
                if (!("props" in block)) {
                  return;
                }

                updateBlock(
                  selectedBlockIndex,
                  autoSizeTextFrameProps({ props: block.props, type: block.type }, event.currentTarget.value, { props: block.props }),
                  event.currentTarget.value,
                  { transient: true }
                );
              }}
              onFocus={(event) => {
                pushUndoSnapshot();
                event.target.style.height = "auto";
                event.target.style.height = `${event.target.scrollHeight}px`;
              }}
              placeholder="Enter text content..."
              style={{ minHeight: block.type === "Title" ? "64px" : "100px", overflow: "hidden" }}
              value={textValue}
            />
          </Section>
        )}

        {(block.type === "Card" || block.type === "Chart" || block.type === "Icon" || block.type === "ImageBlock" || block.type === "Metric" || block.type === "Shape" || block.type === "Stack" || block.type === "VideoBlock") && (
          <Section title={`${block.type} properties`} defaultOpen={true}>
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
          </Section>
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
  updateBlock: BlockUpdater;
}) {
  const props = "props" in block && block.props ? block.props : {};
  const text = "text" in block ? (block as { text: string }).text : "";
  const currentRole = String(props.role || (block.type === "Title" ? "title" : "content"));
  const currentFontSize = Number(props.fontSize) || (block.type === "Title" ? 72 : 24);
  const fontFamily = String(props.fontFamily ?? "");
  
  useDynamicFont(fontFamily);

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
    updateBlock(selectedBlockIndex, autoSizeTextFrameProps({ props, type: block.type }, text, { props: nextProps }), text);
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

    updateBlock(selectedBlockIndex, autoSizeTextFrameProps({ props, type: block.type }, nextText, { props: nextProps }), nextText);
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Style">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative rounded-lg bg-white/[0.03] transition-colors hover:bg-white/[0.05] focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/[0.12]">
            <select
              className="w-full cursor-pointer appearance-none bg-transparent pl-3 pr-8 py-1.5 text-[13px] text-neutral-200 outline-none"
              onChange={(event) => setTextStyle(event.target.value)}
              value={displayValue}
            >
              {selectOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-neutral-900 text-neutral-200">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
              size={14}
            />
          </div>
          <button
            type="button"
            className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer ${
              props.listType === "bullet"
                ? "bg-white/[0.08] text-white"
                : "bg-white/[0.03] text-neutral-500 hover:bg-white/[0.05] hover:text-neutral-300"
            }`}
            onClick={toggleList}
            title="Toggle Bulleted List"
          >
            <List size={14} />
          </button>
        </div>
      </Field>

      <Field label="Typography">
        <div className="flex flex-col gap-1.5">
          <FontPicker
            onChange={(value) => {
              const nextProps = { ...props, fontFamily: value === "" ? "" : value };
              updateBlock(selectedBlockIndex, autoSizeTextFrameProps({ props, type: block.type }, text, { props: nextProps }), text);
            }}
            value={fontFamily}
          />
          <div className="grid grid-cols-[1fr_auto] gap-1.5">
            <NumberInput prefix={<span className="text-[10px] font-semibold text-neutral-500 w-8">Size</span>} min="8" max="180" onChange={(value) => {
              const nextProps = { ...props, fontSize: value === "" ? "" : value };
              updateBlock(selectedBlockIndex, autoSizeTextFrameProps({ props, type: block.type }, text, { props: nextProps }), text);
            }} placeholder={block.type === "Title" ? "72" : "24"} step="1" suffix="px" value={props.fontSize ?? ""} />
            <div className="w-[104px]">
              <IconSegmentedControl
                label=""
                onChange={(value) => {
                  const nextProps = { ...props, textAlign: value };
                  updateBlock(selectedBlockIndex, autoSizeTextFrameProps({ props, type: block.type }, text, { props: nextProps }), text);
                }}
                options={[
                  { icon: <AlignLeft size={14} />, label: "Align left", value: "left" },
                  { icon: <AlignCenter size={14} />, label: "Align center", value: "center" },
                  { icon: <AlignRight size={14} />, label: "Align right", value: "right" }
                ]}
                value={String(props.textAlign ?? "left")}
              />
            </div>
          </div>
        </div>
      </Field>
    </div>
  );
}
