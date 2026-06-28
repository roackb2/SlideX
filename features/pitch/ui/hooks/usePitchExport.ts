"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { downloadFile } from "@/common/util/browserFile";
import { buildMotionDocHtml, slugifyFilename } from "@/core/motion-doc/infrastructure/export/motionDocExport";

type UsePitchExportArgs = {
  canvasSource: string;
  documentTitle: string;
  setIsExportMenuOpen: Dispatch<SetStateAction<boolean>>;
  setNotice: Dispatch<SetStateAction<string>>;
};

export function usePitchExport({
  canvasSource,
  documentTitle,
  setIsExportMenuOpen,
  setNotice
}: UsePitchExportArgs) {
  const embedLocalFiles = async (sourceText: string) => {
    const localFiles = (window as any).__slidexLocalFiles as Map<string, File> | undefined;
    if (!localFiles) return sourceText;
    
    let result = sourceText;
    const blobRegex = /src="(blob:[^"]+)"/g;
    const matches = [...sourceText.matchAll(blobRegex)];
    
    for (const match of matches) {
      const url = match[1];
      const file = localFiles.get(url);
      if (file) {
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          result = result.replace(url, base64);
        } catch (e) {
          console.warn("Failed to embed local file", url, e);
        }
      }
    }
    return result;
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
      return; // User cancelled
    }
    
    const finalTitle = userFilename.trim() || title;
    const defaultFilename = `${slugifyFilename(finalTitle)}.mdx`;

    try {
      setNotice("Preparing export...");
      const finalSource = await embedLocalFiles(canvasSource);

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
      return; // User cancelled
    }
    
    const finalTitle = userFilename.trim() || title;
    const defaultFilename = `${slugifyFilename(finalTitle)}.html`;

    try {
      setNotice("Preparing export...");
      const finalSource = await embedLocalFiles(canvasSource);
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
      const finalSource = await embedLocalFiles(canvasSource);
      const html = buildMotionDocHtml(finalSource, finalTitle);

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setNotice("Please allow popups to export PDF");
        setIsExportMenuOpen(false);
        return;
      }

      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.document.title = finalTitle;
          printWindow.print();
        }, 500); // Wait for fonts and images
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
