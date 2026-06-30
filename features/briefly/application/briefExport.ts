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
  ProjectBrief,
  SectionType
} from "@/features/briefly/domain/briefTypes";
import {
  renderHtmlList,
  richTextToHtml,
  richTextToMdx,
  richTextToPlainText
} from "@/features/briefly/application/richTextFormat";
import {
  getBrieflyCopy,
  getOptionLabel,
  getSectionCopy,
  type BrieflyLocale
} from "@/features/briefly/application/brieflyCopy";

const SECTION_TITLES: Record<SectionType, string> = {
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

function getText(section: BriefSection | undefined, key: string) {
  const value = section?.data[key];
  if (typeof value !== "string") return "";
  return richTextToPlainText(value);
}

function getMdxText(section: BriefSection | undefined, key: string) {
  const value = section?.data[key];
  if (typeof value !== "string") return "";
  return richTextToMdx(value);
}

function getRichText(section: BriefSection | undefined, key: string) {
  const value = section?.data[key];
  return typeof value === "string" ? value : "";
}

function getTextArray(section: BriefSection | undefined, key: string) {
  const value = section?.data[key];
  return isTextArray(value) ? value.filter(Boolean) : [];
}

function getLinks(section: BriefSection | undefined) {
  const value = section?.data.links;
  return isLinkArray(value)
    ? value.filter((link) => link.url.trim() || link.label.trim())
    : [];
}

function getImages(section: BriefSection | undefined) {
  const value = section?.data.images;
  return isImageArray(value) ? value.filter((image) => image.src.trim()) : [];
}

function getFaqItems(section: BriefSection | undefined) {
  const value = section?.data.faq_items;
  return isFaqArray(value)
    ? value.filter((item) => item.question.trim() || item.answer.trim())
    : [];
}

function getTeamMembers(section: BriefSection | undefined) {
  const value = section?.data.team_members;
  return isTeamArray(value)
    ? value.filter((item) => item.name.trim() || item.role.trim())
    : [];
}

function getTimelineItems(section: BriefSection | undefined) {
  const value = section?.data.timeline_items;
  return isTimelineItemArray(value)
    ? value.filter((item) => item.label.trim() || item.date.trim() || item.endDate?.trim() || item.note?.trim())
    : [];
}

function getAttachments(section: BriefSection | undefined) {
  const value = section?.data.attachments;
  return isAttachmentArray(value)
    ? value.filter((item) => item.name.trim() && item.dataUrl.trim())
    : [];
}

function quote(value: string) {
  return JSON.stringify(value);
}

function mdxArray(items: string[]) {
  return JSON.stringify(items);
}

function mdxParagraph(value: string) {
  return value.trim() || "_Add details here._";
}

function indentMultiline(value: string, depth: number) {
  const prefix = "  ".repeat(depth);
  return value
    .split("\n")
    .map((line) => (line.trim() ? `${prefix}${line}` : ""))
    .join("\n");
}

function briefField(name: string, value: string) {
  return [
    `  <BriefField name=${quote(name)}>`,
    indentMultiline(mdxParagraph(value), 2),
    "  </BriefField>"
  ].join("\n");
}

function briefTags(name: string, items: string[]) {
  if (!items.length) {
    return "";
  }

  return `  <BriefTags name=${quote(name)} items={${mdxArray(items)}} />`;
}

function briefList(name: string, items: string[]) {
  const content = items.map((item) => item.trim()).filter(Boolean);

  if (!content.length) {
    return "";
  }

  return `  <BriefList name=${quote(name)} items={${mdxArray(content)}} />`;
}

function briefBlock(section: BriefSection, children: string[], attrs: Record<string, string> = {}) {
  const blockAttrs = [
    `type=${quote(section.type)}`,
    `title=${quote(section.title)}`,
    ...(section.layout && section.layout !== "full" ? [`layout=${quote(section.layout)}`] : []),
    ...Object.entries(attrs)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}=${quote(value)}`)
  ];
  const body = children.filter(Boolean).join("\n\n");

  return body
    ? `<BriefBlock ${blockAttrs.join(" ")}>\n\n${body}\n\n</BriefBlock>`
    : `<BriefBlock ${blockAttrs.join(" ")}>\n\n</BriefBlock>`;
}

function orderedSections(brief: ProjectBrief) {
  return [...brief.sections]
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getCoverSection(brief: ProjectBrief) {
  return brief.sections.find((section) => section.type === "cover");
}

export function getBriefDisplayTitle(brief: ProjectBrief) {
  const cover = getCoverSection(brief);
  return getText(cover, "project_name") || brief.document_name.trim() || "Project Brief";
}

export function getExportBaseName(brief: ProjectBrief) {
  const title = brief.document_name.trim() || getBriefDisplayTitle(brief) || "project-brief";
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "project-brief";
}

export function generateMdx(brief: ProjectBrief, locale?: BrieflyLocale) {
  const sections = orderedSections(brief);

  if (!sections.length) {
    return "";
  }

  const output: string[] = [];

  for (const section of sections) {
    const rendered = renderSectionMdx(section);
    if (rendered) {
      output.push(rendered, "");
    }
  }

  return output.join("\n").trimEnd() + "\n";
}

function renderSectionMdx(section: BriefSection) {
  switch (section.type) {
    case "background":
      return briefBlock(section, [
        briefField("vision_statement", getMdxText(section, "vision_statement")),
        briefField("problem_statement", getMdxText(section, "problem_statement")),
        briefField("background", getMdxText(section, "background")),
        briefField("context_note", getMdxText(section, "context_note"))
      ]);
    case "cover":
      return briefBlock(
        section,
        [
          briefField("project_name", getMdxText(section, "project_name")),
          briefField("one_liner", getMdxText(section, "one_liner")),
          `  <BriefMeta category=${quote(getText(section, "project_category"))} stage=${quote(getText(section, "project_stage"))} status=${quote(getText(section, "status"))} owner=${quote(getText(section, "owner"))} confidentiality=${quote(getText(section, "confidentiality"))} />`
        ],
        { coverImage: getText(section, "cover_image") }
      );
    case "goal":
      return briefBlock(section, [
        briefField("primary_goal", getMdxText(section, "primary_goal")),
        briefTags("secondary_goals", getTextArray(section, "secondary_goals")),
        briefList("non_goals", getTextArray(section, "non_goals")),
        briefField("success_signal", getMdxText(section, "success_signal"))
      ]);

    case "timeline":
      return briefBlock(section, [
        briefField("start_date", getMdxText(section, "start_date")),
        briefField("target_date", getMdxText(section, "target_date")),
        renderTimelineItemsMdx(section),
        briefList("milestones", getTextArray(section, "milestones")),
        briefList("dependencies", getTextArray(section, "dependencies"))
      ]);
    case "deliverables":
      return briefBlock(section, [
        briefList("deliverables", getTextArray(section, "deliverables")),
        briefList("out_of_scope", getTextArray(section, "out_of_scope")),
        briefField("expected_outputs", getMdxText(section, "expected_outputs")),
        briefField("scope_notes", getMdxText(section, "scope_notes"))
      ]);

    case "resources":
      return briefBlock(section, [
        briefList("available_assets", getTextArray(section, "available_assets")),
        renderAttachmentsMdx(section),
        briefField("files_or_links", getMdxText(section, "files_or_links")),
        briefField("asset_notes", getMdxText(section, "asset_notes"))
      ]);
    case "risks":
      return briefBlock(section, [
        briefList("risks", getTextArray(section, "risks")),
        briefList("mitigation_plans", getTextArray(section, "mitigation_plans")),
        briefList("open_questions", getTextArray(section, "open_questions")),
        briefList("assumptions_to_validate", getTextArray(section, "assumptions_to_validate"))
      ]);
    case "audience":
      return briefBlock(section, [
        briefField("target_users", getMdxText(section, "target_users")),
        briefList("use_cases", getTextArray(section, "use_cases")),
        briefField("early_adopters", getMdxText(section, "early_adopters"))
      ]);

    case "team":
      return renderTeamMdx(section);
    case "faq":
      return renderFaqMdx(section);

    default:
      return "";
  }
}

function renderTimelineItemsMdx(section: BriefSection) {
  const items = getTimelineItems(section).filter(
    (item) => item.date || item.endDate || item.note || (item.label && item.label !== "新的時間節點" && item.label !== "New timeline item")
  );

  if (!items.length) {
    return "";
  }

  const itemTags = items.map((item) => {
    const props = [];
    if (item.label) props.push(`label="${escapeHtml(item.label)}"`);
    if (item.date) props.push(`date="${escapeHtml(item.date)}"`);
    if (item.endDate) props.push(`endDate="${escapeHtml(item.endDate)}"`);
    if (item.note) props.push(`note="${escapeHtml(item.note)}"`);
    return `    <BriefTimelineItem ${props.join(" ")} />`;
  }).join("\n");

  return `  <BriefTimeline>\n${itemTags}\n  </BriefTimeline>`;
}

function renderAttachmentsMdx(section: BriefSection) {
  const attachments = getAttachments(section);

  if (!attachments.length) {
    return "";
  }

  const itemTags = attachments.map((att) => {
    const props = [];
    if (att.name) props.push(`name="${escapeHtml(att.name)}"`);
    if (att.type) props.push(`type="${escapeHtml(att.type)}"`);
    if (att.size) props.push(`size="${att.size}"`);
    if (att.dataUrl) props.push(`dataUrl="${escapeHtml(att.dataUrl)}"`);
    return `    <BriefAttachment ${props.join(" ")} />`;
  }).join("\n");

  return `  <BriefAttachments>\n${itemTags}\n  </BriefAttachments>`;
}

function renderReferencesMdx(section: BriefSection) {
  const links = getLinks(section);
  const images = getImages(section);
  const parts: string[] = [];

  if (links.length) {
    const linkTags = links.map((link) => {
      const props = [];
      if (link.label) props.push(`label="${escapeHtml(link.label)}"`);
      if (link.url) props.push(`url="${escapeHtml(link.url)}"`);
      return `    <BriefLink ${props.join(" ")} />`;
    }).join("\n");
    parts.push(`  <BriefLinks>\n${linkTags}\n  </BriefLinks>`);
  }

  if (images.length) {
    const imgTags = images.map((img) => {
      const props = [];
      if (img.src) props.push(`src="${escapeHtml(img.src)}"`);
      if (img.caption) props.push(`caption="${escapeHtml(img.caption)}"`);
      return `    <BriefImage ${props.join(" ")} />`;
    }).join("\n");
    parts.push(`  <BriefImages>\n${imgTags}\n  </BriefImages>`);
  }

  return briefBlock(section, parts);
}

function renderTeamMdx(section: BriefSection) {
  const members = getTeamMembers(section).filter((m) => m.name || m.role || m.raci_type);
  const parts: string[] = [];

  if (members.length) {
    const memberTags = members.map((m) => {
      const props = [];
      if (m.name) props.push(`name="${escapeHtml(m.name)}"`);
      if (m.role) props.push(`role="${escapeHtml(m.role)}"`);
      if (m.raci_type) props.push(`raci_type="${escapeHtml(m.raci_type)}"`);
      return `    <BriefTeamMember ${props.join(" ")} />`;
    }).join("\n");
    parts.push(`  <BriefTeam>\n${memberTags}\n  </BriefTeam>`);
  }

  parts.push(briefField("roles", getMdxText(section, "roles")));
  parts.push(briefField("current_gaps", getMdxText(section, "current_gaps")));

  return briefBlock(section, parts);
}

function renderFaqMdx(section: BriefSection) {
  const items = getFaqItems(section).filter((item) => item.question || item.answer);

  if (!items.length) {
    return briefBlock(section, []);
  }

  const faqTags = items.map((item) => {
    const props = [];
    if (item.question) props.push(`question="${escapeHtml(item.question)}"`);
    if (item.answer) props.push(`answer="${escapeHtml(item.answer)}"`);
    return `    <BriefFAQItem ${props.join(" ")} />`;
  }).join("\n");

  return briefBlock(section, [`  <BriefFAQ>\n${faqTags}\n  </BriefFAQ>`]);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function paragraph(value: string) {
  return richTextToHtml(value);
}

function tagList(items: string[]) {
  if (!items.length) {
    return "";
  }

  return `<div class="tag-list">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}

function bulletList(items: string[]) {
  return renderHtmlList("ul", items);
}

function sectionHtml(title: string, body: string, index?: number, layout?: string) {
  const layoutClass = layout && layout !== "full" ? ` layout-${layout}` : "";
  return `<section class="brief-section${layoutClass}">${index ? `<span class="section-number">${String(index).padStart(2, "0")}</span>` : ""}<h2>${escapeHtml(title)}</h2>${body || "<p class=\"placeholder\">Add details here.</p>"}</section>`;
}

export function generateHtml(brief: ProjectBrief, locale: BrieflyLocale = "en") {
  const cover = getCoverSection(brief);
  const title = getBriefDisplayTitle(brief);
  const sections = orderedSections(brief).filter((section) => section.type !== "cover");
  const layout = brief.layout_settings;
  const style = brief.style_settings;
  const copy = getBrieflyCopy(locale).sectionEditor;

  // Font Family configuration
  const fontConfig = {
    sans: {
      url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;600;700&display=swap",
      family: "'Inter', 'Noto Sans TC', sans-serif"
    },
    serif: {
      url: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Serif+TC:wght@400;500;600;700&display=swap",
      family: "'Playfair Display', 'Noto Serif TC', serif"
    },
    mono: {
      url: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Noto+Sans+TC:wght@400;500;600;700&display=swap",
      family: "'Fira Code', 'Noto Sans TC', monospace"
    }
  }[style.typography];

  const maxWidth = {
    narrow: "720px",
    standard: "860px",
    wide: "1040px"
  }[layout.page_width];

  const sectionGap = {
    compact: "2rem",
    standard: "3rem",
    spacious: "4.5rem"
  }[layout.section_spacing];

  const fontSize = {
    small: "15px",
    medium: "16px",
    large: "18px"
  }[style.font_size];

  const isDarkTheme = style.page_background === "dark";
  const themeVars = isDarkTheme
    ? `
      --bg-body: #000000;
      --bg-main: #0a0a0a;
      --card-bg: #111111;
      --card-bg-alt: #1a1a1a;
      --border-color: #222222;
      --text-primary: #ffffff;
      --text-secondary: #a1a1aa;
      --text-muted: #71717a;
      --shadow-color: rgba(0,0,0,0.4);
    `
    : `
      --bg-body: #f5f5f5;
      --bg-main: #ffffff;
      --card-bg: #fafafa;
      --card-bg-alt: #f0f0f0;
      --border-color: #e5e5e5;
      --text-primary: #111111;
      --text-secondary: #525252;
      --text-muted: #737373;
      --shadow-color: rgba(0,0,0,0.04);
    `;
  
  let backgroundCss = 'var(--bg-body)';
  if (style.background_image) {
    backgroundCss = `url(${style.background_image}) center / cover fixed no-repeat`;
  } else if (style.theme_gradient) {
    backgroundCss = style.theme_gradient;
  }

  // Tag Style
  const tagStyle = {
    filledGray: "background: var(--card-bg-alt); border: 1px solid transparent; color: var(--text-primary);",
    outline: "background: transparent; border: 1px solid var(--border-color); color: var(--text-primary);",
    minimal: "background: transparent; border: 0; border-bottom: 1px solid var(--border-color); border-radius: 0; padding: 4px 0; color: var(--text-secondary);"
  }[style.tag_style];

  // Border Style
  const sectionBorderStyle = {
    none: "border: 0; padding: 0;",
    light: "border-top: 1px solid var(--border-color); padding-top: 2rem;",
    card: "border: 1px solid var(--border-color); background: var(--card-bg); padding: 2.5rem; border-radius: 1rem; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 20px var(--shadow-color);"
  }[style.border_style];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <style>
    @import url('${fontConfig.url}');
    
    :root { 
      ${themeVars}
      color-scheme: ${isDarkTheme ? 'dark' : 'light'}; 
    }
    
    * { box-sizing: border-box; }
    
    body {
      margin: 0;
      background: ${backgroundCss};
      color: var(--text-primary);
      font-family: ${fontConfig.family};
      font-size: ${fontSize};
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }

    /* Double Bezel Outer Shell Container */
    .document-wrapper {
      max-width: calc(${maxWidth} + 6rem);
      margin: 4rem auto;
      padding: 3rem;
      background: var(--bg-main);
      border: 1px solid var(--border-color);
      border-radius: 1.5rem;
      box-shadow: 0 20px 40px var(--shadow-color);
    }

    main {
      max-width: ${maxWidth};
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 ${sectionGap};
    }

    main > * {
      grid-column: 1 / -1;
    }

    .layout-half-left { grid-column: 1 / 2; }
    .layout-half-right { grid-column: 2 / 3; }

    /* Header & Cover */
    .cover {
      padding-bottom: ${sectionGap};
      border-bottom: 1px solid var(--border-color);
      margin-bottom: ${sectionGap};
      animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    .cover-image {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    
    h1, h2, h3, p { margin: 0; }
    
    h1 {
      font-size: clamp(32px, 5vw, 48px);
      line-height: 1.1;
      font-weight: 700;
      letter-spacing: -0.02em;
      max-width: 800px;
      color: var(--text-primary);
    }
    
    .one-liner {
      margin-top: 1.25rem;
      max-width: 700px;
      color: var(--text-secondary);
      font-size: 1.125rem;
      line-height: 1.6;
    }

    /* Tag Pills */
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    
    .tag-list span {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.01em;
      ${tagStyle}
    }

    /* Sections */
    .brief-section {
      ${sectionBorderStyle}
      margin-bottom: ${sectionGap};
      page-break-inside: avoid;
      break-inside: avoid;
      opacity: 0;
      animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    .section-number {
      display: block;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
      font-family: 'Fira Code', monospace;
    }
    
    h2 {
      font-size: 1.5rem;
      line-height: 1.3;
      font-weight: 600;
      letter-spacing: -0.01em;
      margin-bottom: 1.25rem;
      color: var(--text-primary);
    }
    
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    p { color: var(--text-secondary); }
    p + p,
    p + ul,
    p + ol,
    p + blockquote,
    ul + p,
    ol + p,
    blockquote + p { margin-top: 1rem; }
    
    ul,
    ol {
      margin: 1rem 0 0;
      padding-left: 1.35rem;
      color: var(--text-secondary);
    }
    
    li + li { margin-top: 0.5rem; }
    li::marker { color: var(--text-muted); }

    blockquote {
      margin: 1rem 0 0;
      padding-left: 1rem;
      border-left: 3px solid var(--border-color);
      color: var(--text-secondary);
      font-style: italic;
    }
    
    a { 
      color: var(--text-primary); 
      text-decoration-thickness: 1px;
      text-underline-offset: 4px;
      text-decoration-color: var(--border-color);
      transition: all 0.2s;
    }
    
    /* Grids & Cards */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .meta-grid div {
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      padding: 1.25rem;
      border-radius: 0.75rem;
    }
    
    .meta-grid span {
      display: block;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    
    .meta-grid p {
      color: var(--text-primary);
      font-weight: 500;
    }

    .contact-box {
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      padding: 1.5rem;
      background: var(--card-bg);
      margin-bottom: 1rem;
    }

    .timeline-list {
      display: grid;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }

    .timeline-item {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--border-color);
      border-radius: 0.85rem;
      background: var(--card-bg);
      padding: 1.25rem 1.25rem 1.25rem 1.5rem;
      box-shadow: 0 4px 16px var(--shadow-color);
    }

    .timeline-item::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
      background: var(--text-primary);
      opacity: 0.9;
    }

    .timeline-date {
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .attachment-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.75rem;
      margin-top: 1.25rem;
    }

    .attachment-card {
      display: block;
      border: 1px solid var(--border-color);
      border-radius: 0.85rem;
      background: var(--card-bg);
      padding: 1rem;
      text-decoration: none;
      box-shadow: 0 4px 16px var(--shadow-color);
    }

    .attachment-card strong {
      display: block;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .attachment-card span {
      display: block;
      margin-top: 0.35rem;
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .references {
      display: grid;
      gap: 0.75rem;
    }
    
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    
    figure { margin: 0; }
    
    img {
      width: 100%;
      height: auto;
      display: block;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background: var(--card-bg-alt);
      object-fit: cover;
    }
    
    figcaption {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 0.75rem;
      text-align: center;
    }

    /* Team Layout */
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .team-member {
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      padding: 1.25rem;
      border-radius: 0.75rem;
    }
    
    .team-avatar {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 999px;
      border: 1px solid var(--border-color);
      background: var(--card-bg-alt);
      object-fit: cover;
      flex-shrink: 0;
    }
    
    .team-info p.name {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }
    
    .team-info p.role {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    
    .brief-section:nth-child(2) { animation-delay: 0.1s; }
    .brief-section:nth-child(3) { animation-delay: 0.2s; }
    .brief-section:nth-child(4) { animation-delay: 0.3s; }
    .brief-section:nth-child(5) { animation-delay: 0.4s; }
    
    .placeholder { color: var(--text-muted); font-style: italic; }
    
    /* Media Queries */
    @media (max-width: 768px) {
      .document-wrapper { margin: 0; padding: 1.5rem; border-radius: 0; border: none; max-width: none; box-shadow: none; }
      .meta-grid, .image-grid, .team-grid { grid-template-columns: 1fr; }
    }
    
    @media print {
      @page {
        size: A4;
        margin: 15mm 12mm;
      }
      :root {
        --bg-body: #ffffff;
        --bg-main: #ffffff;
        --card-bg: #ffffff;
        --card-bg-alt: #f5f5f5;
        --border-color: #d1d5db;
        --text-primary: #000000;
        --text-secondary: #374151;
        --text-muted: #6b7280;
        --shadow-color: transparent;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body { background: #ffffff !important; }
      .document-wrapper { margin: 0; border: 0; padding: 0; max-width: none; box-shadow: none; border-radius: 0; }
      .brief-section {
        page-break-inside: avoid;
        break-inside: avoid;
        animation: none !important;
        opacity: 1 !important;
      }
      .cover { animation: none !important; opacity: 1 !important; }
      .team-member, .timeline-item, .contact-box, .attachment-card {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      img { border-color: #d1d5db; }
    }
  </style>
</head>
<body>
  <div class="document-wrapper">
    <main>
      ${layout.header_logo ? `<header style="text-align: center; margin-bottom: 3rem;"><img src="${layout.header_logo}" alt="Header Logo" style="max-height: 48px; border: none; background: transparent; object-fit: contain;" /></header>` : ""}
      <header class="cover">
        ${getText(cover, "cover_image") ? `<img src="${getText(cover, "cover_image")}" alt="Cover" style="width: 100%; aspect-ratio: 2.5/1; object-fit: cover; border-radius: 1rem; margin-bottom: 2rem;" />` : ""}
        <h1>${escapeHtml(title)}</h1>
        ${paragraph(getRichText(cover, "one_liner")).replace("<p>", "<p class=\"one-liner\">")}
        <div class="meta-grid">
          <div><span>${copy.fields.category[0]}</span><p>${escapeHtml(getOptionLabel(getText(cover, "project_category") || "Not set", locale))}</p></div>
          <div><span>${copy.fields.stage[0]}</span><p>${escapeHtml(getOptionLabel(getText(cover, "project_stage") || "Not set", locale))}</p></div>
          <div><span>${copy.fields.status[0]}</span><p>${escapeHtml(getOptionLabel(getText(cover, "status") || "Draft", locale))}</p></div>
          <div><span>${copy.fields.owner[0]}</span><p>${escapeHtml(getText(cover, "owner") || "Not set")}</p></div>
          <div><span>${copy.fields.confidentiality[0]}</span><p>${escapeHtml(getOptionLabel(getText(cover, "confidentiality") || "Internal", locale))}</p></div>
        </div>
      </header>
      ${sections
        .map((section) => renderSectionHtml(section, undefined, locale))
        .join("\n      ")}
      ${layout.footer_text ? `<footer style="text-align: center; margin-top: 4rem; padding-top: 3rem; border-top: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.875rem;">${paragraph(layout.footer_text)}</footer>` : ""}
    </main>
  </div>
</body>
</html>`;
}

function renderSectionHtml(section: BriefSection, index?: number, locale: BrieflyLocale = "en") {
  const sectionTitle = getSectionCopy(section.type, locale).title;
  
  switch (section.type) {
    case "background":
      return sectionHtml(
        sectionTitle,
        paragraph(getRichText(section, "vision_statement")) +
          paragraph(getRichText(section, "problem_statement")) +
          paragraph(getRichText(section, "background")) +
          paragraph(getRichText(section, "context_note")),
        index,
        section.layout
      );
    case "goal":
      return sectionHtml(
        sectionTitle,
        paragraph(getRichText(section, "primary_goal")) +
          tagList(getTextArray(section, "secondary_goals")) +
          bulletList(getTextArray(section, "non_goals")) +
          paragraph(getRichText(section, "success_signal")),
        index,
        section.layout
      );

    case "timeline":
      return sectionHtml(
        sectionTitle,
        paragraph(getRichText(section, "start_date")) +
          paragraph(getRichText(section, "target_date")) +
          renderTimelineHtml(section) +
          bulletList(getTextArray(section, "milestones")) +
          bulletList(getTextArray(section, "dependencies")),
        index,
        section.layout
      );
    case "deliverables":
      return sectionHtml(
        sectionTitle,
        bulletList(getTextArray(section, "deliverables")) +
          bulletList(getTextArray(section, "out_of_scope")) +
          paragraph(getRichText(section, "expected_outputs")) +
          paragraph(getRichText(section, "scope_notes")),
        index,
        section.layout
      );

    case "resources":
      return sectionHtml(
        sectionTitle,
        bulletList(getTextArray(section, "available_assets")) +
          renderAttachmentsHtml(section) +
          paragraph(getRichText(section, "files_or_links")) +
          paragraph(getRichText(section, "asset_notes")),
        index,
        section.layout
      );
    case "risks":
      return sectionHtml(
        sectionTitle,
        bulletList(getTextArray(section, "risks")) +
          bulletList(getTextArray(section, "mitigation_plans")) +
          bulletList(getTextArray(section, "open_questions")) +
          bulletList(getTextArray(section, "assumptions_to_validate")),
        index,
        section.layout
      );
    case "audience":
      return sectionHtml(
        sectionTitle,
        paragraph(getRichText(section, "target_users")) +
          bulletList(getTextArray(section, "use_cases")) +
          paragraph(getRichText(section, "early_adopters")),
        index,
        section.layout
      );

    case "team":
      return sectionHtml(sectionTitle, renderTeamHtml(section), index, section.layout);
    case "faq":
      return sectionHtml(sectionTitle, renderFaqHtml(section), index, section.layout);
    case "budget":
      return sectionHtml(
        sectionTitle,
        renderBudgetHtml(section, locale) + paragraph(getRichText(section, "total_budget")) + paragraph(getRichText(section, "budget_notes")),
        index,
        section.layout
      );
    case "decisions":
      return sectionHtml(
        sectionTitle,
        renderDecisionHtml(section, locale) + paragraph(getRichText(section, "decision_notes")),
        index,
        section.layout
      );

    default:
      return sectionHtml(sectionTitle || SECTION_TITLES[section.type] || "Section", "", index, section.layout);
  }
}

function renderTimelineHtml(section: BriefSection) {
  const items = getTimelineItems(section).filter(
    (item) => item.date || item.endDate || item.note || (item.label && item.label !== "新的時間節點" && item.label !== "New timeline item")
  );

  if (!items.length) {
    return "";
  }

  return `<div class="timeline-list">${items
    .map((item) => {
      const date = item.date && item.endDate ? `${item.date} - ${item.endDate}` : item.date || item.endDate || "TBD";
      return `<div class="timeline-item"><span class="timeline-date">${escapeHtml(date)}</span><h3>${escapeHtml(
        item.label || "Timeline item"
      )}</h3>${item.note ? paragraph(item.note) : ""}</div>`;
    })
    .join("")}</div>`;
}

function renderAttachmentsHtml(section: BriefSection) {
  const attachments = getAttachments(section);

  if (!attachments.length) {
    return "";
  }

  return `<div class="attachment-grid">${attachments
    .map(
      (attachment) =>
        `<a class="attachment-card" href="${escapeHtml(attachment.dataUrl)}" download="${escapeHtml(
          attachment.name
        )}"><strong>${escapeHtml(attachment.name)}</strong><span>${escapeHtml(
          attachment.type || "Attachment"
        )} · ${formatBytes(attachment.size)}</span></a>`
    )
    .join("")}</div>`;
}

function renderReferencesHtml(section: BriefSection) {
  const links = getLinks(section);
  const images = getImages(section);
  const linkHtml = links.length
    ? `<div class="references">${links
        .map(
          (link) =>
            `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label || link.url)}</a>`
        )
        .join("")}</div>`
    : "";
  const imageHtml = images.length
    ? `<div class="image-grid">${images
        .map(
          (image) =>
            `<figure><img src="${escapeHtml(image.src)}" alt="${escapeHtml(
              image.caption || "Reference image"
            )}" />${image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : ""}</figure>`
        )
        .join("")}</div>`
    : "";

  return linkHtml + imageHtml;
}

function getBudgetItems(section: BriefSection): BriefBudgetItem[] {
  const items = section.data.budget_items;
  return isBudgetItemArray(items) ? items : [];
}

function renderBudgetHtml(section: BriefSection, locale: BrieflyLocale) {
  const items = getBudgetItems(section);
  const copy = getBrieflyCopy(locale).sectionEditor;
  if (!items.length) return "";

  const rows = items.map(
    (item) => `<tr><td>${escapeHtml(item.category)}</td><td class="tabular-nums">${escapeHtml(item.amount)}</td><td>${escapeHtml(item.note)}</td></tr>`
  );

  return `<table class="budget-table">
    <thead>
      <tr><th>${copy.budgetCategory}</th><th>${copy.budgetAmount}</th><th>${copy.budgetNote}</th></tr>
    </thead>
    <tbody>
      ${rows.join("")}
    </tbody>
  </table>`;
}

function getDecisionItems(section: BriefSection): BriefDecisionItem[] {
  const items = section.data.decision_items;
  return isDecisionItemArray(items) ? items : [];
}

function renderDecisionHtml(section: BriefSection, locale: BrieflyLocale) {
  const items = getDecisionItems(section);
  const copy = getBrieflyCopy(locale).sectionEditor;
  if (!items.length) return "";

  return `<div class="decision-list">${items
    .map((item) => {
      const statusCopy = item.status === "approved" ? copy.decisionApproved : item.status === "rejected" ? copy.decisionRejected : copy.decisionPending;
      const meta = [item.date, statusCopy, item.decided_by].filter(Boolean).map(escapeHtml).join(" · ");
      return `<div class="decision-item">
        <div class="decision-meta">${meta}</div>
        <h3>${escapeHtml(item.decision)}</h3>
        ${item.rationale ? paragraph(item.rationale) : ""}
      </div>`;
    })
    .join("")}</div>`;
}

function renderTeamHtml(section: BriefSection) {
  const members = getTeamMembers(section).filter((m) => m.name || m.role || m.raci_type);
  const memberHtml = members.length
    ? `<div class="team-grid">${members
        .map((member) => `
          <div class="team-member">
            ${member.avatar ? `<img src="${escapeHtml(member.avatar)}" class="team-avatar" alt="${escapeHtml(member.name)}" />` : `<div class="team-avatar" style="display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted)"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`}
            <div class="team-info">
              <p class="name">${escapeHtml(member.name || "Member")}</p>
              ${member.role ? `<p class="role">${escapeHtml(member.role)}</p>` : ""}
              ${member.raci_type ? `<span class="raci-badge" data-type="${escapeHtml(member.raci_type)}">${escapeHtml(member.raci_type.toUpperCase().charAt(0))}</span>` : ""}
            </div>
          </div>
        `)
        .join("")}</div>`
    : "";

  return memberHtml + paragraph(getRichText(section, "roles")) + paragraph(getRichText(section, "current_gaps"));
}

function renderFaqHtml(section: BriefSection) {
  const items = getFaqItems(section).filter((item) => item.question || item.answer);

  if (!items.length) {
    return "";
  }

  return items
    .map(
      (item) =>
        `<div class="contact-box"><h3>${escapeHtml(item.question || "Question")}</h3>${paragraph(item.answer)}</div>`
    )
    .join("");
}
