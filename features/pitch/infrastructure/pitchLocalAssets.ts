type PitchLocalFilesWindow = Window & {
  __slidexLocalFiles?: Map<string, File>;
};

import { preparePitchAssetFile } from "@/features/pitch/infrastructure/pitchAssetFiles";

export function registerPitchLocalFile(file: File, exportFile = file) {
  const url = URL.createObjectURL(file);
  localFileStore().set(url, exportFile);
  return url;
}

export function registeredPitchLocalFiles(): ReadonlyMap<string, File> {
  return localFileStore();
}

export async function prepareAndRegisterPitchLocalFile(file: File) {
  const preparedAsset = await preparePitchAssetFile(file);
  return {
    ...preparedAsset,
    // Persist and export the optimized rendition. The source file is still
    // retained by the asset pipeline for cloud archival when required.
    url: registerPitchLocalFile(preparedAsset.file)
  };
}

export async function prepareAndRegisterPitchRemoteImage(source: string, preferredName?: string) {
  const url = remoteImageUrl(source);
  let response: Response;

  try {
    response = await fetch(url, {
      cache: "force-cache",
      credentials: "omit",
      mode: "cors"
    });
  } catch {
    throw new Error("This image host does not allow SlideX to import the file");
  }

  if (!response.ok) {
    throw new Error(`Image import failed (${response.status})`);
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("The URL did not return a supported image");
  }

  const file = new File([blob], remoteImageFileName(url, blob.type, preferredName), {
    type: blob.type
  });
  return prepareAndRegisterPitchLocalFile(file);
}

export async function externalizeEmbeddedPitchImages(source: string) {
  const matches = [...source.matchAll(/<ImageBlock\b[\s\S]*?\/>/g)];
  const replacements = new Map<string, string>();

  await Promise.all(matches.map(async (match, index) => {
    const tag = match[0];
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1] ?? "";
    if (!src.startsWith("data:image/") || replacements.has(src)) return;
    const alt = tag.match(/\balt="([^"]+)"/)?.[1] || `imported-image-${index + 1}`;
    const response = await fetch(src);
    const blob = await response.blob();
    const file = new File([blob], alt, { type: blob.type || mediaTypeFromDataUrl(src) });
    const preparedAsset = await prepareAndRegisterPitchLocalFile(file);
    replacements.set(src, preparedAsset.url);
  }));

  if (replacements.size === 0) return source;
  return source.replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[^"\s]+/g, (value) => replacements.get(value) ?? value);
}

export async function embedPitchLocalImagesForPersistence(source: string) {
  const imageSourcePattern = /<ImageBlock\b[^>]*?\bsrc\s*=\s*(["'])(blob:[^"'<>]+)\1/gi;
  const urls = [...new Set([...source.matchAll(imageSourcePattern)].map((match) => match[2]))];
  if (urls.length === 0) return source;

  const files = localFileStore();
  const replacements = new Map<string, string>();

  await Promise.all(urls.map(async (url) => {
    const file = files.get(url);
    if (!file || !file.type.startsWith("image/")) return;
    replacements.set(url, await fileToDataUrl(file));
  }));

  return source.replace(imageSourcePattern, (attribute, _quote: string, url: string) => (
    attribute.replace(url, replacements.get(url) ?? url)
  ));
}

function localFileStore() {
  const localWindow = window as PitchLocalFilesWindow;
  localWindow.__slidexLocalFiles ??= new Map<string, File>();
  return localWindow.__slidexLocalFiles;
}

function mediaTypeFromDataUrl(value: string) {
  return value.match(/^data:([^;,]+)/)?.[1] ?? "image/png";
}

function remoteImageUrl(source: string) {
  try {
    const url = new URL(source.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    return url;
  } catch {
    throw new Error("Enter a complete http or https image URL");
  }
}

function remoteImageFileName(url: URL, mimeType: string, preferredName?: string) {
  const requestedName = preferredName?.trim() || decodeURIComponent(url.pathname.split("/").pop() || "remote-image");
  const safeName = requestedName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "remote-image";
  if (/\.[a-zA-Z0-9]{2,5}$/.test(safeName)) return safeName;
  return `${safeName}.${imageExtension(mimeType)}`;
}

function imageExtension(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/svg+xml") return "svg";
  return mimeType.split("/")[1]?.replace("+xml", "") || "png";
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
