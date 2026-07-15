import { z } from "zod";
import { pitchAssetLimits } from "@/features/pitch/application/pitchAssetPolicy";

const multipartOverheadAllowanceBytes = 512 * 1024;
const presentationImageUploadSchema = z.object({
  presentationId: z.string().uuid()
});

export const presentationImageUploadRequestByteLimit =
  pitchAssetLimits.image + multipartOverheadAllowanceBytes;

export type PresentationImageUploadInput = {
  file: File;
  presentationId: string;
};

export function parsePresentationImageUploadFormData(formData: FormData) {
  const file = formData.get("file");
  const parsedFields = presentationImageUploadSchema.safeParse({
    presentationId: formData.get("presentationId")
  });

  if (!(file instanceof File) || !parsedFields.success) {
    return { success: false } as const;
  }

  return {
    data: {
      file,
      presentationId: parsedFields.data.presentationId
    },
    success: true
  } as const;
}
