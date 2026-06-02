"use client";

import type { PropRecord } from "@/features/studio/application/themeColors";
import { ShaderBackgroundSection } from "@/features/studio/ui/inspector/shader/ShaderBackgroundSection";
import { SlideLayoutSection } from "@/features/studio/ui/inspector/slide/SlideLayoutSection";
import { SlideThemeSection } from "@/features/studio/ui/inspector/slide/SlideThemeSection";
import { SlideTimelineSection } from "@/features/studio/ui/inspector/slide/SlideTimelineSection";

type SlideSettingsProps = {
  accent: string;
  alignX: string;
  alignY: string;
  background: string;
  duration: number;
  isGridVisible: boolean;
  layout: string;
  mutedColor: string;
  setIsGridVisible: (value: boolean) => void;
  shader: string;
  shaderColor1: string;
  shaderColor2: string;
  shaderColor3: string;
  shaderDetail: number;
  shaderIntensity: number;
  shaderScale: number;
  shaderSoftness: number;
  shaderSpeed: number;
  textColor: string;
  theme: string;
  updateActiveSlideStyle: (updates: PropRecord) => void;
  updateAllSlidesStyle: (updates: PropRecord) => void;
};

export function SlideSettings({
  accent,
  alignX,
  alignY,
  background,
  duration,
  isGridVisible,
  layout,
  mutedColor,
  setIsGridVisible,
  shader,
  shaderColor1,
  shaderColor2,
  shaderColor3,
  shaderDetail,
  shaderIntensity,
  shaderScale,
  shaderSoftness,
  shaderSpeed,
  textColor,
  theme,
  updateActiveSlideStyle,
  updateAllSlidesStyle
}: SlideSettingsProps) {
  return (
    <div className="flex flex-col gap-4 animate-[bubble-appear_0.2s_ease-out]">
      <SlideThemeSection
        accent={accent}
        background={background}
        mutedColor={mutedColor}
        textColor={textColor}
        theme={theme}
        updateActiveSlideStyle={updateActiveSlideStyle}
        updateAllSlidesStyle={updateAllSlidesStyle}
      />

      <SlideLayoutSection
        alignX={alignX}
        alignY={alignY}
        isGridVisible={isGridVisible}
        layout={layout}
        setIsGridVisible={setIsGridVisible}
        updateActiveSlideStyle={updateActiveSlideStyle}
      />

      <SlideTimelineSection duration={duration} updateActiveSlideStyle={updateActiveSlideStyle} />

      <ShaderBackgroundSection
        accent={accent}
        background={background}
        shader={shader}
        shaderColor1={shaderColor1}
        shaderColor2={shaderColor2}
        shaderColor3={shaderColor3}
        shaderDetail={shaderDetail}
        shaderIntensity={shaderIntensity}
        shaderScale={shaderScale}
        shaderSoftness={shaderSoftness}
        shaderSpeed={shaderSpeed}
        updateActiveSlideStyle={updateActiveSlideStyle}
      />
    </div>
  );
}
