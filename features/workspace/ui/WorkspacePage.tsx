"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FilePlus2, LogOut, Plus, Search } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { defaultMdx } from "@/core/motion-doc/presets/defaultMdx";
import {
  launchDeckPresentationId,
  launchDeckPresentationSeedVersion,
  launchDeckPresentationSource,
  launchDeckPresentationTitle
} from "@/core/motion-doc/presets/launchDeck";
import {
  welcomePresentationId,
  welcomePresentationSeedVersion,
  welcomePresentationSource,
  welcomePresentationTitle
} from "@/core/motion-doc/presets/welcomeToSlideX";
import { clearLocalAuthSession } from "@/features/auth/infrastructure/localAuthSession";
import { useLocalAuthSession } from "@/features/auth/ui/useLocalAuthSession";
import { createUntitledPresentationName } from "@/features/workspace/application/presentationTitle";
import {
  canDeleteWorkspacePresentation,
  type WorkspacePresentation
} from "@/features/workspace/domain/presentation";
import {
  createLocalPresentation,
  deleteLocalPresentation,
  duplicateLocalPresentation,
  ensureLocalPresentationSeed,
  listLocalPresentations,
  markLocalPresentationOpened,
  renameLocalPresentation
} from "@/features/workspace/infrastructure/localPresentationRepository";
import { WorkspacePresentationCard } from "@/features/workspace/ui/WorkspacePresentationCard";
import { WorkspaceSidebar, type WorkspaceView } from "@/features/workspace/ui/WorkspaceSidebar";
import { useWorkspaceOnboarding } from "@/features/workspace/ui/hooks/useWorkspaceOnboarding";
import { WorkspaceOnboardingDialog } from "@/features/workspace/ui/onboarding/WorkspaceOnboardingDialog";

const workspaceViews = [
  { id: "home", label: "Home" },
  { id: "presentations", label: "Presentations" },
  { id: "recent", label: "Recents" },
  { id: "settings", label: "Settings" }
] as const satisfies ReadonlyArray<{ id: WorkspaceView; label: string }>;

const workspaceViewCopy: Record<WorkspaceView, { description: string; title: string }> = {
  home: { description: "Create a presentation or continue recent work.", title: "Workspace" },
  presentations: { description: "Every presentation saved in this workspace.", title: "Presentations" },
  recent: { description: "Continue the files you opened most recently.", title: "Recents" },
  settings: { description: "Manage your account and workspace preferences.", title: "Settings" }
};

