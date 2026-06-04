import { useMemo } from "react";
import { stringValue } from "@/common/util/valueUtils";
import { getMotionDocStats } from "@/core/motion-doc/application/mdxStats";
import { materializeFreeformSource } from "@/core/motion-doc/application/motionDocFreeform";
import { getSlideTitle } from "@/core/motion-doc/application/motionDocSerialize";
import { numberValue } from "@/core/motion-doc/domain/frame";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";

export function useMotionDocDocument({
  activeSlideIndex,
  source
}: {
  activeSlideIndex: number;
  source: string;
}) {
  const canvasSource = useMemo(() => materializeFreeformSource(source), [source]);
  const stats = useMemo(() => getMotionDocStats(canvasSource), [canvasSource]);
  const sliderDocument = useMemo(() => parseMotionDoc(canvasSource), [canvasSource]);
  const activeSlide = sliderDocument.scenes[activeSlideIndex] ?? sliderDocument.scenes[0];
  const activeSlideBackground = stringValue(activeSlide?.props.background) ?? "#0f172a";
  const activeSlideAccent = stringValue(activeSlide?.props.accent) ?? "#7c3aed";
  const activeSlideTheme = stringValue(activeSlide?.props.theme) ?? "dark";
  const activeSlideLayout = stringValue(activeSlide?.props.layout) ?? "default";
  const activeSlideAlignX = stringValue(activeSlide?.props.alignX) ?? "left";
  const activeSlideAlignY = stringValue(activeSlide?.props.alignY) ?? "center";
  const activeSlideCardFlow = stringValue(activeSlide?.props.cardFlow) ?? "stack";
  const activeSlideMetricFlow = stringValue(activeSlide?.props.metricFlow ?? activeSlide?.props.cardFlow) ?? "stack";
  const activeSlideChartFlow = stringValue(activeSlide?.props.chartFlow) ?? "stack";
  const activeSlideCardGap = numberValue(activeSlide?.props.cardGap) ?? 3;
  const activeSlideChartGap = numberValue(activeSlide?.props.chartGap) ?? 3;
  const activeSlideMetricGap = numberValue(activeSlide?.props.metricGap) ?? 3;
  const activeSlideTextColor = stringValue(activeSlide?.props.textColor ?? activeSlide?.props.foreground ?? activeSlide?.props.color) ?? "";
  const activeSlideMutedColor = stringValue(activeSlide?.props.mutedColor) ?? "";
  const activeSlideShader = stringValue(activeSlide?.props.shader) ?? "";
  const activeSlideShaderColor1 = stringValue(activeSlide?.props.shaderColor1) ?? "";
  const activeSlideShaderColor2 = stringValue(activeSlide?.props.shaderColor2) ?? "";
  const activeSlideShaderColor3 = stringValue(activeSlide?.props.shaderColor3) ?? "";
  const activeSlideShaderEngine = stringValue(activeSlide?.props.shaderEngine) ?? "three";
  const activeSlideShaderIntensity = numberValue(activeSlide?.props.shaderIntensity) ?? 0.5;
  const activeSlideShaderSpeed = numberValue(activeSlide?.props.shaderSpeed) ?? 1;
  const activeSlideShaderSoftness = numberValue(activeSlide?.props.shaderSoftness) ?? 0.5;
  const activeSlideShaderScale = numberValue(activeSlide?.props.shaderScale) ?? 0.5;
  const activeSlideShaderDetail = numberValue(activeSlide?.props.shaderDetail) ?? 0.5;
  const slideRows = useMemo(
    () =>
      sliderDocument.scenes.map((slide, index) => ({
        index,
        duration: slide.duration,
        title: getSlideTitle(slide.blocks, index),
        layers: slide.blocks.length
      })),
    [sliderDocument.scenes]
  );

  return {
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
    activeSlideShaderEngine,
    activeSlideShaderIntensity,
    activeSlideShaderScale,
    activeSlideShaderSoftness,
    activeSlideShaderSpeed,
    activeSlideTextColor,
    activeSlideTheme,
    canvasSource,
    slideRows,
    sliderDocument,
    stats
  };
}
