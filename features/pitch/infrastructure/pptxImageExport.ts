const PPTX_PORTABLE_IMAGE_TYPES = new Set(["image/jpeg"]);
const PPTX_IMAGE_JPEG_QUALITY = 0.9;
const PPTX_PNG_OPTIMIZATION_MIN_BYTES = 256 * 1024;
const PPTX_PNG_REPLACEMENT_RATIO = 0.95;
const PPTX_RASTER_PIXELS_PER_INCH = 144;
const PPTX_RASTER_MAX_DIMENSION = 4096;

export type PptxImageFrame = {
  h: number;
  w: number;
};

/**
 * Google Slides does not reliably import WebP, AVIF, GIF, or SVG images stored
 * inside a PPTX. Convert those formats and oversized PNGs at the actual display
 * size, preserving transparent PNGs and using JPEG for opaque raster content.
 */
export async function portablePptxImageData(source: string, frame: PptxImageFrame) {
  const mimeType = dataImageMimeType(source);
  if (!mimeType || PPTX_PORTABLE_IMAGE_TYPES.has(mimeType)) return source;

  const image = await loadImage(source);
  const width = rasterDimension(frame.w);
  const height = rasterDimension(frame.h);

  if (
    mimeType === "image/png" &&
    dataUrlByteSize(source) < PPTX_PNG_OPTIMIZATION_MIN_BYTES &&
    image.naturalWidth <= width * 1.25 &&
    image.naturalHeight <= height * 1.25
  ) {
    image.src = "";
    return source;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("PowerPoint image conversion is unavailable in this browser");

  context.drawImage(image, 0, 0, width, height);
  image.src = "";

  try {
    const hasTransparency = canvasHasTransparency(context, width, height);
    const optimizedBlob = await canvasToBlob(
      canvas,
      hasTransparency ? "image/png" : "image/jpeg",
      hasTransparency ? undefined : PPTX_IMAGE_JPEG_QUALITY
    );

    if (
      mimeType === "image/png" &&
      optimizedBlob.size >= dataUrlByteSize(source) * PPTX_PNG_REPLACEMENT_RATIO
    ) {
      return source;
    }

    return blobToDataUrl(optimizedBlob);
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

function dataImageMimeType(source: string) {
  const match = source.match(/^data:(image\/[a-z0-9.+-]+)(?:;[^,]*)?,/i);
  return match?.[1]?.toLowerCase();
}

function rasterDimension(inches: number) {
  return Math.max(1, Math.min(Math.round(inches * PPTX_RASTER_PIXELS_PER_INCH), PPTX_RASTER_MAX_DIMENSION));
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PowerPoint image compression failed"));
    }, type, quality);
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

function canvasHasTransparency(context: CanvasRenderingContext2D, width: number, height: number) {
  try {
    const pixels = context.getImageData(0, 0, width, height).data;
    for (let alphaIndex = 3; alphaIndex < pixels.length; alphaIndex += 4) {
      if (pixels[alphaIndex] !== 255) return true;
    }
    return false;
  } catch {
    return true;
  }
}

function dataUrlByteSize(source: string) {
  const commaIndex = source.indexOf(",");
  if (commaIndex < 0) return source.length;
  const metadata = source.slice(0, commaIndex);
  const payload = source.slice(commaIndex + 1);

  if (metadata.includes(";base64")) {
    const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
    return Math.max(0, Math.floor(payload.length * 3 / 4) - padding);
  }

  try {
    return new Blob([decodeURIComponent(payload)]).size;
  } catch {
    return new Blob([payload]).size;
  }
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("An image could not be converted for Google Slides compatibility"));
    image.src = source;
  });
}
