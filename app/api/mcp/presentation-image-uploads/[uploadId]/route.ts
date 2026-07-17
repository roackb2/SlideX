import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import {
  normalizePresentationImage,
  PresentationImageUploadError,
  readExactUploadBody
} from "@/mcp/presentationImageUpload";
import { SupabaseMcpPresentationImageUploadStore } from "@/mcp/supabasePresentationImageUploadStore";

export const runtime = "nodejs";

type UploadRouteContext = {
  params: Promise<{ uploadId: string }>;
};

export async function PUT(request: NextRequest, context: UploadRouteContext) {
  const { uploadId } = await context.params;
  if (!isUuid(uploadId)) return uploadResponse("invalid_upload", 401);

  const token = uploadCredential(request.headers.get("authorization"));
  if (!token) return uploadResponse("invalid_upload", 401);

  const store = new SupabaseMcpPresentationImageUploadStore(createSupabaseAdminClient());
  let upload;
  try {
    upload = await store.claimUpload(uploadId, token);
  } catch {
    return uploadResponse("upload_unavailable", 503);
  }
  if (!upload) return uploadResponse("invalid_upload", 401);

  let stored = false;
  try {
    const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
    if (contentType !== upload.expectedMimeType) {
      throw new PresentationImageUploadError(
        "invalid_image",
        "Content-Type does not match the prepared upload."
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength !== null && !isExpectedContentLength(contentLength, upload.expectedSize)) {
      throw new PresentationImageUploadError(
        "size_mismatch",
        "Content-Length does not match the prepared upload."
      );
    }

    const source = await readExactUploadBody(request.body, upload.expectedSize);
    const normalized = await normalizePresentationImage(source, upload.expectedMimeType);
    await store.storeImage({ bytes: normalized, path: upload.storagePath });
    stored = true;

    if (!await store.completeUpload(upload.uploadId, normalized.byteLength)) {
      throw new Error("The upload could not be completed.");
    }

    return uploadResponse("completed", 201, {
      mimeType: "image/webp",
      size: normalized.byteLength,
      uploadId: upload.uploadId
    });
  } catch (error) {
    if (stored) {
      await store.removeStoredImage(upload.storagePath).catch(() => undefined);
    }
    await store.rejectUpload(upload.uploadId).catch(() => undefined);

    if (error instanceof PresentationImageUploadError) {
      return uploadResponse(error.code, 400);
    }
    return uploadResponse("upload_failed", 500);
  }
}

function uploadCredential(header: string | null) {
  const match = header?.match(/^Upload\s+(slx_up_[A-Za-z0-9_-]{43})$/);
  return match?.[1];
}

function isExpectedContentLength(value: string, expectedSize: number) {
  return /^\d+$/.test(value) && Number(value) === expectedSize;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function uploadResponse(
  status: string,
  httpStatus: number,
  details: Record<string, string | number> = {}
) {
  return NextResponse.json(
    { status, ...details },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      },
      status: httpStatus
    }
  );
}
