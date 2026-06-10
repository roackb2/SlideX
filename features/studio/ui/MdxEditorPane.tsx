"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { bracketMatching } from "@codemirror/language";
import { EditorView, highlightActiveLine, highlightActiveLineGutter, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { snippetTemplates } from "@/core/motion-doc/presets/templates";
import { slidexDarkTheme, slidexHighlight } from "@/features/studio/ui/editor/codeMirrorTheme";

export function MdxEditorPane({
  source,
  onSourceChange,
  selectionSource,
  onSelectionSourceChange,
  sceneCount,
  selectionLabel,
  copySource,
  insertSnippet
}: {
  source: string;
  onSourceChange: (value: string) => void;
  selectionSource: string;
  onSelectionSourceChange: (value: string) => void;
  sceneCount: number;
  selectionLabel: string;
  copySource: () => Promise<void>;
  insertSnippet: (code: string) => void;
}) {
  const [editorScope, setEditorScope] = useState<"selection" | "deck">("selection");
  const [localSource, setLocalSource] = useState("");
  const [cursorInfo, setCursorInfo] = useState({ line: 1, column: 1 });
  const editorViewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    const next = editorScope === "selection" ? selectionSource : source;
    setLocalSource(next);
    setCursorInfo({ line: 1, column: 1 });
  }, [editorScope, selectionLabel, source, selectionSource]);

  const lineCount = useMemo(() => localSource.split("\n").length, [localSource]);

  const extensions = useMemo(
    () => [
      markdown({
        base: markdownLanguage,
        codeLanguages: [],
        extensions: []
      }),
      javascript({ jsx: true }),
      html(),
      EditorView.lineWrapping,
      bracketMatching(),
      closeBrackets(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightSelectionMatches(),
      history(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...closeBracketsKeymap,
        ...searchKeymap,
        indentWithTab
      ]),
      slidexDarkTheme,
      slidexHighlight
    ],
    []
  );

  const handleChange = useCallback(
    (value: string) => {
      setLocalSource(value);
      if (editorScope === "selection") {
        onSelectionSourceChange(value);
      } else {
        onSourceChange(value);
      }
    },
    [editorScope, onSourceChange, onSelectionSourceChange]
  );

  const handleEditorUpdate = useCallback((viewUpdate: { state: { selection: { main: { head: number } }; doc: { lineAt: (pos: number) => { number: number; from: number } } } }) => {
    const pos = viewUpdate.state.selection.main.head;
    const line = viewUpdate.state.doc.lineAt(pos);
    setCursorInfo({
      line: line.number,
      column: pos - line.from + 1
    });
  }, []);

  const handleInsertSnippet = useCallback(
    (code: string) => {
      if (editorScope === "selection") {
        const updated = `${localSource.trimEnd()}\n\n${code}`;
        setLocalSource(updated);
        onSelectionSourceChange(updated);
      } else {
        insertSnippet(code);
      }

      // Also insert at cursor if we have a view reference (deck mode)
      if (editorScope === "deck" && editorViewRef.current) {
        const view = editorViewRef.current;
        const pos = view.state.selection.main.head;
        const insert = `\n\n${code}`;
        view.dispatch({
          changes: { from: pos, insert },
          selection: { anchor: pos + insert.length }
        });
      }
    },
    [editorScope, insertSnippet]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded-md border border-white/[0.08] bg-black/40 px-2 py-1 font-mono text-[10px] tracking-wider text-neutral-400">
            {editorScope === "selection" ? selectionLabel : "deck.mdx"}
          </span>
          <span className="text-[11px] font-medium text-neutral-500">{lineCount} lines</span>
          <span className="text-[11px] text-neutral-600">/</span>
          <span className="text-[11px] font-medium text-neutral-500">{sceneCount} scenes</span>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-neutral-300 transition-all hover:bg-white/10 hover:text-white"
          onClick={copySource}
          type="button"
        >
          <Copy size={12} />
          Copy MDX
        </button>
      </div>
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-black/20 px-4 py-3">
        <div className="flex gap-1 rounded-lg border border-white/[0.08] bg-black/40 p-1">
          {(["selection", "deck"] as const).map((scope) => (
            <button
              className={`rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                editorScope === scope
                  ? "bg-[#8b5cf6]/20 text-[#c4b5fd] shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]"
                  : "text-neutral-500 hover:bg-white/5 hover:text-neutral-300"
              }`}
              key={scope}
              onClick={() => setEditorScope(scope)}
              type="button"
            >
              {scope === "selection" ? "Selection" : "Full Deck"}
            </button>
          ))}
        </div>
      </div>
      <div className="border-b border-white/[0.06] bg-black/20 px-4 py-3">
        <div className="mb-2.5 px-1 text-[10px] font-bold tracking-widest text-neutral-500">Insert Blocks</div>
        <div className="flex flex-wrap gap-2">
          {snippetTemplates.map((snippet) => (
            <button
              className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium tracking-wide text-neutral-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
              key={snippet.id}
              onClick={() => handleInsertSnippet(snippet.code)}
              type="button"
            >
              + {snippet.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden bg-transparent">
        <CodeMirror
          basicSetup={false}
          extensions={extensions}
          height="100%"
          onChange={handleChange}
          onCreateEditor={(view) => {
            editorViewRef.current = view;
          }}
          onUpdate={handleEditorUpdate}
          style={{ height: "100%", overflow: "auto" }}
          theme="none"
          value={localSource}
        />
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.02] px-5 py-3 font-mono text-[11px] text-neutral-500">
        <span>Ln {cursorInfo.line}, Col {cursorInfo.column}</span>
        <span className="font-semibold">{editorScope === "selection" ? "Selection MDX" : "Full MDX"}</span>
      </div>
    </div>
  );
}
