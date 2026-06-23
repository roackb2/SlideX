export interface ImageUploadPreset {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  mimeType: "image/webp" | "image/jpeg";
  mode?: "fit" | "square";
  passthroughBytes?: number;
}

export interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
  originalBytes: number;
  bytes: number;
}

export const IMAGE_UPLOAD_PRESETS = {
  avatar: {
    maxWidth: 320,
    maxHeight: 320,
    quality: 0.82,
    mimeType: "image/webp",
    mode: "square",
    passthroughBytes: 120_000
  },
  logo: {
    maxWidth: 640,
    maxHeight: 240,
    quality: 0.86,
    mimeType: "image/webp",
    mode: "fit",
    passthroughBytes: 160_000
  },
  cover: {
    maxWidth: 1600,
    maxHeight: 900,
    quality: 0.84,
    mimeType: "image/webp",
    mode: "fit",
    passthroughBytes: 280_000
  },
  background: {
    maxWidth: 1800,
    maxHeight: 1200,
    quality: 0.8,
    mimeType: "image/webp",
    mode: "fit",
    passthroughBytes: 320_000
  },
  reference: {
    maxWidth: 1280,
    maxHeight: 960,
    quality: 0.82,
    mimeType: "image/webp",
    mode: "fit",
    passthroughBytes: 260_000
  }
} satisfies Record<string, ImageUploadPreset>;

export async function processImageFile(file: File, preset: ImageUploadPreset): Promise<ProcessedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  if (file.type === "image/svg+xml") {
    const dataUrl = await readBlobAsDataUrl(file);
    return {
      dataUrl,
      width: 0,
      height: 0,
      originalBytes: file.size,
      bytes: file.size
    };
  }

  const source = await decodeImage(file);
  const sourceWidth = source.width;
  const sourceHeight = source.height;
  const target = getTargetSize(sourceWidth, sourceHeight, preset);
  const canPassthrough =
    target.width === sourceWidth &&
    target.height === sourceHeight &&
    file.size <= (preset.passthroughBytes ?? 0);

  if (canPassthrough) {
    closeImageSource(source);
    const dataUrl = await readBlobAsDataUrl(file);
    return {
      dataUrl,
      width: sourceWidth,
      height: sourceHeight,
      originalBytes: file.size,
      bytes: file.size
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    closeImageSource(source);
    const dataUrl = await readBlobAsDataUrl(file);
    return {
      dataUrl,
      width: sourceWidth,
      height: sourceHeight,
      originalBytes: file.size,
      bytes: file.size
    };
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    source,
    target.sourceX,
    target.sourceY,
    target.sourceWidth,
    target.sourceHeight,
    0,
    0,
    target.width,
    target.height
  );
  closeImageSource(source);

  const blob = await canvasToBlob(canvas, preset.mimeType, preset.quality);
  const dataUrl = await readBlobAsDataUrl(blob);

  return {
    dataUrl,
    width: target.width,
    height: target.height,
    originalBytes: file.size,
    bytes: blob.size
  };
}

async function decodeImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Fall through to HTMLImageElement decode for formats the browser bitmap decoder rejects.
    }
  }

  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function closeImageSource(source: ImageBitmap | HTMLImageElement) {
  if ("close" in source) {
    source.close();
  }
}

function getTargetSize(width: number, height: number, preset: ImageUploadPreset) {
  if (preset.mode === "square") {
    const side = Math.min(width, height);
    const targetSide = Math.min(side, preset.maxWidth, preset.maxHeight);

    return {
      width: targetSide,
      height: targetSide,
      sourceX: Math.round((width - side) / 2),
      sourceY: Math.round((height - side) / 2),
      sourceWidth: side,
      sourceHeight: side
    };
  }

  const ratio = Math.min(1, preset.maxWidth / width, preset.maxHeight / height);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
    sourceX: 0,
    sourceY: 0,
    sourceWidth: width,
    sourceHeight: height
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob ?? dataUrlToBlob(canvas.toDataURL("image/jpeg", quality)));
      },
      mimeType,
      quality
    );
  });
}

function dataUrlToBlob(dataUrl: string) {
  const [header, payload] = dataUrl.split(",");
  const mimeType = /data:(.*?);base64/.exec(header)?.[1] ?? "image/jpeg";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
