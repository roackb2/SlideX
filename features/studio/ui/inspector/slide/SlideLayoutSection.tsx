"use client";

import { Grid3X3, Sliders } from "lucide-react";
import type { PropRecord } from "@/features/studio/application/themeColors";
import { Field, NativeSelect } from "@/features/studio/ui/inspector/InspectorControls";
import { AccordionSection } from "@/features/studio/ui/inspector/controls/AccordionSection";

type SlideLayoutSectionProps = {
  alignX: string;
  alignY: string;
  isGridVisible: boolean;
  layout: string;
  setIsGridVisible: (value: boolean) => void;
  updateActiveSlideStyle: (updates: PropRecord) => void;
};

export function SlideLayoutSection({
  alignX,
  alignY,
  isGridVisible,
  layout,
  setIsGridVisible,
  updateActiveSlideStyle
}: SlideLayoutSectionProps) {
  return (
    <AccordionSection title="Canvas Grid & Layout" icon={<Sliders size={13} className="text-[#8ea5ff]" />} defaultOpen>
      <Field label="Canvas grid">
        <button
          aria-pressed={isGridVisible}
          className={`flex items-center justify-between rounded-md border px-3 py-2 text-[11px] transition-colors cursor-pointer ${
            isGridVisible
              ? "border-neutral-600 bg-neutral-900 text-white"
              : "border-neutral-800 bg-transparent text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
          }`}
          onClick={() => setIsGridVisible(!isGridVisible)}
          type="button"
        >
          <span className="flex items-center gap-2">
            <Grid3X3 size={13} />
            Grid Overlay
          </span>
          <span className={`flex h-4 w-7 items-center rounded-full p-0.5 transition-colors ${isGridVisible ? "bg-[#8ea5ff]" : "bg-neutral-800"}`}>
            <span className={`h-3 w-3 rounded-full transition-transform ${isGridVisible ? "translate-x-3 bg-black" : "translate-x-0 bg-neutral-500"}`} />
          </span>
        </button>
      </Field>

      <Field label="Layout Style">
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
        <Field label="Horizontal align">
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
        <Field label="Vertical align">
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
    </AccordionSection>
  );
}
