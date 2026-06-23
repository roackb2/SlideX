export const SECTION_GROUPS = [
  "Essential Blocks",
  "Project Details",
  "Advanced Blocks"
] as const;

export type SectionGroup = (typeof SECTION_GROUPS)[number];

export const CORE_SECTION_TYPES = [
  "cover",
  "background",
  "goal",
  "deliverables",
  "timeline"
] as const;

export const OPTIONAL_SECTION_TYPES = [
  "audience",
  "team",
  "risks",
  "faq",
  "resources",
  "budget",
  "decisions"
] as const;

export const SECTION_TYPES = [
  ...CORE_SECTION_TYPES,
  ...OPTIONAL_SECTION_TYPES
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];
export type CoreSectionType = (typeof CORE_SECTION_TYPES)[number];

export type PageWidth = "narrow" | "standard" | "wide";
export type SectionSpacing = "compact" | "standard" | "spacious";
export type HeaderStyle = "minimal" | "editorial" | "pitch";
export type ImageLayout = "grid" | "fullWidth" | "inline";
export type TypographyStyle = "sans" | "serif" | "mono";
export type FontSizeStyle = "small" | "medium" | "large";
export type BorderStyle = "none" | "light" | "card";
export type TagStyle = "filledGray" | "outline" | "minimal";
export type PageBackground = "white" | "dark";
export type SectionLayout = "full" | "half-left" | "half-right";

export interface LayoutSettings {
  page_width: PageWidth;
  section_spacing: SectionSpacing;
  header_style: HeaderStyle;
  image_layout: ImageLayout;
  section_numbering: boolean;
  header_logo?: string;
  footer_text?: string;
}

export interface StyleSettings {
  typography: TypographyStyle;
  font_size: FontSizeStyle;
  border_style: BorderStyle;
  tag_style: TagStyle;
  page_background: PageBackground;
  theme_gradient?: string;
  background_image?: string;
}

export interface BriefLink {
  id: string;
  label: string;
  url: string;
}

export interface BriefImage {
  id: string;
  src: string;
  caption: string;
}

export interface BriefFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface BriefTeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  raci_type?: "responsible" | "accountable" | "consulted" | "informed" | "";
}

export interface BriefTimelineItem {
  id: string;
  label: string;
  date: string;
  endDate?: string;
  note?: string;
}

export interface BriefAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface BriefBudgetItem {
  id: string;
  category: string;
  amount: string;
  note: string;
}

export interface BriefDecisionItem {
  id: string;
  decision: string;
  rationale: string;
  date: string;
  decided_by: string;
  status: "approved" | "pending" | "rejected";
}

export type SectionDataValue =
  | string
  | string[]
  | BriefLink[]
  | BriefImage[]
  | BriefFaqItem[]
  | BriefTeamMember[]
  | BriefTimelineItem[]
  | BriefAttachment[]
  | BriefBudgetItem[]
  | BriefDecisionItem[]
  | undefined;

export type SectionData = Record<string, SectionDataValue>;

export interface BriefSection {
  id: string;
  type: SectionType;
  title: string;
  enabled: boolean;
  order: number;
  data: SectionData;
  layout?: SectionLayout;
}

export interface ProjectBrief {
  id: string;
  title: string;
  document_name: string;
  sections: BriefSection[];
  layout_settings: LayoutSettings;
  style_settings: StyleSettings;
  created_at: string;
  updated_at: string;
}

export interface BlockDefinition {
  type: SectionType;
  title: string;
  group: SectionGroup;
  description: string;
  core: boolean;
}

export const PROJECT_CATEGORIES = [
  "AI 工具",
  "SaaS",
  "Side Project",
  "網站",
  "品牌與視覺",
  "內容產品",
  "課程與知識產品",
  "社群",
  "開源專案",
  "自動化",
  "商業專案",
  "其他"
] as const;

export const PROJECT_STAGES = [
  "點子發想",
  "規劃中",
  "原型製作",
  "MVP (最小可行性產品)",
  "已上線",
  "已有使用者",
  "已有營收",
  "成長期",
  "需要重新設計或優化"
] as const;

export const PROJECT_STATUSES = [
  "草稿",
  "尋求回饋",
  "開發中",
  "已發布",
  "暫停"
] as const;

