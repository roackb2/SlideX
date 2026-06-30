import type { Locale } from "@/common/lib/i18n";
import { getBrieflyCopy } from "@/features/briefly/application/brieflyCopy";
import type { LeftTool } from "@/features/briefly/ui/builder/types";

export function getDesktopGridClass(leftDrawerOpen: boolean, inspectorVisible: boolean) {
  if (leftDrawerOpen && inspectorVisible) {
    return "grid-cols-[56px_320px_minmax(0,1fr)_360px]";
  }

  if (leftDrawerOpen) {
    return "grid-cols-[56px_320px_minmax(0,1fr)]";
  }

  if (inspectorVisible) {
    return "grid-cols-[56px_minmax(0,1fr)_360px]";
  }

  return "grid-cols-[56px_minmax(0,1fr)]";
}

export function getLeftToolLabel(tool: LeftTool, locale: Locale) {
  return getBrieflyCopy(locale).builder.tools[tool].label;
}

export function getLeftToolTitle(tool: LeftTool, locale: Locale) {
  return getBrieflyCopy(locale).builder.tools[tool].title;
}
