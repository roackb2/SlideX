"use client";

import { TemplateModal } from "@/features/pitch/ui/TemplateModal";
import type { PitchWorkspaceProps } from "@/features/pitch/ui/workspace/PitchWorkspaceTypes";

type WorkspaceTemplateDialogProps = Pick<
  PitchWorkspaceProps,
  "addSlide" | "applyTemplate" | "isTemplateModalOpen" | "selectedTemplateId" | "setIsTemplateModalOpen"
>;

export function WorkspaceTemplateDialog({
  addSlide,
  applyTemplate,
  isTemplateModalOpen,
  selectedTemplateId,
  setIsTemplateModalOpen
}: WorkspaceTemplateDialogProps) {
  if (!isTemplateModalOpen) {
    return null;
  }

  return (
    <TemplateModal
      onAddBlankSlide={() => {
        addSlide();
        setIsTemplateModalOpen(false);
      }}
      onApplyTemplate={applyTemplate}
      onClose={() => setIsTemplateModalOpen(false)}
      selectedTemplateId={selectedTemplateId}
    />
  );
}
