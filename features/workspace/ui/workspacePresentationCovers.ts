import { welcomePresentationId } from "@/core/motion-doc/presets/welcomeToSlideX";

export function workspacePresentationCoverPath(templateId?: string) {
  return templateId === welcomePresentationId
    ? "/images/workspace-welcome/welcome-to-slidex.svg"
    : null;
}
