"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";
import { FilePlus2, LogOut, Plus, Search } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { InteractiveDotField } from "@/common/ui/InteractiveDotField";
import { defaultMdx } from "@/core/motion-doc/presets/defaultMdx";
import { getSettingsAuthIdentity } from "@/features/auth/application/authIdentityPrivacy";
import { useAuthSession } from "@/features/auth/ui/useAuthSession";
import { AccountAvatar } from "@/features/auth/ui/AccountAvatar";
import { isLocale } from "@/common/lib/i18n";
import { createUntitledPresentationName } from "@/features/workspace/application/presentationTitle";
import {
  canDeleteWorkspacePresentation,
  type WorkspacePresentation
} from "@/features/workspace/domain/presentation";
import type { OfficialTemplate } from "@/features/workspace/domain/officialTemplate";
import { WorkspaceCardSkeletonGrid } from "@/features/workspace/ui/WorkspaceCardSkeleton";
import { WorkspaceOfficialTemplateCard } from "@/features/workspace/ui/WorkspaceOfficialTemplateCard";
import { WorkspacePageSkeleton } from "@/features/workspace/ui/WorkspacePageSkeleton";
import { WorkspacePresentationCard } from "@/features/workspace/ui/WorkspacePresentationCard";
import { WorkspaceDeletePresentationDialog } from "@/features/workspace/ui/WorkspaceDeletePresentationDialog";
import { WorkspaceSidebar, type WorkspaceView } from "@/features/workspace/ui/WorkspaceSidebar";
import { useWorkspaceOnboarding } from "@/features/workspace/ui/hooks/useWorkspaceOnboarding";
import { useWorkspacePrivacyMode } from "@/features/workspace/ui/hooks/useWorkspacePrivacyMode";
import { useSupabaseOfficialTemplates } from "@/features/workspace/ui/hooks/useSupabaseOfficialTemplates";
import { useSupabaseWorkspacePresentations } from "@/features/workspace/ui/hooks/useSupabaseWorkspacePresentations";
import { useWorkspaceLazyLoad } from "@/features/workspace/ui/hooks/useWorkspaceLazyLoad";
import { WorkspaceOnboardingDialog } from "@/features/workspace/ui/onboarding/WorkspaceOnboardingDialog";
import { useWorkspaceI18n } from "@/features/workspace/ui/workspaceI18n";

const workspaceViews = [
  { id: "home", label: "Home" },
  { id: "presentations", label: "Presentations" },
  { id: "recent", label: "Recents" },
  { id: "settings", label: "Settings" }
] as const satisfies ReadonlyArray<{ id: WorkspaceView; label: string }>;

const workspaceViewTitles: Record<WorkspaceView, string> = {
  home: "Workspace",
  presentations: "Presentations",
  recent: "Recents",
  settings: "Settings"
};

const recentGroupOrder = ["Today", "Yesterday", "Previous 7 days", "Older"] as const;
type RecentGroupLabel = (typeof recentGroupOrder)[number];

function recentGroupLabel(value: string): RecentGroupLabel {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Older";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 86_400_000;
  if (timestamp >= today) return "Today";
  if (timestamp >= today - day) return "Yesterday";
  if (timestamp >= today - day * 7) return "Previous 7 days";
  return "Older";
}

function groupRecentPresentations(items: WorkspacePresentation[]) {
  const groups = new Map<RecentGroupLabel, WorkspacePresentation[]>();
  items.forEach((presentation) => {
    const label = recentGroupLabel(presentation.lastOpenedAt);
    groups.set(label, [...(groups.get(label) ?? []), presentation]);
  });
  return recentGroupOrder.flatMap((label) => {
    const presentations = groups.get(label);
    return presentations?.length ? [{ label, presentations }] : [];
  });
}

