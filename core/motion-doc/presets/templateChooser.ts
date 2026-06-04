import { materializeFreeformSource } from "@/core/motion-doc/application/motionDocFreeform";
import { motionTemplates, type MotionTemplate } from "@/core/motion-doc/presets/templates";
import {
  createBlankDocumentSource,
  defaultDocumentTheme,
  documentThemes,
  type BlankDocumentSourceConfig,
  type DocumentTheme
} from "@/core/motion-doc/presets/themeGallery";

export type TemplateChooserCategoryId = "all" | "recent" | "blank" | `template:${string}`;

export type TemplateChooserCategory = {
  id: TemplateChooserCategoryId;
  label: string;
  source: "system" | "template";
};

export type TemplatePreviewTone = {
  accent: string;
  border: string;
  foreground: string;
  muted: string;
  primary: string;
  secondary: string;
  shell: string;
};

export type TemplateChooserItem =
  | {
      blankSource: string;
      description: string;
      id: string;
      kind: "blank";
      name: string;
      preview: TemplatePreviewTone;
      source: string;
      tag: "blank";
      tagLabel: string;
    }
  | {
      blankSource: string;
      description: string;
      duration: string;
      id: string;
      kind: "deck";
      name: string;
      preview: TemplatePreviewTone;
      slideCount: number;
      source: string;
      tag: string;
      tagLabel: string;
      templateId: string;
      useCase: string;
    };

export type BlankTemplateChooserItem = Extract<TemplateChooserItem, { kind: "blank" }>;
export type DeckTemplateChooserItem = Extract<TemplateChooserItem, { kind: "deck" }>;

const templateTagLabels: Record<string, string> = {
  Black: "Black",
  White: "White",
  "Consulting Blue": "Consulting Blue",
  "Electric Slate": "Electric Slate",
  "Graphite Green": "Graphite Green",
  "Ivory Finance": "Ivory Finance",
  "Luxury Plum": "Luxury Plum",
  "Midnight Blue": "Midnight Blue",
  "Mist QBR": "Mist QBR",
  "Signal White": "Signal White"
};

const templateToneByTag: Record<string, TemplatePreviewTone> = {
  Black: { accent: "#ffffff", border: "#3f3f46", foreground: "#ffffff", muted: "#a1a1aa", primary: "#050505", secondary: "#111111", shell: "#020202" },
  White: { accent: "#111111", border: "#d4d4d8", foreground: "#111111", muted: "#71717a", primary: "#ffffff", secondary: "#f4f4f5", shell: "#fafafa" },
  "Midnight Blue": { accent: "#72a7ff", border: "#1e3a5f", foreground: "#f8fbff", muted: "#9fb7d8", primary: "#07111f", secondary: "#0d1728", shell: "#030812" },
  "Ivory Finance": { accent: "#7a4f24", border: "#d8c6ac", foreground: "#2f2418", muted: "#8b7358", primary: "#fff8ef", secondary: "#efe5d7", shell: "#f4eadc" },
  "Graphite Green": { accent: "#7dd3a8", border: "#224034", foreground: "#f4fff8", muted: "#9bb7aa", primary: "#07120f", secondary: "#0e1c17", shell: "#030906" },
  "Mist QBR": { accent: "#145c49", border: "#c8d8d2", foreground: "#10251f", muted: "#5d746c", primary: "#f6faf8", secondary: "#e5ece8", shell: "#edf4f1" },
  "Electric Slate": { accent: "#7dd3fc", border: "#1f3b50", foreground: "#f5fbff", muted: "#99b5c5", primary: "#081018", secondary: "#0e1a24", shell: "#03070d" },
  "Consulting Blue": { accent: "#183b68", border: "#c3d5eb", foreground: "#10233c", muted: "#607895", primary: "#f7fbff", secondary: "#e4edf8", shell: "#edf4fc" },
  "Luxury Plum": { accent: "#f0a6ca", border: "#3d203f", foreground: "#fff7fb", muted: "#c49ab4", primary: "#120815", secondary: "#1c1021", shell: "#070309" },
  "Signal White": { accent: "#3157ff", border: "#cbd6f3", foreground: "#111827", muted: "#64748b", primary: "#f8faff", secondary: "#e8edf7", shell: "#f0f4ff" }
};

const lightTemplateTags = new Set(["White", "Ivory Finance", "Mist QBR", "Consulting Blue", "Signal White"]);

