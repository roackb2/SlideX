import type { SupabaseClient } from "@supabase/supabase-js";
import { pitchAssetCacheControlSeconds } from "@/features/pitch/application/pitchAssetPolicy";
import { preparePitchAssetFile } from "@/features/pitch/infrastructure/pitchAssetFiles";

const presentationAssetsBucket = "presentation-assets";
const storageListPageSize = 100;
const storageDeleteBatchSize = 100;

type SlideXSupabaseClient = SupabaseClient;

export type UploadSupabasePresentationAssetInput = {
  file: File;
  presentationId: string;
  uploadedBy: string;
  workspaceId: string;
};

export type UploadedSupabasePresentationAsset = {
  id: string;
  kind: "file" | "image" | "video";
  mimeType: string;
  originalName: string;
  originalPath: string;
  previewMimeType: string | null;
  previewPath: string | null;
  previewSize: number;
  size: number;
};

type StoredAssetPaths = {
  id: string;
  preview_storage_path: string | null;
  storage_path: string;
};

 export async function uploadSupabasePresentationAsset(
  client: SlideXSupabaseClient,
  input: UploadSupabasePresentationAssetInput
): Promise<UploadedSupabasePresentationAsset> {
  const preparedAsset = await preparePitchAssetFile(input.file);
  const assetId = crypto.randomUUID();
  const originalPath = storagePath(
    input.workspaceId,
    input.presentationId,
    assetId,
    "original",
    preparedAsset.originalFile.name
  );
  const previewPath = preparedAsset.optimized
    ? storagePath(
        input.workspaceId,
        input.presentationId,
        assetId,
        "preview",
        preparedAsset.file.name
      )
    : null;
  const uploadedPaths: string[] = [];

  try {
    await uploadStorageObject(client, originalPath, preparedAsset.originalFile);
    uploadedPaths.push(originalPath);

    if (previewPath) {
      await uploadStorageObject(client, previewPath, preparedAsset.file);
      uploadedPaths.push(previewPath);
    }

    const { error: metadataError } = await client.from("presentation_assets").insert({
      byte_size: preparedAsset.originalFile.size,
      id: assetId,
      kind: preparedAsset.kind,
      mime_type: preparedAsset.originalFile.type,
      original_name: input.file.name,
      presentation_id: input.presentationId,
      preview_byte_size: previewPath ? preparedAsset.file.size : 0,
      preview_mime_type: previewPath ? preparedAsset.file.type : null,
      preview_storage_path: previewPath,
      storage_path: originalPath,
      uploaded_by: input.uploadedBy,
      workspace_id: input.workspaceId
    });

    if (metadataError) throw new Error(metadataError.message);
  } catch (error) {
    await removeStorageObjects(client, uploadedPaths);
    throw error;
  }

  return {
    id: assetId,
    kind: preparedAsset.kind,
    mimeType: preparedAsset.originalFile.type,
    originalName: input.file.name,
    originalPath,
    previewMimeType: previewPath ? preparedAsset.file.type : null,
    previewPath,
    previewSize: previewPath ? preparedAsset.file.size : 0,
    size: preparedAsset.originalFile.size
  };
}

export async function deleteSupabasePresentationAsset(
  client: SlideXSupabaseClient,
  asset: Pick<UploadedSupabasePresentationAsset, "id" | "originalPath" | "previewPath">
) {
  await removeStorageObjects(client, assetPaths(asset));

  const { error: metadataError } = await client.from("presentation_assets").delete().eq("id", asset.id);
  if (metadataError) throw new Error(metadataError.message);
}

export async function deleteSupabasePresentationAssetsForPresentation(
  client: SlideXSupabaseClient,
  presentationId: string
) {
  const { data, error } = await client
    .from("presentation_assets")
    .select("id, storage_path, preview_storage_path")
    .eq("presentation_id", presentationId);

  if (error) throw new Error(error.message);

  const assets = data satisfies StoredAssetPaths[];
  await removeStorageObjects(client, assets.flatMap(storedAssetPaths));

  const { error: metadataError } = await client
    .from("presentation_assets")
    .delete()
    .eq("presentation_id", presentationId);

  if (metadataError) throw new Error(metadataError.message);
}

export async function removeOrphanedSupabasePresentationAssetObjects(
  client: SlideXSupabaseClient,
  workspaceId: string,
  presentationId: string
) {
  const { data, error } = await client
    .from("presentation_assets")
    .select("id, storage_path, preview_storage_path")
    .eq("workspace_id", workspaceId)
    .eq("presentation_id", presentationId);

  if (error) throw new Error(error.message);

  const knownPaths = new Set((data satisfies StoredAssetPaths[]).flatMap(storedAssetPaths));
  const prefix = `${workspaceId}/${presentationId}`;
  const storedPaths = await listStorageObjectPaths(client, prefix);
  const orphanedPaths = storedPaths.filter((path) => !knownPaths.has(path));

  await removeStorageObjects(client, orphanedPaths);
  return orphanedPaths.length;
}

export async function createSupabasePresentationAssetPreviewUrl(
  client: SlideXSupabaseClient,
  asset: Pick<UploadedSupabasePresentationAsset, "originalPath" | "previewPath">,
  expiresInSeconds = 3600
) {
  return createSupabasePresentationAssetUrl(
    client,
    asset.previewPath ?? asset.originalPath,
    expiresInSeconds
  );
}

export async function createSupabasePresentationAssetOriginalUrl(
  client: SlideXSupabaseClient,
  asset: Pick<UploadedSupabasePresentationAsset, "originalPath">,
  expiresInSeconds = 3600
) {
  return createSupabasePresentationAssetUrl(client, asset.originalPath, expiresInSeconds);
}

async function createSupabasePresentationAssetUrl(
  client: SlideXSupabaseClient,
  path: string,
  expiresInSeconds: number
) {
  const { data, error } = await client.storage
    .from(presentationAssetsBucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

async function uploadStorageObject(client: SlideXSupabaseClient, path: string, file: File) {
  const { error } = await client.storage.from(presentationAssetsBucket).upload(path, file, {
    cacheControl: String(pitchAssetCacheControlSeconds),
    contentType: file.type,
    upsert: false
  });

  if (error) throw new Error(error.message);
}

async function listStorageObjectPaths(client: SlideXSupabaseClient, prefix: string) {
  const paths: string[] = [];

  for (let offset = 0; ; offset += storageListPageSize) {
    const { data, error } = await client.storage.from(presentationAssetsBucket).list(prefix, {
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

    const { error } = await client.storage.from(presentationAssetsBucket).remove(batch);
    if (error) throw new Error(error.message);
  }
}

function assetPaths(asset: Pick<UploadedSupabasePresentationAsset, "originalPath" | "previewPath">) {
  return [asset.originalPath, asset.previewPath].filter((path): path is string => Boolean(path));
}

function storedAssetPaths(asset: StoredAssetPaths) {
  return [asset.storage_path, asset.preview_storage_path].filter((path): path is string => Boolean(path));
}

function storagePath(
  workspaceId: string,
  presentationId: string,
  assetId: string,
  variant: "original" | "preview",
  fileName: string
) {
  return `${workspaceId}/${presentationId}/${assetId}-${variant}-${safeFileName(fileName)}`;
}

function safeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";
}
