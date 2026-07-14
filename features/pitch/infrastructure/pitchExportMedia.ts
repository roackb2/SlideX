import { youtubeVideoId } from "@/core/motion-doc/domain/videoSource";
import { registeredPitchLocalFiles } from "@/features/pitch/infrastructure/pitchLocalAssets";

const EXPORT_IMAGE_MAX_DIMENSION = 1920;
const EXPORT_IMAGE_QUALITY = 0.78;
const EXPORT_IMAGE_PASSTHROUGH_MAX_BYTES = 256 * 1024;
const EXPORT_IMAGE_REPLACEMENT_RATIO = 0.96;
const PPTX_EMBEDDED_VIDEO_MAX_BYTES = 80 * 1024 * 1024;
const PNG_DESKTOP_DOWNLOAD_DELAY_MS = 30;
const PNG_MOBILE_DOWNLOAD_DELAY_MS = 80;
const REMOTE_VIDEO_EMBED_HOSTS = new Set([
  "animark-media-library.zz41354899.chatgpt.site",
  "interactive-examples.mdn.mozilla.net",
  "www.w3schools.com"
]);

export function getPitchExportDeviceProfile() {
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
  const deviceMemory = navigatorWithMemory.deviceMemory ?? (isMobileViewport ? 4 : 8);
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const isLowMemory = deviceMemory <= 4;
  const isLowConcurrency = hardwareConcurrency <= 4;

  return {
    mediaConcurrency: isMobileViewport || isLowMemory ? 2 : Math.min(4, Math.max(2, Math.floor(hardwareConcurrency / 2))),
    pngConcurrency: isLowMemory || isLowConcurrency ? 1 : isMobileViewport ? 2 : Math.min(3, Math.max(2, Math.floor(hardwareConcurrency / 4))),
    pngDownloadDelayMs: isMobileViewport ? PNG_MOBILE_DOWNLOAD_DELAY_MS : PNG_DESKTOP_DOWNLOAD_DELAY_MS
  };
}

export async function mapPitchExportWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(Math.max(1, concurrency), items.length) }, () => worker()));
  return results;
}

