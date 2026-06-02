import { commercialTemplates } from "@/core/motion-doc/presets/templates/commercialTemplates";
import { premiumBusinessTemplates } from "@/core/motion-doc/presets/templates/premiumBusinessTemplates";

export type { MotionTemplate } from "@/core/motion-doc/presets/templates/templateTypes";
export { snippetTemplates } from "@/core/motion-doc/presets/templates/snippetTemplates";

export const motionTemplates = [
  ...commercialTemplates,
  ...premiumBusinessTemplates
];

export const defaultTemplate = motionTemplates[0];
