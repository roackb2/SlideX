import type PptxGenJS from "pptxgenjs";
import { escapeSvgAttribute, svgDataUri } from "@/core/motion-doc/application/svgDataUri";
import { youtubeEmbedUrl } from "@/core/motion-doc/domain/videoSource";
import { portablePptxImageData } from "@/features/pitch/infrastructure/pptxImageExport";

type PptxSlide = ReturnType<PptxGenJS["addSlide"]>;
type PptxFrame = { h: number; w: number; x: number; y: number };

export async function addPptxVideo(
  slide: PptxSlide,
  props: Record<string, string | number>,
  frame: PptxFrame
) {
  const src = stringProp(props.src);
  const poster = stringProp(props.poster);
  const link = sourceLink(stringProp(props.sourceUrl) ?? src);
  const hyperlink = link ? { tooltip: "Open video", url: link } : undefined;
  const posterData = poster?.startsWith("data:image/")
    ? await portablePptxImageData(poster, frame)
    : undefined;
  const coverData = await portablePptxImageData(videoFallbackSvgDataUri(src, Boolean(posterData)), frame);

  if (posterData) {
    slide.addImage({ data: posterData, ...frame, hyperlink, transparency: 0 });
  }

  slide.addImage({
    altText: "Video playback cover",
    data: coverData,
    ...frame,
    hyperlink,
    transparency: 0
  });

  const youtube = src ? youtubeEmbedUrl(src) : null;
  if (youtube) {
    slide.addMedia({ ...frame, cover: coverData, link: youtube, type: "online" });
    return;
  }

  if (src?.startsWith("data:video/") && src.includes("base64,")) {
    slide.addMedia({
      ...frame,
      cover: posterData ?? coverData,
      data: src,
      extn: videoExtension(src),
      type: "video"
    });
  }
}

function videoFallbackSvgDataUri(src: string | undefined, hasPoster: boolean) {
  const label = videoLabel(src);
  return svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" preserveAspectRatio="none"><rect width="1280" height="720" rx="34" fill="#09090b"${hasPoster ? " fill-opacity=\".24\"" : ""}/><rect x="2" y="2" width="1276" height="716" rx="32" fill="none" stroke="#ffffff" stroke-opacity=".18" stroke-width="4"/><path d="M0 560C280 480 510 640 780 548s370-50 500-18v190H0Z" fill="#ffffff" fill-opacity=".035"/><circle cx="640" cy="342" r="86" fill="#09090b" fill-opacity=".56" stroke="#ffffff" stroke-opacity=".72" stroke-width="3"/><path d="M617 294 691 342 617 390Z" fill="#ffffff"/><text x="640" y="510" fill="#ffffff" fill-opacity=".92" font-family="Aptos,Arial,sans-serif" font-size="34" font-weight="700" text-anchor="middle">VIDEO</text><text x="640" y="556" fill="#ffffff" fill-opacity=".62" font-family="Aptos,Arial,sans-serif" font-size="22" text-anchor="middle">${escapeSvgAttribute(label)}</text></svg>`);
}

function videoLabel(src: string | undefined) {
  if (!src) return "Media preserved as a movable playback cover";
  try {
    const url = new URL(src);
    return `Open media from ${url.hostname.replace(/^www\./, "")}`;
  } catch {
    return "Embedded media with cross-platform fallback";
  }
}

function sourceLink(src: string | undefined) {
  return src && /^https?:\/\//i.test(src) ? src : undefined;
}

function videoExtension(dataUrl: string) {
  const mime = dataUrl.slice(5, dataUrl.indexOf(";"));
  if (mime === "video/quicktime") return "mov";
  if (mime === "video/webm") return "webm";
  if (mime === "video/ogg") return "ogv";
  return mime.split("/")[1] || "mp4";
}

function stringProp(value: string | number | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
