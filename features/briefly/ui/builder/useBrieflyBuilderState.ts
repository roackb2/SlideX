import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/common/lib/I18nProvider";
import { generateHtml, generateMdx, getExportBaseName } from "@/features/briefly/application/briefExport";
import { parseMdx } from "@/features/briefly/application/briefParser";
import { getOrderedSections } from "@/features/briefly/application/briefSelectors";
import {
  createBriefSection,
  createDefaultProjectBrief,
  type LayoutSettings,
  type ProjectBrief,
  type SectionData,
  type SectionType,
  type StyleSettings
} from "@/features/briefly/domain/briefTypes";
import {
  readAppearanceMode,
  saveAppearanceMode,
  watchSystemAppearance,
  type AppearanceMode,
  type ResolvedAppearance
} from "@/features/briefly/infrastructure/builderAppearance";
import { downloadTextFile } from "@/features/briefly/infrastructure/browserExport";
import { getBrieflyCopy } from "@/features/briefly/ui/brieflyCopy";
import { getDesktopGridClass } from "@/features/briefly/ui/builder/layout";
import type { ExportKind, LeftTool, MobileTab, PreviewMode } from "@/features/briefly/ui/builder/types";

function createInitialBrief() {
  const defaultBrief = createDefaultProjectBrief();
  defaultBrief.style_settings.theme_gradient = "linear-gradient( 135deg, #FEC163 10%, #DE4313 100%)";
  return defaultBrief;
}

function withUpdatedTimestamp(brief: ProjectBrief): ProjectBrief {
  return {
    ...brief,
    updated_at: new Date().toISOString()
  };
}

function blurActiveEditor() {
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
}

