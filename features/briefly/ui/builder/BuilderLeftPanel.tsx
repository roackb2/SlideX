import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart,
  Blocks,
  Calendar,
  Check,
  ChevronDown,
  FileText,
  Folder,
  HelpCircle,
  Image as ImageIcon,
  LineChart,
  Link,
  ListOrdered,
  Mail,
  Package,
  Palette,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Target,
  Trash2,
  Upload,
  Users,
  X
} from "lucide-react";
import type { Locale } from "@/common/lib/i18n";
import {
  BLOCK_DEFINITIONS,
  getBlockDefinition,
  isCoreSectionType,
  type BriefSection,
  type ProjectBrief,
  type SectionGroup,
  type SectionType,
  type StyleSettings
} from "@/features/briefly/domain/briefTypes";
import type { AppearanceMode } from "@/features/briefly/infrastructure/builderAppearance";
import { IMAGE_UPLOAD_PRESETS, processImageFile } from "@/features/briefly/infrastructure/imageUpload";
import { getBrieflyCopy, getSectionCopy, getSectionGroupLabel } from "@/features/briefly/application/brieflyCopy";
import { BuilderPreferencesPanel } from "@/features/briefly/ui/builder/BuilderPreferencesPanel";
import { getLeftToolLabel, getLeftToolTitle } from "@/features/briefly/ui/builder/layout";
import { IconButton } from "@/features/briefly/ui/builder/BuilderShared";
import { BRIEFLY_SECTION_TYPE_MIME, type LeftTool } from "@/features/briefly/ui/builder/types";

interface LeftRailProps {
  activeTool: LeftTool;
  drawerOpen: boolean;
  locale: Locale;
  onSelectTool: (tool: LeftTool) => void;
}

interface LeftDrawerProps {
  tool: LeftTool;
  brief: ProjectBrief;
  orderedSections: BriefSection[];
  activeSectionId: string;
  appearanceMode: AppearanceMode;
  jsonOpen: boolean;
  locale: Locale;
  mobile?: boolean;
  onAddSection: (type: SectionType) => void;
  onAppearanceModeChange: (mode: AppearanceMode) => void;
  onLocaleChange: (locale: Locale) => void;
  onSelectSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: -1 | 1) => void;
  onDeleteSection: (sectionId: string) => void;
  onStyleChange: <Key extends keyof StyleSettings>(key: Key, value: StyleSettings[Key]) => void;
  onToggleJson: () => void;
  onClose: () => void;
}

