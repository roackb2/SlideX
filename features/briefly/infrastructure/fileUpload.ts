import type { BriefAttachment } from "@/features/briefly/domain/briefTypes";

export const FILE_UPLOAD_LIMITS = {
  maxFiles: 6,
  maxBytesPerFile: 2_500_000
} as const;

export async function processAttachmentFile(file: File): Promise<BriefAttachment> {
  if (file.size > FILE_UPLOAD_LIMITS.maxBytesPerFile) {
    throw new Error("File is too large.");
  }

  const dataUrl = await readFileAsDataUrl(file);

  return {
    id: `attachment_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    dataUrl
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
