import {
  BLOCK_DEFINITIONS,
  CORE_SECTION_TYPES,
  SECTION_TYPES,
  createBriefSection,
  createDefaultProjectBrief,
  type BriefSection,
  type ProjectBrief,
  type SectionData,
  type SectionDataValue,
  type SectionType
} from "@/features/briefly/domain/briefTypes";
import {
  generateHtml,
  generateMdx,
  getBriefDisplayTitle,
  getExportBaseName
} from "@/features/briefly/application/briefExport";
import { parseMdx } from "@/features/briefly/application/briefParser";

type BrieflyBuilderLocale = "en" | "zh-TW";

export type BrieflyBuilderSectionInput = {
  data?: Record<string, unknown>;
  enabled?: boolean;
  title?: string;
  type: SectionType;
};

export type CreateBrieflyBriefInput = {
  category?: string;
  documentName?: string;
  includeCoreSections?: boolean;
  oneLiner?: string;
  owner?: string;
  projectName?: string;
  sections?: BrieflyBuilderSectionInput[];
  stage?: string;
  status?: string;
  title?: string;
};

export type UpdateBrieflySectionInput = {
  brief: ProjectBrief;
  data?: Record<string, unknown>;
  enabled?: boolean;
  title?: string;
  type: SectionType;
};

export type ExportBrieflyBriefInput = {
  brief: ProjectBrief;
  format: "html" | "json" | "mdx";
  locale?: BrieflyBuilderLocale;
};

export function createBrieflyBrief(input: CreateBrieflyBriefInput) {
  const brief = createDefaultProjectBrief();
  const now = new Date().toISOString();
  const sectionInputs = input.sections ?? [];
  const sectionTypes = new Set<SectionType>(["cover"]);

  if (input.includeCoreSections ?? true) {
    CORE_SECTION_TYPES.forEach((type) => sectionTypes.add(type));
  }

  sectionInputs.forEach((section) => sectionTypes.add(section.type));

  brief.id = `brief_${now.replace(/[-:.TZ]/g, "").slice(0, 14)}`;
  brief.document_name = input.documentName ?? input.projectName ?? input.title ?? brief.document_name;
  brief.title = input.title ?? brief.title;
  brief.created_at = now;
  brief.updated_at = now;
  brief.sections = Array.from(sectionTypes).map((type, index) => {
    const existing = brief.sections.find((section) => section.type === type);
    return existing ? { ...existing, order: index + 1 } : createBriefSection(type, index + 1);
  });

  const cover = getSectionOrThrow(brief, "cover");
  cover.data.project_name = input.projectName ?? input.documentName ?? input.title ?? "";
  cover.data.one_liner = input.oneLiner ?? "";
  cover.data.project_category = input.category ?? "";
  cover.data.project_stage = input.stage ?? "規劃中";
  cover.data.status = input.status ?? "草稿";
  cover.data.owner = input.owner ?? "";

  sectionInputs.forEach((sectionInput) => {
    applySectionPatch(brief, sectionInput.type, sectionInput);
  });

  return formatBriefResult(withUpdatedTimestamp(brief));
}

export function parseBrieflyBrief(mdx: string, currentBrief?: ProjectBrief) {
  const base = currentBrief ?? createDefaultProjectBrief();
  return formatBriefResult(withUpdatedTimestamp(parseMdx(mdx, base)));
}

export function updateBrieflySection(input: UpdateBrieflySectionInput) {
  const brief = cloneBrief(input.brief);
  applySectionPatch(brief, input.type, input);
  return formatBriefResult(withUpdatedTimestamp(brief));
}

export function addBrieflySection(input: UpdateBrieflySectionInput) {
  const brief = cloneBrief(input.brief);
  const existing = brief.sections.find((section) => section.type === input.type);

  if (!existing) {
    brief.sections.push(createBriefSection(input.type, brief.sections.length + 1));
  }

  applySectionPatch(brief, input.type, input);
  return formatBriefResult(withUpdatedTimestamp(brief));
}

