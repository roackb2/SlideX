import { defaultTemplate } from "@/lib/templates";
import { materializeFreeformSource } from "@/lib/motionDocFreeform";

export const defaultMdx = materializeFreeformSource(defaultTemplate.source);
