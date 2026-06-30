import { BookOpen, Code2, FileCode2, MonitorPlay, SlidersHorizontal, Sparkles, Terminal, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/common/lib/i18n";

export type MdxDocsSection = "overview" | "example" | "patterns" | "props" | "motion" | "mcp" | "briefly-overview" | "briefly-builder" | "briefly-blocks";
export type SyntaxCopy = Dictionary["resourcesPage"]["syntax"];
export type BrieflyDocsCopy = Dictionary["resourcesPage"]["brieflyDocs"];

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

export function getSectionBody(section: MdxDocsSection, syntax: SyntaxCopy, brieflyDocs?: BrieflyDocsCopy) {
  const bodies: Record<MdxDocsSection, string> = {
    example: syntax.exampleBody,
    motion: syntax.motionBody,
    mcp: syntax.mcpBody,
    overview: syntax.overviewBody,
    patterns: syntax.patternsBody,
    props: syntax.propsBody,
    "briefly-overview": brieflyDocs?.overviewBody ?? "Create structured project briefs and align your presentations.",
    "briefly-builder": brieflyDocs?.builderBody ?? "Use the interactive builder to define project scope and generate documents.",
    "briefly-blocks": brieflyDocs?.blocksBody ?? "Reference guide for all Briefly block types and their MDX structures."
  };

  return bodies[section];
}

export function buildDocSections(syntax: SyntaxCopy, brieflyDocs: BrieflyDocsCopy) {
  return [
    { href: "/docs/introduction", icon: BookOpen, id: "overview", label: syntax.overviewTitle },
    { href: "/docs/example", icon: FileCode2, id: "example", label: syntax.fullExampleTitle },
    { href: "/docs/patterns", icon: Code2, id: "patterns", label: syntax.patternsTitle },
    { href: "/docs/props", icon: SlidersHorizontal, id: "props", label: syntax.propsTitle },
    { href: "/docs/motion", icon: Sparkles, id: "motion", label: syntax.motionTitle },
    { href: "/docs/mcp", icon: Terminal, id: "mcp", label: syntax.mcpTitle },
    { href: "/docs/briefly", icon: BookOpen, id: "briefly-overview", label: brieflyDocs.overviewTitle },
    { href: "/docs/briefly/builder", icon: FileCode2, id: "briefly-builder", label: brieflyDocs.builderTitle },
    { href: "/docs/briefly/blocks", icon: Code2, id: "briefly-blocks", label: brieflyDocs.blocksTitle }
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
        { active: false, href: "/pitch", icon: MonitorPlay, label: syntax.pitchLinkLabel }
      ],
      title: syntax.sideNavGroups.reference
    },
    {
      links: [
        { ...docSections[6], active: section === "briefly-overview" },
        { ...docSections[7], active: section === "briefly-builder" },
        { ...docSections[8], active: section === "briefly-blocks" }
      ],
      title: syntax.sideNavGroups.briefly
    }
  ] satisfies DocsGroup[];
}
