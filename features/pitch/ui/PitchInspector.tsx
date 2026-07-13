"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  List
} from "lucide-react";
import { MotionFields } from "@/features/pitch/ui/inspector/MotionFields";
import { SlideSettings } from "@/features/pitch/ui/inspector/SlideSettings";
import { SlideLayoutSelector } from "@/features/pitch/ui/inspector/SlideLayoutSelector";
import { autoSizeTextFrameProps } from "@/features/pitch/application/textFrameSizing";
import { Field, IconSegmentedControl, NumberInput, type PropRecord } from "@/features/pitch/ui/inspector/InspectorControls";
import { getBlockFieldRegistryEntry } from "@/features/pitch/ui/inspector/blockFieldRegistry";
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
  activeSlideShaderAngle,
  activeSlideShaderColor1,
  activeSlideShaderColor2,
  activeSlideShaderColor3,
  activeSlideShaderColor4,
  activeSlideShaderColor5,
  activeSlideShaderColor6,
  activeSlideShaderIntensity,
  activeSlideShaderEngine,
  activeSlideShaderPreset,
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
  activeSlideShaderAngle: number;
  activeSlideShaderColor1: string;
  activeSlideShaderColor2: string;
  activeSlideShaderColor3: string;
  activeSlideShaderColor4: string;
  activeSlideShaderColor5: string;
  activeSlideShaderColor6: string;
  activeSlideShaderEngine: string;
  activeSlideShaderIntensity: number;
  activeSlideShaderPreset: string;
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
                shaderAngle={activeSlideShaderAngle}
                shaderColor1={activeSlideShaderColor1}
                shaderColor2={activeSlideShaderColor2}
                shaderColor3={activeSlideShaderColor3}
                shaderColor4={activeSlideShaderColor4}
                shaderColor5={activeSlideShaderColor5}
                shaderColor6={activeSlideShaderColor6}
                shaderEngine={activeSlideShaderEngine}
                shaderIntensity={activeSlideShaderIntensity}
                shaderPreset={activeSlideShaderPreset}
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
	  const inheritedBackgroundColor = block.type === "Card" || block.type === "Metric" || block.type === "Chart" || block.type === "Stack"
	    ? defaultCardBackground(slideTheme, slideBackground)
	    : "transparent";
	  const blockFieldEntry = getBlockFieldRegistryEntry(block.type);

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

	        {blockFieldEntry && "props" in block ? (
	          <Section title={blockFieldEntry.title} defaultOpen={true}>
	            <div className="flex flex-col gap-4">
	              {blockFieldEntry.render({
	                block,
	                selectedBlockIndex,
	                updateBlock,
	                uploadImageForBlock,
	                uploadVideoForBlock
	              })}
	            </div>
	          </Section>
	        ) : null}

        {"props" in block && (
          <MotionFields
            block={block}
            inheritedBackgroundColor={inheritedBackgroundColor}
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
  { description: "Large statement", label: "Display", lineHeight: 1, size: 72, weight: 700, role: "title" },
  { description: "Section heading", label: "Heading", lineHeight: 1.08, size: 48, weight: 650, role: "title" },
  { description: "Introductory copy", label: "Lead", lineHeight: 1.28, size: 30, weight: 560, role: "content" },
  { description: "Comfortable reading", label: "Body", lineHeight: 1.45, size: 24, weight: 400, role: "content" },
  { description: "Details and notes", label: "Caption", lineHeight: 1.35, size: 18, weight: 500, role: "content" }
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

  const activeStyle = textStyleOptions.find((option) => option.role === currentRole && option.size === currentFontSize);

  function setTextStyle(value: string) {
    const option = textStyleOptions.find((item) => item.label === value);
    if (!option) return;

    const nextProps = {
      ...props,
      fontSize: option.size,
      fontWeight: option.weight,
      lineHeight: option.lineHeight,
      role: option.role
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
    <div className="flex flex-col gap-5">
      <Field label="Text style">
        <div className="grid gap-1 rounded-xl bg-white/[0.025] p-1">
          {textStyleOptions.map((option) => {
            const active = activeStyle?.label === option.label;
            return (
              <button
                className={`group grid grid-cols-[74px_1fr_auto] items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all ${active ? "bg-white text-black shadow-sm" : "text-neutral-300 hover:bg-white/[0.055] hover:text-white"}`}
                key={option.label}
                onClick={() => setTextStyle(option.label)}
                type="button"
              >
                <span className="text-[12px] font-semibold">{option.label}</span>
                <span className={`truncate text-[10px] ${active ? "text-black/50" : "text-neutral-600 group-hover:text-neutral-400"}`}>{option.description}</span>
                {active ? <Check size={13} /> : <span className="font-mono text-[9px] tabular-nums text-neutral-600">{option.size}</span>}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Typography">
        <div className="flex flex-col gap-2">
          <FontPicker
            onChange={(value) => {
              const nextProps = { ...props, fontFamily: value === "" ? "" : value };
              updateBlock(selectedBlockIndex, autoSizeTextFrameProps({ props, type: block.type }, text, { props: nextProps }), text);
            }}
            value={fontFamily}
          />
          <div className="grid grid-cols-3 gap-1.5">
            <NumberInput prefix={<span className="text-[9px] font-semibold text-neutral-500">Size</span>} min="8" max="180" onChange={(value) => {
              const nextProps = { ...props, fontSize: value === "" ? "" : value };
              updateBlock(selectedBlockIndex, nextProps, text);
            }} placeholder={block.type === "Title" ? "72" : "24"} step="1" value={props.fontSize ?? ""} />
            <NumberInput prefix={<span className="text-[9px] font-semibold text-neutral-500">Weight</span>} min="100" max="900" onChange={(value) => {
              const nextProps = { ...props, fontWeight: value === "" ? "" : value };
              updateBlock(selectedBlockIndex, autoSizeTextFrameProps({ props, type: block.type }, text, { props: nextProps }), text);
            }} placeholder={block.type === "Title" ? "700" : "400"} step="50" value={props.fontWeight ?? ""} />
            <NumberInput prefix={<span className="text-[9px] font-semibold text-neutral-500">Line</span>} min="0.8" max="2.5" onChange={(value) => {
              const nextProps = { ...props, lineHeight: value === "" ? "" : value };
              updateBlock(selectedBlockIndex, autoSizeTextFrameProps({ props, type: block.type }, text, { props: nextProps }), text);
            }} placeholder={block.type === "Title" ? "1" : "1.45"} step="0.05" value={props.lineHeight ?? ""} />
          </div>
        </div>
      </Field>

      <Field label="Alignment">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
          <IconSegmentedControl
            label=""
            onChange={(value) => {
              const nextProps = { ...props, textAlign: value };
              updateBlock(selectedBlockIndex, nextProps, text);
            }}
            options={[
              { icon: <AlignLeft size={14} />, label: "Align left", value: "left" },
              { icon: <AlignCenter size={14} />, label: "Align center", value: "center" },
              { icon: <AlignRight size={14} />, label: "Align right", value: "right" }
            ]}
            value={String(props.textAlign ?? "left")}
          />
          <IconSegmentedControl
            label=""
            onChange={(value) => {
              const nextProps = { ...props, textVerticalAlign: value };
              updateBlock(selectedBlockIndex, nextProps, text);
            }}
            options={[
              { icon: <AlignVerticalJustifyStart size={14} />, label: "Align top", value: "top" },
              { icon: <AlignVerticalJustifyCenter size={14} />, label: "Align middle", value: "middle" },
              { icon: <AlignVerticalJustifyEnd size={14} />, label: "Align bottom", value: "bottom" }
            ]}
            value={String(props.textVerticalAlign ?? "top")}
          />
          <button
            type="button"
            className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg transition-all cursor-pointer ${
              props.listType === "bullet"
                ? "bg-white text-black shadow-sm"
                : "bg-white/[0.03] text-neutral-500 hover:bg-white/[0.07] hover:text-neutral-200"
            }`}
            onClick={toggleList}
            title="Toggle bulleted list"
          >
            <List size={14} />
          </button>
        </div>
      </Field>
    </div>
  );
}
