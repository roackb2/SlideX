"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, Minus, Plus } from "lucide-react";
import type { CSSProperties } from "react";
import { numberValue } from "@/core/motion-doc/domain/frame";
import { hexColorValue } from "@/features/studio/application/colorPalettes";
import { stringValue, type EditableTextBlock } from "@/features/studio/application/previewCanvas";

type TextFrameEditorProps = {
  block: EditableTextBlock;
  blockIndex: number;
  canvasScale: number;
  onSelectBlock: (index: number) => void;
  onUpdateBlock: (blockIndex: number, newProps: Record<string, string | number>, newText?: string) => void;
};

export function TextFrameEditor({
  block,
  blockIndex,
  canvasScale,
  onSelectBlock,
  onUpdateBlock
}: TextFrameEditorProps) {
  return (
    <>
      <TextStyleToolbar block={block} blockIndex={blockIndex} onUpdateBlock={onUpdateBlock} />
      <div
        aria-label={`Edit ${block.type} text`}
        className="absolute inset-0 z-10 cursor-text overflow-hidden border-0 bg-transparent p-0 text-current outline-none selection:bg-sky-500/30"
        contentEditable="plaintext-only"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onInput={(event) => onUpdateBlock(blockIndex, block.props, event.currentTarget.textContent ?? "")}
        onKeyDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelectBlock(blockIndex);
        }}
        role="textbox"
        spellCheck={false}
        style={editableTextStyle(block, canvasScale)}
        suppressContentEditableWarning
      >
        {block.text}
      </div>
    </>
  );
}

function TextStyleToolbar({
  block,
  blockIndex,
  onUpdateBlock
}: {
  block: EditableTextBlock;
  blockIndex: number;
  onUpdateBlock: (blockIndex: number, newProps: Record<string, string | number>, newText?: string) => void;
}) {
  const fontSize = numberValue(block.props.fontSize) ?? (block.type === "Title" ? 72 : 24);
  const lineHeight = numberValue(block.props.lineHeight) ?? (block.type === "Title" ? 1.02 : 1.45);
  const fontWeight = numberValue(block.props.fontWeight) ?? (block.type === "Title" ? 600 : 400);
  const color = stringValue(block.props.color ?? block.props.textColor, "#ffffff");
  const pickerColor = hexColorValue(color) ?? "#ffffff";
  const textAlign = stringValue(block.props.textAlign, "left");
  const isBold = fontWeight >= 700 || block.props.fontWeight === "bold";

  function updateProps(nextProps: Record<string, string | number>) {
    onUpdateBlock(blockIndex, nextProps, block.text);
  }

  function setProp(key: string, value: string | number | "") {
    const nextProps = { ...block.props };

    delete nextProps[key];

    if (value !== "") {
      nextProps[key] = value;
    }

    updateProps(nextProps);
  }

  function adjustFontSize(delta: number) {
    setProp("fontSize", Math.min(Math.max(Math.round(fontSize + delta), 8), 180));
  }

  return (
    <div
      className="absolute -top-11 left-0 z-30 flex max-w-[min(520px,90vw)] items-center gap-1 overflow-hidden rounded-md border border-white/15 bg-[#111] p-1 shadow-2xl shadow-black/50"
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button aria-label="Decrease font size" className={toolbarButtonClass(false)} onClick={() => adjustFontSize(-1)} type="button">
        <Minus size={13} />
      </button>
      <input
        aria-label="Font size"
        className="h-7 w-12 rounded border border-neutral-700 bg-black px-1.5 text-center font-mono text-[11px] text-neutral-100 outline-none focus:border-neutral-400"
        max={180}
        min={8}
        onChange={(event) => setProp("fontSize", event.target.value === "" ? "" : Number(event.target.value))}
        type="number"
        value={fontSize}
      />
      <button aria-label="Increase font size" className={toolbarButtonClass(false)} onClick={() => adjustFontSize(1)} type="button">
        <Plus size={13} />
      </button>
      <span className="mx-0.5 h-5 w-px bg-white/10" />
      <button aria-label="Bold" className={toolbarButtonClass(isBold)} onClick={() => setProp("fontWeight", isBold ? "" : 700)} type="button">
        <Bold size={14} />
      </button>
      <span className="mx-0.5 h-5 w-px bg-white/10" />
      <button aria-label="Align left" className={toolbarButtonClass(textAlign === "left")} onClick={() => setProp("textAlign", "left")} type="button">
        <AlignLeft size={14} />
      </button>
      <button aria-label="Align center" className={toolbarButtonClass(textAlign === "center")} onClick={() => setProp("textAlign", "center")} type="button">
        <AlignCenter size={14} />
      </button>
      <button aria-label="Align right" className={toolbarButtonClass(textAlign === "right")} onClick={() => setProp("textAlign", "right")} type="button">
        <AlignRight size={14} />
      </button>
      <span className="mx-0.5 h-5 w-px bg-white/10" />
      <label className="flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded border border-neutral-700 bg-black" title="Text color">
        <span className="h-4 w-4 rounded-sm border border-white/30" style={{ background: color }} />
        <input
          aria-label="Text color"
          className="sr-only"
          onChange={(event) => setProp("color", event.target.value)}
          type="color"
          value={pickerColor}
        />
      </label>
      <span className="ml-1 font-mono text-[10px] text-neutral-500">LH</span>
      <input
        aria-label="Line height"
        className="h-7 w-14 rounded border border-neutral-700 bg-black px-1.5 text-center font-mono text-[11px] text-neutral-100 outline-none focus:border-neutral-400"
        max={2.5}
        min={0.8}
        onChange={(event) => setProp("lineHeight", event.target.value === "" ? "" : Number(event.target.value))}
        step={0.05}
        type="number"
        value={lineHeight}
      />
    </div>
  );
}

function editableTextStyle(block: EditableTextBlock, canvasScale: number): CSSProperties {
  const fontSize = Number(block.props.fontSize) || (block.type === "Title" ? 72 : 24);
  const textAlign = stringValue(block.props.textAlign, "left") as CSSProperties["textAlign"];
  const color = stringValue(block.props.color ?? block.props.textColor, "inherit");
  const hasSurface = Boolean(stringValue(block.props.background ?? block.props.backgroundColor ?? block.props.bg, ""));
  const fontWeight = numberValue(block.props.fontWeight) ?? (block.type === "Title" ? 600 : 400);
  const lineHeight = numberValue(block.props.lineHeight) ?? (block.type === "Title" ? 1.02 : 1.45);

  return {
    border: 0,
    boxSizing: "border-box",
    caretColor: color === "inherit" ? "currentColor" : color,
    color,
    display: "block",
    fontFamily: "inherit",
    fontSize: `${fontSize * canvasScale}px`,
    fontWeight,
    height: "100%",
    letterSpacing: 0,
    lineHeight,
    margin: 0,
    padding: hasSurface ? "0.12em 0.18em" : 0,
    textAlign,
    whiteSpace: "pre-wrap",
    width: "100%"
  };
}

function toolbarButtonClass(active: boolean) {
  return `flex h-7 w-7 items-center justify-center rounded transition-colors ${
    active ? "bg-white text-black" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
  }`;
}
