import type { ProjectBrief } from "@/features/briefly/domain/briefTypes";

export function getOrderedSections(brief: ProjectBrief) {
  return [...brief.sections]
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);
}
