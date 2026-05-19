"use client";

import { Grid3X3 } from "lucide-react";
import { ColorSetControl, Field, NativeSelect, NumberInput, type PropRecord, type ThemePaletteColors } from "@/components/studio/inspector/InspectorControls";

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
  textColor,
  theme,
  updateAllSlidesStyle,
  updateActiveSlideStyle
}: {
  accent: string;
  alignX: string;
  alignY: string;
  background: string;
  duration: number;
  isGridVisible: boolean;
  layout: string;
  mutedColor: string;
  setIsGridVisible: (value: boolean) => void;
  textColor: string;
  theme: string;
  updateAllSlidesStyle: (updates: PropRecord) => void;
  updateActiveSlideStyle: (updates: PropRecord) => void;
}) {
  function themeUpdates(colors: ThemePaletteColors): PropRecord {
    const resolvedTheme = isLightTheme(colors.background) ? "light" : "dark";

    return {
      accent: colors.accent,
      background: colors.background,
      mutedColor: colors.muted,
      textColor: colors.text,
      theme: resolvedTheme
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Global Settings</h3>

      <ColorSetControl
        label="Theme"
        onApplyPalette={(colors, scope) => {
          const updates = themeUpdates(colors);

          if (scope === "deck") {
            updateAllSlidesStyle(updates);
            return;
          }

          updateActiveSlideStyle(updates);
        }}
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

      <Field label="Canvas grid">
        <button
          aria-pressed={isGridVisible}
          className={`flex items-center justify-between rounded-md border px-3 py-2 text-[11px] transition-colors ${
            isGridVisible
              ? "border-neutral-600 bg-neutral-900 text-white"
              : "border-neutral-800 bg-transparent text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
          }`}
          onClick={() => setIsGridVisible(!isGridVisible)}
          type="button"
        >
          <span className="flex items-center gap-2">
            <Grid3X3 size={13} />
            Grid
          </span>
          <span className={`flex h-4 w-7 items-center rounded-full p-0.5 transition-colors ${isGridVisible ? "bg-white" : "bg-neutral-800"}`}>
            <span className={`h-3 w-3 rounded-full transition-transform ${isGridVisible ? "translate-x-3 bg-black" : "translate-x-0 bg-neutral-500"}`} />
          </span>
        </button>
      </Field>

      <Field label="Layout">
        <NativeSelect
          onChange={(value) => updateActiveSlideStyle({ layout: value })}
          options={[
            { label: "Default (Centered)", value: "default" },
            { label: "Split Left (Text Left, Image Right)", value: "split-left" },
            { label: "Split Right (Image Left, Text Right)", value: "split-right" }
          ]}
          value={layout}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Horizontal">
          <NativeSelect
            onChange={(value) => updateActiveSlideStyle({ alignX: value })}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
              { label: "Stretch", value: "stretch" }
            ]}
            value={alignX}
          />
        </Field>
        <Field label="Vertical">
          <NativeSelect
            onChange={(value) => updateActiveSlideStyle({ alignY: value })}
            options={[
              { label: "Top", value: "top" },
              { label: "Center", value: "center" },
              { label: "Bottom", value: "bottom" }
            ]}
            value={alignY}
          />
        </Field>
      </div>

      <Field label="Duration">
        <NumberInput
          min="0.5"
          onChange={(value) => updateActiveSlideStyle({ duration: value || 5 })}
          step="0.5"
          suffix="s"
          value={duration}
        />
      </Field>

    </div>
  );
}

function isLightTheme(background: string) {
  const hex = background.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return false;
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.62;
}
