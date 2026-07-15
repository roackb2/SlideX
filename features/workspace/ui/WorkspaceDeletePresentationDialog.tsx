"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle, LoaderCircle, Trash2, X } from "lucide-react";
import { canConfirmPresentationDeletion } from "@/features/workspace/application/presentationDeletion";
import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";
import { useWorkspaceI18n } from "@/features/workspace/ui/workspaceI18n";

type WorkspaceDeletePresentationDialogProps = {
  error?: string | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  presentation: WorkspacePresentation;
};

export function WorkspaceDeletePresentationDialog({
  error,
  isDeleting,
  onCancel,
  onConfirm,
  presentation
}: WorkspaceDeletePresentationDialogProps) {
  const { tx } = useWorkspaceI18n();
  const [confirmation, setConfirmation] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canDelete = canConfirmPresentationDeletion(confirmation, presentation.title) && !isDeleting;

  useEffect(() => {
    setConfirmation("");
  }, [presentation.id]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canDelete) onConfirm();
  }

  return (
    <AlertDialog.Root
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel();
      }}
      open
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[90] bg-black/74 backdrop-blur-[9px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <AlertDialog.Content
          aria-describedby="workspace-delete-presentation-description"
          className="fixed left-1/2 top-1/2 z-[91] w-[calc(100%-2rem)] max-w-[470px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[14px] border border-white/[0.12] bg-[#191919] text-[#f2f2ef] shadow-[0_32px_100px_rgba(0,0,0,0.66)] outline-none"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <form onSubmit={submit}>
            <div className="flex items-start gap-4 border-b border-white/[0.08] px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-red-300/15 bg-red-300/[0.07] text-[#ff9b9b]">
                <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={1.7} />
              </div>
              <div className="min-w-0 pr-8">
                <AlertDialog.Title className="text-[18px] font-medium leading-6 tracking-[-0.015em] text-white/92">
                  {tx("Delete presentation?")}
                </AlertDialog.Title>
                <AlertDialog.Description className="mt-1.5 max-w-[42ch] text-[13px] leading-5 text-white/46" id="workspace-delete-presentation-description">
                  {tx("This permanently deletes the presentation and all of its uploaded images. This action cannot be undone.")}
                </AlertDialog.Description>
              </div>
              <AlertDialog.Cancel asChild>
                <button
                  aria-label={tx("Close delete dialog")}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-[7px] text-white/36 transition hover:bg-white/[0.06] hover:text-white/72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/22 disabled:pointer-events-none disabled:opacity-30"
                  disabled={isDeleting}
                  type="button"
                >
                  <X className="h-4 w-4" strokeWidth={1.7} />
                </button>
              </AlertDialog.Cancel>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <p className="text-[12px] leading-5 text-white/52">{tx("To confirm, click the presentation name or type it exactly as shown.")}</p>
              <button
                aria-label={tx("Use presentation name to confirm deletion")}
                className="mt-2.5 block w-full overflow-hidden rounded-[7px] border border-white/[0.08] bg-[#141414] px-3 py-2.5 text-left font-mono text-[12px] leading-5 text-white/72 transition hover:border-white/[0.2] hover:bg-white/[0.04] hover:text-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-wait disabled:opacity-60"
                disabled={isDeleting}
                onClick={() => {
                  setConfirmation(presentation.title);
                  inputRef.current?.focus();
                }}
                type="button"
              >
                <span className="block truncate">{presentation.title}</span>
              </button>
              <label className="mt-4 block">
                <span className="sr-only">{tx("Presentation name confirmation")}</span>
                <input
                  autoComplete="off"
                  className="h-10 w-full rounded-[7px] border border-white/[0.12] bg-[#222] px-3 text-[13px] text-white/88 outline-none transition placeholder:text-white/24 focus:border-white/[0.28] focus:ring-2 focus:ring-white/[0.06] disabled:cursor-wait disabled:opacity-60"
                  disabled={isDeleting}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder={tx("Type the presentation name")}
                  ref={inputRef}
                  spellCheck={false}
                  value={confirmation}
                />
              </label>
              {error ? <p className="mt-3 text-[12px] leading-5 text-[#ffabab]" role="alert">{tx(error)}</p> : null}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] bg-[#161616] px-5 py-4 sm:px-6">
              <AlertDialog.Cancel asChild>
                <button
                  className="h-9 rounded-[7px] px-3.5 text-[12px] font-medium text-white/52 transition hover:bg-white/[0.06] hover:text-white/82 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/22 disabled:pointer-events-none disabled:opacity-30"
                  disabled={isDeleting}
                  type="button"
                >
                  {tx("Cancel")}
                </button>
              </AlertDialog.Cancel>
              <button
                className="inline-flex h-9 min-w-[142px] items-center justify-center gap-2 rounded-[7px] bg-[#d85959] px-3.5 text-[12px] font-semibold text-white transition hover:bg-[#e06464] active:translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300/16 disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-white/26"
                disabled={!canDelete}
                type="submit"
              >
                {isDeleting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} /> : <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />}
                {tx(isDeleting ? "Deleting…" : "Delete presentation")}
              </button>
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
