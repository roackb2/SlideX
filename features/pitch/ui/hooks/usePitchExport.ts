"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { downloadFile } from "@/common/util/browserFile";
import {
  buildMotionDocHtml,
  buildMotionDocPdfHtml,
  buildMotionDocPngSvgFromSlideHtml,
  buildMotionDocRasterHtml,
  slugifyFilename
} from "@/core/motion-doc/infrastructure/export/motionDocExport";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import { parseExportSlideSelection } from "@/features/pitch/application/exportSlideSelection";

type UsePitchExportArgs = {
  canvasSource: string;
  documentTitle: string;
  setNotice: Dispatch<SetStateAction<string>>;
};

type SlideXLocalFilesWindow = Window & {
  __slidexLocalFiles?: Map<string, File>;
};

type MotionDocExportWindow = Window & {
  __motionDocExport?: {
    prepareStaticExport: () => Promise<{ slideCount: number }>;
  };
};

const HTML_EXPORT_IMAGE_MAX_DIMENSION = 4096;
const HTML_EXPORT_IMAGE_QUALITY = 0.94;
const PNG_EXPORT_HEIGHT = 1080;
const PNG_EXPORT_WIDTH = 1920;
const PNG_MULTI_DOWNLOAD_DELAY_MS = 180;

/**
 * Embed a local image with enough source pixels for fullscreen HTML playback.
 * We preserve the original bytes unless the image is larger than the export cap.
 */
async function imageFileToDataUrl(
  file: File,
  maxDimension = HTML_EXPORT_IMAGE_MAX_DIMENSION,
  quality = HTML_EXPORT_IMAGE_QUALITY
): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const largestDimension = Math.max(bitmap.width, bitmap.height);

    if (largestDimension <= maxDimension) {
      bitmap.close();
      return readFileAsDataUrl(file);
    }

    const scale = maxDimension / largestDimension;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const mimeType = imageExportMimeType(file.type);

    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await canvas.convertToBlob({ type: mimeType, quality });
        return readFileAsDataUrl(blob);
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
      return canvas.toDataURL(mimeType, quality);
    }

    bitmap.close();
  } catch {
    // Bitmap decoding can fail for some browser-supported image containers.
  }

  return readFileAsDataUrl(file);
}

function imageExportMimeType(fileType: string) {
  if (fileType === "image/jpeg" || fileType === "image/png" || fileType === "image/webp") {
    return fileType;
  }

  return "image/jpeg";
}

function readFileAsDataUrl(fileOrBlob: File | Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(fileOrBlob);
  });
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function svgToPngBlob(svg: string, width = PNG_EXPORT_WIDTH, height = PNG_EXPORT_HEIGHT): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.width = width;
    image.height = height;

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("PNG export is unavailable in this browser"));
          return;
        }

        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob((resultBlob) => {
          if (!resultBlob) {
            reject(new Error("PNG export failed"));
            return;
          }
          resolve(resultBlob);
        }, "image/png");
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("PNG render failed"));
    };

    image.src = url;
  });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export function countMotionDocSlides(source: string) {
  return parseMotionDoc(source).scenes.length;
}

function waitForIframeLoad(iframe: HTMLIFrameElement) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Export renderer timed out"));
    }, 8000);
    iframe.addEventListener("load", () => {
      window.clearTimeout(timeout);
      resolve();
    }, { once: true });
  });
}

async function waitForExportApi(frameWindow: MotionDocExportWindow) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (frameWindow.__motionDocExport?.prepareStaticExport) {
      return frameWindow.__motionDocExport;
    }
    await wait(100);
  }
  throw new Error("Export renderer unavailable");
}

async function prepareStaticExportWindow(frameWindow: MotionDocExportWindow) {
  const api = await waitForExportApi(frameWindow);
  await api.prepareStaticExport();
}

