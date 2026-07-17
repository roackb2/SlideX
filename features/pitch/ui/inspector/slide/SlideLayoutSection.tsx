"use client";

import { Grid3X3 } from "lucide-react";
import { Field } from "@/features/pitch/ui/inspector/InspectorControls";
import { AccordionSection } from "@/features/pitch/ui/inspector/controls/AccordionSection";
import { usePitchI18n } from "@/features/pitch/ui/pitchI18n";

type SlideLayoutSectionProps = {
  isGridVisible: boolean;
  setIsGridVisible: (value: boolean) => void;
};

export function SlideLayoutSection({
  isGridVisible,
  setIsGridVisible
}: SlideLayoutSectionProps) {
  const { tx } = usePitchI18n();

  return (
    <AccordionSection title={tx("Canvas Grid & Layout")} defaultOpen>
      <Field label={tx("Canvas grid")}>
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
            {tx("Grid Overlay")}
          </span>
          <span className={`flex h-4 w-7 items-center rounded-full p-0.5 transition-colors ${isGridVisible ? "bg-[#8ea5ff]" : "bg-neutral-800"}`}>
            <span className={`h-3 w-3 rounded-full transition-transform ${isGridVisible ? "translate-x-3 bg-black" : "translate-x-0 bg-neutral-500"}`} />
          </span>
        </button>
      </Field>

    </AccordionSection>
  );
}
