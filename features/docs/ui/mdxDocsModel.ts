import { BookOpen, Code2, FileCode2, MonitorPlay, SlidersHorizontal, Sparkles, Terminal, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/common/lib/i18n";

export type MdxDocsSection = "overview" | "example" | "patterns" | "props" | "motion" | "mcp";
export type SyntaxCopy = Dictionary["resourcesPage"]["syntax"];

export type DocsSectionLink = {
  href: string;
  icon: LucideIcon;
  id: MdxDocsSection;
  label: string;
};

export type DocsGroupLink = Omit<DocsSectionLink, "id"> & {
  active: boolean;
  id?: MdxDocsSection;
};

export type DocsGroup = {
  links: DocsGroupLink[];
  title: string;
};

export const easeSmooth = [0.22, 1, 0.36, 1] as const;

export const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.04, duration: 0.48, ease: easeSmooth },
    y: 0
  })
};

export function getSectionBody(section: MdxDocsSection, syntax: SyntaxCopy) {
  const bodies = {
    example: syntax.exampleBody,
    motion: syntax.motionBody,
    mcp: syntax.mcpBody,
    overview: syntax.overviewBody,
    patterns: syntax.patternsBody,
    props: syntax.propsBody
  } satisfies Record<MdxDocsSection, string>;

  return bodies[section];
}

export function buildDocSections(syntax: SyntaxCopy) {
  return [
    { href: "/resources/mdx", icon: BookOpen, id: "overview", label: syntax.overviewTitle },
    { href: "/resources/mdx/example", icon: FileCode2, id: "example", label: syntax.fullExampleTitle },
    { href: "/resources/mdx/patterns", icon: Code2, id: "patterns", label: syntax.patternsTitle },
    { href: "/resources/mdx/props", icon: SlidersHorizontal, id: "props", label: syntax.propsTitle },
    { href: "/resources/mdx/motion", icon: Sparkles, id: "motion", label: syntax.motionTitle },
    { href: "/resources/mdx/mcp", icon: Terminal, id: "mcp", label: syntax.mcpTitle }
  ] satisfies DocsSectionLink[];
}

export function buildDocsGroups(
  syntax: SyntaxCopy,
  docSections: readonly DocsSectionLink[],
  section: MdxDocsSection
) {
  return [
    {
      links: [{ ...docSections[0], active: section === "overview" }],
      title: syntax.sideNavGroups.start
    },
    {
      links: [
        { ...docSections[1], active: section === "example" },
        { ...docSections[2], active: section === "patterns" }
      ],
      title: syntax.sideNavGroups.syntax
    },
    {
      links: [
        { ...docSections[3], active: section === "props" },
        { ...docSections[4], active: section === "motion" },
        { ...docSections[5], active: section === "mcp" },
        { active: false, href: "/studio", icon: MonitorPlay, label: syntax.studioLinkLabel }
      ],
      title: syntax.sideNavGroups.reference
    }
  ] satisfies DocsGroup[];
}
