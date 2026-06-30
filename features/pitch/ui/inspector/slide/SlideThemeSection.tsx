"use client";

import { Palette, Plus, Trash2 } from "lucide-react";
import { themeUpdates, type PaletteScope, type PropRecord, type ThemePaletteColors } from "@/features/pitch/application/themeColors";
import { ColorSetControl, Field } from "@/features/pitch/ui/inspector/InspectorControls";
import { colorSwatchStyle } from "@/features/pitch/ui/inspector/color/colorSwatchStyle";
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
    <AccordionSection title="Slide Style & Theme" icon={<Palette size={13} className="text-[#8ea5ff]" />} defaultOpen>
      <SlideThemeSectionContent {...props} />
    </AccordionSection>
  );
}

export function SlideThemeSectionContent({
  accent,
  background,
  mutedColor,
  textColor,
  theme,
  updateActiveSlideStyle,
  updateAllSlidesStyle
}: SlideThemeSectionProps) {

  function applyTheme(colors: ThemePaletteColors, scope: PaletteScope) {
    const updates = themeUpdates(colors);

    if (scope === "deck") {
      updateAllSlidesStyle(updates);
      return;
    }

    updateActiveSlideStyle(updates);
  }

  return (
    <div className="flex flex-col gap-4">
      <ColorSetControl
        label="Color Presets"
        onApplyPalette={applyTheme}
        items={[
          {
            id: "background",
            label: "Background",
            onChange: (value) => updateActiveSlideStyle({ background: value }),
            placeholder: "#050505",
            value: background
          },

          {
            id: "muted",
            label: "Muted",
            onChange: (value) => updateActiveSlideStyle({ mutedColor: value }),
            placeholder: theme === "light" || theme === "paper" ? "#475569" : "#cbd5e1",
            value: mutedColor
          },
          {
            id: "accent",
            label: "Accent",
            onChange: (value) => updateActiveSlideStyle({ accent: value }),
            placeholder: "#7c3aed",
            value: accent
          }
        ]}
      />


    </div>
  );
}
