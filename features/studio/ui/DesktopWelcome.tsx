"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  FilePlus2,
  FolderOpen,
  Grid3X3,
  History,
  Layers3,
  type LucideIcon
} from "lucide-react";
import {
  defaultTemplateChooserItem,
  getTemplateChooserItem,
  getTemplateChooserItemsForCategory,
  templateChooserCategories,
  type TemplateChooserCategory,
  type TemplateChooserCategoryId,
  type TemplateChooserItem
} from "@/core/motion-doc/presets/templateChooser";
import type { SlidexRecentProject } from "@/features/studio/infrastructure/tauriProject";
import type { NewStudioProjectOptions } from "@/features/studio/ui/hooks/useStudioProject";
import {
  CompactTemplateCard,
  FeaturedTemplateCard,
  LabeledTemplateCard,
  RecentProjectList,
  RecentProjectShortcut
} from "@/features/studio/ui/welcome/TemplateChooserCards";

type DesktopWelcomeProps = {
  newProject: (options?: NewStudioProjectOptions) => void;
  openProject: () => void;
  openRecentProject: (project: SlidexRecentProject) => void;
  recentProjects: SlidexRecentProject[];
};

const categoryIconBySource = {
  recent: History,
  system: Grid3X3,
  template: Briefcase
} satisfies Record<"recent" | TemplateChooserCategory["source"], LucideIcon>;