export function WorkspacePage() {
  const router = useRouter();
  const { isReady, session } = useLocalAuthSession();
  const [activeView, setActiveView] = useState<WorkspaceView>("home");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [menuPresentationId, setMenuPresentationId] = useState<string | null>(null);
  const [presentations, setPresentations] = useState<WorkspacePresentation[]>([]);
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    complete: completeOnboarding,
    isReady: isOnboardingReady,
    shouldShow: shouldShowOnboarding
  } = useWorkspaceOnboarding(session?.user.id ?? null);

  useEffect(() => {
    if (!isReady) return;
    if (!session) {
      router.replace(appRoutes.login);
      return;
    }
    ensureLocalPresentationSeed({
      kind: "template",
      ownerId: session.user.id,
      seedId: welcomePresentationId,
      source: welcomePresentationSource,
      templateId: welcomePresentationId,
      title: welcomePresentationTitle,
      version: welcomePresentationSeedVersion
    });
    setPresentations(ensureLocalPresentationSeed({
      kind: "template",
      ownerId: session.user.id,
      seedId: launchDeckPresentationId,
      source: launchDeckPresentationSource,
      templateId: launchDeckPresentationId,
      title: launchDeckPresentationTitle,
      version: launchDeckPresentationSeedVersion
    }));
  }, [isReady, router, session]);

  const filteredPresentations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return presentations;
    return presentations.filter((presentation) => presentation.title.toLowerCase().includes(normalizedQuery));
  }, [presentations, searchQuery]);

  function navigateTo(view: WorkspaceView) {
    setActiveView(view);
    setMenuPresentationId(null);
  }

  function createBlankPresentation() {
    if (!session) return;
    const title = createUntitledPresentationName(presentations.map((presentation) => presentation.title), "Untitled presentation");
    const presentation = createLocalPresentation({ ownerId: session.user.id, source: defaultMdx, title });
    router.push(`${appRoutes.pitch}?presentation=${encodeURIComponent(presentation.id)}`);
  }

  function openPresentation(presentationId: string) {
    if (!session) return;
    markLocalPresentationOpened(session.user.id, presentationId);
    router.push(`${appRoutes.pitch}?presentation=${encodeURIComponent(presentationId)}`);
  }

  function duplicatePresentation(presentation: WorkspacePresentation) {
    if (!session) return;
    const title = createUntitledPresentationName(presentations.map((item) => item.title), `${presentation.title} copy`);
    duplicateLocalPresentation(session.user.id, presentation.id, title);
    setPresentations(listLocalPresentations(session.user.id));
    setMenuPresentationId(null);
  }

  function renamePresentation(presentationId: string, title: string) {
    if (!session) return;
    setPresentations(renameLocalPresentation(session.user.id, presentationId, title));
    setMenuPresentationId(null);
  }

  function removePresentation(presentationId: string) {
    if (!session) return;
    setPresentations(deleteLocalPresentation(session.user.id, presentationId));
    setMenuPresentationId(null);
  }

  function signOut() {
    clearLocalAuthSession();
    router.replace(appRoutes.login);
  }

  function renderPresentationGrid(items: WorkspacePresentation[]) {
    if (items.length === 0) {
      return (
        <div className="flex min-h-[190px] items-center justify-center rounded-[8px] border border-white/[0.08] bg-[#1d1d1d] px-6 text-center">
          <div>
            <FilePlus2 className="mx-auto h-5 w-5 text-white/24" strokeWidth={1.5} />
            <p className="mt-3 text-[14px] font-medium leading-5 text-white/62">{searchQuery ? "No matching presentations" : "No recent presentations"}</p>
            <button className="mt-2 text-[12px] font-medium leading-4 text-white/42 hover:text-white/76" onClick={createBlankPresentation} type="button">Create a blank presentation</button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {items.map((presentation) => (
          <WorkspacePresentationCard
            isMenuOpen={menuPresentationId === presentation.id}
            key={presentation.id}
            onDelete={canDeleteWorkspacePresentation(presentation) ? () => removePresentation(presentation.id) : undefined}
            onDuplicate={() => duplicatePresentation(presentation)}
            onOpen={() => openPresentation(presentation.id)}
            onRename={(title) => renamePresentation(presentation.id, title)}
            onToggleMenu={() => setMenuPresentationId((current) => current === presentation.id ? null : presentation.id)}
            presentation={presentation}
          />
        ))}
      </div>
    );
  }

  if (!isReady || !session) {
    return <main className="min-h-[100dvh] bg-[#171717]" />;
  }

  const activeCopy = workspaceViewCopy[activeView];
  const isOnboardingOpen = isOnboardingReady && shouldShowOnboarding;

  return (
    <main className="min-h-[100dvh] bg-[#171717] text-[#f2f2ef]">
      <div aria-hidden={isOnboardingOpen ? true : undefined} inert={isOnboardingOpen ? true : undefined}>
        <WorkspaceSidebar activeView={activeView} onNavigate={navigateTo} onSignOut={signOut} session={session} />

        <header className="border-b border-white/[0.07] bg-[#1b1b1b] md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link aria-label="SlideX workspace home" href={appRoutes.workspace}>
            <Image alt="SlideX" className="h-auto w-[84px] object-contain" height={72} priority src="/logo.png" width={260} />
          </Link>
          <button aria-label="Sign out" className="flex h-8 w-8 items-center justify-center rounded-[6px] text-white/42 hover:bg-white/[0.06] hover:text-white" onClick={signOut} type="button">
            <LogOut className="h-4 w-4" strokeWidth={1.7} />
          </button>
        </div>
        <nav aria-label="Workspace navigation" className="flex gap-1 overflow-x-auto px-3 pb-3">
          {workspaceViews.map(({ id, label }) => (
            <button className={`rounded-[5px] px-3 py-2 text-[13px] leading-5 transition ${activeView === id ? "bg-white/[0.09] text-white" : "text-white/48 hover:text-white"}`} key={id} onClick={() => navigateTo(id)} type="button">{label}</button>
          ))}
        </nav>
        </header>

        <div className="md:pl-[232px]">
        <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-7 sm:px-8 md:px-10 md:pt-9 xl:px-12">
          <header className="flex flex-col gap-5 border-b border-white/[0.075] pb-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[32px] font-medium leading-[1.1] tracking-[-0.03em] text-white/94">{activeCopy.title}</h1>
              <p className="mt-2 text-[15px] leading-6 text-white/46">{activeCopy.description}</p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <label className="relative block sm:w-[260px]">
                <span className="sr-only">Search presentations</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/28" strokeWidth={1.7} />
                <input
                  className="h-10 w-full rounded-[7px] border border-white/[0.09] bg-[#202020] pl-9 pr-3 text-[14px] text-white/82 outline-none placeholder:text-white/32 focus:border-white/[0.2]"
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    if (event.target.value) setActiveView("presentations");
                  }}
                  placeholder="Search presentations"
                  type="search"
                  value={searchQuery}
                />
              </label>
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-[#f1f0eb] px-4 text-[14px] font-medium text-[#191919] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/14" onClick={createBlankPresentation} type="button">
                <Plus className="h-4 w-4" strokeWidth={1.8} />
                New presentation
              </button>
            </div>
          </header>

          {activeView === "home" ? (
            <div className="pt-8">
              <section>
                <div className="mb-4 flex items-end justify-between gap-6">
                  <div><h2 className="text-[18px] font-medium leading-6 text-white/88">Your presentations</h2><p className="mt-1 text-[13px] leading-5 text-white/42">Open a file or use More to manage it.</p></div>
                  <button className="text-[13px] leading-5 text-white/46 hover:text-white/78" onClick={() => navigateTo("presentations")} type="button">View all presentations</button>
                </div>
                {renderPresentationGrid(filteredPresentations.slice(0, 4))}
              </section>
            </div>
          ) : null}

          {activeView === "presentations" ? (
            <section className="pt-8">
              <div className="mb-4 flex items-end justify-between gap-6"><p className="text-[13px] leading-5 text-white/44">Open a file or use More to manage it.</p><span className="text-[12px] leading-4 tabular-nums text-white/36">{filteredPresentations.length} files</span></div>
              {renderPresentationGrid(filteredPresentations)}
            </section>
          ) : null}

          {activeView === "recent" ? (
            <section className="pt-8">
              <div className="mb-4 flex items-end justify-between gap-6"><p className="text-[13px] leading-5 text-white/44">Sorted by the last time you opened each file.</p><span className="text-[12px] leading-4 tabular-nums text-white/36">{Math.min(filteredPresentations.length, 8)} recent</span></div>
              {renderPresentationGrid(filteredPresentations.slice(0, 8))}
            </section>
          ) : null}

          {activeView === "settings" ? (
            <section className="max-w-[720px] space-y-8 pt-8">
              <div>
                <h2 className="text-[17px] font-medium leading-6 text-white/84">Account</h2>
                <div className="mt-3 flex items-center justify-between gap-5 rounded-[8px] border border-white/[0.08] bg-[#1d1d1d] px-4 py-3.5">
                  <div className="min-w-0"><p className="truncate text-[14px] font-medium leading-5 text-white/78">{session.user.displayName}</p><p className="mt-1 truncate text-[12px] leading-4 text-white/40">{session.provider} demo · {session.user.email}</p></div>
                  <button className="shrink-0 rounded-[6px] border border-white/[0.1] px-3 py-2 text-[12px] leading-4 text-white/54 hover:border-white/[0.2] hover:text-white" onClick={signOut} type="button">Sign out</button>
                </div>
              </div>
              <div>
                <h2 className="text-[17px] font-medium leading-6 text-white/84">Workspace preferences</h2>
                <div className="mt-3 divide-y divide-white/[0.07] rounded-[8px] border border-white/[0.08] bg-[#1d1d1d]">
                  <PreferenceRow description="Save local changes while editing a presentation." enabled={autoSaveEnabled} label="Autosave" onToggle={() => setAutoSaveEnabled((current) => !current)} />
                  <PreferenceRow description="Use simpler transitions in the workspace interface." enabled={reducedMotionEnabled} label="Reduce motion" onToggle={() => setReducedMotionEnabled((current) => !current)} />
                </div>
                <p className="mt-2 text-[11px] leading-4 text-white/34">Demo preferences are ready to connect to the account settings API.</p>
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
    </main>
  );
}

type PreferenceRowProps = {
  description: string;
  enabled: boolean;
  label: string;
  onToggle: () => void;
};

function PreferenceRow({ description, enabled, label, onToggle }: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3.5">
      <div><p className="text-[14px] font-medium leading-5 text-white/76">{label}</p><p className="mt-1 text-[12px] leading-5 text-white/42">{description}</p></div>
      <button aria-label={`${label}: ${enabled ? "on" : "off"}`} aria-pressed={enabled} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${enabled ? "bg-[#f1f0eb]" : "bg-white/[0.12]"}`} onClick={onToggle} type="button">
        <span className={`absolute top-0.5 h-4 w-4 rounded-full transition-transform ${enabled ? "translate-x-[18px] bg-[#191919]" : "translate-x-0.5 bg-white/55"}`} />
      </button>
    </div>
  );
}
