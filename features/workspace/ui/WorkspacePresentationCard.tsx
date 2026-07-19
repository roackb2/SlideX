import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { Bot, Check, CheckCircle2, CircleAlert, Copy, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import {
  isMcpOperationVisuallyActive,
  mcpOperationAction,
  mcpOperationVisualDeadline
} from "@/features/workspace/application/mcpOperationActivity";
import type { McpOperationActivity } from "@/features/workspace/domain/mcpOperationActivity";
import {
  canDeleteWorkspacePresentation,
  type WorkspacePresentation
} from "@/features/workspace/domain/presentation";
import { workspacePresentationCoverPath } from "@/features/workspace/ui/workspacePresentationCovers";
import { useWorkspaceI18n } from "@/features/workspace/ui/workspaceI18n";

type WorkspacePresentationCardProps = {
  isMenuOpen: boolean;
  mcpActivities?: readonly McpOperationActivity[];
  onDelete?: () => void;
  onDuplicate: () => void;
  onOpen: () => void;
  onRename: (title: string) => void;
  onToggleMenu: () => void;
  presentation: WorkspacePresentation;
  textSize?: "default" | "large";
};

function formatUpdatedAt(value: string, locale: "en" | "zh-TW") {
  const date = new Date(value);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const elapsedMinutes = Math.round((date.getTime() - Date.now()) / 60_000);
  if (Math.abs(elapsedMinutes) < 60) return formatter.format(elapsedMinutes, "minute");
  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (Math.abs(elapsedHours) < 24) return formatter.format(elapsedHours, "hour");
  const elapsedDays = Math.round(elapsedHours / 24);
  if (Math.abs(elapsedDays) < 30) return formatter.format(elapsedDays, "day");
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function PresentationArtwork({ presentation }: { presentation: WorkspacePresentation }) {
  const coverPath = workspacePresentationCoverPath(presentation.templateId);

  if (coverPath) {
    return (
      <div className="relative aspect-video overflow-hidden bg-[#242424]">
        <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-white/[0.04]" />
        <Image alt={`${presentation.title} cover`} className="object-cover transition-transform duration-500 group-hover:scale-[1.018]" decoding="async" fill loading="lazy" sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" src={coverPath} />
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden bg-[#242424] p-[8%]">
      <div aria-hidden="true" className="absolute inset-x-0 top-[38%] h-px bg-white/[0.055]" />
      <Image alt="SlideX" className="relative h-auto w-[18%] object-contain opacity-38" decoding="async" height={72} loading="lazy" src="/logo.png" width={260} />
      <div className="absolute bottom-[12%] left-[8%] max-w-[78%] text-[clamp(16px,1.7vw,25px)] font-medium leading-[0.98] tracking-[-0.04em] text-white/86">{presentation.title}</div>
    </div>
  );
}

export function WorkspacePresentationCard({ isMenuOpen, mcpActivities = [], onDelete, onDuplicate, onOpen, onRename, onToggleMenu, presentation, textSize = "default" }: WorkspacePresentationCardProps) {
  const { locale, tx } = useWorkspaceI18n();
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(presentation.title);
  const [visualNow, setVisualNow] = useState(() => Date.now());
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const canDelete = canDeleteWorkspacePresentation(presentation) && Boolean(onDelete);
  const mcpActivity = mcpActivities.find((activity) => isMcpOperationVisuallyActive(activity, visualNow));

  useEffect(() => {
    if (!mcpActivity) return;
    const remaining = mcpOperationVisualDeadline(mcpActivity) - Date.now();
    if (remaining <= 0) return;
    const timeout = window.setTimeout(() => setVisualNow(Date.now()), remaining + 20);
    return () => window.clearTimeout(timeout);
  }, [mcpActivity]);

  useEffect(() => {
    if (!isMenuOpen) return;

    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])')?.focus();

    function closeOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !menuContainerRef.current?.contains(event.target)) {
        onToggleMenu();
      }
    }

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onToggleMenu();
      moreButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen, onToggleMenu]);

  function submitRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = draftTitle.trim();
    if (!nextTitle) return;
    onRename(nextTitle);
    setIsRenaming(false);
  }

  function startRename() {
    setDraftTitle(presentation.title);
    setIsRenaming(true);
    onToggleMenu();
  }

  function navigateMenu(event: KeyboardEvent<HTMLDivElement>) {
    const menuItems = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])'));
    const activeIndex = menuItems.findIndex((item) => item === document.activeElement);
    let nextIndex = activeIndex;

    if (event.key === "ArrowDown") nextIndex = (activeIndex + 1) % menuItems.length;
    else if (event.key === "ArrowUp") nextIndex = (activeIndex - 1 + menuItems.length) % menuItems.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = menuItems.length - 1;
    else return;

    event.preventDefault();
    menuItems[nextIndex]?.focus();
  }

  return (
    <article className="group relative [contain-intrinsic-size:auto_320px] [content-visibility:auto]">
      <div className="relative" ref={menuContainerRef}>
        <button className="block w-full overflow-hidden rounded-[12px] border border-white/[0.09] bg-[#242424] text-left transition duration-200 hover:border-white/[0.19] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/10" onClick={onOpen} type="button">
          <PresentationArtwork presentation={presentation} />
        </button>
        {mcpActivity ? (
          <div
            aria-live="polite"
            className={`pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[12px] ${mcpActivity.status === "running" ? "" : "motion-safe:animate-[mcp-activity-settle_6s_ease-out_forwards]"}`}
            data-mcp-operation-status={mcpActivity.errorCode === "revision_conflict" ? "conflict" : mcpActivity.status}
          >
            <div className={`absolute inset-0 rounded-[12px] border-2 border-[#8b5cf6] shadow-[inset_0_0_0_1px_rgba(139,92,246,0.28),0_0_24px_rgba(139,92,246,0.22)] ${mcpActivity.status === "running" ? "motion-safe:animate-pulse" : ""} ${mcpActivity.status === "failed" ? "border-dashed" : "border-solid"}`} />
            <div className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-20px)] rounded-[7px] border border-[#a78bfa]/55 bg-[#26164a]/92 px-2.5 py-1.5 text-[#ede9fe] shadow-[0_8px_28px_rgba(36,16,74,0.45)] backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold leading-4">
                {mcpActivity.status === "running" ? <Bot className="h-3.5 w-3.5" /> : mcpActivity.status === "completed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
                <span className="truncate">AI · {mcpActivity.clientName}</span>
              </div>
              <div className="truncate text-[10px] leading-4 text-[#ddd6fe]/78">{mcpOperationAction(mcpActivity, locale)}</div>
            </div>
          </div>
        ) : null}
        <button aria-expanded={isMenuOpen} aria-haspopup="menu" aria-label={`${tx("More options for")} ${presentation.title}`} className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-[7px] border border-white/[0.1] bg-[#151515]/86 text-white/58 backdrop-blur-md transition duration-200 hover:bg-[#292929] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/12 ${isMenuOpen ? "opacity-100" : "opacity-55 group-hover:opacity-100 group-focus-within:opacity-100"}`} onClick={onToggleMenu} ref={moreButtonRef} type="button">
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.8} />
        </button>
        {isMenuOpen ? (
          <div className="absolute right-2.5 top-12 z-30 w-44 rounded-[10px] border border-white/[0.1] bg-[#202020] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.42)]" onKeyDown={navigateMenu} ref={menuRef} role="menu">
            <button className="flex h-9 w-full items-center gap-2.5 rounded-[5px] px-2.5 text-left text-[13px] text-white/72 transition hover:bg-white/[0.07] hover:text-white" onClick={onDuplicate} role="menuitem" type="button">
              <Copy className="h-4 w-4" strokeWidth={1.7} />
              {tx("Duplicate")}
            </button>
            <button className="flex h-9 w-full items-center gap-2.5 rounded-[5px] px-2.5 text-left text-[13px] text-white/72 transition hover:bg-white/[0.07] hover:text-white" onClick={startRename} role="menuitem" type="button">
              <Pencil className="h-4 w-4" strokeWidth={1.7} />
              {tx("Rename")}
            </button>
            {canDelete ? <div className="my-1 h-px bg-white/[0.07]" /> : null}
            {canDelete ? (
              <button className="flex h-9 w-full items-center gap-2.5 rounded-[5px] px-2.5 text-left text-[13px] text-[#ff9b9b] transition hover:bg-white/[0.07]" onClick={onDelete} role="menuitem" type="button">
                <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                {tx("Delete")}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isRenaming ? (
        <form className="mt-2.5 flex items-center gap-1.5" onSubmit={submitRename}>
          <input aria-label={tx("Presentation name")} autoFocus className="h-9 min-w-0 flex-1 rounded-[6px] border border-white/[0.16] bg-[#222] px-2.5 text-[14px] text-white outline-none focus:border-white/[0.3]" maxLength={120} onChange={(event) => setDraftTitle(event.target.value)} value={draftTitle} />
          <button aria-label={tx("Save name")} className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#f1f0eb] text-[#181818] hover:bg-white" type="submit"><Check className="h-3.5 w-3.5" /></button>
          <button aria-label={tx("Cancel rename")} className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-white/[0.1] text-white/46 hover:bg-white/[0.06] hover:text-white" onClick={() => setIsRenaming(false)} type="button"><X className="h-3.5 w-3.5" /></button>
        </form>
      ) : (
        <button className="mt-3 block w-full px-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" onClick={onOpen} type="button">
          <span className={`block truncate font-medium tracking-[-0.015em] text-white/84 transition group-hover:text-white ${textSize === "large" ? "text-[17px] leading-6" : "text-[15px] leading-5"}`}>{presentation.title}</span>
          <span className={`mt-1.5 block text-white/38 ${textSize === "large" ? "text-[13px] leading-5" : "text-[11px] leading-4"}`}>{tx(presentation.kind === "template" ? "Built-in template" : "Edited")} · {formatUpdatedAt(presentation.updatedAt, locale)}</span>
        </button>
      )}
    </article>
  );
}