export function WorkspacePage() {
  const router = useRouter();
  const { locale, setLocale, tx } = useWorkspaceI18n();
  const { isReady, session, signOut } = useAuthSession();
  const { isPrivacyModeEnabled, updatePrivacyMode } = useWorkspacePrivacyMode(session?.user.id);
  const [activeView, setActiveView] = useState<WorkspaceView>("home");
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);
  const [deletingPresentationId, setDeletingPresentationId] = useState<string | null>(null);
  const [menuPresentationId, setMenuPresentationId] = useState<string | null>(null);
  const [presentationPendingDelete, setPresentationPendingDelete] = useState<WorkspacePresentation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const {
    complete: completeOnboarding,
    isReady: isOnboardingReady,
    shouldShow: shouldShowOnboarding
  } = useWorkspaceOnboarding(session?.user.id ?? null);
  const {
    createPresentation,
    duplicatePresentation: duplicateRemotePresentation,
    error: presentationsError,
    hasMore: hasMorePresentations,
    isLoading: arePresentationsLoading,
    isLoadingMore: areMorePresentationsLoading,
    loadMore: loadMorePresentations,
    presentations,
    removePresentation: removeRemotePresentation,
    renamePresentation: renameRemotePresentation,
    totalCount: presentationCount
  } = useSupabaseWorkspacePresentations(session?.user.id, deferredSearchQuery);
  const lazyLoadMoreRef = useWorkspaceLazyLoad({
    enabled: activeView === "presentations" && hasMorePresentations && !presentationsError,
    isLoading: areMorePresentationsLoading,
    onLoadMore: loadMorePresentations
  });
  const {
    error: officialTemplatesError,
    isLoading: areOfficialTemplatesLoading,
    templates: officialTemplates
  } = useSupabaseOfficialTemplates(session?.user.id);

  useEffect(() => {
    if (!isReady) return;
    if (!session) {
      router.replace(appRoutes.login);
      return;
    }
  }, [isReady, router, session]);

  function navigateTo(view: WorkspaceView) {
    setActiveView(view);
    setMenuPresentationId(null);
  }

  async function createBlankPresentation() {
    if (!session) return;
    const title = createUntitledPresentationName(presentations.map((presentation) => presentation.title), tx("Untitled presentation"));
    const presentation = await createPresentation({ source: defaultMdx, title });
    if (presentation) router.push(`${appRoutes.pitch}?presentation=${encodeURIComponent(presentation.id)}`);
  }

  async function createFromOfficialTemplate(template: OfficialTemplate) {
    if (!session || creatingTemplateId) return;
    setCreatingTemplateId(template.id);
    const copyLabel = locale === "zh-TW" ? `${template.name} 複本` : `${template.name} copy`;
    const title = createUntitledPresentationName(
      presentations.map((presentation) => presentation.title),
      copyLabel
    );
    const presentation = await createPresentation({
      source: template.source,
      templateId: template.id,
      title
    });
    setCreatingTemplateId(null);
    if (presentation) router.push(`${appRoutes.pitch}?presentation=${encodeURIComponent(presentation.id)}`);
  }

  function openPresentation(presentationId: string) {
    if (!session) return;
    router.push(`${appRoutes.pitch}?presentation=${encodeURIComponent(presentationId)}`);
  }

  async function duplicatePresentation(presentation: WorkspacePresentation) {
    if (!session) return;
    const title = createUntitledPresentationName(presentations.map((item) => item.title), locale === "zh-TW" ? `${presentation.title} 複本` : `${presentation.title} copy`);
    await duplicateRemotePresentation(presentation, title);
    setMenuPresentationId(null);
  }

  async function renamePresentation(presentationId: string, title: string) {
    if (!session) return;
    await renameRemotePresentation(presentationId, title);
    setMenuPresentationId(null);
  }

  function requestPresentationDelete(presentation: WorkspacePresentation) {
    setPresentationPendingDelete(presentation);
    setMenuPresentationId(null);
  }

  async function confirmPresentationDelete() {
    if (!session || !presentationPendingDelete || deletingPresentationId) return;
    const presentationId = presentationPendingDelete.id;
    setPresentationPendingDelete(null);
    setDeletingPresentationId(presentationId);
    await removeRemotePresentation(presentationId);
    setDeletingPresentationId(null);
  }

  async function handleSignOut() {
    await signOut();
    router.replace(appRoutes.login);
  }

  function renderPresentationGrid(
    items: WorkspacePresentation[],
    options?: { emptyMessage?: string; gridClassName?: string; textSize?: "default" | "large" }
  ) {
    if (items.length === 0) {
      return (
        <div className="flex min-h-[240px] items-center justify-center rounded-[14px] border border-dashed border-white/[0.1] bg-white/[0.018] px-6 text-center">
          <div>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.03]">
              <FilePlus2 className="h-4 w-4 text-white/30" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-[15px] font-medium leading-5 text-white/66">{tx(options?.emptyMessage ?? "No recent presentations")}</p>
            <button className="mt-3 text-[12px] font-medium leading-4 text-white/40 transition hover:text-white/76 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" onClick={() => void createBlankPresentation()} type="button">{tx("Create a blank presentation")}</button>
          </div>
        </div>
      );
    }

    return (
      <div className={options?.gridClassName ?? "grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3"}>
        {items.map((presentation) => (
          <WorkspacePresentationCard
            isMenuOpen={menuPresentationId === presentation.id}
            key={presentation.id}
            onDelete={canDeleteWorkspacePresentation(presentation) ? () => requestPresentationDelete(presentation) : undefined}
            onDuplicate={() => void duplicatePresentation(presentation)}
            onOpen={() => openPresentation(presentation.id)}
            onRename={(title) => void renamePresentation(presentation.id, title)}
            onToggleMenu={() => setMenuPresentationId((current) => current === presentation.id ? null : presentation.id)}
            presentation={presentation}
            textSize={options?.textSize}
          />
        ))}
      </div>
    );
  }

  if (!isReady || !session) {
    return <WorkspacePageSkeleton />;
  }

  const activeTitle = workspaceViewTitles[activeView];
  const isOnboardingOpen = isOnboardingReady && shouldShowOnboarding;
  const settingsIdentity = getSettingsAuthIdentity(session.user, isPrivacyModeEnabled);

  return (
    <main className="min-h-[100dvh] bg-[#171717] bg-[radial-gradient(ellipse_70%_42%_at_78%_-12%,rgba(255,255,255,0.05),transparent_72%)] text-[#f2f2ef]">
      <div aria-hidden={isOnboardingOpen ? true : undefined} inert={isOnboardingOpen ? true : undefined}>
        <WorkspaceSidebar activeView={activeView} isPrivacyModeEnabled={isPrivacyModeEnabled} onNavigate={navigateTo} onSignOut={() => void handleSignOut()} session={session} />

        <header className="border-b border-white/[0.07] bg-[#1b1b1b] md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link aria-label="SlideX workspace home" href={appRoutes.workspace}>
            <Image alt="SlideX" className="h-auto w-[84px] object-contain" height={72} loading="eager" priority src="/logo.png" width={260} />
          </Link>
          <button aria-label={tx("Sign out")} className="flex h-8 w-8 items-center justify-center rounded-[6px] text-white/42 hover:bg-white/[0.06] hover:text-white" onClick={() => void handleSignOut()} type="button">
            <LogOut className="h-4 w-4" strokeWidth={1.7} />
          </button>
        </div>
        <nav aria-label={tx("Workspace navigation")} className="flex gap-1 overflow-x-auto px-3 pb-3">
          {workspaceViews.map(({ id, label }) => (
            <button className={`rounded-[5px] px-3 py-2 text-[13px] leading-5 transition ${activeView === id ? "bg-white/[0.09] text-white" : "text-white/48 hover:text-white"}`} key={id} onClick={() => navigateTo(id)} type="button">{tx(label)}</button>
          ))}
        </nav>
        </header>

        <div className="md:pl-[232px]">
        <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-7 sm:px-8 md:px-10 md:pt-9 xl:px-12">
          <header className="flex flex-col gap-5 border-b border-white/[0.075] pb-7 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-[36px] font-medium leading-none tracking-[-0.04em] text-white/94 sm:text-[40px]">{tx(activeTitle)}</h1>
            {activeView !== "settings" && activeView !== "home" ? (
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-[9px] bg-[#f1f0eb] px-4 text-[13px] font-medium text-[#191919] transition duration-200 hover:bg-white active:translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/14 disabled:cursor-wait disabled:opacity-60" disabled={arePresentationsLoading} onClick={() => void createBlankPresentation()} type="button">
                <Plus className="h-4 w-4" strokeWidth={1.8} />
                {tx("Create")}
              </button>
            ) : null}
          </header>

          {activeView !== "settings" && (presentationsError || officialTemplatesError) ? (
            <div className="mt-5 rounded-[7px] border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-[13px] text-red-100/80" role="alert">{tx(presentationsError ?? officialTemplatesError ?? "")}</div>
          ) : null}

          {activeView === "home" ? (
            <div className="space-y-12 pt-9">
              <section className="grid items-stretch gap-6 lg:grid-cols-[minmax(240px,0.58fr)_minmax(0,1.42fr)]">
                <article className="group relative isolate flex min-h-[280px] overflow-hidden rounded-[12px] border border-white/[0.085] bg-[#1b1b1b] p-6 transition duration-300 hover:border-white/[0.14] sm:p-7">
                  <InteractiveDotField />
                  <div className="relative z-10 flex w-full flex-col justify-between">
                    <div>
                      <h2 className="max-w-[10ch] text-[26px] font-medium leading-[1.02] tracking-[-0.04em] text-white/90">{tx("Blank presentation")}</h2>
                      <p className="mt-4 max-w-[32ch] text-[12px] leading-5 text-white/38">{tx("Build a presentation from an empty deck and shape every slide yourself.")}</p>
                    </div>
                    <button className="inline-flex h-10 w-fit items-center gap-2 rounded-[8px] bg-[#f1f0eb] px-3.5 text-[12px] font-medium text-[#191919] transition duration-200 hover:bg-white active:translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/14" onClick={() => void createBlankPresentation()} type="button">
                      <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
                      {tx("Create")}
                    </button>
                  </div>
                </article>

                <div>
                  <div className="mb-5 flex items-end justify-between gap-6">
                    <h2 className="text-[18px] font-medium leading-6 tracking-[-0.02em] text-white/84">{tx("Official templates")}</h2>
                    <p className="hidden max-w-[34ch] text-right text-[11px] leading-4 text-white/32 sm:block">{tx("Official templates are available to every account.")}</p>
                  </div>
                  {areOfficialTemplatesLoading ? (
                    <WorkspaceCardSkeletonGrid
                      className="grid gap-5 sm:grid-cols-2"
                      count={2}
                      label={tx("Loading official templates")}
                      variant="template"
                    />
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                      {officialTemplates.map((template) => (
                        <WorkspaceOfficialTemplateCard
                          isDisabled={Boolean(creatingTemplateId)}
                          isCreating={creatingTemplateId === template.id}
                          key={template.id}
                          onUse={() => void createFromOfficialTemplate(template)}
                          template={template}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="border-t border-white/[0.075] pt-8">
                <div className="mb-6 flex items-end justify-between gap-6">
                  <h2 className="text-[18px] font-medium leading-6 tracking-[-0.02em] text-white/84">{tx("Recent work")}</h2>
                  <button className="text-[12px] font-medium leading-5 text-white/40 transition hover:text-white/76 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" onClick={() => navigateTo("presentations")} type="button">{tx("View all presentations")}</button>
                </div>
                {arePresentationsLoading ? (
                  <WorkspaceCardSkeletonGrid count={3} label={tx("Loading…")} />
                ) : renderPresentationGrid(presentations.slice(0, 3))}
              </section>
            </div>
          ) : null}

          {activeView === "presentations" ? (
            <section className="pt-9">
              <div className="mb-7 flex flex-col gap-4 border-b border-white/[0.075] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block w-full sm:max-w-[380px]">
                  <span className="sr-only">{tx("Search presentations")}</span>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/26" strokeWidth={1.7} />
                  <input
                    className="h-11 w-full rounded-[9px] border border-white/[0.09] bg-[#1d1d1d] pl-10 pr-3 text-[13px] text-white/82 outline-none transition duration-200 placeholder:text-white/28 hover:border-white/[0.14] focus:border-white/[0.22] focus:ring-2 focus:ring-white/[0.06]"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={tx("Search presentations")}
                    type="search"
                    value={searchQuery}
                  />
                </label>
                <span className="text-[11px] tabular-nums text-white/34">{locale === "zh-TW" ? `已顯示 ${presentations.length}／${presentationCount} 份` : `Showing ${presentations.length} of ${presentationCount}`}</span>
              </div>
              {arePresentationsLoading ? (
                <WorkspaceCardSkeletonGrid count={6} label={tx("Loading…")} />
              ) : renderPresentationGrid(presentations, { emptyMessage: searchQuery ? "No matching presentations" : "No presentations yet" })}
              {areMorePresentationsLoading ? (
                <div className="mt-9">
                  <WorkspaceCardSkeletonGrid count={3} label={tx("Loading…")} />
                </div>
              ) : null}
              {hasMorePresentations ? (
                <div className="mt-12 flex justify-center border-t border-white/[0.07] pt-8" ref={lazyLoadMoreRef}>
                  <button
                    className="h-10 rounded-[8px] border border-white/[0.1] bg-white/[0.025] px-5 text-[12px] font-medium text-white/56 transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.055] hover:text-white active:translate-y-px disabled:cursor-wait disabled:opacity-50"
                    disabled={areMorePresentationsLoading}
                    onClick={() => void loadMorePresentations()}
                    type="button"
                  >
                    {tx(areMorePresentationsLoading ? "Loading…" : "Load more")}
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {activeView === "recent" ? (
            <section className="pt-9">
              {arePresentationsLoading ? (
                <div className="space-y-10">
                  {[0, 1].map((group) => (
                    <div className={group === 0 ? "pt-1" : "border-t border-white/[0.07] pt-6"} key={group}>
                      <div className="mb-5 h-5 w-24 animate-pulse rounded bg-white/[0.04]" />
                      <WorkspaceCardSkeletonGrid count={2} label={tx("Loading…")} />
                    </div>
                  ))}
                </div>
              ) : presentations.length === 0 ? (
                renderPresentationGrid([], { emptyMessage: "No recent presentations" })
              ) : (
                <div className="space-y-10">
                  {groupRecentPresentations(presentations.slice(0, 8)).map((group, groupIndex) => (
                    <section className={groupIndex === 0 ? "pt-1" : "border-t border-white/[0.07] pt-6"} key={group.label}>
                      <header className="mb-5">
                        <h2 className="text-[18px] font-medium leading-6 tracking-[-0.02em] text-white/76">{tx(group.label)}</h2>
                      </header>
                      {renderPresentationGrid(group.presentations, { gridClassName: "grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3", textSize: "large" })}
                    </section>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {activeView === "settings" ? (
            <section className="pt-9">
              <div className="grid max-w-[1040px] gap-5 lg:grid-cols-[minmax(280px,0.82fr)_minmax(420px,1.38fr)]">
                <article className="flex min-h-[300px] flex-col rounded-[12px] border border-white/[0.085] bg-[#1b1b1b] p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">{tx("Account")}</p>
                    <p className="text-[10px] font-medium tracking-[0.04em] text-white/30">{tx(session.provider === "google" ? "Google account" : "GitHub account")}</p>
                  </div>
                  <div className="mt-8 min-w-0">
                    <AccountAvatar avatarUrl={isPrivacyModeEnabled ? undefined : session.user.avatarUrl} displayName={settingsIdentity.displayName} size="profile" />
                    <h2 className="mt-5 truncate text-[24px] font-medium leading-7 tracking-[-0.025em] text-white/92">{settingsIdentity.displayName}</h2>
                    <p className="mt-2 truncate text-[13px] leading-5 text-white/42">{settingsIdentity.email}</p>
                  </div>

                  <button className="mt-auto flex h-10 items-center justify-center rounded-[8px] border border-white/[0.1] bg-white/[0.025] px-4 text-[13px] font-medium text-white/54 transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.055] hover:text-white active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/24" onClick={() => void handleSignOut()} type="button">{tx("Sign out")}</button>
                </article>

                <section className="overflow-hidden rounded-[12px] border border-white/[0.085] bg-[#1b1b1b]">
                  <header className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
                    <h2 className="text-[18px] font-medium leading-6 tracking-[-0.02em] text-white/86">{tx("Workspace preferences")}</h2>
                  </header>

                  <div className="divide-y divide-white/[0.07]">
                    <div className="flex items-center justify-between gap-5 px-5 py-5 sm:px-7">
                      <div>
                        <p className="text-[14px] font-medium leading-5 text-white/76">{tx("Privacy mode")}</p>
                        <p className="mt-1 max-w-[46ch] text-[11px] leading-4 text-white/34">{tx("Hide your name, email, and account photo in the workspace.")}</p>
                      </div>
                      <div className="flex items-center">
                        <button
                          aria-label={`${tx("Privacy mode")}: ${isPrivacyModeEnabled ? tx("On") : tx("Off")}`}
                          aria-pressed={isPrivacyModeEnabled}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${isPrivacyModeEnabled ? "bg-[#f1f0eb]" : "bg-white/[0.12]"}`}
                          onClick={() => updatePrivacyMode(!isPrivacyModeEnabled)}
                          type="button"
                        >
                          <span className={`absolute left-0 top-1 h-4 w-4 rounded-full transition-transform ${isPrivacyModeEnabled ? "translate-x-6 bg-[#191919]" : "translate-x-1 bg-white/55"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                      <div>
                        <p className="text-[14px] font-medium leading-5 text-white/76">{tx("Workspace language")}</p>
                        <p className="mt-1 max-w-[46ch] text-[11px] leading-4 text-white/34">{tx("Change the language used across Workspace and Pitch.")}</p>
                      </div>
                      <label className="relative shrink-0">
                        <span className="sr-only">{tx("Workspace language")}</span>
                        <select
                          className="h-10 min-w-[156px] appearance-none rounded-[8px] border border-white/[0.1] bg-[#242424] px-3 pr-9 text-[12px] font-medium text-white/72 outline-none transition duration-200 hover:border-white/[0.18] hover:bg-[#282828] focus:border-white/[0.26] focus:ring-2 focus:ring-white/[0.08]"
                          onChange={(event) => {
                            if (isLocale(event.target.value)) setLocale(event.target.value);
                          }}
                          value={locale}
                        >
                          <option value="en">English</option>
                          <option value="zh-TW">繁體中文</option>
                        </select>
                        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/34">⌄</span>
                      </label>
                    </div>
                  </div>
                  <footer className="border-t border-white/[0.07] px-5 py-3.5 sm:px-7">
                    <p className="text-[10px] leading-4 text-white/26">{tx("Your workspace language and privacy preference are saved in this browser.")}</p>
                  </footer>
                </section>
              </div>
            </section>
          ) : null}
        </div>
        </div>
      </div>

      {isOnboardingOpen ? (
        <WorkspaceOnboardingDialog
          onComplete={completeOnboarding}
        />
      ) : null}

      {presentationPendingDelete ? (
        <WorkspaceDeletePresentationDialog
          isDeleting={deletingPresentationId === presentationPendingDelete.id}
          onCancel={() => setPresentationPendingDelete(null)}
          onConfirm={() => void confirmPresentationDelete()}
          presentation={presentationPendingDelete}
        />
      ) : null}
    </main>
  );
}