const deckBlankStyles: Record<string, DeckBlankStyle> = {
  Black: {
    bodyFrame: { h: 14, w: 46, x: 8, y: 55 },
    bodyFontSize: 22,
    lineHeight: 1.35,
    titleFrame: { h: 18, w: 68, x: 8, y: 30 },
    titleFontSize: 76,
    titleWeight: 820
  },
  White: {
    bodyFrame: { h: 14, w: 48, x: 15, y: 53 },
    bodyFontSize: 21,
    lineHeight: 1.42,
    titleFrame: { h: 16, w: 62, x: 15, y: 30 },
    titleFontSize: 64,
    titleWeight: 720
  },
  "Midnight Blue": {
    bodyFrame: { h: 15, w: 52, x: 8, y: 49 },
    bodyFontSize: 23,
    lineHeight: 1.36,
    titleFrame: { h: 17, w: 70, x: 8, y: 22 },
    titleFontSize: 72,
    titleWeight: 780
  },
  "Ivory Finance": {
    bodyFrame: { h: 16, w: 44, x: 9, y: 45 },
    bodyFontSize: 21,
    lineHeight: 1.48,
    titleFrame: { h: 15, w: 58, x: 9, y: 22 },
    titleFontSize: 58,
    titleWeight: 650
  },
  "Graphite Green": {
    bodyFrame: { h: 15, w: 50, x: 8, y: 50 },
    bodyFontSize: 22,
    lineHeight: 1.38,
    titleFrame: { h: 17, w: 66, x: 8, y: 25 },
    titleFontSize: 68,
    titleWeight: 760
  },
  "Mist QBR": {
    bodyFrame: { h: 16, w: 56, x: 22, y: 53 },
    bodyFontSize: 21,
    lineHeight: 1.42,
    textAlign: "center",
    titleFrame: { h: 15, w: 66, x: 17, y: 31 },
    titleFontSize: 60,
    titleWeight: 700
  },
  "Electric Slate": {
    bodyFrame: { h: 15, w: 50, x: 9, y: 47 },
    bodyFontSize: 22,
    lineHeight: 1.34,
    titleFrame: { h: 17, w: 66, x: 9, y: 21 },
    titleFontSize: 70,
    titleWeight: 780
  },
  "Consulting Blue": {
    bodyFrame: { h: 16, w: 48, x: 12, y: 45 },
    bodyFontSize: 22,
    lineHeight: 1.42,
    titleFrame: { h: 15, w: 60, x: 12, y: 20 },
    titleFontSize: 60,
    titleWeight: 720
  },
  "Luxury Plum": {
    bodyFrame: { h: 15, w: 54, x: 23, y: 54 },
    bodyFontSize: 22,
    lineHeight: 1.36,
    textAlign: "center",
    titleFrame: { h: 17, w: 66, x: 17, y: 29 },
    titleFontSize: 70,
    titleWeight: 760
  },
  "Signal White": {
    bodyFrame: { h: 14, w: 48, x: 7, y: 51 },
    bodyFontSize: 22,
    lineHeight: 1.38,
    titleFrame: { h: 18, w: 72, x: 7, y: 25 },
    titleFontSize: 76,
    titleWeight: 820
  }
};

export const blankTemplateItems: BlankTemplateChooserItem[] = documentThemes.map(blankItemFromTheme);
export const deckTemplateItems: DeckTemplateChooserItem[] = motionTemplates.map(deckItemFromTemplate);
export const templateChooserItems = [...blankTemplateItems, ...deckTemplateItems] satisfies readonly TemplateChooserItem[];
export const defaultTemplateChooserItem = blankTemplateItems[0] ?? {
  blankSource: defaultDocumentTheme.source,
  description: defaultDocumentTheme.description,
  id: `blank:${defaultDocumentTheme.id}`,
  kind: "blank",
  name: defaultDocumentTheme.name,
  preview: templatePreviewTone("White"),
  source: defaultDocumentTheme.source,
  tag: "blank",
  tagLabel: "Blank"
} satisfies TemplateChooserItem;

export const templateChooserCategories = [
  { id: "all", label: "All Templates", source: "system" },
  { id: "recent", label: "Recent", source: "system" },
  { id: "blank", label: "Blank Documents", source: "system" },
  ...uniqueTemplateTags().map((tag) => ({
    id: templateCategoryId(tag),
    label: templateTagLabel(tag),
    source: "template" as const
  }))
] satisfies readonly TemplateChooserCategory[];

