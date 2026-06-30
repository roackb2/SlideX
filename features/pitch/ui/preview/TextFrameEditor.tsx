"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, List, Minus, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import type { CSSProperties, CompositionEvent } from "react";
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
};

export function TextFrameEditor({
  block,
  blockIndex,
  canvasScale,
  onBeginTextEdit,
  onSelectBlock,
  onUpdateBlock
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
      <TextStyleToolbar block={block} blockIndex={blockIndex} onUpdateBlock={onUpdateBlock} />
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
  block,
  blockIndex,
  onUpdateBlock
}: {
  block: EditableTextBlock;
  blockIndex: number;
  onUpdateBlock: BlockUpdater;
}) {
  const fontSize = numberValue(block.props.fontSize) ?? (block.type === "Title" ? 72 : 24);
  const lineHeight = numberValue(block.props.lineHeight) ?? (block.type === "Title" ? 1.02 : 1.45);
  const fontWeight = numberValue(block.props.fontWeight) ?? (block.type === "Title" ? 600 : 400);
  const color = stringValue(block.props.color ?? block.props.textColor, "#ffffff");
  const pickerColor = hexColorValue(color) ?? "#ffffff";
  const textAlign = stringValue(block.props.textAlign, "left");
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
    setProp("fontSize", Math.min(Math.max(Math.round(fontSize + delta), 8), 180), true);
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
      className="absolute -top-14 left-0 z-30 flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#18181b]/95 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {/* Font Family Selector */}
      <FontPicker onChange={(val) => setProp("fontFamily", val, true)} value={fontFamily} />

      <Toolbar.Separator className="mx-0.5 h-4 w-px bg-white/10 shrink-0" />

      {/* Font Size Group */}
      <div className="flex items-center h-7 rounded border border-white/[0.06] bg-black/20 overflow-hidden shrink-0">
        <Toolbar.Button aria-label="Decrease font size" className="flex h-full w-7 items-center justify-center text-neutral-400 hover:bg-white/10 hover:text-white transition-colors outline-none focus-visible:ring-1 focus-visible:ring-white/50" onClick={() => adjustFontSize(-1)}>
          <Minus size={12} />
        </Toolbar.Button>
        <input
          aria-label="Font size"
          className="h-full w-9 bg-transparent px-1 text-center font-mono text-[11px] text-neutral-200 outline-none focus:bg-white/5"
          max={180}
          min={8}
          onChange={(event) => setProp("fontSize", event.target.value === "" ? "" : Number(event.target.value), true)}
          type="number"
          value={fontSize}
        />
        <Toolbar.Button aria-label="Increase font size" className="flex h-full w-7 items-center justify-center text-neutral-400 hover:bg-white/10 hover:text-white transition-colors outline-none focus-visible:ring-1 focus-visible:ring-white/50" onClick={() => adjustFontSize(1)}>
          <Plus size={12} />
        </Toolbar.Button>
      </div>

      <Toolbar.Separator className="mx-0.5 h-4 w-px bg-white/10 shrink-0" />

      {/* Styling */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Toolbar.Button aria-label="Bold" className={toolbarButtonClass(isBold)} onClick={() => setProp("fontWeight", isBold ? "" : 700, true)}>
          <Bold size={13} />
        </Toolbar.Button>
        <Toolbar.Button aria-label="Bullet list" className={toolbarButtonClass(isBulletList)} onClick={toggleList}>
          <List size={13} />
        </Toolbar.Button>
      </div>

      <Toolbar.Separator className="mx-0.5 h-4 w-px bg-white/10 shrink-0" />

      {/* Alignment */}
      <div className="flex items-center gap-0.5 bg-black/20 rounded p-0.5 border border-white/[0.04] shrink-0">
        <Toolbar.Button aria-label="Align left" className={toolbarButtonClass(textAlign === "left")} onClick={() => setProp("textAlign", "left")}>
          <AlignLeft size={13} />
        </Toolbar.Button>
        <Toolbar.Button aria-label="Align center" className={toolbarButtonClass(textAlign === "center")} onClick={() => setProp("textAlign", "center")}>
          <AlignCenter size={13} />
        </Toolbar.Button>
        <Toolbar.Button aria-label="Align right" className={toolbarButtonClass(textAlign === "right")} onClick={() => setProp("textAlign", "right")}>
          <AlignRight size={13} />
        </Toolbar.Button>
      </div>

      <Toolbar.Separator className="mx-0.5 h-4 w-px bg-white/10 shrink-0" />

      {/* Color */}
      <label className="group flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded border border-white/10 bg-black/40 hover:border-white/30 transition-colors shrink-0" title="Text color">
        <span className="h-4 w-4 rounded-[3px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
        <input
          aria-label="Text color"
          className="sr-only"
          onChange={(event) => setProp("color", event.target.value)}
          type="color"
          value={pickerColor}
        />
      </label>

      {/* Line Height */}
      <div className="ml-0.5 flex h-7 items-center rounded border border-white/[0.06] bg-black/20 px-1.5 hover:border-white/20 transition-colors focus-within:border-white/30 focus-within:bg-black/40 shrink-0">
        <span className="font-mono text-[9px] text-neutral-500 font-semibold mr-1">LH</span>
        <input
          aria-label="Line height"
          className="h-full w-9 bg-transparent text-center font-mono text-[11px] text-neutral-200 outline-none"
          max={2.5}
          min={0.8}
          onChange={(event) => setProp("lineHeight", event.target.value === "" ? "" : Number(event.target.value), true)}
          step={0.05}
          type="number"
          value={lineHeight}
        />
      </div>
    </Toolbar.Root>
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
