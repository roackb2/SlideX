import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { Check, Copy, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import {
  canDeleteWorkspacePresentation,
  type WorkspacePresentation
} from "@/features/workspace/domain/presentation";
import { workspacePresentationCoverPath } from "@/features/workspace/ui/workspacePresentationCovers";

type WorkspacePresentationCardProps = {
  isMenuOpen: boolean;
  onDelete?: () => void;
  onDuplicate: () => void;
  onOpen: () => void;
  onRename: (title: string) => void;
  onToggleMenu: () => void;
  presentation: WorkspacePresentation;
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const elapsedMinutes = Math.round((date.getTime() - Date.now()) / 60_000);
  if (Math.abs(elapsedMinutes) < 60) return formatter.format(elapsedMinutes, "minute");
  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (Math.abs(elapsedHours) < 24) return formatter.format(elapsedHours, "hour");
  const elapsedDays = Math.round(elapsedHours / 24);
  if (Math.abs(elapsedDays) < 30) return formatter.format(elapsedDays, "day");
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function PresentationArtwork({ presentation }: { presentation: WorkspacePresentation }) {
  const coverPath = workspacePresentationCoverPath(presentation.templateId);

  if (coverPath) {
    return (
      <div className="relative aspect-video bg-[#242424]">
        <Image alt={`${presentation.title} cover`} className="object-cover" fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" src={coverPath} />
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden bg-[#272727] p-[8%]">
      <Image alt="SlideX" className="h-auto w-[20%] object-contain opacity-45" height={72} src="/logo.png" width={260} />
      <div className="absolute bottom-[12%] left-[8%] max-w-[76%] text-[clamp(15px,1.8vw,24px)] font-medium leading-[0.98] tracking-[-0.04em] text-white/86">{presentation.title}</div>
    </div>
  );
}

export function WorkspacePresentationCard({ isMenuOpen, onDelete, onDuplicate, onOpen, onRename, onToggleMenu, presentation }: WorkspacePresentationCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(presentation.title);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const canDelete = canDeleteWorkspacePresentation(presentation) && Boolean(onDelete);

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
    <article className="group relative">
      <div className="relative" ref={menuContainerRef}>
        <button className="block w-full overflow-hidden rounded-[8px] border border-white/[0.1] bg-[#242424] text-left transition duration-200 hover:border-white/[0.22] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/10" onClick={onOpen} type="button">
          <PresentationArtwork presentation={presentation} />
        </button>
        <button aria-expanded={isMenuOpen} aria-haspopup="menu" aria-label={`More options for ${presentation.title}`} className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/[0.11] bg-[#151515]/90 text-white/62 transition hover:bg-[#222] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/12 ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"}`} onClick={onToggleMenu} ref={moreButtonRef} type="button">
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.8} />
        </button>
        {isMenuOpen ? (
          <div className="absolute right-2 top-10 z-30 w-44 rounded-[8px] border border-white/[0.1] bg-[#202020] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.42)]" onKeyDown={navigateMenu} ref={menuRef} role="menu">
            <button className="flex h-9 w-full items-center gap-2.5 rounded-[5px] px-2.5 text-left text-[13px] text-white/72 transition hover:bg-white/[0.07] hover:text-white" onClick={onDuplicate} role="menuitem" type="button">
              <Copy className="h-4 w-4" strokeWidth={1.7} />
              Duplicate
            </button>
            <button className="flex h-9 w-full items-center gap-2.5 rounded-[5px] px-2.5 text-left text-[13px] text-white/72 transition hover:bg-white/[0.07] hover:text-white" onClick={startRename} role="menuitem" type="button">
              <Pencil className="h-4 w-4" strokeWidth={1.7} />
              Rename
            </button>
            {canDelete ? <div className="my-1 h-px bg-white/[0.07]" /> : null}
            {canDelete ? (
              <button className="flex h-9 w-full items-center gap-2.5 rounded-[5px] px-2.5 text-left text-[13px] text-[#ff9b9b] transition hover:bg-white/[0.07]" onClick={onDelete} role="menuitem" type="button">
                <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isRenaming ? (
        <form className="mt-2.5 flex items-center gap-1.5" onSubmit={submitRename}>
          <input aria-label="Presentation name" autoFocus className="h-9 min-w-0 flex-1 rounded-[6px] border border-white/[0.16] bg-[#222] px-2.5 text-[14px] text-white outline-none focus:border-white/[0.3]" maxLength={120} onChange={(event) => setDraftTitle(event.target.value)} value={draftTitle} />
          <button aria-label="Save name" className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#f1f0eb] text-[#181818] hover:bg-white" type="submit"><Check className="h-3.5 w-3.5" /></button>
          <button aria-label="Cancel rename" className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-white/[0.1] text-white/46 hover:bg-white/[0.06] hover:text-white" onClick={() => setIsRenaming(false)} type="button"><X className="h-3.5 w-3.5" /></button>
        </form>
      ) : (
        <button className="mt-2.5 block w-full px-0.5 text-left" onClick={onOpen} type="button">
          <span className="block truncate text-[15px] font-medium leading-5 text-white/82 transition group-hover:text-white">{presentation.title}</span>
          <span className="mt-1 block text-[12px] leading-4 text-white/34">{presentation.kind === "template" ? "Built-in template · " : "Edited "}{formatUpdatedAt(presentation.updatedAt)}</span>
        </button>
      )}
    </article>
  );
}