export function templateCategoryId(tag: string): TemplateChooserCategoryId {
  return `template:${tag}`;
}

export function templateTagFromCategoryId(categoryId: TemplateChooserCategoryId) {
  return categoryId.startsWith("template:") ? categoryId.replace(/^template:/, "") : null;
}

export function getTemplateChooserItem(itemId: string) {
  return templateChooserItems.find((item) => item.id === itemId);
}

export function getTemplateChooserItemsForCategory(categoryId: TemplateChooserCategoryId) {
  if (categoryId === "all") {
    return templateChooserItems;
  }

  if (categoryId === "recent") {
    return [];
  }

  if (categoryId === "blank") {
    return blankTemplateItems;
  }

  const tag = templateTagFromCategoryId(categoryId);
  return tag ? deckTemplateItems.filter((item) => item.tag === tag) : [];
}

export function nextTemplateChooserItem(currentItemId: string, categoryId: TemplateChooserCategoryId) {
  const items = getTemplateChooserItemsForCategory(categoryId);
  const candidates = items.length > 0 ? items : templateChooserItems;
  const currentIndex = candidates.findIndex((item) => item.id === currentItemId);

  return candidates[(currentIndex + 1 + candidates.length) % candidates.length] ?? defaultTemplateChooserItem;
}

export function templateTagLabel(tag: string) {
  return templateTagLabels[tag] ?? tag;
}

export function templatePreviewTone(tag: string): TemplatePreviewTone {
  if (tag === "blank") {
    return templateToneFromTheme(defaultDocumentTheme);
  }

  return templateToneByTag[tag] ?? templateToneByTag.Black;
}

function blankItemFromTheme(theme: DocumentTheme): BlankTemplateChooserItem {
  return {
    blankSource: theme.source,
    description: theme.description,
    id: `blank:${theme.id}`,
    kind: "blank",
    name: theme.name,
    preview: templateToneFromTheme(theme),
    source: theme.source,
    tag: "blank",
    tagLabel: "Blank"
  };
}

function deckItemFromTemplate(template: MotionTemplate): DeckTemplateChooserItem {
  const tone = templatePreviewTone(template.category);

  return {
    blankSource: createDeckBlankSource(template, tone),
    description: template.description,
    duration: template.duration,
    id: `deck:${template.id}`,
    kind: "deck",
    name: template.name,
    preview: tone,
    slideCount: countSlides(template.source),
    source: materializeFreeformSource(template.source),
    tag: template.category,
    tagLabel: templateTagLabel(template.category),
    templateId: template.id,
    useCase: template.useCase
  };
}

function templateToneFromTheme(theme: DocumentTheme): TemplatePreviewTone {
  return {
    accent: theme.preview.accent,
    border: theme.theme === "light" ? "#d4d4d8" : "#3f3f46",
    foreground: theme.preview.text,
    muted: theme.preview.muted,
    primary: theme.preview.background,
    secondary: theme.preview.surface,
    shell: theme.theme === "light" ? "#f4f4f5" : "#09090b"
  };
}

function uniqueTemplateTags() {
  return motionTemplates
    .map((template) => template.category)
    .filter((tag, index, tags) => tags.indexOf(tag) === index);
}

function countSlides(source: string) {
  return Array.from(source.matchAll(/<(?:Slide|Scene)\b/g)).length || 1;
}

type DeckBlankStyle = Partial<
  Pick<
    BlankDocumentSourceConfig,
    | "bodyFontSize"
    | "bodyFrame"
    | "lineHeight"
    | "textAlign"
    | "titleFontSize"
    | "titleFrame"
    | "titleWeight"
  >
>;

function createDeckBlankSource(template: MotionTemplate, tone: TemplatePreviewTone) {
  const style = deckBlankStyles[template.category] ?? {};

  return createBlankDocumentSource({
    accent: tone.accent,
    background: tone.primary,
    bodyPlaceholder: "Write a short paragraph to begin your story.",
    mutedColor: tone.muted,
    textAlign: style.textAlign ?? "left",
    textColor: tone.foreground,
    theme: lightTemplateTags.has(template.category) ? "light" : "dark",
    titlePlaceholder: "Title",
    ...definedBlankStyle(style)
  });
}

function definedBlankStyle(style: DeckBlankStyle): DeckBlankStyle {
  return Object.fromEntries(Object.entries(style).filter(([, value]) => value !== undefined)) as DeckBlankStyle;
}
