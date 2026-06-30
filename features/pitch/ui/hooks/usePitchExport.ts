"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { downloadFile } from "@/common/util/browserFile";
import { buildMotionDocHtml, buildMotionDocPdfHtml, slugifyFilename } from "@/core/motion-doc/infrastructure/export/motionDocExport";

type UsePitchExportArgs = {
  canvasSource: string;
  documentTitle: string;
  setIsExportMenuOpen: Dispatch<SetStateAction<boolean>>;
  setNotice: Dispatch<SetStateAction<string>>;
};

type SlideXLocalFilesWindow = Window & {
  __slidexLocalFiles?: Map<string, File>;
};

/**
 * Compress an image File to JPEG via OffscreenCanvas.
 * Returns a data URL string. Falls back to raw base64 if OffscreenCanvas is unavailable.
 */
async function compressImageToDataUrl(file: File, maxWidth = 1920, quality = 0.85): Promise<string> {
  // Fast path: if the file is already small (<200KB), just read as-is
  if (file.size < 200 * 1024) {
    return readFileAsDataUrl(file);
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    // Use OffscreenCanvas for non-blocking compression
    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
        return readFileAsDataUrl(blob);
      }
    }

    // Fallback: use regular canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
      return canvas.toDataURL("image/jpeg", quality);
    }

    bitmap.close();
  } catch {
    // Compression failed, fall back to raw data URL
  }

  return readFileAsDataUrl(file);
}

function readFileAsDataUrl(fileOrBlob: File | Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}

export function usePitchExport({
  canvasSource,
  documentTitle,
  setIsExportMenuOpen,
  setNotice
}: UsePitchExportArgs) {
  /**
   * Embed and compress local blob images into base64 data URLs.
   * Used only for MDX/HTML exports that need to be self-contained offline files.
   * PDF export skips this entirely since blob URLs work same-origin.
   */
  const embedAndCompressLocalFiles = async (sourceText: string) => {
    const localFiles = (window as SlideXLocalFilesWindow).__slidexLocalFiles;
    if (!localFiles) return sourceText;
    
    const blobRegex = /src="(blob:[^"]+)"/g;
    const matches = [...sourceText.matchAll(blobRegex)];
    if (matches.length === 0) return sourceText;

    const replacements = new Map<string, string>();

    await Promise.all(
      matches.map(async (match) => {
        const url = match[1];
        if (replacements.has(url)) return;
        const file = localFiles.get(url);
        if (!file) return;
        try {
          const dataUrl = await compressImageToDataUrl(file);
          replacements.set(url, dataUrl);
        } catch (e) {
          console.warn("Failed to embed local file", url, e);
        }
      })
    );

    if (replacements.size === 0) return sourceText;

    return sourceText.replace(/blob:[^"]+/g, (match) => replacements.get(match) ?? match);
  };

  const copySource = useCallback(async () => {
    if (!navigator.clipboard) {
      setNotice("Clipboard unavailable");
      return;
    }

    await navigator.clipboard.writeText(canvasSource);
    setNotice("Source copied");
  }, [canvasSource, setNotice]);

  const exportMdxFile = useCallback(async () => {
    const title = documentTitle || "slidesx-deck";
    const userFilename = window.prompt("Enter export filename (without extension):", title);
    if (userFilename === null) {
      setIsExportMenuOpen(false);
      return;
    }
    
    const finalTitle = userFilename.trim() || title;
    const defaultFilename = `${slugifyFilename(finalTitle)}.mdx`;

    try {
      setNotice("Preparing export...");
      const finalSource = await embedAndCompressLocalFiles(canvasSource);

      downloadFile(defaultFilename, finalSource, "text/markdown;charset=utf-8");
      setIsExportMenuOpen(false);
      setNotice("MDX exported");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "MDX export failed");
    }
  }, [canvasSource, documentTitle, setIsExportMenuOpen, setNotice]);

  const exportHtmlFile = useCallback(async () => {
    const title = documentTitle || "slidesx-deck";
    const userFilename = window.prompt("Enter export filename (without extension):", title);
    if (userFilename === null) {
      setIsExportMenuOpen(false);
      return;
    }
    
    const finalTitle = userFilename.trim() || title;
    const defaultFilename = `${slugifyFilename(finalTitle)}.html`;

    try {
      setNotice("Preparing export...");
      const finalSource = await embedAndCompressLocalFiles(canvasSource);
      const html = buildMotionDocHtml(finalSource, finalTitle);

      downloadFile(defaultFilename, html, "text/html;charset=utf-8");
      setIsExportMenuOpen(false);
      setNotice("HTML exported");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "HTML export failed");
    }
  }, [canvasSource, documentTitle, setIsExportMenuOpen, setNotice]);

  const exportPdfFile = useCallback(async () => {
    const title = documentTitle || "slidesx-deck";
    const finalTitle = title.trim();

    try {
      setNotice("Preparing PDF...");

      // PDF uses same-origin blob URLs directly — no base64 conversion needed.
      // This is the key performance optimization: skip the entire image embedding step.
      const html = buildMotionDocPdfHtml(canvasSource, finalTitle);

      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const printWindow = window.open(blobUrl, "_blank");

      if (!printWindow) {
        URL.revokeObjectURL(blobUrl);
        setNotice("Please allow popups to export PDF");
        setIsExportMenuOpen(false);
        return;
      }

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.document.title = finalTitle;
          printWindow.print();
          URL.revokeObjectURL(blobUrl);
        }, 800);
      };

      setIsExportMenuOpen(false);
      setNotice("PDF prepared");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "PDF export failed");
    }
  }, [canvasSource, documentTitle, setIsExportMenuOpen, setNotice]);

  return {
    copySource,
    exportHtmlFile,
    exportMdxFile,
    exportPdfFile
  };
}
