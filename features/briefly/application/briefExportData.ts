import type {
  BriefAttachment,
  BriefBudgetItem,
  BriefDecisionItem,
  BriefFaqItem,
  BriefImage,
  BriefLink,
  BriefSection,
  BriefTeamMember,
  BriefTimelineItem,
  SectionType
} from "@/features/briefly/domain/briefTypes";
import {
  richTextToMdx,
  richTextToPlainText
} from "@/features/briefly/application/richTextFormat";

export const SECTION_TITLES: Record<SectionType, string> = {
  cover: "Cover / Snapshot",
  background: "Background",
  goal: "Goal",
  timeline: "Timeline",
  deliverables: "Deliverables",
  resources: "Resources / Assets",
  risks: "Risks / Open Questions",
  audience: "Target Audience",
  team: "Team",
  faq: "FAQ",
  budget: "Budget & Resources",
  decisions: "Decision Log"
};

export function getText(section: BriefSection | undefined, key: string) {
  const value = section?.data[key];
  if (typeof value !== "string") return "";
  return richTextToPlainText(value);
}

export function getMdxText(section: BriefSection | undefined, key: string) {
  const value = section?.data[key];
  if (typeof value !== "string") return "";
  return richTextToMdx(value);
}

export function getRichText(section: BriefSection | undefined, key: string) {
  const value = section?.data[key];
  return typeof value === "string" ? value : "";
}

export function getTextArray(section: BriefSection | undefined, key: string) {
  const value = section?.data[key];
  return isTextArray(value) ? value.filter(Boolean) : [];
}

export function getLinks(section: BriefSection | undefined) {
  const value = section?.data.links;
  return isLinkArray(value)
    ? value.filter((link) => link.url.trim() || link.label.trim())
    : [];
}

export function getImages(section: BriefSection | undefined) {
  const value = section?.data.images;
  return isImageArray(value) ? value.filter((image) => image.src.trim()) : [];
}

export function getFaqItems(section: BriefSection | undefined) {
  const value = section?.data.faq_items;
  return isFaqArray(value)
    ? value.filter((item) => item.question.trim() || item.answer.trim())
    : [];
}

export function getTeamMembers(section: BriefSection | undefined) {
  const value = section?.data.team_members;
  return isTeamArray(value)
    ? value.filter((item) => item.name.trim() || item.role.trim())
    : [];
}

export function getTimelineItems(section: BriefSection | undefined) {
  const value = section?.data.timeline_items;
  return isTimelineItemArray(value)
    ? value.filter((item) => item.label.trim() || item.date.trim() || item.endDate?.trim() || item.note?.trim())
    : [];
}

export function getAttachments(section: BriefSection | undefined) {
  const value = section?.data.attachments;
  return isAttachmentArray(value)
    ? value.filter((item) => item.name.trim() && item.dataUrl.trim())
    : [];
}

export function getBudgetItems(section: BriefSection): BriefBudgetItem[] {
  const items = section.data.budget_items;
  return isBudgetItemArray(items) ? items : [];
}

export function getDecisionItems(section: BriefSection): BriefDecisionItem[] {
  const items = section.data.decision_items;
  return isDecisionItemArray(items) ? items : [];
}

function isTextArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isLinkArray(value: unknown): value is BriefLink[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && "url" in item)
  );
}

function isImageArray(value: unknown): value is BriefImage[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && "src" in item)
  );
}

function isFaqArray(value: unknown): value is BriefFaqItem[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && "question" in item)
  );
}

function isTeamArray(value: unknown): value is BriefTeamMember[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && "name" in item)
  );
}

function isTimelineItemArray(value: unknown): value is BriefTimelineItem[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && "label" in item)
  );
}

function isAttachmentArray(value: unknown): value is BriefAttachment[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && "dataUrl" in item)
  );
}

function isBudgetItemArray(value: unknown): value is BriefBudgetItem[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && "category" in item)
  );
}

function isDecisionItemArray(value: unknown): value is BriefDecisionItem[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && "decision" in item)
  );
}
