"use client";

import { TemplateModal } from "@/features/studio/ui/TemplateModal";
import type { StudioWorkspaceProps } from "@/features/studio/ui/workspace/StudioWorkspaceTypes";

type WorkspaceTemplateDialogProps = Pick<
  StudioWorkspaceProps,
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
