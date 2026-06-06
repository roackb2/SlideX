"use client";

import { StudioInspector } from "@/features/studio/ui/StudioInspector";
import type { StudioWorkspaceProps } from "@/features/studio/ui/workspace/StudioWorkspaceTypes";

type WorkspaceInspectorPanelProps = Pick<
  StudioWorkspaceProps,
  | "activeSlide"
  | "activeSlideAccent"
  | "addSlideWithLayout"
  | "activeSlideAlignX"
  | "activeSlideAlignY"
  | "activeSlideBackground"
  | "activeSlideLayout"
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
  | "isCanvasGridVisible"
  | "isMobileInspectorOpen"
  | "selectSingleBlock"
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
        <StudioInspectorContent {...props} />
      </div>

      {props.isMobileInspectorOpen ? (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => props.setIsMobileInspectorOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-40 flex w-[260px] flex-col border-l border-white/[0.12] bg-[#0a0a0a] shadow-2xl sm:w-[280px] md:hidden">
            <StudioInspectorContent
              {...props}
              onOpenMdxEditor={() => {
                props.setIsMobileInspectorOpen(false);
                props.setIsCodeEditorOpen(true);
              }}
              setSelectedBlockIndex={(index) => {
                props.selectSingleBlock(index);
                if (index !== null) {
                  props.setIsMobileInspectorOpen(false);
                }
              }}
            />
          </div>
        </>
      ) : null}
    </>
  );
}

type StudioInspectorContentProps = WorkspaceInspectorPanelProps & {
  onOpenMdxEditor?: () => void;
  setSelectedBlockIndex?: (index: number | null) => void;
};

function StudioInspectorContent({
  activeSlide,
  activeSlideAccent,
  activeSlideAlignX,
  activeSlideAlignY,
  activeSlideBackground,
  activeSlideLayout,
  addSlideWithLayout,
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
  isCanvasGridVisible,
  onOpenMdxEditor,
  selectSingleBlock,
  selectedBlockIndex,
  selectedBlockIndices,
  setIsCanvasGridVisible,
  setIsCodeEditorOpen,
  setSelectedBlockIndex,
  updateActiveSlideStyle,
  updateAllSlidesStyle,
  updateBlock,
  uploadImageForBlock,
  uploadVideoForBlock
}: StudioInspectorContentProps) {
  return (
    <StudioInspector
      activeSlide={activeSlide}
      activeSlideAccent={activeSlideAccent}
      activeSlideAlignX={activeSlideAlignX}
      activeSlideAlignY={activeSlideAlignY}
      activeSlideBackground={activeSlideBackground}
      activeSlideLayout={activeSlideLayout}
      addSlideWithLayout={addSlideWithLayout}
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
      isGridVisible={isCanvasGridVisible}
      onOpenMdxEditor={onOpenMdxEditor ?? (() => setIsCodeEditorOpen(true))}
      selectedBlockIndex={selectedBlockIndex}
      selectedBlockIndices={selectedBlockIndices}
      setIsGridVisible={setIsCanvasGridVisible}
      setSelectedBlockIndex={setSelectedBlockIndex ?? selectSingleBlock}
      updateActiveSlideStyle={updateActiveSlideStyle}
      updateAllSlidesStyle={updateAllSlidesStyle}
      updateBlock={updateBlock}
      uploadImageForBlock={uploadImageForBlock}
      uploadVideoForBlock={uploadVideoForBlock}
    />
  );
}