export async function embedPitchLocalFiles(sourceText: string, imagesOnly = false) {
  const localFiles = registeredPitchLocalFiles();
  const blobRegex = /src\s*=\s*(["'])(blob:[^"'<>]+)\1/g;
  const urls = [...new Set([...sourceText.matchAll(blobRegex)].map((match) => match[2]))]
    .filter((url) => !imagesOnly || localFiles.get(url)?.type.startsWith("image/"));
  if (urls.length === 0) return sourceText;

  const replacements = new Map<string, string>();
  await mapPitchExportWithConcurrency(urls, getPitchExportDeviceProfile().mediaConcurrency, async (url) => {
    const file = localFiles.get(url);
    if (!file) return;
    try {
      replacements.set(url, file.type.startsWith("image/") ? await compressedImageDataUrl(file) : await blobToDataUrl(file));
    } catch (error) {
      console.warn("Failed to embed local file", url, error);
    }
  });

  let embeddedSource = sourceText;
  replacements.forEach((dataUrl, url) => {
    embeddedSource = embeddedSource.replaceAll(url, dataUrl);
  });
  return embeddedSource;
}

export async function embedPitchRemoteImages(sourceText: string) {
  return embedMatchedImages(sourceText, /<ImageBlock\b[^>]*?\bsrc\s*=\s*(["'])(https?:\/\/[^"'<>]+)\1/gi, async (url) => {
    try {
      return await fetchCompressedImage(url);
    } catch {
      let hostname = url;
      try { hostname = new URL(url).hostname; } catch { /* retain the source */ }
      throw new Error(`Cannot export image from ${hostname}. Re-upload the image from your device, or use an image host that allows CORS.`);
    }
  });
}

export async function embedPitchRootRelativeImages(sourceText: string) {
  return embedMatchedImages(sourceText, /<ImageBlock\b[^>]*?\bsrc\s*=\s*(["'])(\/(?!\/)[^"'<>]+)\1/gi, async (path) => {
    try {
      return await fetchCompressedImage(new URL(path, window.location.origin).toString());
    } catch {
      throw new Error(`Cannot export bundled image ${path}. Reload SlideX and try again.`);
    }
  });
}

async function embedMatchedImages(sourceText: string, pattern: RegExp, resolveImage: (source: string) => Promise<string>) {
  const sources = [...new Set([...sourceText.matchAll(pattern)].map((match) => match[2]).filter(Boolean))];
  if (sources.length === 0) return sourceText;
  const dataUrls = await mapPitchExportWithConcurrency(sources, getPitchExportDeviceProfile().mediaConcurrency, resolveImage);
  const replacements = new Map(sources.map((source, index) => [source, dataUrls[index]]));
  return sourceText.replace(pattern, (attribute, _quote: string, source: string) => attribute.replace(source, replacements.get(source) ?? source));
}

export async function embedPitchRootRelativeVideos(sourceText: string) {
  const pattern = /<VideoBlock\b[^>]*?\bsrc\s*=\s*(["'])(\/(?!\/)[^"'<>]+)\1/gi;
  const paths = [...new Set([...sourceText.matchAll(pattern)].map((match) => match[2]))];
  if (paths.length === 0) return sourceText;
  const dataUrls = await mapPitchExportWithConcurrency(paths, getPitchExportDeviceProfile().mediaConcurrency, async (path) => {
    const response = await fetch(new URL(path, window.location.origin));
    if (!response.ok) throw new Error(`Cannot export bundled video ${path}. Reload SlideX and try again.`);
    const blob = await response.blob();
    if (!blob.type.startsWith("video/")) throw new Error(`Bundled media ${path} is not a supported video.`);
    return blobToDataUrl(blob);
  });
  const replacements = new Map(paths.map((path, index) => [path, dataUrls[index]]));
  return sourceText.replace(pattern, (attribute, _quote: string, path: string) => attribute.replace(path, replacements.get(path) ?? path));
}

export async function embedPitchRemoteVideos(sourceText: string) {
  const pattern = /<VideoBlock\b[^>]*?\bsrc\s*=\s*(["'])(https?:\/\/[^"'<>]+)\1/gi;
  const urls = [...new Set([...sourceText.matchAll(pattern)].map((match) => match[2]))];
  if (urls.length === 0) return sourceText;
  const embeddableUrls = urls.filter((url) => !youtubeVideoId(url) && canEmbedRemoteVideo(url));
  const dataUrls = await mapPitchExportWithConcurrency(embeddableUrls, getPitchExportDeviceProfile().mediaConcurrency, async (url) => {
    try {
      const response = await fetch(url, { mode: "cors", credentials: "omit" });
      if (!response.ok) return null;
      const blob = await response.blob();
      if (!blob.type.startsWith("video/") || blob.size > PPTX_EMBEDDED_VIDEO_MAX_BYTES) return null;
      return blobToDataUrl(blob);
    } catch {
      return null;
    }
  });
  const replacements = new Map<string, string>();
  embeddableUrls.forEach((url, index) => {
    if (dataUrls[index]) replacements.set(url, dataUrls[index]);
  });
  return sourceText.replace(pattern, (attribute, _quote: string, url: string) => {
    const data = replacements.get(url);
    return data ? `${attribute.replace(url, data)} sourceUrl="${escapeMotionDocAttribute(url)}"` : attribute;
  });
}

export function assertPitchPortableVideoSources(sourceText: string) {
  if (/<VideoBlock\b[^>]*?\bsrc\s*=\s*(["'])blob:[^"'<>]+\1/i.test(sourceText)) {
    throw new Error("A local video is no longer available. Re-import it before exporting HTML.");
  }
}

async function fetchCompressedImage(url: string) {
  const response = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!response.ok) throw new Error(`Image request failed (${response.status})`);
  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) throw new Error("URL did not return an image");
  return compressedImageDataUrl(blob);
}

async function compressedImageDataUrl(blob: Blob) {
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(blob);
    const largestDimension = Math.max(bitmap.width, bitmap.height);
    if (blob.size <= EXPORT_IMAGE_PASSTHROUGH_MAX_BYTES && largestDimension <= EXPORT_IMAGE_MAX_DIMENSION) {
      return blobToDataUrl(blob);
    }
    const scale = Math.min(1, EXPORT_IMAGE_MAX_DIMENSION / largestDimension);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return blobToDataUrl(blob);
    context.drawImage(bitmap, 0, 0, width, height);
    const optimizedBlob = await canvasToBlob(canvas, "image/webp", EXPORT_IMAGE_QUALITY);
    canvas.width = 1;
    canvas.height = 1;
    if (largestDimension <= EXPORT_IMAGE_MAX_DIMENSION && optimizedBlob.size >= blob.size * EXPORT_IMAGE_REPLACEMENT_RATIO) {
      return blobToDataUrl(blob);
    }
    return blobToDataUrl(optimizedBlob);
  } catch {
    return blobToDataUrl(blob);
  } finally {
    bitmap?.close();
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image compression failed")), type, quality);
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function canEmbedRemoteVideo(value: string) {
  try { return REMOTE_VIDEO_EMBED_HOSTS.has(new URL(value).hostname.toLowerCase()); }
  catch { return false; }
}

function escapeMotionDocAttribute(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("\"", "&quot;");
}
