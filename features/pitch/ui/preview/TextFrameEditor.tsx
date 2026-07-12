"use client";

import * as Popover from "@radix-ui/react-popover";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Bold,
  Check,
  List,
  Minus,
  MoreHorizontal,
  Plus,
  Type
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { CSSProperties, CompositionEvent, ReactNode } from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import { numberValue } from "@/core/motion-doc/domain/frame";
import { hexColorValue } from "@/features/pitch/application/colorPalettes";
import { stringValue, type EditableTextBlock } from "@/features/pitch/application/previewCanvas";
import { autoSizeTextFrameProps } from "@/features/pitch/application/textFrameSizing";
import type { BlockUpdater } from "@/features/pitch/ui/pitchCommandTypes";
import { useDynamicFont } from "@/features/pitch/ui/hooks/useDynamicFont";
import { FontPicker } from "@/features/pitch/ui/preview/controls/FontPicker";

type TextFrameEditorProps = {
  block: EditableTextBlock;
  blockIndex: number;
  canvasScale: number;
  onBeginTextEdit: () => void;
  onSelectBlock: (index: number) => void;
  onUpdateBlock: BlockUpdater;
  toolbarAlignment?: "left" | "right";
  toolbarPlacement?: "above" | "below";
};

export function TextFrameEditor({
  block,
  blockIndex,
  canvasScale,
  onBeginTextEdit,
  onSelectBlock,
  onUpdateBlock,
  toolbarAlignment = "left",
  toolbarPlacement = "above"
}: TextFrameEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editStartedRef = useRef(false);
  const isComposingRef = useRef(false);
  const lastTextRef = useRef("");

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || isComposingRef.current || lastTextRef.current === block.text) {
      return;
    }

    editor.textContent = block.text;
    lastTextRef.current = block.text;
  }, [block.text]);

  function beginTextEdit() {
    if (editStartedRef.current) {
      return;
    }

    onBeginTextEdit();
    editStartedRef.current = true;
  }

  function syncText(text: string, resizeFrame = false) {
    beginTextEdit();

    const nextProps = resizeFrame ? autoSizeTextFrameProps(block, text) : block.props;
    lastTextRef.current = text;
    onUpdateBlock(blockIndex, nextProps, text, { transient: true });
  }

  function finishTextEdit() {
    if (!editStartedRef.current) {
      return;
    }

    syncText(editorRef.current?.textContent ?? "", true);
    editStartedRef.current = false;
  }

  return (
    <>
      <TextStyleToolbar alignment={toolbarAlignment} block={block} blockIndex={blockIndex} onUpdateBlock={onUpdateBlock} placement={toolbarPlacement} />
      <div
        className="absolute z-10 cursor-text overflow-hidden border-0 bg-transparent p-0 text-current outline-none"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => {
          event.stopPropagation();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelectBlock(blockIndex);
        }}
        style={{
          ...editableFrameStyle(block),
          inset: 0,
          width: "auto",
          height: "auto"
        }}
      >
        <div
          aria-label={`Edit ${block.type} text`}
          className="w-full outline-none selection:bg-violet-500/35 selection:text-inherit"
          contentEditable="plaintext-only"
          onBeforeInput={beginTextEdit}
          onBlur={finishTextEdit}
          onCompositionEnd={(event: CompositionEvent<HTMLDivElement>) => {
            isComposingRef.current = false;
            syncText(event.currentTarget.textContent ?? "");
          }}
          onCompositionStart={() => {
            beginTextEdit();
            isComposingRef.current = true;
          }}
          onInput={(event) => {
            if (isComposingRef.current) {
              lastTextRef.current = event.currentTarget.textContent ?? "";
              return;
            }

            syncText(event.currentTarget.textContent ?? "");
          }}
          onKeyDown={(event) => event.stopPropagation()}
          onPaste={beginTextEdit}
          ref={editorRef}
          role="textbox"
          spellCheck={false}
          style={editableTextStyle(block, canvasScale)}
          suppressContentEditableWarning
        />
      </div>
    </>
  );
}