export function exportBrieflyBrief(input: ExportBrieflyBriefInput) {
  const brief = cloneBrief(input.brief);
  const locale = input.locale ?? "en";
  const basename = getExportBaseName(brief);

  if (input.format === "json") {
    return {
      content: JSON.stringify(brief, null, 2),
      filename: `${basename}.json`,
      mimeType: "application/json",
      summary: summarizeBrieflyBrief(brief)
    };
  }

  if (input.format === "html") {
    return {
      content: generateHtml(brief, locale),
      filename: `${basename}.html`,
      mimeType: "text/html",
      summary: summarizeBrieflyBrief(brief)
    };
  }

  return {
    content: generateMdx(brief, locale),
    filename: `${basename}.mdx`,
    mimeType: "text/markdown",
    summary: summarizeBrieflyBrief(brief)
  };
}

export function listBrieflyBuilderBlocks() {
  return {
    blockDefinitions: BLOCK_DEFINITIONS,
    coreSectionTypes: CORE_SECTION_TYPES,
    sectionTypes: SECTION_TYPES
  };
}

export function getBrieflyBuilderSchema() {
  return {
    fields: {
      ProjectBrief: [
        "id",
        "title",
        "document_name",
        "sections",
        "layout_settings",
        "style_settings",
        "created_at",
        "updated_at"
      ],
      BriefSection: ["id", "type", "title", "enabled", "order", "data", "layout"]
    },
    sectionTypes: SECTION_TYPES,
    tools: [
      "briefly_create_brief",
      "briefly_parse_brief",
      "briefly_add_section",
      "briefly_update_section",
      "briefly_export_brief",
      "briefly_export_pdf"
    ]
  };
}

export function summarizeBrieflyBrief(brief: ProjectBrief) {
  const enabledSections = brief.sections
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);

  return {
    displayTitle: getBriefDisplayTitle(brief),
    enabledSectionCount: enabledSections.length,
    sectionCount: brief.sections.length,
    sections: enabledSections.map((section) => ({
      order: section.order,
      title: section.title,
      type: section.type
    }))
  };
}

function formatBriefResult(brief: ProjectBrief) {
  return {
    brief,
    mdx: generateMdx(brief),
    summary: summarizeBrieflyBrief(brief)
  };
}

function applySectionPatch(
  brief: ProjectBrief,
  type: SectionType,
  patch: Omit<BrieflyBuilderSectionInput, "type"> | UpdateBrieflySectionInput
) {
  const section = getSectionOrCreate(brief, type);

  if (patch.title !== undefined) {
    section.title = patch.title;
  }

  if (patch.enabled !== undefined) {
    section.enabled = patch.enabled;
  }

  if (patch.data) {
    section.data = {
      ...section.data,
      ...coerceSectionData(patch.data)
    };
  }
}

function getSectionOrCreate(brief: ProjectBrief, type: SectionType) {
  const existing = brief.sections.find((section) => section.type === type);

  if (existing) {
    return existing;
  }

  const section = createBriefSection(type, brief.sections.length + 1);
  brief.sections.push(section);
  return section;
}

function getSectionOrThrow(brief: ProjectBrief, type: SectionType) {
  const section = brief.sections.find((item) => item.type === type);

  if (!section) {
    throw new Error(`Brief section is missing: ${type}.`);
  }

  return section;
}

function coerceSectionData(data: Record<string, unknown>): SectionData {
  return Object.fromEntries(
    Object.entries(data)
      .map(([key, value]) => [key, coerceSectionDataValue(value)])
      .filter((entry): entry is [string, SectionDataValue] => entry[1] !== undefined)
  );
}

function coerceSectionDataValue(value: unknown): SectionDataValue {
  if (typeof value === "string") {
    return value;
  }

  if (value === undefined || value === null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string")) {
      return value;
    }

    if (value.every((item) => isPlainObject(item))) {
      return value as unknown as SectionDataValue;
    }

    return value.map((item) => String(item));
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function cloneBrief(brief: ProjectBrief): ProjectBrief {
  return {
    ...brief,
    layout_settings: { ...brief.layout_settings },
    sections: brief.sections.map(cloneSection),
    style_settings: { ...brief.style_settings }
  };
}

function cloneSection(section: BriefSection): BriefSection {
  return {
    ...section,
    data: structuredClone(section.data)
  };
}

function withUpdatedTimestamp(brief: ProjectBrief): ProjectBrief {
  return {
    ...brief,
    updated_at: new Date().toISOString()
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
