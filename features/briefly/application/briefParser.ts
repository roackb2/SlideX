import {
  SECTION_TYPES,
  createBriefSection,
  type BriefAttachment,
  type BriefSection,
  type BriefFaqItem,
  type BriefImage,
  type BriefLink,
  type BriefTeamMember,
  type BriefTimelineItem,
  type ProjectBrief,
  type SectionType
} from "@/features/briefly/domain/briefTypes";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractAttr(text: string, attr: string): string | null {
  const attrName = escapeRegExp(attr);
  const patterns = [
    new RegExp(`(?:^|\\s)${attrName}\\s*=\\s*"([^"]*)"`, "i"),
    new RegExp(`(?:^|\\s)${attrName}\\s*=\\s*'([^']*)'`, "i"),
    new RegExp(`(?:^|\\s)${attrName}\\s*=\\s*{\\s*"([^"]*)"\\s*}`, "i"),
    new RegExp(`(?:^|\\s)${attrName}\\s*=\\s*{\\s*'([^']*)'\\s*}`, "i")
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function parseJsonArray<T>(text: string): T[] {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function stableId(prefix: string, index: number, seed?: string) {
  const slug = (seed ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  return slug ? `${prefix}_${index + 1}_${slug}` : `${prefix}_${index + 1}`;
}

function normalizeLinks(items: Partial<BriefLink>[]): BriefLink[] {
  return items.map((item, index) => ({
    id: item.id || stableId("link", index, `${item.label ?? ""}-${item.url ?? ""}`),
    label: item.label ?? "",
    url: item.url ?? ""
  }));
}

function normalizeImages(items: Partial<BriefImage>[]): BriefImage[] {
  return items.map((item, index) => ({
    id: item.id || stableId("image", index, `${item.caption ?? ""}-${item.src ?? ""}`),
    src: item.src ?? "",
    caption: item.caption ?? ""
  }));
}

function normalizeTeamMembers(items: Partial<BriefTeamMember>[]): BriefTeamMember[] {
  return items.map((item, index) => ({
    id: item.id || stableId("member", index, `${item.name ?? ""}-${item.role ?? ""}`),
    name: item.name ?? "",
    role: item.role ?? "",
    avatar: item.avatar,
    raci_type: item.raci_type
  }));
}

function normalizeFaqItems(items: Partial<BriefFaqItem>[]): BriefFaqItem[] {
  return items.map((item, index) => ({
    id: item.id || stableId("faq", index, `${item.question ?? ""}-${item.answer ?? ""}`),
    question: item.question ?? "",
    answer: item.answer ?? ""
  }));
}

function normalizeTimelineItems(items: Partial<BriefTimelineItem>[]): BriefTimelineItem[] {
  return items.map((item, index) => ({
    id: item.id || stableId("timeline", index, `${item.label ?? ""}-${item.date ?? ""}`),
    label: item.label ?? "",
    date: item.date ?? "",
    endDate: item.endDate ?? "",
    note: item.note ?? ""
  }));
}

function normalizeAttachments(items: Partial<BriefAttachment>[]): BriefAttachment[] {
  return items.map((item, index) => ({
    id: item.id || stableId("attachment", index, `${item.name ?? ""}-${item.size ?? ""}`),
    name: item.name ?? "",
    type: item.type ?? "",
    size: item.size ?? 0,
    dataUrl: item.dataUrl ?? ""
  }));
}

function extractFrontmatterValue(frontmatter: string, key: string): string | null {
  const keyName = escapeRegExp(key);
  const match = new RegExp(`^${keyName}:\\s*(.+)$`, "im").exec(frontmatter);
  if (!match) return null;

  const raw = match[1].trim();
  const quoted = /^["']([\s\S]*)["']$/.exec(raw);
  return quoted ? quoted[1] : raw;
}

function extractComponentAttrs(mdx: string, component: string): string | null {
  const match = new RegExp(`<${escapeRegExp(component)}\\b([\\s\\S]*?)\\/>`, "i").exec(mdx);
  return match ? match[1] : null;
}

function extractComponentArrayProp<T>(
  mdx: string,
  component: string,
  prop: string,
  title?: string
): T[] | null {
  const componentPattern = new RegExp(`<${escapeRegExp(component)}\\b([\\s\\S]*?)\\/>`, "gi");
  let match: RegExpExecArray | null;

  while ((match = componentPattern.exec(mdx)) !== null) {
    const attrs = match[1];
    if (title && extractAttr(attrs, "title") !== title) {
      continue;
    }

    const propMatch = new RegExp(`${escapeRegExp(prop)}\\s*=\\s*{\\s*(\\[[\\s\\S]*?\\])\\s*}`, "i").exec(attrs);
    if (!propMatch) {
      return [];
    }

    return parseJsonArray<T>(propMatch[1]);
  }

  return null;
}

function extractBriefBlocks(mdx: string) {
  const blocks: { attrs: string; body: string }[] = [];
  const blockPattern = /<BriefBlock\b([^>]*)>([\s\S]*?)<\/BriefBlock>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(mdx)) !== null) {
    blocks.push({ attrs: match[1], body: match[2] });
  }

  return blocks;
}

function hasLegacySyntax(mdx: string) {
  return /<(ProjectCover|Section|TagSection|ContactBlock|LinkList|ImageGallery|TeamList|FAQ)\b/i.test(mdx);
}

function isSectionType(value: string): value is SectionType {
  return SECTION_TYPES.includes(value as SectionType);
}

function stripCommonIndent(value: string) {
  const lines = value.replace(/\r\n/g, "\n").split("\n");

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }

  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  const indent = lines
    .filter((line) => line.trim())
    .reduce<number | null>((minIndent, line) => {
      const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;
      return minIndent === null ? currentIndent : Math.min(minIndent, currentIndent);
    }, null);

  return lines.map((line) => line.slice(indent ?? 0)).join("\n");
}

function normalizeFieldContent(value: string) {
  const content = stripCommonIndent(value).trim();
  return content === "_Add details here._" ? "" : content;
}

const orderedListItemPattern = /^\d+[.)]\s+(.+)$/;
const unorderedListItemPattern = /^[-*+]\s+(.+)$/;

function parseMarkdownListItems(value: string) {
  const items: string[] = [];

  value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .forEach((rawLine) => {
      const line = rawLine.trim();
      const unorderedMatch = unorderedListItemPattern.exec(line);
      const orderedMatch = orderedListItemPattern.exec(line);
      const item = unorderedMatch?.[1] ?? orderedMatch?.[1];

      if (item?.trim()) {
        items.push(item.trim());
        return;
      }

      if (line && /^\s{2,}\S/.test(rawLine) && items.length) {
        items[items.length - 1] = `${items[items.length - 1]}\n${line}`;
      }
    });

  return items.length ? items : null;
}

function extractBriefFieldEntries(blockBody: string) {
  const entries: { name: string; content: string }[] = [];
  const fieldPattern = /<BriefField\b([^>]*)>([\s\S]*?)<\/BriefField>/gi;
  let match: RegExpExecArray | null;

  while ((match = fieldPattern.exec(blockBody)) !== null) {
    const name = extractAttr(match[1], "name");
    if (!name) {
      continue;
    }

    entries.push({ name, content: normalizeFieldContent(match[2]) });
  }

  return entries;
}

function extractBriefArrayProp<T>(
  blockBody: string,
  component: string,
  prop: string,
  name?: string
): T[] | null {
  const componentPattern = new RegExp(`<${escapeRegExp(component)}\\b([\\s\\S]*?)\\/>`, "gi");
  let match: RegExpExecArray | null;

  while ((match = componentPattern.exec(blockBody)) !== null) {
    const attrs = match[1];
    if (name && extractAttr(attrs, "name") !== name) {
      continue;
    }

    const propMatch = new RegExp(`${escapeRegExp(prop)}\\s*=\\s*{\\s*(\\[[\\s\\S]*?\\])\\s*}`, "i").exec(attrs);
    return propMatch ? parseJsonArray<T>(propMatch[1]) : [];
  }

  return null;
}

const BRIEF_TEXT_FIELDS: Record<SectionType, string[]> = {
  cover: ["project_name", "one_liner", "project_category", "project_stage", "status", "owner", "confidentiality"],
  background: ["background", "context_note"],
  goal: ["primary_goal", "success_signal"],
  timeline: ["start_date", "target_date"],
  deliverables: ["expected_outputs", "scope_notes"],
  resources: ["files_or_links", "asset_notes"],
  risks: [],
  audience: ["target_users", "early_adopters"],
  team: ["roles", "current_gaps"],
  faq: [],
  budget: ["total_budget", "budget_notes"],
  decisions: ["decision_notes"]
};

const BRIEF_TAG_FIELDS: Partial<Record<SectionType, string[]>> = {
  goal: ["secondary_goals"]
};

const BRIEF_LIST_FIELDS: Partial<Record<SectionType, string[]>> = {
  goal: ["non_goals"],
  timeline: ["milestones", "dependencies"],
  deliverables: ["deliverables", "out_of_scope"],
  resources: ["available_assets"],
  risks: ["risks", "mitigation_plans", "open_questions", "assumptions_to_validate"],
  audience: ["use_cases"]
};

function extractSectionContent(mdx: string, title: string): string | null {
  const sectionPattern = /<Section\b([^>]*)>([\s\S]*?)<\/Section>/gi;
  let match: RegExpExecArray | null;

  while ((match = sectionPattern.exec(mdx)) !== null) {
    if (extractAttr(match[1], "title") !== title) {
      continue;
    }

    const content = match[2].trim();
    return content === "_Add details here._" ? "" : content;
  }

  return null;
}

function extractListItems(mdx: string, title: string): string[] | null {
  const content = extractSectionContent(mdx, title);
  if (content === null) return null;
  if (!content) return [];

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.substring(2));
}

