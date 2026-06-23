"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { BuilderCanvas } from "@/features/briefly/ui/builder/BuilderCanvas";
import { LeftDrawer, LeftRail } from "@/features/briefly/ui/builder/BuilderLeftPanel";
import { BuilderPreferencesPanel } from "@/features/briefly/ui/builder/BuilderPreferencesPanel";
import {
  MobileExportPanel,
  MobileTabs
} from "@/features/briefly/ui/builder/BuilderMobilePanels";
import { SectionInspectorPanel } from "@/features/briefly/ui/builder/BuilderInspector";
import { BuilderTopBar } from "@/features/briefly/ui/builder/BuilderTopBar";
import { brieflyBuilderCss } from "@/features/briefly/ui/builder/styles";
import { useBrieflyBuilderState } from "@/features/briefly/ui/builder/useBrieflyBuilderState";

export function BrieflyBuilder() {
  const { locale, setLocale } = useI18n();
  const {
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
    actions
  } = useBrieflyBuilderState();
  const themeClass =
    resolvedAppearance === "dark"
      ? "briefly-theme-dark bg-[#000000] text-[#e8e8e8]"
      : "briefly-theme-light bg-[#f4f5f7] text-[#161616]";

  const preview = (
    <BuilderCanvas
      brief={brief}
      orderedSections={orderedSections}
      activeSectionId={selectedSectionId}
      previewMode={previewMode}
      appearance={resolvedAppearance}
      mdx={mdx}
      onMdxChange={actions.setCustomMdx}
      onAddSectionAt={actions.addSection}
      onMoveSectionToIndex={actions.moveSectionToIndex}
      onMoveSection={actions.moveSection}
      onDeleteSection={actions.deleteSection}
      onSelectSection={actions.selectSection}
      onUpdateSectionData={actions.updateSectionData}
      onUpdateLayoutSetting={actions.updateLayoutSetting}
    />
  );

  return (
    <main
      lang={locale}
      className={`briefly-app briefly-studio min-h-[100dvh] selection:bg-blue-500/30 selection:text-blue-100 ${themeClass}`}
    >
      <style>{brieflyBuilderCss}</style>
      <BuilderTopBar
        appearance={resolvedAppearance}
        documentName={brief.document_name}
        exportOpen={exportOpen}
        leftDrawerOpen={leftDrawerOpen}
        previewMode={previewMode}
        onDocumentNameChange={actions.updateDocumentName}
        onToggleDrawer={actions.toggleLeftDrawer}
        onToggleExport={actions.toggleExport}
        onExport={actions.handleExport}
        onPreviewModeChange={actions.changePreviewMode}
      />

      <div className={`briefly-shell hidden h-[calc(100dvh-56px)] min-h-0 ${desktopGridClass} lg:grid`}>
        <LeftRail
          activeTool={leftTool}
          drawerOpen={leftDrawerOpen}
          locale={locale}
          onSelectTool={actions.openLeftTool}
        />
        {leftDrawerOpen ? (
          <LeftDrawer
            tool={leftTool}
            brief={brief}
            orderedSections={orderedSections}
            activeSectionId={selectedSectionId}
            appearanceMode={appearanceMode}
            jsonOpen={jsonOpen}
            locale={locale}
            onAddSection={actions.addSection}
            onAppearanceModeChange={actions.setAppearanceMode}
            onLocaleChange={setLocale}
            onSelectSection={actions.selectSection}
            onMoveSection={actions.moveSection}
            onDeleteSection={actions.deleteSection}
            onStyleChange={actions.updateStyleSetting}
            onToggleJson={actions.toggleJson}
            onClose={actions.closeLeftDrawer}
          />
        ) : null}
        {preview}
        {inspectorVisible && selectedSection && previewMode === "preview" ? (
          <SectionInspectorPanel
            section={selectedSection}
            onChangeSectionData={actions.updateSectionData}
            onChangeSectionLayout={actions.updateSectionLayout}
            onClose={actions.closeInspector}
          />
        ) : null}
      </div>

      <div className="lg:hidden">
        <MobileTabs active={mobileTab} locale={locale} onChange={actions.setMobileTab} />
        {mobileTab === "blocks" ? (
          <LeftDrawer
            tool="blocks"
            brief={brief}
            orderedSections={orderedSections}
            activeSectionId={selectedSectionId}
            appearanceMode={appearanceMode}
            jsonOpen={jsonOpen}
            locale={locale}
            mobile
            onAddSection={actions.addSection}
            onAppearanceModeChange={actions.setAppearanceMode}
            onLocaleChange={setLocale}
            onSelectSection={actions.selectSection}
            onMoveSection={actions.moveSection}
            onDeleteSection={actions.deleteSection}
            onStyleChange={actions.updateStyleSetting}
            onToggleJson={actions.toggleJson}
            onClose={() => actions.setMobileTab("preview")}
          />
        ) : null}
        {mobileTab === "preview" ? preview : null}
        {mobileTab === "settings" && selectedSection ? (
          <SectionInspectorPanel
            section={selectedSection}
            mobile
            onChangeSectionData={actions.updateSectionData}
            onChangeSectionLayout={actions.updateSectionLayout}
            onClose={() => {
              actions.closeInspector();
              actions.setMobileTab("preview");
            }}
          />
        ) : null}
        {mobileTab === "settings" && !selectedSection ? (
          <section className="briefly-chrome min-h-[calc(100dvh-112px)] bg-[#000000] p-4 text-[#e8e8e8]">
            <BuilderPreferencesPanel
              appearanceMode={appearanceMode}
              locale={locale}
              onAppearanceModeChange={actions.setAppearanceMode}
              onLocaleChange={setLocale}
            />
          </section>
        ) : null}
        {mobileTab === "export" ? (
          <MobileExportPanel onExport={actions.handleExport} mdx={mdx} />
        ) : null}
      </div>

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-[#ffffff] px-5 py-2.5 text-sm font-medium text-black shadow-[0_18px_40px_rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            {toast}
          </div>
        </div>
      ) : null}
    </main>
  );
}
