"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { downloadFile } from "@/common/util/browserFile";
import {
  buildMotionDocHtml,
  buildMotionDocPngSvgFromSlideHtml,
  buildMotionDocRasterHtml,
  slugifyFilename
} from "@/core/motion-doc/infrastructure/export/motionDocExport";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import { youtubeVideoId } from "@/core/motion-doc/domain/videoSource";
import { parseExportSlideSelection } from "@/features/pitch/application/exportSlideSelection";
import {
  addEditableSlides,
  pptxRasterRequirements
} from "@/features/pitch/infrastructure/editablePptxExport";
import { createPptxPresentation } from "@/features/pitch/infrastructure/pptxBrowser";
import { renderPptxRasterAssets } from "@/features/pitch/infrastructure/pptxRasterExport";

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
const PNG_SLIDE_HTML_SEPARATOR = "\n<!-- slidex-png-slide-boundary -->\n";
const PNG_DESKTOP_DOWNLOAD_DELAY_MS = 30;
const PNG_MOBILE_DOWNLOAD_DELAY_MS = 80;
const PPTX_EMBEDDED_VIDEO_MAX_BYTES = 80 * 1024 * 1024;
const STATIC_EXPORT_API_MAX_ATTEMPTS = 120;
const STATIC_EXPORT_RENDERER_LOAD_TIMEOUT_MS = 30_000;
const REMOTE_VIDEO_EMBED_HOSTS = new Set([
  "animark-media-library.zz41354899.chatgpt.site",
  "interactive-examples.mdn.mozilla.net",
  "www.w3schools.com"
]);

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

async function remoteImageToDataUrl(url: string) {
  const response = await fetch(url, { mode: "cors", credentials: "omit" });

  if (!response.ok) {
    throw new Error(`Image request failed (${response.status})`);
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("URL did not return an image");
  }

  return readFileAsDataUrl(blob);
}

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number;
};

function getExportDeviceProfile() {
  const navigatorWithMemory = navigator as NavigatorWithDeviceMemory;
  const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
  const deviceMemory = navigatorWithMemory.deviceMemory ?? (isMobileViewport ? 4 : 8);
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const isLowMemory = deviceMemory <= 4;
  const isLowConcurrency = hardwareConcurrency <= 4;

  return {
    mediaConcurrency: isMobileViewport || isLowMemory
      ? 2
      : Math.min(4, Math.max(2, Math.floor(hardwareConcurrency / 2))),
    pngConcurrency: isLowMemory || isLowConcurrency
      ? 1
      : isMobileViewport
        ? 2
        : Math.min(3, Math.max(2, Math.floor(hardwareConcurrency / 4))),
    pngDownloadDelayMs: isMobileViewport ? PNG_MOBILE_DOWNLOAD_DELAY_MS : PNG_DESKTOP_DOWNLOAD_DELAY_MS
  };
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(Math.max(1, concurrency), items.length) }, () => worker())
  );

  return results;
}