export function useBrieflyBuilderState() {
  const { locale } = useI18n();
  const [brief, setBrief] = useState<ProjectBrief>(() => createInitialBrief());
  const [activeSectionId, setActiveSectionId] = useState("");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("preview");
  const [leftTool, setLeftTool] = useState<LeftTool>("blocks");
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("preview");
  const [exportOpen, setExportOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [customMdx, setCustomMdx] = useState<string | null>(null);
  const [appearanceMode, setAppearanceModeState] = useState<AppearanceMode>("system");
  const [systemAppearance, setSystemAppearance] = useState<ResolvedAppearance>("dark");

  const orderedSections = useMemo(() => getOrderedSections(brief), [brief]);
  const selectedSection = useMemo(
    () => orderedSections.find((section) => section.id === activeSectionId),
    [activeSectionId, orderedSections]
  );
  const selectedSectionId = selectedSection?.id ?? "";
  const inspectorVisible = inspectorOpen && Boolean(selectedSection);
  const desktopGridClass = useMemo(
    () => getDesktopGridClass(leftDrawerOpen, inspectorVisible),
    [inspectorVisible, leftDrawerOpen]
  );
  const shouldRenderMdx = previewMode === "mdx" || mobileTab === "export";
  const generatedMdx = useMemo(
    () => (shouldRenderMdx ? generateMdx(brief, locale) : ""),
    [brief, locale, shouldRenderMdx]
  );
  const mdx = customMdx ?? generatedMdx;
  const exportBrief = useMemo(
    () => (customMdx === null ? brief : parseMdx(customMdx, brief)),
    [brief, customMdx]
  );
  const exportBaseName = useMemo(() => getExportBaseName(exportBrief), [exportBrief]);
  const exportMdx = useMemo(() => {
    return generateMdx(exportBrief, locale);
  }, [exportBrief, locale]);
  const resolvedAppearance = appearanceMode === "system" ? systemAppearance : appearanceMode;
  const toastCopy = getBrieflyCopy(locale).builder.toasts;

  useEffect(() => {
    setAppearanceModeState(readAppearanceMode());
    return watchSystemAppearance(setSystemAppearance);
  }, []);

  useEffect(() => {
    if (customMdx === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setBrief((current) => ({
        ...parseMdx(customMdx, current),
        updated_at: new Date().toISOString()
      }));
    }, 500);

    return () => window.clearTimeout(timer);
  }, [customMdx]);

  const updateBrief = useCallback((updater: (current: ProjectBrief) => ProjectBrief) => {
    setBrief((current) => ({
      ...updater(current),
      updated_at: new Date().toISOString()
    }));
  }, []);

  const setAppearanceMode = useCallback((mode: AppearanceMode) => {
    setAppearanceModeState(mode);
    saveAppearanceMode(mode);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }, []);

  const updateDocumentName = useCallback(
    (documentName: string) => {
      updateBrief((current) => ({
        ...current,
        document_name: documentName
      }));
    },
    [updateBrief]
  );

  const updateSectionData = useCallback(
    (sectionId: string, patch: SectionData) => {
      updateBrief((current) => ({
        ...current,
        sections: current.sections.map((section) =>
          section.id === sectionId
            ? { ...section, data: { ...section.data, ...patch } }
            : section
        )
      }));
    },
    [updateBrief]
  );

  const updateSectionLayout = useCallback(
    (sectionId: string, layout: import("@/features/briefly/domain/briefTypes").SectionLayout) => {
      updateBrief((current) => ({
        ...current,
        sections: current.sections.map((section) =>
          section.id === sectionId
            ? { ...section, layout }
            : section
        )
      }));
    },
    [updateBrief]
  );

  const updateLayoutSetting = useCallback(
    <Key extends keyof LayoutSettings>(key: Key, value: LayoutSettings[Key]) => {
      updateBrief((current) => ({
        ...current,
        layout_settings: { ...current.layout_settings, [key]: value }
      }));
    },
    [updateBrief]
  );

  const updateStyleSetting = useCallback(
    <Key extends keyof StyleSettings>(key: Key, value: StyleSettings[Key]) => {
      updateBrief((current) => ({
        ...current,
        style_settings: { ...current.style_settings, [key]: value }
      }));
    },
    [updateBrief]
  );

  const moveSectionToIndex = useCallback(
    (sectionId: string, targetIndex: number) => {
      const currentIndex = orderedSections.findIndex((section) => section.id === sectionId);

      if (currentIndex < 0) {
        return;
      }

      const next = [...orderedSections];
      const [section] = next.splice(currentIndex, 1);
      const insertAt = Math.min(Math.max(targetIndex, 0), next.length);
      next.splice(insertAt, 0, section);
      const orderMap = new Map(next.map((item, index) => [item.id, index + 1]));

      updateBrief((current) => ({
        ...current,
        sections: current.sections.map((item) => ({
          ...item,
          order: orderMap.get(item.id) ?? item.order
        }))
      }));
    },
    [orderedSections, updateBrief]
  );

  const selectSection = useCallback((sectionId: string) => {
    setExportOpen(false);
    setActiveSectionId(sectionId);

    if (sectionId) {
      setInspectorOpen(true);
      setMobileTab("settings");
      return;
    }

    setInspectorOpen(false);
    setMobileTab("preview");
  }, []);

  const addSection = useCallback(
    (type: SectionType, targetIndex?: number) => {
      setExportOpen(false);
      const existing = brief.sections.find((section) => section.type === type);

      if (existing) {
        if (typeof targetIndex === "number") {
          moveSectionToIndex(existing.id, targetIndex);
          setActiveSectionId(existing.id);
          setInspectorOpen(true);
          return;
        }

        selectSection(existing.id);
        setMobileTab("preview");
        return;
      }

      const section = createBriefSection(type, orderedSections.length + 1);
      const insertAt =
        typeof targetIndex === "number"
          ? Math.min(Math.max(targetIndex, 0), orderedSections.length)
          : orderedSections.length;
      const next = [...orderedSections];
      next.splice(insertAt, 0, section);
      const orderMap = new Map(next.map((item, index) => [item.id, index + 1]));

      updateBrief((current) => ({
        ...current,
        sections: [...current.sections, section].map((item) => ({
          ...item,
          order: orderMap.get(item.id) ?? item.order
        }))
      }));
      setActiveSectionId(section.id);
      setInspectorOpen(true);
      setLeftTool("outline");
      setMobileTab("preview");
    },
    [brief.sections, moveSectionToIndex, orderedSections, selectSection, updateBrief]
  );

  const moveSection = useCallback(
    (sectionId: string, direction: -1 | 1) => {
      const currentIndex = orderedSections.findIndex((section) => section.id === sectionId);
      const targetIndex = currentIndex + direction;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedSections.length) {
        return;
      }

      moveSectionToIndex(sectionId, targetIndex);
    },
    [moveSectionToIndex, orderedSections]
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      const target = brief.sections.find((section) => section.id === sectionId);

      if (!target) {
        return;
      }

      const nextSections = orderedSections.filter((section) => section.id !== sectionId);
      const orderMap = new Map(nextSections.map((section, index) => [section.id, index + 1]));
      updateBrief((current) => ({
        ...current,
        sections: current.sections
          .filter((section) => section.id !== sectionId)
          .map((section) => ({
            ...section,
            order: orderMap.get(section.id) ?? section.order
          }))
      }));
      setActiveSectionId(nextSections[0]?.id ?? "");
      setInspectorOpen(false);
    },
    [brief.sections, orderedSections, updateBrief]
  );

  const openLeftTool = useCallback(
    (tool: LeftTool) => {
      setExportOpen(false);

      if (leftTool === tool && leftDrawerOpen) {
        setLeftDrawerOpen(false);
        return;
      }

      setLeftTool(tool);
      setLeftDrawerOpen(true);
    },
    [leftDrawerOpen, leftTool]
  );

  const changePreviewMode = useCallback(
    (mode: PreviewMode) => {
      if (mode === "preview" && customMdx !== null) {
        updateBrief((current) => parseMdx(customMdx, current));
        setCustomMdx(null);
      }

      setPreviewMode(mode);
    },
    [customMdx, updateBrief]
  );

  const handleExport = useCallback(
    (kind: ExportKind) => {
      setExportOpen(false);
      const exportMdx = customMdx ?? generateMdx(exportBrief);

      if (kind === "mdx") {
        downloadTextFile(`${exportBaseName}.mdx`, exportMdx, "text/mdx;charset=utf-8");
        showToast(toastCopy.exportedMdx);
        return;
      }

      if (kind === "html") {
        downloadTextFile(`${exportBaseName}.html`, generateHtml(exportBrief, locale), "text/html;charset=utf-8");
        showToast(toastCopy.exportedHtml);
        return;
      }

      if (kind === "pdf") {
        blurActiveEditor();

        if (customMdx !== null) {
          setBrief(withUpdatedTimestamp(exportBrief));
          setCustomMdx(null);
        }

        showToast(toastCopy.preparingPdf);

        // Generate a standalone white-background HTML document
        const html = generateHtml(exportBrief, locale);
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          showToast("Please allow popups to export PDF.");
          return;
        }

        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for fonts and images to load, then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.document.title = exportBaseName;
            printWindow.print();
          }, 400);
        };

        return;
      }

      void navigator.clipboard
        .writeText(exportMdx)
        .then(() => showToast(toastCopy.copiedMdx))
        .catch(() => showToast(toastCopy.copyFailed));
    },
    [customMdx, exportBaseName, exportBrief, showToast, toastCopy]
  );

  return {
    brief,
    orderedSections,
    selectedSection,
    selectedSectionId,
    desktopGridClass,
    inspectorVisible,
    previewMode,
    leftTool,
    leftDrawerOpen,
    mobileTab,
    exportOpen,
    jsonOpen,
    toast,
    mdx,
    appearanceMode,
    resolvedAppearance,
    actions: {
      addSection,
      changePreviewMode,
      closeInspector: () => setInspectorOpen(false),
      closeLeftDrawer: () => setLeftDrawerOpen(false),
      deleteSection,
      handleExport,
      moveSection,
      moveSectionToIndex,
      openLeftTool,
      selectSection,
      setAppearanceMode,
      setCustomMdx,
      setMobileTab,
      toggleExport: () => setExportOpen((open) => !open),
      toggleJson: () => setJsonOpen((open) => !open),
      toggleLeftDrawer: () => setLeftDrawerOpen((open) => !open),
      updateDocumentName,
      updateLayoutSetting,
      updateSectionData,
      updateSectionLayout,
      updateStyleSetting
    }
  };
}
