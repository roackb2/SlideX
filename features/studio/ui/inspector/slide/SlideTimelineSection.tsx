"use client";

import { Clock } from "lucide-react";
import type { PropRecord } from "@/features/studio/application/themeColors";
import { Field, NumberInput } from "@/features/studio/ui/inspector/InspectorControls";
import { AccordionSection } from "@/features/studio/ui/inspector/controls/AccordionSection";

type SlideTimelineSectionProps = {
  duration: number;
  updateActiveSlideStyle: (updates: PropRecord) => void;
};

export function SlideTimelineSection({ duration, updateActiveSlideStyle }: SlideTimelineSectionProps) {
  return (
    <AccordionSection title="Slide Timeline" icon={<Clock size={13} className="text-[#8ea5ff]" />} defaultOpen>
      <Field label="Slide Duration">
        <NumberInput
          min="0.5"
          onChange={(value) => updateActiveSlideStyle({ duration: value || 5 })}
          step="0.5"
          suffix="seconds"
          value={duration}
        />
      </Field>
    </AccordionSection>
  );
}
