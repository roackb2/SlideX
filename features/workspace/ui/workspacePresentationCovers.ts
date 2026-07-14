import { launchDeckPresentationId } from "@/core/motion-doc/presets/launchDeck";
import { welcomePresentationId } from "@/core/motion-doc/presets/welcomeToSlideX";

export function workspacePresentationCoverPath(templateId?: string) {
  if (templateId === welcomePresentationId) {
    return "/images/workspace-welcome/welcome-to-slidex.svg";
  }
  if (templateId === launchDeckPresentationId) {
    return "/images/workspace-welcome/launch-deck.svg";
  }
  return null;
}