async function embedRemoteImages(sourceText: string) {
  const imageSourcePattern = /<ImageBlock\b[^>]*?\bsrc\s*=\s*(["'])(https?:\/\/[^"'<>]+)\1/gi;
  const urls = [...new Set([...sourceText.matchAll(imageSourcePattern)].map((match) => match[2]))];
  if (urls.length === 0) return sourceText;

  const replacements = new Map<string, string>();
  const { mediaConcurrency } = getExportDeviceProfile();

  const dataUrls = await mapWithConcurrency(urls, mediaConcurrency, async (url) => {
    try {
      return await remoteImageToDataUrl(url);
    } catch {
      let hostname = url;
      try {
        hostname = new URL(url).hostname;
      } catch {
        // Keep the original value when URL parsing fails.
      }
      throw new Error(`Cannot export image from ${hostname}. Re-upload the image from your device, or use an image host that allows CORS.`);
    }
  });

  urls.forEach((url, index) => replacements.set(url, dataUrls[index]));

  return sourceText.replace(imageSourcePattern, (attribute, _quote: string, url: string) => (
    attribute.replace(url, replacements.get(url) ?? url)
  ));
}

async function embedRootRelativeVideos(sourceText: string) {
  const videoSourcePattern = /<VideoBlock\b[^>]*?\bsrc\s*=\s*(["'])(\/(?!\/)[^"'<>]+)\1/gi;
  const paths = [...new Set([...sourceText.matchAll(videoSourcePattern)].map((match) => match[2]))];
  if (paths.length === 0) return sourceText;

  const replacements = new Map<string, string>();
  const { mediaConcurrency } = getExportDeviceProfile();
  const dataUrls = await mapWithConcurrency(paths, mediaConcurrency, async (path) => {
    const response = await fetch(new URL(path, window.location.origin));
    if (!response.ok) throw new Error(`Cannot export bundled video ${path}. Reload SlideX and try again.`);
    const blob = await response.blob();
    if (!blob.type.startsWith("video/")) throw new Error(`Bundled media ${path} is not a supported video.`);
    return readFileAsDataUrl(blob);
  });

  paths.forEach((path, index) => replacements.set(path, dataUrls[index]));

  return sourceText.replace(videoSourcePattern, (attribute, _quote: string, path: string) => (
    attribute.replace(path, replacements.get(path) ?? path)
  ));
}

async function embedRemoteVideos(sourceText: string) {
  const videoSourcePattern = /<VideoBlock\b[^>]*?\bsrc\s*=\s*(["'])(https?:\/\/[^"'<>]+)\1/gi;
  const urls = [...new Set([...sourceText.matchAll(videoSourcePattern)].map((match) => match[2]))];
  if (urls.length === 0) return sourceText;

  const replacements = new Map<string, string>();
  const embeddableUrls = urls.filter((url) => !youtubeVideoId(url) && canEmbedRemoteVideo(url));
  const { mediaConcurrency } = getExportDeviceProfile();
  const dataUrls = await mapWithConcurrency(embeddableUrls, mediaConcurrency, async (url) => {
    try {
      const response = await fetch(url, { mode: "cors", credentials: "omit" });
      if (!response.ok) return null;
      const blob = await response.blob();
      if (!blob.type.startsWith("video/") || blob.size > PPTX_EMBEDDED_VIDEO_MAX_BYTES) return null;
      return readFileAsDataUrl(blob);
    } catch {
      // The SVG playback cover keeps the remote URL usable when embedding is blocked.
      return null;
    }
  });

  embeddableUrls.forEach((url, index) => {
    const dataUrl = dataUrls[index];
    if (dataUrl) replacements.set(url, dataUrl);
  });

  return sourceText.replace(videoSourcePattern, (attribute, _quote: string, url: string) => {
    const data = replacements.get(url);
    if (!data) return attribute;
    return `${attribute.replace(url, data)} sourceUrl="${escapeMotionDocAttribute(url)}"`;
  });
}

function canEmbedRemoteVideo(value: string) {
  try {
    return REMOTE_VIDEO_EMBED_HOSTS.has(new URL(value).hostname.toLowerCase());
  } catch {
    return false;
  }
}

function escapeMotionDocAttribute(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("\"", "&quot;");
}

function assertPortableVideoSources(sourceText: string) {
  const unavailableLocalVideo = /<VideoBlock\b[^>]*?\bsrc\s*=\s*(["'])blob:[^"'<>]+\1/i.test(sourceText);

  if (unavailableLocalVideo) {
    throw new Error("A local video is no longer available. Re-import it before exporting HTML.");
  }
}

async function embedRootRelativeImages(sourceText: string) {
  const imageSourcePattern = /<ImageBlock\b[^>]*?\bsrc\s*=\s*(["'])(\/(?!\/)[^"'<>]+)\1/gi;
  const paths = [...new Set(
    [...sourceText.matchAll(imageSourcePattern)]
      .map((match) => match[2])
      .filter((path): path is string => Boolean(path))
  )];
  if (paths.length === 0) return sourceText;

  const replacements = new Map<string, string>();
  const { mediaConcurrency } = getExportDeviceProfile();
  const dataUrls = await mapWithConcurrency(paths, mediaConcurrency, async (path) => {
    try {
      const browserUrl = new URL(path, window.location.origin).toString();
      return await remoteImageToDataUrl(browserUrl);
    } catch {
      throw new Error(`Cannot export bundled image ${path}. Reload SlideX and try again.`);
    }
  });

  paths.forEach((path, index) => replacements.set(path, dataUrls[index]));

  return sourceText.replace(imageSourcePattern, (attribute, _quote: string, path: string) => (
    attribute.replace(path, replacements.get(path) ?? path)
  ));
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
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
          canvas.width = 1;
          canvas.height = 1;
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
    }, STATIC_EXPORT_RENDERER_LOAD_TIMEOUT_MS);
    iframe.addEventListener("load", () => {
      window.clearTimeout(timeout);
      resolve();
    }, { once: true });
  });
}

async function waitForExportApi(frameWindow: MotionDocExportWindow) {
  for (let attempt = 0; attempt < STATIC_EXPORT_API_MAX_ATTEMPTS; attempt += 1) {
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

async function renderStaticSlideHtml(source: string, title: string, slideIndices: readonly number[]) {
  const rasterHtml = buildMotionDocRasterHtml(source, title, slideIndices);
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1024px;height:576px;pointer-events:none;opacity:0;";
  document.body.appendChild(iframe);
  const iframeLoad = waitForIframeLoad(iframe);
  iframe.srcdoc = rasterHtml;

  try {
    await iframeLoad;

    const frameWindow = iframe.contentWindow as MotionDocExportWindow | null;

    if (!frameWindow || !frameWindow.document) {
      throw new Error("Export renderer failed to load");
    }

    const slides = Array.from(frameWindow.document.querySelectorAll<HTMLElement>(".slide"));
    if (slides.length === 0) {
      throw new Error("No slides to export");
    }

    const selectedSlides = slideIndices.map((slideIndex, selectionIndex) => ({
      slide: slides[selectionIndex],
      slideIndex
    }));

    if (selectedSlides.some(({ slide }) => !slide)) {
      throw new Error("Invalid slide selection");
    }

    await prepareStaticExportWindow(frameWindow);

    return selectedSlides.map(({ slide, slideIndex }) => {
      slide.classList.add("is-active");
      const html = slide.outerHTML;
      slide.classList.remove("is-active");
      return { html, slideIndex };
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
   * Self-contained HTML/MDX/PPTX exports embed every local asset. Static PNG
   * export embeds only selected-slide images after rendering.
   */
  const embedLocalFiles = async (sourceText: string, imagesOnly = false) => {
    const localFiles = (window as SlideXLocalFilesWindow).__slidexLocalFiles;
    if (!localFiles) return sourceText;

    const blobRegex = /src\s*=\s*(["'])(blob:[^"'<>]+)\1/g;
    const urls = [...new Set([...sourceText.matchAll(blobRegex)].map((match) => match[2]))]
      .filter((url) => !imagesOnly || localFiles.get(url)?.type.startsWith("image/"));
    if (urls.length === 0) return sourceText;

    const replacements = new Map<string, string>();
    const { mediaConcurrency } = getExportDeviceProfile();

    await mapWithConcurrency(urls, mediaConcurrency, async (url) => {
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
    });

    if (replacements.size === 0) return sourceText;

    let embeddedSource = sourceText;
    replacements.forEach((dataUrl, url) => {
      embeddedSource = embeddedSource.replaceAll(url, dataUrl);
    });
    return embeddedSource;
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
      const localSource = await embedLocalFiles(canvasSource);
      const finalSource = await embedRootRelativeImages(localSource);

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
      const localSource = await embedLocalFiles(canvasSource);
      const bundledImageSource = await embedRootRelativeImages(localSource);
      const bundledVideoSource = await embedRootRelativeVideos(bundledImageSource);
      const finalSource = await embedRemoteVideos(bundledVideoSource);
      assertPortableVideoSources(finalSource);
      const html = buildMotionDocHtml(finalSource, finalTitle);

      downloadFile(defaultFilename, html, "text/html;charset=utf-8");
      setNotice("HTML exported ✓");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "HTML export failed");
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
      const renderedSlides = await renderStaticSlideHtml(canvasSource, finalTitle, selection.indices);
      const embeddedSlideHtml = await embedLocalFiles(
        renderedSlides.map(({ html }) => html).join(PNG_SLIDE_HTML_SEPARATOR),
        true
      );
      const embeddedSlideHtmlList = embeddedSlideHtml.split(PNG_SLIDE_HTML_SEPARATOR);
      const selectedSlides = renderedSlides.map((slide, index) => ({
        ...slide,
        html: embeddedSlideHtmlList[index]
      }));
      const { pngConcurrency, pngDownloadDelayMs } = getExportDeviceProfile();

      for (let batchStart = 0; batchStart < selectedSlides.length; batchStart += pngConcurrency) {
        const batch = selectedSlides.slice(batchStart, batchStart + pngConcurrency);
        const renderedBatch = await Promise.all(batch.map(async ({ html, slideIndex }, batchIndex) => {
          const exportIndex = batchStart + batchIndex;
          const slideNumber = String(slideIndex + 1).padStart(2, "0");
          const pngFilename = slideCount === 1
            ? `${filenamePrefix}.png`
            : `${filenamePrefix}-${slideNumber}.png`;
          const svg = buildMotionDocPngSvgFromSlideHtml(
            html,
            slideCount === 1 ? finalTitle : `${finalTitle} ${slideNumber}`
          );
          const pngBlob = await svgToPngBlob(svg);

          return { exportIndex, pngBlob, pngFilename };
        }));

        for (const { exportIndex, pngBlob, pngFilename } of renderedBatch) {
          setNotice(`Exporting PNG ${exportIndex + 1}/${selection.indices.length}…`);
          downloadBlob(pngFilename, pngBlob);

          if (exportIndex < selection.indices.length - 1) {
            await wait(pngDownloadDelayMs);
          }
        }
      }

      setNotice(selection.indices.length === 1 ? "PNG exported ✓" : `${selection.label} exported as PNG ✓`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "PNG export failed");
    }
  }, [canvasSource, documentTitle, setNotice]);

  const exportPptxFile = useCallback(async (filename: string) => {
    const finalTitle = (filename || documentTitle || "slidesx-deck").trim();
    const pptxFilename = `${slugifyFilename(finalTitle)}.pptx`;

    try {
      setNotice("Rendering PowerPoint…");
      const [finalSource, pptx] = await Promise.all([
        (async () => {
          const localSource = await embedLocalFiles(canvasSource);
          const bundledSource = await embedRootRelativeImages(localSource);
          const bundledMediaSource = await embedRootRelativeVideos(bundledSource);
          return embedRemoteImages(bundledMediaSource);
        })(),
        createPptxPresentation()
      ]);
      const document = parseMotionDoc(finalSource);
      const rasterRequirements = pptxRasterRequirements(document);
      const rasterAssets = rasterRequirements.slideIndices.length > 0
        ? await renderPptxRasterAssets(
            buildMotionDocRasterHtml(finalSource, finalTitle, rasterRequirements.slideIndices),
            rasterRequirements
          )
        : { chartImagesBySlide: [], filteredImagesBySlide: [], slideBackgrounds: [] };
      pptx.layout = "LAYOUT_WIDE";
      pptx.author = "SlideX Pitch";
      pptx.company = "SlideX";
      pptx.subject = "Presentation exported from SlideX Pitch";
      pptx.title = finalTitle;

      setNotice("Building editable slides…");
      await addEditableSlides(
        pptx,
        document,
        rasterAssets.slideBackgrounds,
        rasterAssets.filteredImagesBySlide,
        rasterAssets.chartImagesBySlide
      );

      setNotice("Building PowerPoint…");
      await pptx.writeFile({ fileName: pptxFilename, compression: false });
      setNotice("Editable PowerPoint exported ✓");
    } catch (error) {
      const exportError = error instanceof Error ? error : new Error("PowerPoint export failed");
      setNotice(exportError.message);
      throw exportError;
    }
  }, [canvasSource, documentTitle, setNotice]);

  return {
    copySource,
    exportHtmlFile,
    exportMdxFile,
    exportPngFile,
    exportPptxFile
  };
}
