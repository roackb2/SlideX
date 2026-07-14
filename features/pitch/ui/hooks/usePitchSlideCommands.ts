"use client";

import type { Dispatch, SetStateAction } from "react";
import type { MotionDocProps, MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import { defaultTemplate, motionTemplates } from "@/core/motion-doc/presets/templates";
import {
  appendBlankSlideSource,
  appendLayoutSlideSource,
  applyAllSlidesStyleSource,
  applyLayoutToSlide,
  applySlideStyleSource,
  deleteSlideSource,
  insertBlankSlideSource,
  reorderSlideSource,
  replaceSlideSource,
  type InsertSlidePlacement
} from "@/features/pitch/application/motionDocCommands";

type UsePitchSlideCommandsArgs = {
  activeSlide: MotionDocScene | undefined;
  activeSlideIndex: number;
  commitSource: (nextSource: string | ((current: string) => string)) => void;
  scenes: MotionDocScene[];
  selectSingleBlock: (index: number | null) => void;
  setActiveSlideIndex: Dispatch<SetStateAction<number>>;
  setIsTemplateModalOpen: Dispatch<SetStateAction<boolean>>;
  setNotice: Dispatch<SetStateAction<string>>;
  setReplayNonce: Dispatch<SetStateAction<number>>;
  setSelectedTemplateId: Dispatch<SetStateAction<string>>;
};

export function usePitchSlideCommands({
  activeSlide,
  activeSlideIndex,
  commitSource,
  scenes,
  selectSingleBlock,
  setActiveSlideIndex,
  setIsTemplateModalOpen,
  setNotice,
  setReplayNonce,
  setSelectedTemplateId
}: UsePitchSlideCommandsArgs) {
  function updateAllSlidesStyle(updates: MotionDocProps) {
    if (scenes.length === 0) return;
    commitSource((current) => applyAllSlidesStyleSource(current, scenes, updates));
    setReplayNonce((value) => value + 1);
    setNotice("Theme applied to all slides");
  }

  function applyTemplate(templateId: string) {
    const template = motionTemplates.find((item) => item.id === templateId) ?? defaultTemplate;
    setSelectedTemplateId(template.id);
    const match = template.source.match(/<(?:Slide|Scene)\b([^>]*)>/);

    if (match) {
      const updates: MotionDocProps = {};
      const attrRegex = /([a-zA-Z0-9]+)="([^"]*)"/g;
      let attrMatch: RegExpExecArray | null;

      while ((attrMatch = attrRegex.exec(match[1])) !== null) {
        const key = attrMatch[1];
        const value = attrMatch[2];
        if (key === "duration" || key.startsWith("shader")) continue;
        const numericValue = Number(value);
        updates[key] = !Number.isNaN(numericValue) && value.trim() !== "" ? numericValue : value;
      }

      updateAllSlidesStyle(updates);
      commitSource((source) => source.replace(/<(Text|Title)([^>]*?)\s+color="[^"]*"/g, "<$1$2"));
    }

    setIsTemplateModalOpen(false);
    setNotice(`${template.name} theme applied`);
  }

  function addSlide() {
    commitSource((current) => appendBlankSlideSource(current, activeSlideIndex));
    setActiveSlideIndex(scenes.length);
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Blank slide added");
  }

  function insertSlideNearActive(placement: InsertSlidePlacement) {
    commitSource((current) => insertBlankSlideSource(current, activeSlideIndex, placement));
    setActiveSlideIndex(placement === "before" ? activeSlideIndex : activeSlideIndex + 1);
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice(placement === "before" ? "Slide inserted before" : "Slide inserted after");
  }

  function addSlideWithLayout(layoutSource: string) {
    commitSource((current) => appendLayoutSlideSource(current, activeSlideIndex, layoutSource));
    setActiveSlideIndex(scenes.length);
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Slide added with layout");
  }

  function applyLayoutToActiveSlide(layoutSource: string, layoutId: string) {
    if (!activeSlide) return;
    const nextSlide = applyLayoutToSlide(activeSlide, layoutSource, layoutId);
    commitSource((current) => replaceSlideSource(current, activeSlideIndex, nextSlide));
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Layout applied");
  }

  function deleteSlide(slideIndex: number) {
    if (scenes.length <= 1) {
      setNotice("Cannot delete last slide");
      return;
    }
    commitSource((current) => deleteSlideSource(current, slideIndex));
    setActiveSlideIndex((current) => Math.min(current, scenes.length - 2));
    setReplayNonce((value) => value + 1);
    setNotice("Slide deleted");
  }

  function reorderSlide(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= scenes.length || toIndex >= scenes.length) return;
    commitSource((current) => reorderSlideSource(current, fromIndex, toIndex));
    setActiveSlideIndex((current) => {
      if (current === fromIndex) return toIndex;
      if (current > fromIndex && current <= toIndex) return current - 1;
      if (current < fromIndex && current >= toIndex) return current + 1;
      return current;
    });
  }

  function updateActiveSlideStyle(updates: MotionDocProps) {
    if (!activeSlide) return;
    commitSource((current) => applySlideStyleSource(current, activeSlide, activeSlideIndex, updates));
    setNotice("Slide style updated");
  }

  function goToPreviousSlide() {
    setActiveSlideIndex((current) => Math.max(current - 1, 0));
    setReplayNonce((value) => value + 1);
  }

  function goToNextSlide() {
    setActiveSlideIndex((current) => Math.min(current + 1, Math.max(scenes.length - 1, 0)));
    setReplayNonce((value) => value + 1);
  }

  return {
    addSlide,
    addSlideWithLayout,
    applyLayoutToActiveSlide,
    applyTemplate,
    deleteSlide,
    goToNextSlide,
    goToPreviousSlide,
    insertSlideNearActive,
    reorderSlide,
    updateActiveSlideStyle,
    updateAllSlidesStyle
  };
}