async function renderStaticSlideHtml(source: string, title: string) {
  const rasterHtml = buildMotionDocRasterHtml(source, title);
  const blob = new Blob([rasterHtml], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1024px;height:576px;pointer-events:none;opacity:0;";
  document.body.appendChild(iframe);
  iframe.src = blobUrl;

  try {
    await waitForIframeLoad(iframe);
    URL.revokeObjectURL(blobUrl);

    const frameWindow = iframe.contentWindow as MotionDocExportWindow | null;

    if (!frameWindow || !frameWindow.document) {
      throw new Error("Export renderer failed to load");
    }

    await prepareStaticExportWindow(frameWindow);

    const slides = Array.from(frameWindow.document.querySelectorAll(".slide"));
    if (slides.length === 0) {
      throw new Error("No slides to export");
    }

    return slides.map((slide) => {
      slide.classList.add("is-active");
      const html = slide.outerHTML;
      slide.classList.remove("is-active");
      return html;
    });
  } finally {
    iframe.remove();
  }
}

export function usePitchExport({
  canvasSource,
  documentTitle,
  setNotice
}: UsePitchExportArgs) {
  /**
   * Embed local blob files into base64 data URLs.
   * Used only for MDX/HTML exports that need to be self-contained offline files.
   * PDF export skips this entirely since blob URLs work same-origin.
   */
  const embedLocalFiles = async (sourceText: string) => {
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
          const dataUrl = file.type.startsWith("image/")
            ? await imageFileToDataUrl(file)
            : await readFileAsDataUrl(file);
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

  const exportMdxFile = useCallback(async (filename: string) => {
    const finalTitle = filename.trim() || documentTitle || "slidesx-deck";
    const defaultFilename = `${slugifyFilename(finalTitle)}.mdx`;

    try {
      setNotice("Preparing export…");
      const finalSource = await embedLocalFiles(canvasSource);

      downloadFile(defaultFilename, finalSource, "text/markdown;charset=utf-8");
      setNotice("MDX exported ✓");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "MDX export failed");
    }
  }, [canvasSource, documentTitle, setNotice]);

  const exportHtmlFile = useCallback(async (filename: string) => {
    const finalTitle = filename.trim() || documentTitle || "slidesx-deck";
    const defaultFilename = `${slugifyFilename(finalTitle)}.html`;

    try {
      setNotice("Preparing export…");
      const finalSource = await embedLocalFiles(canvasSource);
      const html = buildMotionDocHtml(finalSource, finalTitle);

      downloadFile(defaultFilename, html, "text/html;charset=utf-8");
      setNotice("HTML exported ✓");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "HTML export failed");
    }
  }, [canvasSource, documentTitle, setNotice]);

  const exportPdfFile = useCallback(async (filename: string) => {
    const finalTitle = (filename || documentTitle || "slidesx-deck").trim();

    try {
      setNotice("Preparing PDF…");
      const finalSource = await embedLocalFiles(canvasSource);
      const html = buildMotionDocPdfHtml(finalSource, finalTitle);

      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const printWindow = window.open(blobUrl, "_blank");

      if (!printWindow) {
        URL.revokeObjectURL(blobUrl);
        setNotice("Please allow popups to export PDF");
        return;
      }

      printWindow.onload = () => {
        window.setTimeout(() => {
          prepareStaticExportWindow(printWindow as MotionDocExportWindow)
            .then(() => {
              printWindow.document.title = finalTitle;
              printWindow.focus();
              printWindow.print();
              URL.revokeObjectURL(blobUrl);
            })
            .catch((error) => {
              URL.revokeObjectURL(blobUrl);
              printWindow.close();
              setNotice(error instanceof Error ? error.message : "PDF export failed");
            });
        }, 800);
      };

      setNotice("PDF prepared ✓");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "PDF export failed");
    }
  }, [canvasSource, documentTitle, setNotice]);

  const exportPngFile = useCallback(async (filename: string, slideSelectionStr?: string) => {
    const finalTitle = (filename || documentTitle || "slidesx-deck").trim();

    try {
      const slideCount = countMotionDocSlides(canvasSource);
      const selection = parseExportSlideSelection(slideSelectionStr || "all", slideCount);

      if (!selection) {
        setNotice("Invalid slide selection");
        return;
      }

      const filenamePrefix = slugifyFilename(finalTitle);

      setNotice("Preparing PNG…");
      const finalSource = await embedLocalFiles(canvasSource);
      const slideHtmlList = await renderStaticSlideHtml(finalSource, finalTitle);

      for (let exportIndex = 0; exportIndex < selection.indices.length; exportIndex += 1) {
        const slideIndex = selection.indices[exportIndex];
        const slideNumber = String(slideIndex + 1).padStart(2, "0");
        const pngFilename = slideHtmlList.length === 1
          ? `${filenamePrefix}.png`
          : `${filenamePrefix}-${slideNumber}.png`;
        const svg = buildMotionDocPngSvgFromSlideHtml(
          slideHtmlList[slideIndex],
          slideHtmlList.length === 1 ? finalTitle : `${finalTitle} ${slideNumber}`
        );
        const pngBlob = await svgToPngBlob(svg);

        setNotice(`Exporting PNG ${exportIndex + 1}/${selection.indices.length}…`);
        downloadBlob(pngFilename, pngBlob);

        if (selection.indices.length > 1) {
          await wait(PNG_MULTI_DOWNLOAD_DELAY_MS);
        }
      }

      setNotice(selection.indices.length === 1 ? "PNG exported ✓" : `${selection.label} exported as PNG ✓`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "PNG export failed");
    }
  }, [canvasSource, documentTitle, setNotice]);

  return {
    copySource,
    exportHtmlFile,
    exportMdxFile,
    exportPdfFile,
    exportPngFile
  };
}
