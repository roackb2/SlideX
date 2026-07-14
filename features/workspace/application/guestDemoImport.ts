import { z } from "zod";

export const presentationSourceByteLimit = 2_097_152;

const guestDemoImportSchema = z.object({
  importId: z.string().uuid(),
  source: z.string().min(1).refine(
    (value) => new TextEncoder().encode(value).byteLength <= presentationSourceByteLimit,
    { message: "Presentation source exceeds the 2 MB limit." }
  ),
  templateId: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(240)
}).strict();

export type GuestDemoImportInput = z.infer<typeof guestDemoImportSchema>;

export function parseGuestDemoImportInput(value: unknown) {
  const result = guestDemoImportSchema.safeParse(value);
  if (result.success) {
    return { data: result.data, success: true } as const;
  }

  return {
    issues: result.error.issues.map((issue) => ({
      field: issue.path[0]?.toString() ?? "request",
      message: issue.message
    })),
    success: false
  } as const;
}