export const TIMELINE_OPTIONS = [
  "兩週內",
  "一個月內",
  "1-3 個月",
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "尚未確定"
] as const;

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "cover",
    title: "封面與簡介",
    group: "Essential Blocks",
    description: "專案名稱、一句話介紹、分類與狀態。",
    core: true
  },
  {
    type: "background",
    title: "背景與問題陳述",
    group: "Essential Blocks",
    description: "為什麼要啟動這個專案？為了解決什麼問題？",
    core: true
  },
  {
    type: "goal",
    title: "目標與成功標準",
    group: "Essential Blocks",
    description: "預期達成什麼目標？將如何衡量成功？",
    core: true
  },
  {
    type: "deliverables",
    title: "預期產出與範圍",
    group: "Essential Blocks",
    description: "具體要做什麼？不在範圍內的項目？",
    core: true
  },
  {
    type: "timeline",
    title: "時程規劃",
    group: "Essential Blocks",
    description: "預計開始時間、目標完成日與重要里程碑。",
    core: true
  },
  {
    type: "audience",
    title: "目標受眾",
    group: "Project Details",
    description: "目標使用者是誰？主要的使用情境為何？",
    core: false
  },
  {
    type: "team",
    title: "團隊陣容",
    group: "Project Details",
    description: "專案負責人與協作團隊成員。",
    core: false
  },
  {
    type: "risks",
    title: "風險與假設",
    group: "Advanced Blocks",
    description: "潛在風險、尚未解決的問題或需要驗證的假設。",
    core: false
  },
  {
    type: "faq",
    title: "常見問題",
    group: "Advanced Blocks",
    description: "讀者或利害關係人可能會想問的問題與解答。",
    core: false
  },
  {
    type: "resources",
    title: "參考資源與附錄",
    group: "Advanced Blocks",
    description: "相關連結、設計資產或補充資料。",
    core: false
  },
  {
    type: "budget",
    title: "預算與資源",
    group: "Advanced Blocks",
    description: "預估專案所需的預算、人力或技術資源配置。",
    core: false
  },
  {
    type: "decisions",
    title: "決策紀錄",
    group: "Advanced Blocks",
    description: "記錄重要的專案決策、理由與決策者。",
    core: false
  }
];

const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  page_width: "standard",
  section_spacing: "standard",
  header_style: "minimal",
  image_layout: "grid",
  section_numbering: false
};

const DEFAULT_STYLE_SETTINGS: StyleSettings = {
  typography: "sans",
  font_size: "medium",
  border_style: "light",
  tag_style: "outline",
  page_background: "white"
};

const SECTION_TEMPLATES: Record<SectionType, Pick<BriefSection, "title" | "data">> = {
  cover: {
    title: "封面與簡介",
    data: {
      cover_image: "",
      project_name: "",
      one_liner: "",
      project_category: "",
      project_stage: "規劃中",
      status: "草稿",
      owner: "",
      confidentiality: "internal"
    }
  },
  background: {
    title: "背景與問題陳述",
    data: {
      vision_statement: "",
      problem_statement: "",
      background: "",
      context_note: ""
    }
  },
  goal: {
    title: "目標與成功標準",
    data: {
      primary_goal: "",
      secondary_goals: [],
      non_goals: [],
      success_signal: ""
    }
  },
  deliverables: {
    title: "預期產出與範圍",
    data: {
      deliverables: [],
      out_of_scope: [],
      expected_outputs: "",
      scope_notes: ""
    }
  },
  timeline: {
    title: "時程規劃",
    data: {
      start_date: "",
      target_date: "",
      timeline_items: [],
      milestones: [],
      dependencies: []
    }
  },
  audience: {
    title: "目標受眾",
    data: {
      target_users: "",
      use_cases: [],
      early_adopters: ""
    }
  },
  team: {
    title: "團隊陣容",
    data: {
      team_members: [],
      roles: "",
      current_gaps: ""
    }
  },
  risks: {
    title: "風險與假設",
    data: {
      risks: [],
      mitigation_plans: [],
      open_questions: [],
      assumptions_to_validate: []
    }
  },
  faq: {
    title: "常見問題",
    data: {
      faq_items: []
    }
  },
  resources: {
    title: "參考資源與附錄",
    data: {
      available_assets: [],
      attachments: [],
      files_or_links: "",
      asset_notes: ""
    }
  },
  budget: {
    title: "預算與資源",
    data: {
      budget_items: [],
      total_budget: "",
      budget_notes: ""
    }
  },
  decisions: {
    title: "決策紀錄",
    data: {
      decision_items: [],
      decision_notes: ""
    }
  }
};

export function getBlockDefinition(type: SectionType) {
  return BLOCK_DEFINITIONS.find((definition) => definition.type === type);
}

export function isCoreSectionType(type: SectionType): type is CoreSectionType {
  return CORE_SECTION_TYPES.includes(type as CoreSectionType);
}

export function createBriefSection(
  type: SectionType,
  order: number,
  idSuffix = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
): BriefSection {
  const template = SECTION_TEMPLATES[type];

  return {
    id: `${type}_${idSuffix}`,
    type,
    title: template.title,
    enabled: true,
    order,
    data: structuredClone(template.data)
  };
}

export function createDefaultProjectBrief(): ProjectBrief {
  const now = new Date().toISOString();

  return {
    id: "brief_001",
    title: "Project Brief Builder",
    document_name: "Untitled Project Brief",
    sections: [
      createBriefSection("cover", 1, "default_1")
    ],
    layout_settings: { ...DEFAULT_LAYOUT_SETTINGS },
    style_settings: { ...DEFAULT_STYLE_SETTINGS },
    created_at: now,
    updated_at: now
  };
}
