type SlideXLocalFilesWindow = Window & {
  __slidexLocalFiles?: Map<string, File>;
};

import { preparePitchAssetFile } from "@/features/pitch/infrastructure/pitchAssetFiles";

export function registerPitchLocalFile(file: File, exportFile = file) {
  const url = URL.createObjectURL(file);
  localFileStore().set(url, exportFile);
  return url;
}

export async function prepareAndRegisterPitchLocalFile(file: File) {
  const preparedAsset = await preparePitchAssetFile(file);
  return {
    ...preparedAsset,
    // Render the optimized preview in the editor, while exports resolve the
    // same blob URL back to the original PNG/JPEG bytes.
    url: registerPitchLocalFile(preparedAsset.file, preparedAsset.originalFile)
  };
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

function localFileStore() {
  const localWindow = window as SlideXLocalFilesWindow;
  localWindow.__slidexLocalFiles ??= new Map<string, File>();
  return localWindow.__slidexLocalFiles;
}

function mediaTypeFromDataUrl(value: string) {
  return value.match(/^data:([^;,]+)/)?.[1] ?? "image/png";
}
