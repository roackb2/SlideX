"use client";

import { TemplateModal } from "@/features/pitch/ui/TemplateModal";
import type { PitchWorkspaceProps } from "@/features/pitch/ui/workspace/PitchWorkspaceTypes";

type WorkspaceTemplateDialogProps = Pick<PitchWorkspaceProps, "commands" | "document" | "view">;

export function WorkspaceTemplateDialog({ commands, document, view }: WorkspaceTemplateDialogProps) {
  if (!view.isTemplateModalOpen) return null;

  return (
    <TemplateModal
      onAddBlankSlide={() => {
        commands.addSlide();
        view.setIsTemplateModalOpen(false);
      }}
      onApplyTemplate={commands.applyTemplate}
      onClose={() => view.setIsTemplateModalOpen(false)}
      selectedTemplateId={document.selectedTemplateId}
    />
  );
}
