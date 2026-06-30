"use client";

import type { PropRecord } from "@/features/pitch/application/themeColors";
import { BackgroundSettingsSection } from "@/features/pitch/ui/inspector/BackgroundSettingsSection";
import { SlideLayoutSection } from "@/features/pitch/ui/inspector/slide/SlideLayoutSection";
import { SlideTransitionSection } from "@/features/pitch/ui/inspector/slide/SlideTransitionSection";

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
  shaderEngine: string;
  shaderIntensity: number;
  shaderScale: number;
  shaderSoftness: number;
  shaderSpeed: number;
  textColor: string;
  theme: string;
  slideTransition?: string | number;
  transitionDuration?: string | number;
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
  shaderEngine,
  shaderIntensity,
  shaderScale,
  shaderSoftness,
  shaderSpeed,
  textColor,
  theme,
  slideTransition,
  transitionDuration,
  updateActiveSlideStyle,
  updateAllSlidesStyle
}: SlideSettingsProps) {
  return (
    <div className="flex flex-col gap-0 animate-[bubble-appear_0.2s_ease-out]">
      <BackgroundSettingsSection
        accent={accent}
        background={background}
        mutedColor={mutedColor}
        shader={shader}
        shaderColor1={shaderColor1}
        shaderColor2={shaderColor2}
        shaderColor3={shaderColor3}
        shaderDetail={shaderDetail}
        shaderEngine={shaderEngine}
        shaderIntensity={shaderIntensity}
        shaderScale={shaderScale}
        shaderSoftness={shaderSoftness}
        shaderSpeed={shaderSpeed}
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

      <SlideTransitionSection
        duration={duration}
        slideTransition={slideTransition}
        transitionDuration={transitionDuration}
        updateActiveSlideStyle={updateActiveSlideStyle}
      />
    </div>
  );
}
