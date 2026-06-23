import type {
  BriefAttachment,
  BriefFaqItem,
  BriefImage,
  BriefLink,
  BriefSection,
  BriefTeamMember,
  BriefTimelineItem
} from "@/features/briefly/domain/briefTypes";

export function textValue(section: BriefSection | undefined, key: string) {
  const value = section?.data[key];
  if (typeof value !== "string") return "";
  
  if (
    value.startsWith("<p>") &&
    value.endsWith("</p>") &&
    value.indexOf("<p>", 3) === -1 &&
    !value.includes("<ul") &&
    !value.includes("<ol") &&
    !value.includes("<h") &&
    !value.includes("<blockquote")
  ) {
    return value.substring(3, value.length - 4);
  }

  return value;
}

export function stringArrayValue(section: BriefSection, key: string) {
  const value = section.data[key];
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

export function linksValue(section: BriefSection) {
  const value = section.data.links;
  return Array.isArray(value) ? (value as BriefLink[]) : [];
}

export function imagesValue(section: BriefSection) {
  const value = section.data.images;
  return Array.isArray(value) ? (value as BriefImage[]) : [];
}

export function faqValue(section: BriefSection) {
  const value = section.data.faq_items;
  return Array.isArray(value) ? (value as BriefFaqItem[]) : [];
}

export function teamValue(section: BriefSection) {
  const value = section.data.team_members;
  return Array.isArray(value) ? (value as BriefTeamMember[]) : [];
}

export function timelineItemsValue(section: BriefSection) {
  const value = section.data.timeline_items;
  return Array.isArray(value) ? (value as BriefTimelineItem[]) : [];
}

export function attachmentsValue(section: BriefSection) {
  const value = section.data.attachments;
  return Array.isArray(value) ? (value as BriefAttachment[]) : [];
}

export function budgetValue(section: BriefSection) {
  const value = section.data.budget_items;
  return Array.isArray(value) ? (value as import("@/features/briefly/domain/briefTypes").BriefBudgetItem[]) : [];
}

export function decisionValue(section: BriefSection) {
  const value = section.data.decision_items;
  return Array.isArray(value) ? (value as import("@/features/briefly/domain/briefTypes").BriefDecisionItem[]) : [];
}

export function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinLines(items: string[]) {
  return items.join("\n");
}
