"use client";

import { Palette, Plus, Trash2 } from "lucide-react";
import { themeUpdates, type PaletteScope, type PropRecord, type ThemePaletteColors } from "@/features/studio/application/themeColors";
import { ColorSetControl, Field } from "@/features/studio/ui/inspector/InspectorControls";
import { colorSwatchStyle } from "@/features/studio/ui/inspector/color/colorSwatchStyle";
import { AccordionSection } from "@/features/studio/ui/inspector/controls/AccordionSection";
import { useCustomThemes } from "@/features/studio/ui/inspector/slide/useCustomThemes";

type SlideThemeSectionProps = {
  accent: string;
  background: string;
  mutedColor: string;
  textColor: string;
  theme: string;
  updateActiveSlideStyle: (updates: PropRecord) => void;
  updateAllSlidesStyle: (updates: PropRecord) => void;
};

export function SlideThemeSection({
  accent,
  background,
  mutedColor,
  textColor,
  theme,
  updateActiveSlideStyle,
  updateAllSlidesStyle
}: SlideThemeSectionProps) {
  const {
    customThemeName,
    customThemes,
    deleteCustomTheme,
    saveCurrentTheme,
    setCustomThemeName
  } = useCustomThemes({
    accent,
    background,
    mutedColor,
    textColor,
    theme
  });

  function applyTheme(colors: ThemePaletteColors, scope: PaletteScope) {
    const updates = themeUpdates(colors);

    if (scope === "deck") {
      updateAllSlidesStyle(updates);
      return;
    }

    updateActiveSlideStyle(updates);
  }

  return (
    <AccordionSection title="Slide Style & Theme" icon={<Palette size={13} className="text-[#8ea5ff]" />} defaultOpen>
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
            id: "text",
            label: "Text",
            onChange: (value) => updateActiveSlideStyle({ textColor: value }),
            placeholder: theme === "light" || theme === "paper" ? "#111827" : "#ffffff",
            value: textColor
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

      <Field label="Custom themes">
        <div className="rounded-md border border-neutral-800 bg-black/30">
          <div className="flex items-center gap-2 border-b border-neutral-800 p-2">
            <input
              className="min-w-0 flex-1 rounded border border-neutral-800 bg-black px-2 py-1.5 text-[11px] text-neutral-200 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-500"
              onChange={(event) => setCustomThemeName(event.target.value)}
              placeholder="Theme name"
              type="text"
              value={customThemeName}
            />
            <button
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral-800 text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-900 hover:text-white"
              onClick={saveCurrentTheme}
              title="Save current theme"
              type="button"
            >
              <Plus size={14} />
            </button>
          </div>

          {customThemes.length > 0 ? (
            <div className="grid gap-1 p-1">
              {customThemes.map((customTheme) => (
                <div
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-1 rounded border border-transparent transition-colors hover:border-neutral-700 hover:bg-neutral-900"
                  key={customTheme.id}
                >
                  <button
                    aria-label={`Use ${customTheme.name} theme on current slide`}
                    className="flex min-w-0 items-center justify-between gap-2 px-2 py-1.5 text-left"
                    onClick={() => applyTheme(customTheme.colors, "slide")}
                    title={customTheme.name}
                    type="button"
                  >
                    <span className="truncate text-[11px] text-neutral-200">{customTheme.name}</span>
                    <span className="flex -space-x-1">
                      {Object.values(customTheme.colors).map((color) => (
                        <span
                          aria-hidden="true"
                          className="h-5 w-5 rounded border border-white/20 shadow-inner"
                          key={color}
                          style={colorSwatchStyle(color)}
                        />
                      ))}
                    </span>
                  </button>
                  <button
                    aria-label={`Use ${customTheme.name} theme on all slides`}
                    className="rounded border border-neutral-800 px-1.5 py-1 text-[9px] font-medium text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                    onClick={() => applyTheme(customTheme.colors, "deck")}
                    type="button"
                  >
                    All
                  </button>
                  <button
                    aria-label={`Delete ${customTheme.name} theme`}
                    className="mr-1 flex h-6 w-6 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-red-950/40 hover:text-red-300"
                    onClick={() => deleteCustomTheme(customTheme.id)}
                    type="button"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-3 text-[11px] text-neutral-500">Save current colors to reuse them later.</div>
          )}
        </div>
      </Field>
    </AccordionSection>
  );
}