function TextStyleToolbar({
  alignment,
  block,
  blockIndex,
  onUpdateBlock,
  placement
}: {
  alignment: "left" | "right";
  block: EditableTextBlock;
  blockIndex: number;
  onUpdateBlock: BlockUpdater;
  placement: "above" | "below";
}) {
  const fontSize = numberValue(block.props.fontSize) ?? (block.type === "Title" ? 72 : 24);
  const lineHeight = numberValue(block.props.lineHeight) ?? (block.type === "Title" ? 1.02 : 1.45);
  const fontWeight = numberValue(block.props.fontWeight) ?? (block.type === "Title" ? 600 : 400);
  const color = stringValue(block.props.color ?? block.props.textColor, "#ffffff");
  const pickerColor = hexColorValue(color) ?? "#ffffff";
  const textAlign = stringValue(block.props.textAlign, "left");
  const verticalAlign = stringValue(block.props.textVerticalAlign, "top");
  const listType = stringValue(block.props.listType, "");
  const fontFamily = stringValue(block.props.fontFamily, "");
  useDynamicFont(fontFamily);

  const isBold = fontWeight >= 700 || block.props.fontWeight === "bold";
  const isBulletList = listType === "bullet";

  function updateProps(nextProps: Record<string, string | number>, resizeFrame = false) {
    const resolvedProps = resizeFrame
      ? autoSizeTextFrameProps(block, block.text, { props: nextProps })
      : nextProps;

    onUpdateBlock(blockIndex, resolvedProps, block.text);
  }

  function setProp(key: string, value: string | number | "", resizeFrame = false) {
    const nextProps = { ...block.props };

    delete nextProps[key];

    if (value !== "") {
      nextProps[key] = value;
    }

    updateProps(nextProps, resizeFrame);
  }

  function adjustFontSize(delta: number) {
    setProp("fontSize", Math.min(Math.max(Math.round(fontSize + delta), 8), 180));
  }

  function applyTextPreset(preset: TextPreset) {
    const nextProps = {
      ...block.props,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      lineHeight: preset.lineHeight,
      role: preset.role
    };

    updateProps(nextProps);
  }

  function toggleList() {
    let nextText = block.text;
    if (!isBulletList) {
      nextText = block.text.split("\n").map(line => line.startsWith("• ") ? line : `• ${line}`).join("\n");
    } else {
      nextText = block.text.split("\n").map(line => line.startsWith("• ") ? line.slice(2) : line).join("\n");
    }

    const nextProps = { ...block.props };
    if (isBulletList) {
      delete nextProps.listType;
    } else {
      nextProps.listType = "bullet";
    }

    onUpdateBlock(blockIndex, autoSizeTextFrameProps(block, nextText, { props: nextProps }), nextText);
  }

  return (
    <Toolbar.Root
      className={`absolute z-30 flex h-9 items-center gap-0.5 rounded-lg border border-white/[0.09] bg-[#1b1b1e]/94 px-1 shadow-[0_8px_24px_rgba(5,4,10,0.34),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl ${alignment === "right" ? "right-0" : "left-0"} ${placement === "below" ? "top-[calc(100%+8px)]" : "-top-[44px]"}`}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <TextPresetPicker block={block} onSelect={applyTextPreset} />

      <FontPicker onChange={(val) => setProp("fontFamily", val, true)} value={fontFamily} />

      <Toolbar.Separator className="mx-0.5 h-4 w-px shrink-0 bg-white/[0.08]" />

      {/* Font Size Group */}
      <div className="flex h-7 shrink-0 items-center overflow-hidden rounded-md bg-black/20">
        <Toolbar.Button aria-label="Decrease font size" className="flex h-full w-7 items-center justify-center text-neutral-400 hover:bg-white/10 hover:text-white transition-colors outline-none focus-visible:ring-1 focus-visible:ring-white/50" onClick={() => adjustFontSize(-1)}>
          <Minus size={12} />
        </Toolbar.Button>
        <input
          aria-label="Font size"
          className="h-full w-9 bg-transparent px-1 text-center font-mono text-[11px] text-neutral-200 outline-none focus:bg-white/5"
          max={180}
          min={8}
          onChange={(event) => setProp("fontSize", event.target.value === "" ? "" : Number(event.target.value))}
          type="number"
          value={fontSize}
        />
        <Toolbar.Button aria-label="Increase font size" className="flex h-full w-7 items-center justify-center text-neutral-400 hover:bg-white/10 hover:text-white transition-colors outline-none focus-visible:ring-1 focus-visible:ring-white/50" onClick={() => adjustFontSize(1)}>
          <Plus size={12} />
        </Toolbar.Button>
      </div>

      <Toolbar.Separator className="mx-0.5 h-4 w-px shrink-0 bg-white/[0.08]" />

      {/* Styling */}
      <div className="flex shrink-0 items-center">
        <Toolbar.Button aria-label="Bold" className={toolbarButtonClass(isBold)} onClick={() => setProp("fontWeight", isBold ? "" : 700, true)}>
          <Bold size={13} />
        </Toolbar.Button>
      </div>

      {/* Less common controls stay one click away without widening the canvas toolbar. */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <Toolbar.Button aria-label="More text options" className={toolbarButtonClass(isBulletList || textAlign !== "left" || verticalAlign !== "top")} title="More text options">
            <MoreHorizontal size={14} />
          </Toolbar.Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="end" className="z-[110] w-[220px] rounded-xl border border-white/10 bg-[#1b1b1e] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.48)]" sideOffset={8}>
            <TextOptionRow label="Alignment">
              <button aria-label="Align left" className={toolbarButtonClass(textAlign === "left")} onClick={() => setProp("textAlign", "left")} type="button"><AlignLeft size={13} /></button>
              <button aria-label="Align center" className={toolbarButtonClass(textAlign === "center")} onClick={() => setProp("textAlign", "center")} type="button"><AlignCenter size={13} /></button>
              <button aria-label="Align right" className={toolbarButtonClass(textAlign === "right")} onClick={() => setProp("textAlign", "right")} type="button"><AlignRight size={13} /></button>
            </TextOptionRow>
            <TextOptionRow label="Vertical">
              <button aria-label="Align top" className={toolbarButtonClass(verticalAlign === "top")} onClick={() => setProp("textVerticalAlign", "top")} type="button"><AlignVerticalJustifyStart size={13} /></button>
              <button aria-label="Align middle" className={toolbarButtonClass(verticalAlign === "middle" || verticalAlign === "center")} onClick={() => setProp("textVerticalAlign", "middle")} type="button"><AlignVerticalJustifyCenter size={13} /></button>
              <button aria-label="Align bottom" className={toolbarButtonClass(verticalAlign === "bottom")} onClick={() => setProp("textVerticalAlign", "bottom")} type="button"><AlignVerticalJustifyEnd size={13} /></button>
            </TextOptionRow>
            <div className="my-1 h-px bg-white/[0.07]" />
            <div className="flex h-9 items-center justify-between px-1.5">
              <span className="text-[11px] text-neutral-400">Bullet list</span>
              <button aria-label="Bullet list" className={toolbarButtonClass(isBulletList)} onClick={toggleList} type="button"><List size={13} /></button>
            </div>
            <div className="flex h-9 items-center justify-between px-1.5">
              <span className="text-[11px] text-neutral-400">Text color</span>
              <label className="group flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-white/[0.08]" title="Text color">
                <span className="h-4 w-4 rounded-[4px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]" style={{ backgroundColor: color }} />
                <input aria-label="Text color" className="sr-only" onChange={(event) => setProp("color", event.target.value)} type="color" value={pickerColor} />
              </label>
            </div>
            <label className="flex h-9 items-center justify-between px-1.5">
              <span className="text-[11px] text-neutral-400">Line height</span>
              <input aria-label="Line height" className="h-7 w-14 rounded-md bg-black/25 px-2 text-center font-mono text-[11px] text-neutral-200 outline-none focus:ring-1 focus:ring-white/25" max={2.5} min={0.8} onChange={(event) => setProp("lineHeight", event.target.value === "" ? "" : Number(event.target.value), true)} step={0.05} type="number" value={lineHeight} />
            </label>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </Toolbar.Root>
  );
}

function TextOptionRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex h-9 items-center justify-between px-1.5">
      <span className="text-[11px] text-neutral-400">{label}</span>
      <div className="flex items-center gap-0.5">{children}</div>
    </div>
  );
}

