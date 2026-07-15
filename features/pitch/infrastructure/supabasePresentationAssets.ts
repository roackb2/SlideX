import type { SupabaseClient } from "@supabase/supabase-js";
import { pitchAssetCacheControlSeconds } from "@/features/pitch/application/pitchAssetPolicy";
import {
  PitchAssetFileError,
  preparePitchAssetFile
} from "@/features/pitch/infrastructure/pitchAssetFiles";
import { isPresentationImageStoragePath } from "@/features/pitch/application/presentationImagePath";

const presentationImagesBucket = "presentation-images";
const storageListPageSize = 100;
const storageDeleteBatchSize = 100;

type SlideXSupabaseClient = SupabaseClient;

export type UploadSupabasePresentationImageInput = {
  file: File;
  presentationId: string;
};

export type UploadedSupabasePresentationImage = {
  id: string;
  mimeType: string;
  name: string;
  optimized: boolean;
  path: string;
  size: number;
};

export class PresentationImageAuthenticationRequiredError extends Error {
  constructor(message = "Sign in to manage presentation images") {
    super(message);
    this.name = "PresentationImageAuthenticationRequiredError";
  }
}

export async function deletePresentationImageViaApi(
  image: Pick<UploadedSupabasePresentationImage, "path">
) {
  const response = await fetch("/api/presentation-images/", {
    body: JSON.stringify({ path: image.path }),
    headers: { "content-type": "application/json" },
    method: "DELETE"
  });

  if (response.status === 401) {
    throw new PresentationImageAuthenticationRequiredError("Sign in before removing images");
  }
  if (!response.ok) {
    throw new PitchAssetFileError(
      response.status === 404
        ? "This image is unavailable. Reload SlideX and try again."
        : "The image could not be removed. Try again."
    );
  }
}

export async function uploadPresentationImageViaApi(
  file: File,
  presentationId: string
): Promise<UploadedSupabasePresentationImage> {
  const preparedImage = await preparePitchAssetFile(file);
  if (preparedImage.kind !== "image") {
    throw new PitchAssetFileError("Only images can be uploaded to a presentation");
  }

  const formData = new FormData();
  formData.set("file", preparedImage.file);
  formData.set("presentationId", presentationId);

  const response = await fetch("/api/presentation-images/", {
    body: formData,
    method: "POST"
  });
  const responseBody: unknown = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new PresentationImageAuthenticationRequiredError("Sign in before uploading images");
  }
  if (!response.ok) {
    throw new PitchAssetFileError(uploadErrorMessage(response.status, responseBody));
  }

  const uploadedImage = uploadedImageFromResponse(responseBody);
  if (!uploadedImage) {
    throw new PitchAssetFileError("The image upload returned an invalid response");
  }

  return {
    ...uploadedImage,
    optimized: preparedImage.optimized || uploadedImage.optimized
  };
}

export async function uploadSupabasePresentationImage(
  client: SlideXSupabaseClient,
  input: UploadSupabasePresentationImageInput
): Promise<UploadedSupabasePresentationImage> {
  const userId = await authenticatedUserId(client);
  const preparedImage = await preparePitchAssetFile(input.file);
  if (preparedImage.kind !== "image") {
    throw new PitchAssetFileError("Only images can be uploaded to a presentation");
  }

  const id = crypto.randomUUID();
  const path = storagePath(userId, input.presentationId, id, preparedImage.file.type);
  const { error } = await client.storage.from(presentationImagesBucket).upload(path, preparedImage.file, {
    cacheControl: String(pitchAssetCacheControlSeconds),
    contentType: preparedImage.file.type,
    upsert: false
  });

  if (error) throw new Error(error.message);

  return {
    id,
    mimeType: preparedImage.file.type,
    name: preparedImage.file.name,
    optimized: preparedImage.optimized,
    path,
    size: preparedImage.file.size
  };
}

export async function deleteSupabasePresentationImage(
  client: SlideXSupabaseClient,
  image: Pick<UploadedSupabasePresentationImage, "path">
) {
  await removeStorageObjects(client, [image.path]);
}

export async function deleteSupabasePresentationImagesForPresentation(
  client: SlideXSupabaseClient,
  presentationId: string
) {
  const userId = await authenticatedUserId(client);
  const prefix = `${userId}/${presentationId}`;
  const paths = await listStorageObjectPaths(client, prefix);
  await removeStorageObjects(client, paths);
}

export async function createSupabasePresentationImageUrl(
  client: SlideXSupabaseClient,
  image: Pick<UploadedSupabasePresentationImage, "path">,
  expiresInSeconds = 3600
) {
  const { data, error } = await client.storage
    .from(presentationImagesBucket)
    .createSignedUrl(image.path, expiresInSeconds);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

async function authenticatedUserId(client: SlideXSupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign in before accessing presentation images");
  return data.user.id;
}

async function listStorageObjectPaths(client: SlideXSupabaseClient, prefix: string) {
  const paths: string[] = [];

  for (let offset = 0; ; offset += storageListPageSize) {
    const { data, error } = await client.storage.from(presentationImagesBucket).list(prefix, {
      limit: storageListPageSize,
      offset,
      sortBy: { column: "name", order: "asc" }
    });

    if (error) throw new Error(error.message);
    paths.push(...data.filter((item) => item.id).map((item) => `${prefix}/${item.name}`));
    if (data.length < storageListPageSize) break;
  }

  return paths;
}

async function removeStorageObjects(client: SlideXSupabaseClient, paths: readonly string[]) {
  for (let index = 0; index < paths.length; index += storageDeleteBatchSize) {
    const batch = paths.slice(index, index + storageDeleteBatchSize);
    if (batch.length === 0) continue;

    const { error } = await client.storage.from(presentationImagesBucket).remove(batch);
    if (error) throw new Error(error.message);
  }
}

function storagePath(userId: string, presentationId: string, imageId: string, mimeType: string) {
  return `${userId}/${presentationId}/${imageId}.${imageExtension(mimeType)}`;
}

function imageExtension(mimeType: string) {
  const extensions: Record<string, string> = {
    "image/avif": "avif",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };
  const extension = extensions[mimeType.toLowerCase()];
  if (!extension) throw new PitchAssetFileError("This image type is not supported");
  return extension;
}

function uploadedImageFromResponse(value: unknown): UploadedSupabasePresentationImage | null {
  if (!value || typeof value !== "object" || !("image" in value)) return null;
  const image = value.image;
  if (!image || typeof image !== "object") return null;

  const candidate = image as Partial<UploadedSupabasePresentationImage>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.mimeType !== "string" ||
    typeof candidate.name !== "string" ||
    typeof candidate.optimized !== "boolean" ||
    typeof candidate.path !== "string" ||
    typeof candidate.size !== "number" ||
    !Number.isFinite(candidate.size) ||
    !isPresentationImageStoragePath(candidate.path)
  ) {
    return null;
  }

  return candidate as UploadedSupabasePresentationImage;
}

function uploadErrorMessage(status: number, value: unknown) {
  if (
    status === 400 &&
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }
  if (status === 404) {
    return "This presentation is unavailable. Reload SlideX and try again.";
  }
  if (status === 413) {
    return "Images must be 10 MB or smaller";
  }
  return "The image could not be uploaded. Try again.";
}