export function DesktopWelcome({
  newProject,
  openProject,
  openRecentProject,
  recentProjects
}: DesktopWelcomeProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateChooserCategoryId>("all");
  const [selectedItemId, setSelectedItemId] = useState(defaultTemplateChooserItem.id);
  const selectedItem = useMemo(
    () => getTemplateChooserItem(selectedItemId) ?? defaultTemplateChooserItem,
    [selectedItemId]
  );
  const visibleItems = useMemo(
    () => getTemplateChooserItemsForCategory(selectedCategory),
    [selectedCategory]
  );
  const deckItems = visibleItems.filter((item) => item.kind === "deck");
  const blankItems = visibleItems.filter((item) => item.kind === "blank");
  const featuredItem = selectedItem.kind === "deck" ? selectedItem : deckItems[0] ?? selectedItem;
  const compactItems = deckItems.filter((item) => item.id !== featuredItem.id).slice(0, 9);

  function selectCategory(categoryId: TemplateChooserCategoryId) {
    const items = getTemplateChooserItemsForCategory(categoryId);

    setSelectedCategory(categoryId);

    if (items.length > 0) {
      setSelectedItemId(items[0].id);
    }
  }

  function createFullTemplate(item = selectedItem) {
    newProject({
      name: "Untitled",
      notice: item.kind === "deck" ? `${item.name} template loaded` : `${item.name} blank document created`,
      source: item.source,
      templateId: item.kind === "deck" ? item.templateId : undefined
    });
  }

  function createBlankDocument(item = selectedItem) {
    newProject({
      name: "Untitled",
      notice: item.kind === "deck" ? `${item.name} blank document created` : `${item.name} blank document created`,
      source: item.blankSource
    });
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#05060b] p-4 font-sans text-neutral-200">
      <section className="premium-glass-panel flex h-[calc(100dvh-32px)] min-h-[660px] w-[calc(100dvw-32px)] max-w-[1380px] overflow-hidden rounded-[24px] shadow-2xl shadow-black/80">
        <aside className="flex w-[238px] shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.01] px-4 py-6">
          <div className="mb-6 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">SlideX</div>
          <nav className="space-y-1.5" aria-label="Theme categories">
            {templateChooserCategories.map((category) => (
              <CategoryButton
                category={category}
                isActive={selectedCategory === category.id}
                key={category.id}
                onSelect={selectCategory}
              />
            ))}
          </nav>

          <div className="mt-auto space-y-2 rounded-xl border border-white/[0.06] bg-[#05060a]/55 p-3 shadow-inner">
            <button
              className="flex h-8.5 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[11px] font-semibold text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white cursor-pointer"
              onClick={openProject}
              type="button"
            >
              <FolderOpen size={13} className="text-[#8ea5ff]" />
              Open Project
            </button>
            <button
              className="flex h-8.5 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[11px] font-semibold text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white cursor-pointer"
              onClick={() => createBlankDocument(defaultTemplateChooserItem)}
              type="button"
            >
              <FilePlus2 size={13} className="text-[#8ea5ff]" />
              Blank Document
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-start justify-between gap-5 px-8 pb-4 pt-10">
            <div className="min-w-0">
              <h1 className="truncate text-[34px] font-bold leading-none tracking-normal text-neutral-100">Choose a Template</h1>
              <p className="mt-6 text-[17px] font-bold text-neutral-200">
                {selectedCategory === "blank" ? "Blank document styles" : "Included in SlideX Creator Studio"}
              </p>
            </div>
            <div className="mt-2 shrink-0 rounded-md px-2 py-1 text-[14px] font-semibold text-[#2f9bff]">
              Wide (16:9)
            </div>
          </header>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-8 pb-5">
            {selectedCategory === "recent" ? (
              <section className="pt-1">
                <h2 className="mb-4 text-[18px] font-bold leading-none text-neutral-200">Recent</h2>
                <RecentProjectList recentProjects={recentProjects} openRecentProject={openRecentProject} />
              </section>
            ) : (
              <>
                {featuredItem.kind === "deck" && (
                  <section className="grid gap-4 rounded-sm bg-[#202020] p-0 pb-4 lg:grid-cols-[minmax(310px,0.92fr)_minmax(350px,1.1fr)]">
                    <FeaturedTemplateCard
                      item={featuredItem}
                      onCreate={createFullTemplate}
                      onSelect={setSelectedItemId}
                      selected={selectedItem.id === featuredItem.id}
                    />
                    <div className="grid grid-cols-3 gap-2.5">
                      {compactItems.map((item) => (
                        <CompactTemplateCard
                          item={item}
                          key={item.id}
                          onSelect={setSelectedItemId}
                          selected={selectedItem.id === item.id}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {selectedCategory === "all" && (
                  <section className="mt-6 border-t border-white/[0.08] pt-4">
                    <h2 className="mb-3 text-[18px] font-bold leading-none text-neutral-200">Recent</h2>
                    <div className="flex gap-5">
                      <div className="w-[180px] shrink-0">
                        <LabeledTemplateCard
                          item={defaultTemplateChooserItem}
                          onSelect={setSelectedItemId}
                          selected={selectedItem.id === defaultTemplateChooserItem.id}
                        />
                      </div>
                      <RecentProjectShortcut recentProjects={recentProjects} onOpenProject={openProject} />
                    </div>
                  </section>
                )}

                <TemplateShelf
                  items={blankItems.length > 0 ? blankItems : visibleItems}
                  onSelect={setSelectedItemId}
                  selectedItemId={selectedItem.id}
                  title={selectedCategory === "all" ? "Blank Documents" : categoryTitle(selectedCategory)}
                />
              </>
            )}
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-white/[0.05] bg-[#0c0d12]/50 px-6 py-4 backdrop-blur-md">
            <div className="min-w-0 px-1">
              <div className="truncate text-[12px] font-bold text-neutral-200">{selectedItem.name}</div>
              <div className="truncate text-[10px] text-neutral-500 mt-0.5">
                {selectedItem.kind === "deck" ? `${selectedItem.slideCount}-page template. Blank starts with this style only.` : "Starts with only a title and paragraph text frame."}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                className="flex h-9 items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3.5 text-[11px] font-bold text-neutral-300 hover:text-white hover:bg-white/[0.08] cursor-pointer active:scale-95 transition-all duration-200"
                onClick={() => createBlankDocument()}
                type="button"
              >
                <FilePlus2 size={13} />
                Blank
              </button>
              <button
                className="h-9 rounded-xl bg-white text-black px-5 text-[11px] font-bold transition-all hover:bg-neutral-200 active:scale-95 duration-200 cursor-pointer shadow-md"
                onClick={() => createFullTemplate()}
                type="button"
              >
                Create
              </button>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}

function TemplateShelf({
  items,
  onSelect,
  selectedItemId,
  title
}: {
  items: readonly TemplateChooserItem[];
  onSelect: (itemId: string) => void;
  selectedItemId: string;
  title: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 border-t border-white/[0.08] pt-4">
      <h2 className="mb-4 text-[18px] font-bold leading-none text-neutral-200">{title}</h2>
      <div className="grid grid-cols-3 gap-5 xl:grid-cols-4">
        {items.map((item) => (
          <LabeledTemplateCard
            item={item}
            key={item.id}
            onSelect={onSelect}
            selected={selectedItemId === item.id}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryButton({
  category,
  isActive,
  onSelect
}: {
  category: TemplateChooserCategory;
  isActive: boolean;
  onSelect: (categoryId: TemplateChooserCategoryId) => void;
}) {
  const Icon = category.id === "recent"
    ? categoryIconBySource.recent
    : category.id === "blank"
      ? Layers3
      : categoryIconBySource[category.source];

  return (
    <button
      className={`flex h-[38px] w-full items-center gap-3 rounded-xl px-3 text-left text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-[0.98] border ${
        isActive
          ? "bg-[#8ea5ff]/12 text-[#8ea5ff] border-[#8ea5ff]/15 shadow-sm"
          : "text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 border-transparent"
      }`}
      onClick={() => onSelect(category.id)}
      type="button"
    >
      <Icon size={14} strokeWidth={2} />
      <span className="truncate">{category.label}</span>
    </button>
  );
}

function categoryTitle(categoryId: TemplateChooserCategoryId) {
  return templateChooserCategories.find((category) => category.id === categoryId)?.label ?? "Templates";
}
