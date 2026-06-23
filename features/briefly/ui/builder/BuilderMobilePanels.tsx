import {
  Blocks,
  Copy,
  Download,
  Eye,
  FileCode2,
  FileText,
  FileType2,
  PanelRight,
  Settings
} from "lucide-react";
import type { Locale } from "@/common/lib/i18n";
import { useI18n } from "@/common/lib/I18nProvider";
import { getBrieflyCopy } from "@/features/briefly/ui/brieflyCopy";
import { ExportAction, PanelHeader } from "@/features/briefly/ui/builder/BuilderShared";
import type { ExportKind, MobileTab } from "@/features/briefly/ui/builder/types";

export function MobileTabs({
  active,
  locale,
  onChange
}: {
  active: MobileTab;
  locale: Locale;
  onChange: (tab: MobileTab) => void;
}) {
  const labels = getBrieflyCopy(locale).builder.mobile;
  const tabs = [
    { id: "blocks" as const, icon: Blocks },
    { id: "preview" as const, icon: Eye },
    { id: "settings" as const, icon: Settings },
    { id: "export" as const, icon: Download }
  ];

  return (
    <nav className="briefly-chrome sticky top-14 z-20 grid grid-cols-4 border-b border-white/[0.08] bg-[#050505]">
      {tabs.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all duration-300 ${
            active === id ? "bg-blue-500/10 text-blue-400" : "bg-transparent text-white/60 hover:text-white/60"
          }`}
        >
          <Icon className="h-4 w-4" />
          {labels[id]}
        </button>
      ))}
    </nav>
  );
}

export function MobileExportPanel({
  onExport,
  mdx
}: {
  onExport: (kind: ExportKind) => void;
  mdx: string;
}) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).builder;

  return (
    <section className="briefly-chrome min-h-[calc(100dvh-112px)] bg-[#000000] p-4 text-[#e8e8e8]">
      <div className="grid gap-6">
        <PanelHeader
          icon={<Download className="h-4 w-4" />}
          title={copy.mobile.export}
          body={copy.exportPanelBody}
        />
        <div className="grid gap-2">
          <ExportAction label={copy.exportActions.mdx} icon={<FileCode2 className="h-4 w-4" />} onClick={() => onExport("mdx")} />
          <ExportAction label={copy.exportActions.html} icon={<FileText className="h-4 w-4" />} onClick={() => onExport("html")} />
          <ExportAction label={copy.exportActions.pdf} icon={<FileType2 className="h-4 w-4" />} onClick={() => onExport("pdf")} />
          <ExportAction label={copy.exportActions.copy} icon={<Copy className="h-4 w-4" />} onClick={() => onExport("copy")} />
        </div>
        <pre className="max-h-[420px] overflow-auto rounded-xl border border-white/[0.08] bg-[#050505] p-4 font-mono text-[11px] leading-5 text-white/60">
          {mdx}
        </pre>
      </div>
    </section>
  );
}

export function MobileEmptyInspector() {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).builder.mobile;

  return (
    <section className="briefly-chrome min-h-[calc(100dvh-112px)] bg-[#000000] p-4 text-[#e8e8e8]">
      <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0a] p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white">
          <PanelRight className="h-4 w-4" />
        </span>
        <h2 className="mt-4 text-base font-medium text-white/90">{copy.emptyTitle}</h2>
        <p className="mt-2 text-xs leading-5 text-white/60">{copy.emptyBody}</p>
      </div>
    </section>
  );
}
