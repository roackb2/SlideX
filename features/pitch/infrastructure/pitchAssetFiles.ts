import {
  validatePitchAssetSource,
  validatePreparedPitchAsset,
  type PitchAssetKind
} from "@/features/pitch/application/pitchAssetPolicy";

const imageOptimizationThresholdBytes = 512 * 1024;
const maximumImageDimension = 2304;
const webpQuality = 0.82;
const optimizableImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type PreparedPitchAsset = {
  file: File;
  kind: PitchAssetKind;
  optimized: boolean;
  originalFile: File;
};

export class PitchAssetFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PitchAssetFileError";
  }
}

export async function preparePitchAssetFile(file: File): Promise<PreparedPitchAsset> {
  const sourceValidation = validatePitchAssetSource(file);
  if (!sourceValidation.ok) {
    throw new PitchAssetFileError(sourceValidation.message);
  }

  const preparedFile = sourceValidation.kind === "image"
    ? await optimizePitchImageFile(file)
    : file;
  const preparedValidation = validatePreparedPitchAsset(preparedFile);

  if (!preparedValidation.ok) {
    throw new PitchAssetFileError(preparedValidation.message);
  }

  return {
    file: preparedFile,
    kind: preparedValidation.kind,
    optimized: preparedFile !== file,
    originalFile: file
  };
}

async function optimizePitchImageFile(file: File) {
  if (!optimizableImageTypes.has(file.type) || file.size <= imageOptimizationThresholdBytes) {
    return file;
  }

  let bitmap: ImageBitmap | null = null;

  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maximumImageDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, width, height);
    const optimizedBlob = await canvasToBlob(canvas, "image/webp", webpQuality);

    if (!optimizedBlob || optimizedBlob.size >= file.size * 0.88) {
      return file;
    }

    return new File([optimizedBlob], webpFileName(file.name), {
      lastModified: file.lastModified,
      type: "image/webp"
    });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

function webpFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "").trim() || "image";
  return `${baseName}.webp`;
}