export function LeftRail({ activeTool, drawerOpen, locale, onSelectTool }: LeftRailProps) {
  const tools = [
    { id: "blocks" as const, icon: Blocks },
    { id: "outline" as const, icon: ListOrdered },
    { id: "design" as const, icon: Palette }
  ];
  const settingsActive = drawerOpen && activeTool === "settings";
  const settingsLabel = getLeftToolLabel("settings", locale);

  return (
    <nav className="briefly-chrome grid min-h-0 grid-rows-[1fr_auto] border-r border-white/[0.08] bg-[#050505] p-2">
      <div className="grid content-start gap-1.5">
        {tools.map(({ id, icon: Icon }) => {
          const active = drawerOpen && activeTool === id;
          const label = getLeftToolLabel(id, locale);

          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              onClick={() => onSelectTool(id)}
              className={`group flex h-11 w-11 items-center justify-center rounded-lg border transition-all duration-300 ${
                active
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
                  : "border-transparent bg-transparent text-white/60 hover:bg-white/[0.06] hover:text-white/80"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label={settingsLabel}
        title={settingsLabel}
        onClick={() => onSelectTool("settings")}
        className={`group flex h-11 w-11 items-center justify-center rounded-lg border transition-all duration-300 ${
          settingsActive
            ? "border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
            : "border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/80"
        }`}
      >
        <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>
    </nav>
  );
}

export function LeftDrawer({
  tool,
  brief,
  orderedSections,
  activeSectionId,
  appearanceMode,
  jsonOpen,
  locale,
  mobile = false,
  onAddSection,
  onAppearanceModeChange,
  onLocaleChange,
  onSelectSection,
  onMoveSection,
  onDeleteSection,
  onStyleChange,
  onToggleJson,
  onClose
}: LeftDrawerProps) {
  const closeLabel = getBrieflyCopy(locale).builder.left.close;

  return (
    <aside
      className={`briefly-chrome border-r border-white/[0.08] bg-[#050505] ${
        mobile ? "min-h-[calc(100dvh-112px)]" : "min-h-0 overflow-y-auto"
      }`}
    >
      <div className="sticky top-0 z-10 flex min-h-12 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#050505] px-4">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium tracking-wide text-white/90">{getLeftToolTitle(tool, locale)}</h2>
        </div>
        <button
          type="button"
          aria-label={closeLabel}
          title={closeLabel}
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/50 transition hover:border-white/20 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-4">
        {tool === "blocks" ? (
          <BlocksDrawer
            brief={brief}
            activeSectionId={activeSectionId}
            locale={locale}
            onAddSection={onAddSection}
            onSelectSection={onSelectSection}
          />
        ) : null}
        {tool === "outline" ? (
          <OutlineDrawer
            orderedSections={orderedSections}
            activeSectionId={activeSectionId}
            locale={locale}
            onSelectSection={onSelectSection}
            onMoveSection={onMoveSection}
            onDeleteSection={onDeleteSection}
          />
        ) : null}
        {tool === "design" ? (
          <DesignDrawer
            brief={brief}
            jsonOpen={jsonOpen}
            locale={locale}
            onToggleJson={onToggleJson}
            onStyleChange={onStyleChange}
          />
        ) : null}
        {tool === "settings" ? (
          <BuilderPreferencesPanel
            appearanceMode={appearanceMode}
            locale={locale}
            onAppearanceModeChange={onAppearanceModeChange}
            onLocaleChange={onLocaleChange}
          />
        ) : null}
      </div>
    </aside>
  );
}

function BlocksDrawer({
  brief,
  activeSectionId,
  locale,
  onAddSection,
  onSelectSection
}: {
  brief: ProjectBrief;
  activeSectionId: string;
  locale: Locale;
  onAddSection: (type: SectionType) => void;
  onSelectSection: (sectionId: string) => void;
}) {
  const copy = getBrieflyCopy(locale).builder.left;
  const groups = useMemo(() => {
    const map = new Map<SectionGroup, typeof BLOCK_DEFINITIONS>();
    BLOCK_DEFINITIONS.forEach((definition) => {
      const list = map.get(definition.group) ?? [];
      list.push(definition);
      map.set(definition.group, list);
    });
    return map;
  }, []);

  return (
    <section className="grid gap-6">
      {Array.from(groups.entries()).map(([group, definitions]) => (
        <div key={group}>
          <p className="mb-3 px-1 text-[11px] font-medium tracking-wider text-white/60">{getSectionGroupLabel(group, locale)}</p>
          <div className="grid grid-cols-2 gap-2">
            {definitions.map((definition) => {
              const section = brief.sections.find((item) => item.type === definition.type);
              const added = Boolean(section);
              const active = section?.id === activeSectionId;
              const sectionCopy = getSectionCopy(definition.type, locale);

              return (
                <div
                  key={definition.type}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "copyMove";
                    event.dataTransfer.setData(BRIEFLY_SECTION_TYPE_MIME, definition.type);
                  }}
                  className="group cursor-pointer"
                >
                  <button
                    type="button"
                    onClick={() => (section ? onSelectSection(section.id) : onAddSection(definition.type))}
                    className={`relative flex w-full flex-col overflow-hidden rounded-xl border transition-all duration-300 ${
                      active
                        ? "border-blue-500/40 bg-blue-500/[0.04] ring-1 ring-blue-500/20"
                        : added
                          ? "border-white/10 bg-white/[0.02] hover:border-white/20"
                          : "border-white/[0.06] hover:border-white/15"
                    }`}
                  >
                    <div className="relative h-20 w-full bg-[#111111] transition-transform duration-500 group-hover:scale-[1.02]">
                      <BlockThumbnailPattern type={definition.type} />
                      {added ? (
                        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <Plus className="h-2.5 w-2.5 text-white" strokeWidth={2} />
                        </span>
                      )}
                    </div>
                    <div className="border-t border-white/[0.04] bg-[#0a0a0a] px-2 py-2">
                      <p className="truncate text-left text-[11px] font-medium text-white/80">{sectionCopy.title}</p>
                      <p className="mt-0.5 truncate text-left text-[10px] text-white/50">
                        {added ? copy.added : copy.add}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function OutlineDrawer({
  orderedSections,
  activeSectionId,
  locale,
  onSelectSection,
  onMoveSection,
  onDeleteSection
}: {
  orderedSections: BriefSection[];
  activeSectionId: string;
  locale: Locale;
  onSelectSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: -1 | 1) => void;
  onDeleteSection: (sectionId: string) => void;
}) {
  const copy = getBrieflyCopy(locale).builder.left;

  return (
    <div className="grid gap-1.5">
      {orderedSections.map((section, index) => {
        const definition = getBlockDefinition(section.type);
        const core = definition?.core ?? isCoreSectionType(section.type);
        const active = section.id === activeSectionId;
        const sectionCopy = getSectionCopy(section.type, locale);

        return (
          <div
            key={section.id}
            className={`grid grid-cols-[1fr_auto] gap-2 rounded-lg border p-2 transition-all duration-300 ${
              active
                ? "border-blue-500/30 bg-blue-500/[0.04] ring-1 ring-blue-500/10"
                : "border-transparent bg-transparent hover:bg-white/[0.03]"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectSection(section.id)}
              className="grid min-w-0 grid-cols-[24px_1fr] items-center gap-2 text-left"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-white/50">
                <Blocks className="h-3 w-3" strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className={`block truncate text-xs font-medium ${active ? "text-blue-100" : "text-white/80"}`}>
                  {sectionCopy.title}
                </span>
                <span className="block text-[10px] text-white/50">{core ? copy.core : copy.optional}</span>
              </span>
            </button>
            <div className="flex items-center gap-1">
              <IconButton label={copy.moveUp} disabled={index === 0} onClick={() => onMoveSection(section.id, -1)}>
                <ArrowUp className="h-3 w-3" />
              </IconButton>
              <IconButton
                label={copy.moveDown}
                disabled={index === orderedSections.length - 1}
                onClick={() => onMoveSection(section.id, 1)}
              >
                <ArrowDown className="h-3 w-3" />
              </IconButton>
              <IconButton label={copy.delete} onClick={() => onDeleteSection(section.id)}>
                <Trash2 className="h-3 w-3" />
              </IconButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DesignDrawer({
  brief,
  jsonOpen,
  locale,
  onToggleJson,
  onStyleChange
}: {
  brief: ProjectBrief;
  jsonOpen: boolean;
  locale: Locale;
  onToggleJson: () => void;
  onStyleChange: <Key extends keyof StyleSettings>(key: Key, value: StyleSettings[Key]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const copy = getBrieflyCopy(locale).builder.left;

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingBackground(true);

    try {
      const image = await processImageFile(file, IMAGE_UPLOAD_PRESETS.background);

      onStyleChange("theme_gradient", "");
      onStyleChange("background_image", image.dataUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingBackground(false);
      event.target.value = "";
    }
  }

  return (
    <div className="grid gap-8">
      <div>
        <p className="mb-3 px-1 text-[11px] font-medium tracking-wider text-white/60">{copy.cardTheme}</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "white", name: copy.minimalWhite },
            { id: "dark", name: copy.darkTech }
          ].map((mode) => {
            const isActive = brief.style_settings.page_background === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onStyleChange("page_background", mode.id as StyleSettings["page_background"])}
                className={`group relative flex items-center justify-between overflow-hidden rounded-xl border px-4 py-3 transition-all duration-300 ${
                  isActive
                    ? "border-blue-500/40 bg-blue-500/[0.04] ring-1 ring-blue-500/20"
                    : "border-white/[0.06] bg-[#0a0a0a] hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full border border-white/20 ${mode.id === "white" ? "bg-white" : "bg-black"}`} />
                  <p className="truncate text-[12px] font-medium text-white/90">{mode.name}</p>
                </div>
                {isActive ? (
                  <span className="flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                    <Check className="h-2 w-2 text-white" strokeWidth={3} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 px-1 text-[11px] font-medium tracking-wider text-white/60">{copy.backgroundColor}</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            "linear-gradient( 135deg, #FEC163 10%, #DE4313 100%)",
            "linear-gradient( 135deg, #F6CEEC 10%, #D939CD 100%)",
            "linear-gradient( 135deg, #79F1A4 10%, #0E5CAD 100%)",
            "linear-gradient( 135deg, #3B2667 10%, #BC78EC 100%)",
            "linear-gradient( 135deg, #667eea 10%, #764ba2 100%)",
            "linear-gradient( 135deg, #FFD3A5 10%, #FD6585 100%)",
            "linear-gradient( 135deg, #00C9FF 10%, #92FE9D 100%)",
            "linear-gradient( 135deg, #81FBB8 10%, #28C76F 100%)"
          ].map((themeGradient, index) => {
            const isActive = brief.style_settings.theme_gradient === themeGradient;
            return (
              <button
                key={themeGradient}
                type="button"
                aria-label={`${copy.applyBackground} ${index + 1}`}
                onClick={() => {
                  onStyleChange("background_image", "");
                  onStyleChange("theme_gradient", themeGradient);
                }}
                className={`group relative aspect-square w-full overflow-hidden rounded-xl border transition-all duration-300 hover:scale-105 ${
                  isActive ? "border-white ring-2 ring-white/50" : "border-white/10 shadow-sm hover:border-white/30"
                }`}
                style={{ background: themeGradient }}
              >
                {isActive ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 px-1 text-[11px] font-medium tracking-wider text-white/60">{copy.backgroundImage}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="sr-only"
        />
        {brief.style_settings.background_image ? (
          <div className="relative overflow-hidden rounded-xl border border-white/10">
            <img
              src={brief.style_settings.background_image}
              alt={copy.backgroundPreview}
              className="aspect-video w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity duration-300 hover:opacity-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
              >
                {copy.replace}
              </button>
              <button
                type="button"
                onClick={() => onStyleChange("background_image", "")}
                className="rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:bg-red-500/40"
              >
                {copy.remove}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-[#0a0a0a] px-4 py-8 transition-all duration-300 hover:border-white/20 hover:bg-[#111111]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/5">
              <Upload className="h-4 w-4 text-white/60 transition group-hover:text-white/80" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-white/50">
                {uploadingBackground ? copy.processingImage : copy.uploadBackground}
              </p>
              <p className="mt-1 text-[10px] text-white/60">{copy.fileTypes}</p>
            </div>
          </button>
        )}
      </div>

      <div className="border-t border-white/[0.08] pt-6">
        <button
          type="button"
          onClick={onToggleJson}
          className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs font-medium text-white/60 transition hover:border-white/15 hover:text-white/80"
        >
          {copy.developerJson}
          <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${jsonOpen ? "rotate-180" : ""}`} />
        </button>
        {jsonOpen ? (
          <pre className="mt-2 max-h-[300px] overflow-auto rounded-lg border border-white/[0.06] bg-[#050505] p-3 font-mono text-[10px] leading-5 text-white/50">
            {JSON.stringify(brief, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

function BlockThumbnailPattern({ type }: { type: string }) {
  const iconClass = "briefly-block-thumbnail-icon h-8 w-8 transition-transform duration-300 group-hover:scale-110";
  const containerClass = "briefly-block-thumbnail flex h-full w-full items-center justify-center rounded-t-xl border";

  switch (type) {
    case "cover":
      return <div className={containerClass}><ImageIcon className={iconClass} strokeWidth={1.5} /></div>;
    case "goal":
      return <div className={containerClass}><Target className={iconClass} strokeWidth={1.5} /></div>;
    case "progress":
      return <div className={containerClass}><BarChart className={iconClass} strokeWidth={1.5} /></div>;
    case "lookingFor":
      return <div className={containerClass}><Search className={iconClass} strokeWidth={1.5} /></div>;
    case "collaboration":
      return <div className={containerClass}><Users className={iconClass} strokeWidth={1.5} /></div>;
    case "contact":
      return <div className={containerClass}><Mail className={iconClass} strokeWidth={1.5} /></div>;
    case "problem":
      return <div className={containerClass}><AlertTriangle className={iconClass} strokeWidth={1.5} /></div>;
    case "timeline":
      return <div className={containerClass}><Calendar className={iconClass} strokeWidth={1.5} /></div>;
    case "deliverables":
      return <div className={containerClass}><Package className={iconClass} strokeWidth={1.5} /></div>;
    case "references":
      return <div className={containerClass}><Link className={iconClass} strokeWidth={1.5} /></div>;
    case "resources":
      return <div className={containerClass}><Folder className={iconClass} strokeWidth={1.5} /></div>;
    case "risks":
      return <div className={containerClass}><ShieldAlert className={iconClass} strokeWidth={1.5} /></div>;
    case "audience":
      return <div className={containerClass}><Users className={iconClass} strokeWidth={1.5} /></div>;
    case "metrics":
      return <div className={containerClass}><LineChart className={iconClass} strokeWidth={1.5} /></div>;
    case "team":
      return <div className={containerClass}><Users className={iconClass} strokeWidth={1.5} /></div>;
    case "faq":
      return <div className={containerClass}><HelpCircle className={iconClass} strokeWidth={1.5} /></div>;
    case "appendix":
      return <div className={containerClass}><FileText className={iconClass} strokeWidth={1.5} /></div>;
    default:
      return <div className={containerClass}><Blocks className={iconClass} strokeWidth={1.5} /></div>;
  }
}
