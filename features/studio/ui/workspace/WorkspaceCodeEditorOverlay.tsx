"use client";

import { Code2, X } from "lucide-react";
import { MdxEditorPane } from "@/features/studio/ui/MdxEditorPane";
import type { StudioWorkspaceProps } from "@/features/studio/ui/workspace/StudioWorkspaceTypes";

type WorkspaceCodeEditorOverlayProps = Pick<
  StudioWorkspaceProps,
  | "commitMdxSource"
  | "copySource"
  | "insertSnippet"
  | "isCodeEditorOpen"
  | "pushUndoSnapshot"
  | "selectionMdx"
  | "setIsCodeEditorOpen"
  | "source"
  | "updateSelectionMdx"
> & {
  sceneCount: number;
};

export function WorkspaceCodeEditorOverlay({
  commitMdxSource,
  copySource,
  insertSnippet,
  isCodeEditorOpen,
  pushUndoSnapshot,
  sceneCount,
  selectionMdx,
  setIsCodeEditorOpen,
  source,
  updateSelectionMdx
}: WorkspaceCodeEditorOverlayProps) {
  if (!isCodeEditorOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/25 backdrop-blur-[1px]" onMouseDown={() => setIsCodeEditorOpen(false)}>
      <div
        className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-neutral-800 bg-[#070707] shadow-2xl shadow-black/50 md:max-w-[820px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <Code2 className="text-neutral-400" size={14} />
            <span className="text-[12px] font-semibold text-white">MDX Editor</span>
          </div>
          <button
            aria-label="Close MDX editor"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            onClick={() => setIsCodeEditorOpen(false)}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
        <MdxEditorPane
          copySource={copySource}
          insertSnippet={insertSnippet}
          onSelectionSourceChange={updateSelectionMdx}
          onSourceChange={(value) => {
            pushUndoSnapshot();
            commitMdxSource(value);
          }}
          sceneCount={sceneCount}
          selectionLabel={selectionMdx.label}
          selectionSource={selectionMdx.source}
          source={source}
        />
      </div>
    </div>
  );
}
