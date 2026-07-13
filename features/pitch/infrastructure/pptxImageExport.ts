const PPTX_PORTABLE_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const PPTX_RASTER_PIXELS_PER_INCH = 192;
const PPTX_RASTER_MAX_DIMENSION = 4096;

export type PptxImageFrame = {
  h: number;
  w: number;
};

/**
 * Google Slides does not reliably import WebP, AVIF, GIF, or SVG images stored
 * inside a PPTX. Rasterize those browser-readable sources to PNG while keeping
 * JPEG and PNG bytes unchanged for smaller files and better photo compression.
 */
export async function portablePptxImageData(source: string, frame: PptxImageFrame) {
  const mimeType = dataImageMimeType(source);
  if (!mimeType || PPTX_PORTABLE_IMAGE_TYPES.has(mimeType)) return source;

  const image = await loadImage(source);
  const width = rasterDimension(frame.w);
  const height = rasterDimension(frame.h);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("PowerPoint image conversion is unavailable in this browser");

  context.drawImage(image, 0, 0, width, height);
  image.src = "";
  return canvas.toDataURL("image/png");
}

function dataImageMimeType(source: string) {
  const match = source.match(/^data:(image\/[a-z0-9.+-]+)(?:;[^,]*)?,/i);
  return match?.[1]?.toLowerCase();
}

function rasterDimension(inches: number) {
  return Math.max(1, Math.min(Math.round(inches * PPTX_RASTER_PIXELS_PER_INCH), PPTX_RASTER_MAX_DIMENSION));
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
