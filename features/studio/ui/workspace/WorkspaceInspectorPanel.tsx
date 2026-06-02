"use client";

import { StudioInspector } from "@/features/studio/ui/StudioInspector";
import type { StudioWorkspaceProps } from "@/features/studio/ui/workspace/StudioWorkspaceTypes";

type WorkspaceInspectorPanelProps = Pick<
  StudioWorkspaceProps,
  | "activeSlide"
  | "activeSlideAccent"
  | "activeSlideAlignX"
  | "activeSlideAlignY"
  | "activeSlideBackground"
  | "activeSlideCardFlow"
  | "activeSlideCardGap"
  | "activeSlideChartFlow"
  | "activeSlideChartGap"
  | "activeSlideLayout"
  | "activeSlideMetricFlow"
  | "activeSlideMetricGap"
  | "activeSlideMutedColor"
  | "activeSlideShader"
  | "activeSlideShaderColor1"
  | "activeSlideShaderColor2"
  | "activeSlideShaderColor3"
  | "activeSlideShaderDetail"
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
  | "setIsCanvasGridVisible"
  | "setIsCodeEditorOpen"
  | "setIsMobileInspectorOpen"
  | "updateActiveSlideStyle"
  | "updateAllSlidesStyle"
  | "updateBlock"
  | "updateBlockGroupFlow"
  | "uploadImageForBlock"
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
  activeSlideCardFlow,
  activeSlideCardGap,
  activeSlideChartFlow,
  activeSlideChartGap,
  activeSlideLayout,
  activeSlideMetricFlow,
  activeSlideMetricGap,
  activeSlideMutedColor,
  activeSlideShader,
  activeSlideShaderColor1,
  activeSlideShaderColor2,
  activeSlideShaderColor3,
  activeSlideShaderDetail,
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
  setIsCanvasGridVisible,
  setIsCodeEditorOpen,
  setSelectedBlockIndex,
  updateActiveSlideStyle,
  updateAllSlidesStyle,
  updateBlock,
  updateBlockGroupFlow,
  uploadImageForBlock
}: StudioInspectorContentProps) {
  return (
    <StudioInspector
      activeSlide={activeSlide}
      activeSlideAccent={activeSlideAccent}
      activeSlideAlignX={activeSlideAlignX}
      activeSlideAlignY={activeSlideAlignY}
      activeSlideBackground={activeSlideBackground}
      activeSlideCardFlow={activeSlideCardFlow}
      activeSlideCardGap={activeSlideCardGap}
      activeSlideChartFlow={activeSlideChartFlow}
      activeSlideChartGap={activeSlideChartGap}
      activeSlideLayout={activeSlideLayout}
      activeSlideMetricFlow={activeSlideMetricFlow}
      activeSlideMetricGap={activeSlideMetricGap}
      activeSlideMutedColor={activeSlideMutedColor}
      activeSlideShader={activeSlideShader}
      activeSlideShaderColor1={activeSlideShaderColor1}
      activeSlideShaderColor2={activeSlideShaderColor2}
      activeSlideShaderColor3={activeSlideShaderColor3}
      activeSlideShaderDetail={activeSlideShaderDetail}
      activeSlideShaderIntensity={activeSlideShaderIntensity}
      activeSlideShaderScale={activeSlideShaderScale}
      activeSlideShaderSoftness={activeSlideShaderSoftness}
      activeSlideShaderSpeed={activeSlideShaderSpeed}
      activeSlideTextColor={activeSlideTextColor}
      activeSlideTheme={activeSlideTheme}
      isGridVisible={isCanvasGridVisible}
      onOpenMdxEditor={onOpenMdxEditor ?? (() => setIsCodeEditorOpen(true))}
      selectedBlockIndex={selectedBlockIndex}
      setIsGridVisible={setIsCanvasGridVisible}
      setSelectedBlockIndex={setSelectedBlockIndex ?? selectSingleBlock}
      updateActiveSlideStyle={updateActiveSlideStyle}
      updateAllSlidesStyle={updateAllSlidesStyle}
      updateBlock={updateBlock}
      updateBlockGroupFlow={updateBlockGroupFlow}
      uploadImageForBlock={uploadImageForBlock}
    />
  );
}
