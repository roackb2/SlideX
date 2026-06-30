"use client";

import { useEffect } from "react";
import { getGoogleFontUrl } from "@/features/pitch/application/googleFonts";

const loadedFonts = new Set<string>();

export function useDynamicFont(fontFamily: string | undefined | null) {
  useEffect(() => {
    if (!fontFamily || typeof document === "undefined") {
      return;
    }

    const url = getGoogleFontUrl(fontFamily);
    if (!url || loadedFonts.has(fontFamily)) {
      return;
    }

    // Check if link already exists in the DOM
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) {
      loadedFonts.add(fontFamily);
      return;
    }

    // Create and append new link tag
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
    loadedFonts.add(fontFamily);
  }, [fontFamily]);
}