type TextPreset = {
  fontSize: number;
  fontWeight: number;
  label: string;
  lineHeight: number;
  role: "title" | "content";
  sample: string;
};

const textPresets: TextPreset[] = [
  { fontSize: 72, fontWeight: 700, label: "Display", lineHeight: 1, role: "title", sample: "Large statement" },
  { fontSize: 48, fontWeight: 650, label: "Heading", lineHeight: 1.08, role: "title", sample: "Section heading" },
  { fontSize: 30, fontWeight: 560, label: "Lead", lineHeight: 1.28, role: "content", sample: "Introductory copy" },
  { fontSize: 24, fontWeight: 400, label: "Body", lineHeight: 1.45, role: "content", sample: "Comfortable reading" },
  { fontSize: 18, fontWeight: 500, label: "Caption", lineHeight: 1.35, role: "content", sample: "Details and notes" }
];

function TextPresetPicker({ block, onSelect }: { block: EditableTextBlock; onSelect: (preset: TextPreset) => void }) {
  const fontSize = numberValue(block.props.fontSize) ?? (block.type === "Title" ? 72 : 24);
  const activePreset = textPresets.find((preset) => preset.fontSize === fontSize);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Toolbar.Button aria-label="Text styles" className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-semibold text-neutral-300 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-1 focus-visible:ring-white/50" title="Text styles">
          <Type size={13} />
          <span>{activePreset?.label ?? "Style"}</span>
        </Toolbar.Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" className="z-[110] w-[250px] overflow-hidden rounded-xl border border-white/10 bg-[#17171a] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.58)]" sideOffset={10}>
          <div className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Text styles</div>
          {textPresets.map((preset) => {
            const active = activePreset?.label === preset.label;
            return (
              <Popover.Close asChild key={preset.label}>
                <button className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${active ? "bg-white text-black" : "text-neutral-200 hover:bg-white/[0.08]"}`} onClick={() => onSelect(preset)} type="button">
                  <span className="w-[72px] text-[12px] font-semibold">{preset.label}</span>
                  <span className={`flex-1 truncate text-[11px] ${active ? "text-black/55" : "text-neutral-500 group-hover:text-neutral-400"}`}>{preset.sample}</span>
                  {active ? <Check size={13} /> : <span className="font-mono text-[9px] text-neutral-600">{preset.fontSize}</span>}
                </button>
              </Popover.Close>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function editableFrameStyle(block: EditableTextBlock): CSSProperties {
  const verticalAlign = stringValue(block.props.textVerticalAlign, "top");

  return {
    alignItems: "stretch",
    display: "flex",
    flexDirection: "column",
    justifyContent: verticalAlign === "bottom" ? "flex-end" : verticalAlign === "middle" || verticalAlign === "center" ? "center" : "flex-start"
  };
}

function editableTextStyle(block: EditableTextBlock, canvasScale: number): CSSProperties {
  const fontSize = Number(block.props.fontSize) || (block.type === "Title" ? 72 : 24);
  const textAlign = stringValue(block.props.textAlign, "left") as CSSProperties["textAlign"];
  const color = stringValue(block.props.color ?? block.props.textColor, "inherit");
  const hasSurface = Boolean(stringValue(block.props.background ?? block.props.backgroundColor ?? block.props.bg, ""));
  const fontWeight = numberValue(block.props.fontWeight) ?? (block.type === "Title" ? 600 : 400);
  const lineHeight = numberValue(block.props.lineHeight) ?? (block.type === "Title" ? 1.02 : 1.45);
  const fontFamily = stringValue(block.props.fontFamily, "");

  return {
    border: 0,
    boxSizing: "border-box",
    caretColor: color === "inherit" ? "currentColor" : color,
    color,
    display: "block",
    fontFamily: fontFamily ? `"${fontFamily}", var(--font-geist-sans, sans-serif)` : "inherit",
    fontSize: `${fontSize * canvasScale}px`,
    fontWeight,
    letterSpacing: 0,
    lineHeight,
    margin: 0,
    minHeight: "1em",
    padding: hasSurface ? "0.12em 0.18em" : 0,
    textAlign,
    userSelect: "text",
    whiteSpace: "pre-wrap",
    width: "100%"
  };
}

function toolbarButtonClass(active: boolean) {
  return `flex h-7 w-7 items-center justify-center rounded-[5px] transition-all outline-none focus-visible:ring-1 focus-visible:ring-white/50 ${
    active ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:bg-white/10 hover:text-white"
  }`;
}
