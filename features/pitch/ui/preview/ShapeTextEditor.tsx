"use client";

import { useEffect, useRef, useState } from "react";
import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";
import type { BlockUpdater } from "@/features/pitch/ui/pitchCommandTypes";

export function ShapeTextEditor({ block, blockIndex, onSelectBlock, onUpdateBlock }: {
  block: Extract<MotionDocBlock, { props: Record<string, string | number> }>;
  blockIndex: number;
  onSelectBlock: (index: number) => void;
  onUpdateBlock: BlockUpdater;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const text = String(block.props.text ?? "");
  const [draft, setDraft] = useState(text);
  const latestTextRef = useRef(text);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    latestTextRef.current = text;
    setDraft(text);
    if (editor.textContent !== text) editor.textContent = text;
  }, [text]);

  function commitText(value: string) {
    latestTextRef.current = value;
    setDraft(value);
    onUpdateBlock(blockIndex, { ...block.props, text: value }, undefined, { skipReplay: true });
  }

  return (
    <div className="absolute inset-[6%] z-20">
      {draft ? null : <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-white/65">Add text</span>}
      <div
        aria-label="Edit shape text"
        className="absolute inset-0 flex cursor-text items-center justify-center overflow-hidden whitespace-pre-wrap text-center leading-tight outline-none selection:bg-violet-500/35"
        contentEditable="plaintext-only"
        onBlur={() => commitText(latestTextRef.current)}
        onInput={(event) => commitText(event.currentTarget.textContent ?? "")}
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelectBlock(blockIndex);
        }}
        ref={editorRef}
        role="textbox"
        style={{
          caretColor: String(block.props.textColor ?? block.props.color ?? "#ffffff"),
          color: "transparent",
          fontSize: Number(block.props.fontSize ?? 18),
          fontWeight: Number(block.props.fontWeight ?? 650)
        }}
        suppressContentEditableWarning
      />
    </div>
  );
}
