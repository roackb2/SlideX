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
      if (isTauri) {
        const path = await exportSlidexFile({
          content: canvasSource,
          defaultFilename,
          extension: "mdx"
        });

        setIsExportMenuOpen(false);
        setNotice(path ? "MDX exported" : "Export canceled");
        return;
      }

      downloadFile(defaultFilename, canvasSource, "text/markdown;charset=utf-8");
      setIsExportMenuOpen(false);
      setNotice("MDX exported");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "MDX export failed");
    }
  }, [canvasSource, documentTitle, isTauri, setIsExportMenuOpen, setNotice]);

  const exportHtmlFile = useCallback(async () => {
    const title = documentTitle || "slidesx-deck";
    const defaultFilename = `${slugifyFilename(title)}.html`;
    const html = buildMotionDocHtml(canvasSource);

    try {
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
