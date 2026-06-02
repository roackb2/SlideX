import { defaultTemplate } from "@/core/motion-doc/presets/templates";
import { materializeFreeformSource } from "@/core/motion-doc/application/motionDocFreeform";

export const defaultMdx = materializeFreeformSource(defaultTemplate.source);
