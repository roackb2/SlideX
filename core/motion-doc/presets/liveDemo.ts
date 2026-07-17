import {
  launchDeckPresentationSource,
  launchDeckPresentationSourceZhTw
} from "@/core/motion-doc/presets/launchDeck";

export const liveDemoPresentationTemplateId = "launch-deck";

export function liveDemoPresentation(locale: "en" | "zh-TW") {
  return locale === "zh-TW"
    ? {
        id: "slidex-live-demo-launch-v7-zh-tw",
        source: launchDeckPresentationSourceZhTw,
        templateId: liveDemoPresentationTemplateId,
        title: "產品發布簡報"
      }
    : {
        id: "slidex-live-demo-launch-v6",
        source: launchDeckPresentationSource,
        templateId: liveDemoPresentationTemplateId,
        title: "Launch Deck"
      };
}
