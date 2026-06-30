import Link from "next/link";
import {
  Braces,
  ChevronDown,
  Copy,
  Eye,
  FileCode2,
  FileText,
  FileType2,
  PanelLeft
} from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import type { ResolvedAppearance } from "@/features/briefly/infrastructure/builderAppearance";
import { getBrieflyCopy } from "@/features/briefly/application/brieflyCopy";
import type { ExportKind, PreviewMode } from "@/features/briefly/ui/builder/types";
import { SegmentButton } from "@/features/briefly/ui/builder/BuilderShared";

interface BuilderTopBarProps {
  documentName: string;
  exportOpen: boolean;
  leftDrawerOpen: boolean;
  previewMode: PreviewMode;
  appearance: ResolvedAppearance;
  onDocumentNameChange: (value: string) => void;
  onToggleDrawer: () => void;
  onToggleExport: () => void;
  onExport: (kind: ExportKind) => void;
  onPreviewModeChange: (mode: PreviewMode) => void;
}

export function BuilderTopBar({
  documentName,
  exportOpen,
  leftDrawerOpen,
  previewMode,
  appearance,
  onDocumentNameChange,
  onToggleDrawer,
  onToggleExport,
  onExport,
  onPreviewModeChange
}: BuilderTopBarProps) {
  const { locale, localePath } = useI18n();
  const copy = getBrieflyCopy(locale).builder;
  const sidebarLabel = leftDrawerOpen ? copy.topBar.hideSidebar : copy.topBar.showSidebar;
  const logoSrc = appearance === "dark" ? "/logo.png" : "/logo-black-slide.png";

  return (
    <header className="briefly-chrome sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#000000] px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          aria-label={sidebarLabel}
          title={sidebarLabel}
          onClick={onToggleDrawer}
          className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 lg:flex ${
            leftDrawerOpen
              ? "border-white/20 bg-white/10 text-white"
              : "border-transparent bg-transparent text-white/60 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <Link href={localePath("/")} className="block hover:opacity-80 transition-opacity">
          <img src={logoSrc} alt="SlideX Logo" className="h-auto w-[70px] object-contain sm:w-[85px]" />
        </Link>
        <div className="hidden h-5 w-px shrink-0 bg-white/10 sm:block" />
        <input
          value={documentName}
          onChange={(event) => onDocumentNameChange(event.target.value)}
          aria-label={copy.topBar.projectName}
          className="w-[180px] rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-sm font-medium text-white/90 outline-none transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] focus:border-white/20 focus:bg-white/[0.06] sm:w-[240px]"
        />
        <div className="ml-1 hidden rounded-lg border border-white/10 bg-white/[0.02] p-1 sm:inline-flex">
          <SegmentButton
            active={previewMode === "preview"}
            onClick={() => onPreviewModeChange("preview")}
            icon={<Eye className="h-3.5 w-3.5" />}
          >
            {copy.topBar.preview}
          </SegmentButton>
          <SegmentButton
            active={previewMode === "mdx"}
            onClick={() => onPreviewModeChange("mdx")}
            icon={<Braces className="h-3.5 w-3.5" />}
          >
            MDX
          </SegmentButton>
        </div>

      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={onToggleExport}
            className="group inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition-all duration-300 hover:bg-[#e0e0e0] active:scale-[0.98]"
          >
            {copy.topBar.export}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${exportOpen ? "rotate-180" : ""}`} />
          </button>
          {exportOpen ? <ExportDropdown onExport={onExport} /> : null}
        </div>
      </div>
    </header>
  );
}

function ExportDropdown({
  onExport
}: {
  onExport: (kind: ExportKind) => void;
}) {
  const { locale } = useI18n();
  const actions = getBrieflyCopy(locale).builder.exportActions;
  const items = [
    { label: actions.mdx, kind: "mdx" as const, icon: FileCode2 },
    { label: actions.html, kind: "html" as const, icon: FileText },
    { label: actions.pdf, kind: "pdf" as const, icon: FileType2 },
    { label: actions.copy, kind: "copy" as const, icon: Copy }
  ];

  return (
    <div className="absolute right-0 top-12 z-40 w-56 rounded-xl border border-white/10 bg-[#0a0a0a] p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
      {items.map(({ label, kind, icon: Icon }) => (
        <button
          key={kind}
          type="button"
          onClick={() => onExport(kind)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
        >
          <Icon className="h-4 w-4 text-white/60" />
          {label}
        </button>
      ))}
    </div>
  );
}
