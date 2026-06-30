export type EnterAnimation =
  | "blurIn"
  | "fadeIn"
  | "fadeUp"
  | "none"
  | "pop"
  | "reveal"
  | "rise"
  | "slideLeft"
  | "zoomIn";

export type SlideTransition =
  | "curtain"
  | "fade"
  | "none"
  | "pushLeft"
  | "rise"
  | "scale"
  | "wipe";

export type MotionPreset<TValue extends string> = {
  description: string;
  label: string;
  value: TValue;
};

export const elementAnimationPresets = [
  { description: "Static layer", label: "None", value: "none" },
  { description: "Soft vertical lift", label: "Fade Up", value: "fadeUp" },
  { description: "Clean opacity pass", label: "Fade", value: "fadeIn" },
  { description: "Lens-like scale", label: "Zoom", value: "zoomIn" },
  { description: "Right-to-left drift", label: "Slide", value: "slideLeft" },
  { description: "Crisp studio rise", label: "Rise", value: "rise" },
  { description: "Small elastic snap", label: "Pop", value: "pop" },
  { description: "Masked line reveal", label: "Reveal", value: "reveal" },
  { description: "Defocused arrival", label: "Blur", value: "blurIn" }
] satisfies ReadonlyArray<MotionPreset<EnterAnimation>>;

export const slideTransitionPresets = [
  { description: "No slide motion", label: "None", value: "none" },
  { description: "Editorial fade", label: "Fade", value: "fade" },
  { description: "Stage lift", label: "Rise", value: "rise" },
  { description: "Cinematic push", label: "Push", value: "pushLeft" },
  { description: "Camera scale", label: "Scale", value: "scale" },
  { description: "Horizontal wipe", label: "Wipe", value: "wipe" },
  { description: "Soft curtain", label: "Curtain", value: "curtain" }
] satisfies ReadonlyArray<MotionPreset<SlideTransition>>;

export function normalizeEnterAnimation(
  value: string | number | undefined,
  fallback: EnterAnimation = "none"
): EnterAnimation {
  if (
    value === "blurIn" ||
    value === "fadeIn" ||
    value === "fadeUp" ||
    value === "none" ||
    value === "pop" ||
    value === "reveal" ||
    value === "rise" ||
    value === "slideLeft" ||
    value === "zoomIn"
  ) {
    return value;
  }

  if (value === "") {
    return "none";
  }

  return fallback;
}

export function normalizeSlideTransition(value: string | number | undefined): SlideTransition {
  if (
    value === "curtain" ||
    value === "fade" ||
    value === "pushLeft" ||
    value === "rise" ||
    value === "scale" ||
    value === "wipe"
  ) {
    return value;
  }

  return "none";
}
