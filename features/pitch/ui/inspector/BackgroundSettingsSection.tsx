"use client";

import { useState } from "react";
import { Layers, Palette, Sparkles } from "lucide-react";
import type { PropRecord } from "@/features/pitch/application/themeColors";
import { AccordionSection } from "@/features/pitch/ui/inspector/controls/AccordionSection";
import { IconSegmentedControl } from "@/features/pitch/ui/inspector/InspectorControls";
import { SlideThemeSectionContent } from "@/features/pitch/ui/inspector/slide/SlideThemeSection";
import { ShaderBackgroundSectionContent } from "@/features/pitch/ui/inspector/shader/ShaderBackgroundSection";

type BackgroundSettingsSectionProps = {
  accent: string;
  background: string;
  mutedColor: string;
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
  updateActiveSlideStyle: (updates: PropRecord) => void;
  updateAllSlidesStyle: (updates: PropRecord) => void;
};

export function BackgroundSettingsSection({
  accent,
  background,
  mutedColor,
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
  updateActiveSlideStyle,
  updateAllSlidesStyle
}: BackgroundSettingsSectionProps) {
  const [activeTab, setActiveTab] = useState<"standard" | "dynamic">(shader ? "dynamic" : "standard");

  return (
    <AccordionSection title="Background" icon={<Layers size={13} className="text-[#8ea5ff]" />} defaultOpen>
      <div className="mb-2">
        <IconSegmentedControl
          label="Background Type"
          onChange={(value) => setActiveTab(value as "standard" | "dynamic")}
          options={[
            { icon: <Palette size={14} />, label: "Standard", value: "standard" },
            { icon: <Sparkles size={14} />, label: "Dynamic", value: "dynamic" }
          ]}
          value={activeTab}
        />
      </div>

      {activeTab === "standard" ? (
        <SlideThemeSectionContent
          accent={accent}
          background={background}
          mutedColor={mutedColor}
          textColor={textColor}
          theme={theme}
          updateActiveSlideStyle={updateActiveSlideStyle}
          updateAllSlidesStyle={updateAllSlidesStyle}
        />
      ) : (
        <ShaderBackgroundSectionContent
          accent={accent}
          background={background}
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
          updateActiveSlideStyle={updateActiveSlideStyle}
        />
      )}
    </AccordionSection>
  );
}
