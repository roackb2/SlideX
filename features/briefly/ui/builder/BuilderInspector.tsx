import { X } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import {
  getBlockDefinition,
  isCoreSectionType,
  type BriefSection,
  type SectionData,
  type SectionLayout
} from "@/features/briefly/domain/briefTypes";
import { getBrieflyCopy, getSectionCopy } from "@/features/briefly/application/brieflyCopy";
import { SectionEditor } from "@/features/briefly/ui/SectionEditor";

interface SectionInspectorPanelProps {
  section: BriefSection;
  mobile?: boolean;
  onChangeSectionData: (sectionId: string, patch: SectionData) => void;
  onChangeSectionLayout: (sectionId: string, layout: SectionLayout) => void;
  onClose: () => void;
}

function toSectionLayout(value: string): SectionLayout {
  switch (value) {
    case "half-left":
    case "half-right":
      return value;
    default:
      return "full";
  }
}

export function SectionInspectorPanel({
  section,
  mobile = false,
  onChangeSectionData,
  onChangeSectionLayout,
  onClose
}: SectionInspectorPanelProps) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).builder.inspector;
  const definition = getBlockDefinition(section.type);
  const isCore = definition?.core ?? isCoreSectionType(section.type);
  const sectionCopy = getSectionCopy(section.type, locale);

  return (
    <aside
      className={`briefly-chrome border-l border-white/[0.08] bg-[#050505] ${
        mobile ? "min-h-[calc(100dvh-112px)]" : "min-h-0 overflow-y-auto"
      }`}
    >
      <div className="sticky top-0 z-10 flex min-h-12 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#050505] px-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-wider text-white/50">{copy.properties}</p>
          <h2 className="truncate text-sm font-medium text-white/90">{sectionCopy.title}</h2>
        </div>
        <button
          type="button"
          aria-label={copy.close}
          title={copy.close}
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/50 transition hover:border-white/20 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid gap-6 p-5">
        <div className="grid gap-3 rounded-xl border border-white/10 bg-[#0a0a0a] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">{copy.selectedBlock}</p>
              <h3 className="mt-1 truncate text-base font-semibold text-white/90">{sectionCopy.title}</h3>
            </div>
            <span
              className={`rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
                isCore ? "bg-white/10 text-white/80" : "bg-white/[0.04] text-white/60"
              }`}
            >
              {isCore ? copy.core : copy.optional}
            </span>
          </div>
          {sectionCopy.description ? (
            <p className="text-[11px] leading-5 text-white/60">{sectionCopy.description}</p>
          ) : null}
        </div>

        <div className="grid gap-2 border-b border-white/[0.08] pb-6">
          <label className="px-1 text-[11px] font-medium tracking-wider text-white/60">{copy.layoutLabel}</label>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0a0a0a] p-1">
            <select
              value={section.layout || "full"}
              onChange={(e) => onChangeSectionLayout(section.id, toSectionLayout(e.target.value))}
              className="w-full bg-transparent px-2 py-1 text-xs text-white/90 outline-none"
            >
              <option value="full">{copy.layoutFull}</option>
              <option value="half-left">{copy.layoutHalfLeft}</option>
              <option value="half-right">{copy.layoutHalfRight}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-white/[0.08] pb-6">
          <div className="grid gap-2">
            <label className="px-1 text-[11px] font-medium tracking-wider text-white/60">{copy.blockBackground}</label>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0a0a0a] p-1">
              <input
                type="color"
                value={(section.data.bg_color as string) || "#ffffff"}
                onChange={(event) => onChangeSectionData(section.id, { bg_color: event.target.value })}
                className="h-7 w-7 cursor-pointer rounded bg-transparent"
              />
              <input
                type="text"
                placeholder="#HEX"
                value={(section.data.bg_color as string) || ""}
                onChange={(event) => onChangeSectionData(section.id, { bg_color: event.target.value })}
                className="w-full bg-transparent px-2 text-xs text-white/90 outline-none placeholder:text-white/30"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="px-1 text-[11px] font-medium tracking-wider text-white/60">{copy.textColor}</label>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0a0a0a] p-1">
              <input
                type="color"
                value={(section.data.text_color as string) || "#000000"}
                onChange={(event) => onChangeSectionData(section.id, { text_color: event.target.value })}
                className="h-7 w-7 cursor-pointer rounded bg-transparent"
              />
              <input
                type="text"
                placeholder="#HEX"
                value={(section.data.text_color as string) || ""}
                onChange={(event) => onChangeSectionData(section.id, { text_color: event.target.value })}
                className="w-full bg-transparent px-2 text-xs text-white/90 outline-none placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        <SectionEditor
          section={section}
          mode="inspector"
          onChangeData={(patch) => onChangeSectionData(section.id, patch)}
        />
      </div>
    </aside>
  );
}
