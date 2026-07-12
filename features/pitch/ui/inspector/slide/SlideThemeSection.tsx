"use client";

import { Palette } from "lucide-react";
import { solidFillUpdates, type PropRecord } from "@/features/pitch/application/themeColors";
import { SolidFillControl } from "@/features/pitch/ui/inspector/InspectorControls";
import { AccordionSection } from "@/features/pitch/ui/inspector/controls/AccordionSection";

type SlideThemeSectionProps = {
  accent: string;
  background: string;
  mutedColor: string;
  textColor: string;
  theme: string;
  updateActiveSlideStyle: (updates: PropRecord) => void;
  updateAllSlidesStyle: (updates: PropRecord) => void;
};

export function SlideThemeSection(props: SlideThemeSectionProps) {
  return (
    <AccordionSection title="Solid Fill" icon={<Palette size={13} className="text-neutral-400" />} defaultOpen>
      <SlideThemeSectionContent {...props} />
    </AccordionSection>
  );
}

export function SlideThemeSectionContent({
  background,
  updateActiveSlideStyle
}: SlideThemeSectionProps) {
  return (
    <SolidFillControl
      onChange={(color) => updateActiveSlideStyle(solidFillUpdates(color))}
      value={background}
    />
  );
}