function extractTagItems(mdx: string, title: string): string[] | null {
  return extractComponentArrayProp<string>(mdx, "TagSection", "items", title);
}

export function parseMdx(mdx: string, currentBrief: ProjectBrief): ProjectBrief {
  const newBrief: ProjectBrief = {
    ...currentBrief,
    sections: currentBrief.sections.map((section) => ({ ...section, data: { ...section.data } }))
  };
  const trimmedMdx = mdx.trim();

  if (!trimmedMdx) {
    return {
      ...newBrief,
      sections: []
    };
  }

  function ensureSection(type: SectionType) {
    const existing = newBrief.sections.find((section) => section.type === type);
    if (existing) return existing;

    const nextOrder = Math.max(0, ...newBrief.sections.map((section) => section.order)) + 1;
    const section = createBriefSection(type, nextOrder);
    newBrief.sections.push(section);
    return section;
  }

  function updateText(type: SectionType, key: string, title: string) {
    const content = extractSectionContent(mdx, title);
    if (content === null) return;
    ensureSection(type).data[key] = content;
  }

  function updateTags(type: SectionType, key: string, title: string) {
    const items = extractTagItems(mdx, title);
    if (items === null) return;
    ensureSection(type).data[key] = items;
  }

  function updateList(type: SectionType, key: string, title: string) {
    const items = extractListItems(mdx, title);
    if (items === null) return;
    ensureSection(type).data[key] = items;
  }

  const fmMatch = /^---\n([\s\S]*?)\n---/m.exec(mdx);
  if (fmMatch) {
    const frontmatter = fmMatch[1];
    const title = extractFrontmatterValue(frontmatter, "title");
    const category = extractFrontmatterValue(frontmatter, "category");
    const stage = extractFrontmatterValue(frontmatter, "stage");
    const status = extractFrontmatterValue(frontmatter, "status");
    const themeGradient = extractFrontmatterValue(frontmatter, "theme_gradient");
    const backgroundImage = extractFrontmatterValue(frontmatter, "background_image");
    const coverImage = extractFrontmatterValue(frontmatter, "cover_image");

    if (title !== null) {
      newBrief.document_name = title;
    }

    if (category !== null) {
      ensureSection("cover").data.project_category = category;
    }

    if (stage !== null) {
      ensureSection("cover").data.project_stage = stage;
    }

    if (status !== null) {
      ensureSection("cover").data.status = status;
    }

    if (themeGradient !== null) {
      newBrief.style_settings.theme_gradient = themeGradient;
    }

    if (backgroundImage !== null) {
      newBrief.style_settings.background_image = backgroundImage;
    }

    if (coverImage !== null) {
      ensureSection("cover").data.cover_image = coverImage;
    }
  }

  const briefBlocks = extractBriefBlocks(mdx);
  if (briefBlocks.length) {
    const parsedSections: BriefSection[] = [];

    briefBlocks.forEach((block, index) => {
      const type = extractAttr(block.attrs, "type");
      if (!type || !isSectionType(type)) {
        return;
      }

      const existing = newBrief.sections.find((section) => section.type === type);
      const section: BriefSection = existing
        ? {
            ...existing,
            enabled: true,
            order: index + 1,
            data: { ...existing.data }
          }
        : createBriefSection(type, index + 1);
      const title = extractAttr(block.attrs, "title");
      const coverImage = extractAttr(block.attrs, "coverImage");

      if (title !== null) {
        section.title = title;
      }

      if (type === "cover" && coverImage !== null) {
        section.data.cover_image = coverImage;
      }

      const textFields = BRIEF_TEXT_FIELDS[type];
      const fieldEntries = extractBriefFieldEntries(block.body);
      const firstValueByName = new Map<string, string>();
      fieldEntries.forEach((entry) => {
        if (!firstValueByName.has(entry.name)) {
          firstValueByName.set(entry.name, entry.content);
        }
      });
      const repeatedNameFallback =
        fieldEntries.length === textFields.length &&
        new Set(fieldEntries.map((entry) => entry.name)).size === 1;

      textFields.forEach((field, fieldIndex) => {
        const value = firstValueByName.get(field) ?? (repeatedNameFallback ? fieldEntries[fieldIndex]?.content : null);
        if (value !== null) {
          section.data[field] = value;
        }
      });

      for (const field of BRIEF_TAG_FIELDS[type] ?? []) {
        const value = extractBriefArrayProp<string>(block.body, "BriefTags", "items", field);
        if (value !== null) {
          section.data[field] = value;
        }
      }

      for (const field of BRIEF_LIST_FIELDS[type] ?? []) {
        const fieldValue = firstValueByName.get(field);
        const markdownValue = fieldValue ? parseMarkdownListItems(fieldValue) : null;
        const value = markdownValue ?? extractBriefArrayProp<string>(block.body, "BriefList", "items", field);
        if (value !== null) {
          section.data[field] = value;
        }
      }

      if (type === "timeline") {
        const timelineItems = extractBriefArrayProp<Partial<BriefTimelineItem>>(block.body, "BriefTimeline", "items");
        if (timelineItems !== null) {
          section.data.timeline_items = normalizeTimelineItems(timelineItems);
        }
      }

      const metaAttrs = type === "cover" ? extractComponentAttrs(block.body, "BriefMeta") : null;
      if (metaAttrs !== null) {
        const category = extractAttr(metaAttrs, "category");
        const stage = extractAttr(metaAttrs, "stage");
        const status = extractAttr(metaAttrs, "status");

        if (category !== null) section.data.project_category = category;
        if (stage !== null) section.data.project_stage = stage;
        if (status !== null) section.data.status = status;
      }



      if (type === "resources") {
        const attachments = extractBriefArrayProp<Partial<BriefAttachment>>(block.body, "BriefAttachments", "items");
        if (attachments !== null) {
          section.data.attachments = normalizeAttachments(attachments);
        }
      }

      if (type === "team") {
        const teamMembers = extractBriefArrayProp<Partial<BriefTeamMember>>(block.body, "BriefTeam", "members");
        if (teamMembers !== null) {
          section.data.team_members = normalizeTeamMembers(teamMembers);
        }
      }

      if (type === "faq") {
        const faqItems = extractBriefArrayProp<Partial<BriefFaqItem>>(block.body, "BriefFAQ", "items");
        if (faqItems !== null) {
          section.data.faq_items = normalizeFaqItems(faqItems);
        }
      }

      parsedSections.push(section);
    });

    return {
      ...newBrief,
      sections: parsedSections
    };
  }

  if (!hasLegacySyntax(mdx)) {
    return {
      ...newBrief,
      sections: []
    };
  }

  const coverAttrs = extractComponentAttrs(mdx, "ProjectCover");
  if (coverAttrs !== null) {
    const coverSection = ensureSection("cover");
    const title = extractAttr(coverAttrs, "title");
    const subtitle = extractAttr(coverAttrs, "subtitle");
    const category = extractAttr(coverAttrs, "category");
    const stage = extractAttr(coverAttrs, "stage");
    const status = extractAttr(coverAttrs, "status");
    const coverImage = extractAttr(coverAttrs, "coverImage");

    if (title !== null) coverSection.data.project_name = title;
    if (subtitle !== null) coverSection.data.one_liner = subtitle;
    if (category !== null) coverSection.data.project_category = category;
    if (stage !== null) coverSection.data.project_stage = stage;
    if (status !== null) coverSection.data.status = status;
    if (coverImage !== null) coverSection.data.cover_image = coverImage;
  }

  updateText("background", "vision_statement", "Vision Statement");
  updateText("background", "problem_statement", "Problem Statement");
  updateText("background", "background", "Background");
  updateText("background", "context_note", "Context Note");

  updateText("goal", "primary_goal", "Goal");
  updateTags("goal", "secondary_goals", "Secondary Goals");
  updateList("goal", "non_goals", "Non Goals");
  updateText("goal", "success_signal", "Success Signal");


  const timelineContent = extractSectionContent(mdx, "Timeline");
  if (timelineContent !== null) {
    const parts = timelineContent.split("\n\n");
    const section = ensureSection("timeline");
    section.data.start_date = parts[0]?.replace("Start: ", "") || "";
    section.data.target_date = parts[1]?.replace("Target: ", "") || "";
  }
  updateList("timeline", "milestones", "Milestones");
  updateList("timeline", "dependencies", "Dependencies");

  updateList("deliverables", "deliverables", "Deliverables");
  updateList("deliverables", "out_of_scope", "Out of Scope");
  updateText("deliverables", "expected_outputs", "Expected Outputs");
  updateText("deliverables", "scope_notes", "Scope Notes");


  updateList("resources", "available_assets", "Available Assets");
  updateText("resources", "files_or_links", "Files or Links");
  updateText("resources", "asset_notes", "Asset Notes");

  updateList("risks", "risks", "Risks");
  updateList("risks", "mitigation_plans", "Mitigation Plans");
  updateList("risks", "open_questions", "Open Questions");
  updateList("risks", "assumptions_to_validate", "Assumptions to Validate");

  updateText("audience", "target_users", "Target Users");
  updateList("audience", "use_cases", "Use Cases");
  updateText("audience", "early_adopters", "Early Adopters");


  const teamMembers = extractComponentArrayProp<Partial<BriefTeamMember>>(mdx, "TeamList", "members");
  if (teamMembers !== null) {
    ensureSection("team").data.team_members = normalizeTeamMembers(teamMembers);
  }
  updateText("team", "roles", "Roles");
  updateText("team", "current_gaps", "Current Gaps");

  const faqItems = extractComponentArrayProp<Partial<BriefFaqItem>>(mdx, "FAQ", "items");
  if (faqItems !== null) {
    ensureSection("faq").data.faq_items = normalizeFaqItems(faqItems);
  }



  return newBrief;
}
