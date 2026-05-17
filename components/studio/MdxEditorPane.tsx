"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { snippetTemplates } from "@/lib/templates";

type CodeCursor = {
  line: number;
  column: number;
};

type CodeScroll = {
  left: number;
  top: number;
};

export function MdxEditorPane({
  source,
  onSourceChange,
  selectionSource,
  onSelectionSourceChange,
  sceneCount,
  selectionLabel,
  codeScroll,
  setCodeScroll,
  codeCursor,
  updateCodeCursor,
  copySource,
  insertSnippet
}: {
  source: string;
  onSourceChange: (value: string) => void;
  selectionSource: string;
  onSelectionSourceChange: (value: string) => void;
  sceneCount: number;
  selectionLabel: string;
  codeScroll: CodeScroll;
  setCodeScroll: (value: CodeScroll) => void;
  codeCursor: CodeCursor;
  updateCodeCursor: (selectionStart: number, cursorSource?: string) => void;
  copySource: () => Promise<void>;
  insertSnippet: (code: string) => void;
}) {
  const [editorScope, setEditorScope] = useState<"selection" | "deck">("selection");
  const [localSource, setLocalSource] = useState("");
  const [hasSelectionDraft, setHasSelectionDraft] = useState(false);

  useEffect(() => {
    setLocalSource(editorScope === "selection" ? selectionSource : source);
    setHasSelectionDraft(false);
    updateCodeCursor(0, editorScope === "selection" ? selectionSource : source);
  }, [editorScope, selectionLabel, source, selectionSource, updateCodeCursor]);

  const activeLineNumbers = useMemo(() => localSource.split("\n").map((_, index) => index + 1), [localSource]);
  const canApplySelection = editorScope === "selection" && hasSelectionDraft;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-neutral-800 bg-[#0c0c0c] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded-md border border-neutral-800 bg-black px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-neutral-400">
            {editorScope === "selection" ? selectionLabel : "deck.mdx"}
          </span>
          <span className="text-[10px] text-neutral-400">{activeLineNumbers.length} lines</span>
          <span className="text-[10px] text-neutral-400">/</span>
          <span className="text-[10px] text-neutral-400">{sceneCount} scenes</span>
        </div>
        <button
          className="inline-flex items-center gap-1 rounded-md border border-neutral-800 px-2 py-1 text-[10px] font-medium text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
          onClick={copySource}
          type="button"
        >
          <Copy size={11} />
          Copy MDX
        </button>
      </div>
      <div className="flex items-center justify-between border-b border-neutral-800 bg-black px-3 py-2">
        <div className="flex gap-1">
          {(["selection", "deck"] as const).map((scope) => (
            <button
              className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                editorScope === scope
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              }`}
              key={scope}
              onClick={() => {
                setEditorScope(scope);
                setCodeScroll({ left: 0, top: 0 });
              }}
              type="button"
            >
              {scope === "selection" ? "Selection" : "Deck"}
            </button>
          ))}
        </div>
        {editorScope === "selection" ? (
          <button
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
              canApplySelection
                ? "border-neutral-600 bg-neutral-100 text-black hover:bg-white"
                : "border-neutral-800 text-neutral-400"
            }`}
            disabled={!canApplySelection}
            onClick={() => {
              onSelectionSourceChange(localSource);
              setHasSelectionDraft(false);
            }}
            type="button"
          >
            <Check size={11} />
            Apply
          </button>
        ) : null}
      </div>
      <div className="border-b border-neutral-800 bg-[#0a0a0a] px-2 py-2">
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Insert Blocks</div>
        <div className="flex flex-wrap gap-2">
          {snippetTemplates.map((snippet) => (
            <button
              className="rounded-md border border-neutral-800 bg-black px-2.5 py-1.5 text-[10px] font-medium text-neutral-400 transition-all hover:bg-neutral-900 hover:text-white"
              key={snippet.id}
              onClick={() => {
                if (editorScope === "selection") {
                  setLocalSource((current) => `${current.trimEnd()}\n\n${snippet.code}`);
                  setHasSelectionDraft(true);
                } else {
                  insertSnippet(snippet.code);
                }
              }}
              type="button"
            >
              + {snippet.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden bg-[#050505]">
        <div
          className="pointer-events-none absolute left-11 right-0 z-0 border-y border-sky-500/10 bg-sky-500/6"
          style={{
            height: 28,
            top: 16 + (codeCursor.line - 1) * 28 - codeScroll.top
          }}
        />
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-11 border-r border-neutral-900 bg-[#080808]">
          <div
            className="py-4 font-mono text-[11px] leading-7 text-neutral-500"
            style={{ transform: `translateY(-${codeScroll.top}px)` }}
          >
            {activeLineNumbers.map((line) => (
              <div className={`h-7 pr-3 text-right ${codeCursor.line === line ? "text-neutral-400" : ""}`} key={line}>
                {line}
              </div>
            ))}
          </div>
        </div>
        <textarea
          aria-label="MDX Code Editor"
          className="absolute inset-0 resize-none bg-[#050505] py-4 pl-14 pr-5 font-mono text-[12px] leading-7 text-neutral-200 caret-white outline-none selection:bg-sky-500/30 focus:ring-1 focus:ring-inset focus:ring-neutral-700 custom-scrollbar"
          onChange={(event) => {
            const newValue = event.target.value;
            setLocalSource(newValue);
            if (editorScope === "selection") {
              setHasSelectionDraft(true);
            } else {
              onSourceChange(newValue);
            }
            updateCodeCursor(event.currentTarget.selectionStart, newValue);
          }}
          onClick={(event) => updateCodeCursor(event.currentTarget.selectionStart, localSource)}
          onKeyUp={(event) => updateCodeCursor(event.currentTarget.selectionStart, localSource)}
          onScroll={(event) =>
            setCodeScroll({
              left: event.currentTarget.scrollLeft,
              top: event.currentTarget.scrollTop
            })
          }
          onSelect={(event) => updateCodeCursor(event.currentTarget.selectionStart, localSource)}
          spellCheck={false}
          value={localSource}
        />
      </div>
      <div className="flex items-center justify-between border-t border-neutral-800 bg-[#0a0a0a] px-3 py-2 font-mono text-[10px] text-neutral-400">
        <span>Ln {codeCursor.line}, Col {codeCursor.column}</span>
        <span>{editorScope === "selection" ? "Selection MDX" : "Full MDX"}</span>
      </div>
    </div>
  );
}

export function getCodeCursor(source: string, selectionStart: number) {
  const textBeforeCursor = source.slice(0, selectionStart);
  const lines = textBeforeCursor.split("\n");
  const line = lines.length;
  const column = (lines.at(-1)?.length ?? 0) + 1;

  return { line, column };
}
