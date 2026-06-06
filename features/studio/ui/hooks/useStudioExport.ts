"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { downloadFile } from "@/common/util/browserFile";
import { buildMotionDocHtml, slugifyFilename } from "@/core/motion-doc/infrastructure/export/motionDocExport";
import { exportSlidexFile } from "@/features/studio/infrastructure/tauriProject";

type UseStudioExportArgs = {
  canvasSource: string;
  documentTitle: string;
  isTauri: boolean;
  setIsExportMenuOpen: Dispatch<SetStateAction<boolean>>;
  setNotice: Dispatch<SetStateAction<string>>;
};

export function useStudioExport({
  canvasSource,
  documentTitle,
  isTauri,
  setIsExportMenuOpen,
  setNotice
}: UseStudioExportArgs) {
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
    const defaultFilename = `${slugifyFilename(title)}.mdx`;

    try {
      setNotice("Preparing export...");
      const finalSource = await embedLocalFiles(canvasSource);

      if (isTauri) {
        const path = await exportSlidexFile({
          content: finalSource,
          defaultFilename,
          extension: "mdx"
        });

        setIsExportMenuOpen(false);
        setNotice(path ? "MDX exported" : "Export canceled");
        return;
      }

      downloadFile(defaultFilename, finalSource, "text/markdown;charset=utf-8");
      setIsExportMenuOpen(false);
      setNotice("MDX exported");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "MDX export failed");
    }
  }, [canvasSource, documentTitle, isTauri, setIsExportMenuOpen, setNotice]);

  const exportHtmlFile = useCallback(async () => {
    const title = documentTitle || "slidesx-deck";
    const defaultFilename = `${slugifyFilename(title)}.html`;

    try {
      setNotice("Preparing export...");
      const finalSource = await embedLocalFiles(canvasSource);
      const html = buildMotionDocHtml(finalSource);

      if (isTauri) {
        const path = await exportSlidexFile({
          content: html,
          defaultFilename,
          extension: "html"
        });

        setIsExportMenuOpen(false);
        setNotice(path ? "HTML exported" : "Export canceled");
        return;
      }

      downloadFile(defaultFilename, html, "text/html;charset=utf-8");
      setIsExportMenuOpen(false);
      setNotice("HTML exported");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "HTML export failed");
    }
  }, [canvasSource, documentTitle, isTauri, setIsExportMenuOpen, setNotice]);

  return {
    copySource,
    exportHtmlFile,
    exportMdxFile
  };
}

