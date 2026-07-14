import {
  assertPitchPortableVideoSources,
  embedPitchLocalFiles,
  embedPitchRemoteImages,
  embedPitchRemoteVideos,
  embedPitchRootRelativeImages,
  embedPitchRootRelativeVideos
} from "@/features/pitch/infrastructure/pitchExportMedia";

export async function preparePitchMdxSource(source: string) {
  const localSource = await embedPitchLocalFiles(source);
  return embedPitchRootRelativeImages(localSource);
}

export async function preparePitchHtmlSource(source: string) {
  const localSource = await embedPitchLocalFiles(source);
  const bundledImageSource = await embedPitchRootRelativeImages(localSource);
  const bundledVideoSource = await embedPitchRootRelativeVideos(bundledImageSource);
  const portableSource = await embedPitchRemoteVideos(bundledVideoSource);
  assertPitchPortableVideoSources(portableSource);
  return portableSource;
}

export async function preparePitchPptxSource(source: string) {
  const localSource = await embedPitchLocalFiles(source);
  const bundledImageSource = await embedPitchRootRelativeImages(localSource);
  const bundledMediaSource = await embedPitchRootRelativeVideos(bundledImageSource);
  return embedPitchRemoteImages(bundledMediaSource);
}
