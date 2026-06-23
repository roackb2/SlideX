import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import type {
  BriefSection,
  LayoutSettings,
  ProjectBrief,
  SectionData,
  SectionType
} from "@/features/briefly/domain/briefTypes";
import type { ResolvedAppearance } from "@/features/briefly/infrastructure/builderAppearance";
import { DocumentPreview } from "@/features/briefly/ui/DocumentPreview";
import { BRIEFLY_SECTION_TYPE_MIME, type PreviewMode } from "@/features/briefly/ui/builder/types";

interface BuilderCanvasProps {
  brief: ProjectBrief;
  orderedSections: BriefSection[];
  activeSectionId: string;
  previewMode: PreviewMode;
  appearance: ResolvedAppearance;
  mdx: string;
  onMdxChange: (value: string) => void;
  onAddSectionAt: (type: SectionType, targetIndex?: number) => void;
  onMoveSectionToIndex: (sectionId: string, targetIndex: number) => void;
  onMoveSection: (sectionId: string, direction: -1 | 1) => void;
  onDeleteSection: (sectionId: string) => void;
  onSelectSection: (sectionId: string) => void;
  onUpdateSectionData: (sectionId: string, patch: SectionData) => void;
  onUpdateLayoutSetting: <Key extends keyof LayoutSettings>(key: Key, value: LayoutSettings[Key]) => void;
}

export function BuilderCanvas({
  brief,
  orderedSections,
  activeSectionId,
  previewMode,
  appearance,
  mdx,
  onMdxChange,
  onAddSectionAt,
  onMoveSectionToIndex,
  onMoveSection,
  onDeleteSection,
  onSelectSection,
  onUpdateSectionData,
  onUpdateLayoutSetting
}: BuilderCanvasProps) {
  return (
    <section className="briefly-main min-h-[calc(100dvh-112px)] bg-[#000000] lg:min-h-0 lg:overflow-y-auto">
      {previewMode === "preview" ? (
        <div
          className="briefly-print-wrap min-h-full cursor-default px-4 py-8 sm:px-6 lg:px-12 lg:py-16"
          onClick={() => onSelectSection("")}
        >
          <DocumentPreview
            brief={brief}
            sections={orderedSections}
            activeSectionId={activeSectionId}
            sectionTypeMime={BRIEFLY_SECTION_TYPE_MIME}
            onAddSectionAt={onAddSectionAt}
            onMoveSectionToIndex={onMoveSectionToIndex}
            onMoveSection={onMoveSection}
            onDeleteSection={onDeleteSection}
            onSelectSection={onSelectSection}
            onUpdateSectionData={onUpdateSectionData}
            onUpdateLayoutSetting={onUpdateLayoutSetting}
          />
        </div>
      ) : (
        <div className="px-4 py-8 sm:px-6 lg:px-12 lg:py-16">
          <div className="briefly-code-editor mx-auto min-h-[640px] max-w-[1040px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#050505]">
            <CodeMirror
              value={mdx}
              extensions={[markdown()]}
              theme={appearance === "dark" ? "dark" : "light"}
              onChange={onMdxChange}
              className="text-[14px] leading-7 [&_.cm-gutters]:border-r-white/[0.05] [&_.cm-gutters]:bg-[#050505] [&_.cm-gutters]:text-white/30 [&_.cm-scroller]:p-4"
            />
          </div>
        </div>
      )}
    </section>
  );
}
