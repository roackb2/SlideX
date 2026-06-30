"use client";

import { PitchInspector } from "@/features/pitch/ui/PitchInspector";
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
  | "activeSlideShaderColor1"
  | "activeSlideShaderColor2"
  | "activeSlideShaderColor3"
  | "activeSlideShaderDetail"
  | "activeSlideShaderEngine"
  | "activeSlideShaderIntensity"
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
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => props.setIsMobileInspectorOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-40 flex w-[260px] flex-col border-l border-white/[0.12] bg-[#0a0a0a] shadow-2xl sm:w-[280px] md:hidden">
            <PitchInspectorContent
              {...props}
              onOpenMdxEditor={() => {
                props.setIsMobileInspectorOpen(false);
                props.setIsCodeEditorOpen(true);
              }}
            />
          </div>
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
  activeSlideShaderColor1,
  activeSlideShaderColor2,
  activeSlideShaderColor3,
  activeSlideShaderDetail,
  activeSlideShaderEngine,
  activeSlideShaderIntensity,
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
      activeSlideShaderColor1={activeSlideShaderColor1}
      activeSlideShaderColor2={activeSlideShaderColor2}
      activeSlideShaderColor3={activeSlideShaderColor3}
      activeSlideShaderDetail={activeSlideShaderDetail}
      activeSlideShaderEngine={activeSlideShaderEngine}
      activeSlideShaderIntensity={activeSlideShaderIntensity}
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
