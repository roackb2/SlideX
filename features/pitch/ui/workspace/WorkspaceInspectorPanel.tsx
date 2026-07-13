"use client";

import { PitchInspector } from "@/features/pitch/ui/PitchInspector";
import { SlidersHorizontal, X } from "lucide-react";
import type { PitchWorkspaceProps } from "@/features/pitch/ui/workspace/PitchWorkspaceTypes";

type WorkspaceInspectorPanelProps = Pick<
  PitchWorkspaceProps,
  | "activeSlide"
  | "activeSlideAccent"
  | "activeSlideAlignX"
  | "activeSlideAlignY"
  | "activeSlideBackground"
  | "activeSlideLayout"
  | "activeSlideLayoutPreset"
  | "activeSlideMutedColor"
  | "activeSlideShader"
  | "activeSlideShaderAngle"
  | "activeSlideShaderColor1"
  | "activeSlideShaderColor2"
  | "activeSlideShaderColor3"
  | "activeSlideShaderColor4"
  | "activeSlideShaderColor5"
  | "activeSlideShaderColor6"
  | "activeSlideShaderDetail"
  | "activeSlideShaderEngine"
  | "activeSlideShaderIntensity"
  | "activeSlideShaderPreset"
  | "activeSlideShaderScale"
  | "activeSlideShaderSoftness"
  | "activeSlideShaderSpeed"
  | "activeSlideTextColor"
  | "activeSlideTheme"
  | "applyLayoutToActiveSlide"
  | "isCanvasGridVisible"
  | "isMobileInspectorOpen"
  | "pushUndoSnapshot"
  | "selectedBlockIndex"
  | "selectedBlockIndices"
  | "setIsCanvasGridVisible"
  | "setIsCodeEditorOpen"
  | "setIsMobileInspectorOpen"
  | "updateActiveSlideStyle"
  | "updateAllSlidesStyle"
  | "updateBlock"
  | "uploadImageForBlock"
  | "uploadVideoForBlock"
>;

export function WorkspaceInspectorPanel(props: WorkspaceInspectorPanelProps) {
  return (
    <>
      <div className="hidden h-full md:flex">
        <PitchInspectorContent {...props} />
      </div>

      {props.isMobileInspectorOpen ? (
        <>
          <div
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => props.setIsMobileInspectorOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-[80] flex w-[min(88vw,340px)] flex-col overflow-hidden rounded-l-[1.5rem] border-l border-white/[0.12] bg-[#0a0a0a] shadow-[-24px_0_80px_rgba(0,0,0,0.72)] md:hidden" aria-label="Options panel">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal size={16} className="text-[#8ea5ff]" />
                <div>
                  <p className="text-sm font-semibold text-white">Options</p>
                  <p className="text-[10px] text-neutral-500">Swipe right to close</p>
                </div>
              </div>
              <button
                aria-label="Close options"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 transition active:scale-95 active:bg-white/[0.08] active:text-white"
                onClick={() => props.setIsMobileInspectorOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <PitchInspectorContent
              {...props}
              onOpenMdxEditor={() => {
                props.setIsMobileInspectorOpen(false);
                props.setIsCodeEditorOpen(true);
              }}
            />
          </aside>
        </>
      ) : null}
    </>
  );
}

type PitchInspectorContentProps = WorkspaceInspectorPanelProps & {
  onOpenMdxEditor?: () => void;
};

function PitchInspectorContent({
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
  activeSlideShaderDetail,
  activeSlideShaderEngine,
  activeSlideShaderIntensity,
  activeSlideShaderPreset,
  activeSlideShaderScale,
  activeSlideShaderSoftness,
  activeSlideShaderSpeed,
  activeSlideTextColor,
  activeSlideTheme,
  applyLayoutToActiveSlide,
  isCanvasGridVisible,
  onOpenMdxEditor,
  pushUndoSnapshot,
  selectedBlockIndex,
  selectedBlockIndices,
  setIsCanvasGridVisible,
  setIsCodeEditorOpen,
  updateActiveSlideStyle,
  updateAllSlidesStyle,
  updateBlock,
  uploadImageForBlock,
  uploadVideoForBlock
}: PitchInspectorContentProps) {
  return (
    <PitchInspector
      activeSlide={activeSlide}
      activeSlideAccent={activeSlideAccent}
      activeSlideAlignX={activeSlideAlignX}
      activeSlideAlignY={activeSlideAlignY}
      activeSlideBackground={activeSlideBackground}
      activeSlideLayout={activeSlideLayout}
      activeSlideLayoutPreset={activeSlideLayoutPreset}
      activeSlideMutedColor={activeSlideMutedColor}
      activeSlideShader={activeSlideShader}
      activeSlideShaderAngle={activeSlideShaderAngle}
      activeSlideShaderColor1={activeSlideShaderColor1}
      activeSlideShaderColor2={activeSlideShaderColor2}
      activeSlideShaderColor3={activeSlideShaderColor3}
      activeSlideShaderColor4={activeSlideShaderColor4}
      activeSlideShaderColor5={activeSlideShaderColor5}
      activeSlideShaderColor6={activeSlideShaderColor6}
      activeSlideShaderDetail={activeSlideShaderDetail}
      activeSlideShaderEngine={activeSlideShaderEngine}
      activeSlideShaderIntensity={activeSlideShaderIntensity}
      activeSlideShaderPreset={activeSlideShaderPreset}
      activeSlideShaderScale={activeSlideShaderScale}
      activeSlideShaderSoftness={activeSlideShaderSoftness}
      activeSlideShaderSpeed={activeSlideShaderSpeed}
      activeSlideTextColor={activeSlideTextColor}
      activeSlideTheme={activeSlideTheme}
      applyLayoutToActiveSlide={applyLayoutToActiveSlide}
      isGridVisible={isCanvasGridVisible}
      onOpenMdxEditor={onOpenMdxEditor ?? (() => setIsCodeEditorOpen(true))}
      pushUndoSnapshot={pushUndoSnapshot}
      selectedBlockIndex={selectedBlockIndex}
      selectedBlockIndices={selectedBlockIndices}
      setIsGridVisible={setIsCanvasGridVisible}
      updateActiveSlideStyle={updateActiveSlideStyle}
      updateAllSlidesStyle={updateAllSlidesStyle}
      updateBlock={updateBlock}
      uploadImageForBlock={uploadImageForBlock}
      uploadVideoForBlock={uploadVideoForBlock}
    />
  );
}
