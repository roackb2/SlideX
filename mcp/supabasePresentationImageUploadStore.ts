import { createHash, randomBytes } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/common/lib/supabase/database.types";
import { pitchAssetCacheControlSeconds } from "@/features/pitch/application/pitchAssetPolicy";
import { presentationImageSource } from "@/features/pitch/application/presentationImagePath";
import type {
  ClaimedMcpPresentationImageUpload,
  CompletedMcpPresentationImage,
  McpPresentationImageMimeType,
  McpPresentationImageUploadStore,
  PreparedMcpPresentationImageUpload
} from "@/mcp/presentationImageUploadStore";

const presentationImagesBucket = "presentation-images";

export class SupabaseMcpPresentationImageUploadStore
implements McpPresentationImageUploadStore {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async prepareUpload(input: {
    byteLength: number;
    contentType: McpPresentationImageMimeType;
    origin: string;
    presentationId: string;
    userId: string;
  }): Promise<PreparedMcpPresentationImageUpload> {
    const token = createUploadToken();
    const { data, error } = await this.client.rpc("mcp_prepare_presentation_image_upload", {
      actor_user_id: input.userId,
      credential_hash: hashUploadToken(token),
      requested_mime_type: input.contentType,
      requested_size: input.byteLength,
      target_presentation_id: input.presentationId
    });

    if (error) throw error;
    const result = data[0];
    if (!result) throw new Error("The image upload did not return a result.");
    if (result.result_status === "inaccessible") {
      throw new Error("Presentation not found or not accessible.");
    }
    if (result.result_status === "rate_limited") {
      return {
        retryAfterSeconds: result.retry_after_seconds ?? 30,
        status: "rate_limited",
        tokensRemaining: 0
      };
    }
    if (result.result_status === "quota_exceeded") {
      return {
        status: "quota_exceeded",
        tokensRemaining: result.tokens_remaining ?? 0
      };
    }
    if (!result.upload_id || !result.expires_at || result.tokens_remaining === null) {
      throw new Error("The image upload did not return a complete intent.");
    }

    const uploadUrl = new URL(
      `/api/mcp/presentation-image-uploads/${result.upload_id}/`,
      input.origin
    ).toString();
    return {
      expiresAt: result.expires_at,
      request: {
        headers: {
          Authorization: `Upload ${token}`,
          "Content-Type": input.contentType
        },
        method: "PUT",
        url: uploadUrl
      },
      status: "prepared",
      tokensRemaining: result.tokens_remaining,
      uploadId: result.upload_id
    };
  }

  async claimUpload(uploadId: string, token: string) {
    const { data, error } = await this.client.rpc("mcp_claim_presentation_image_upload", {
      credential_hash: hashUploadToken(token),
      target_upload_id: uploadId
    });
    if (error) throw error;

    const result = data[0];
    if (
      !result ||
      result.result_status !== "claimed" ||
      !result.upload_id ||
      !result.user_id ||
      !result.presentation_id ||
      !isMcpImageMimeType(result.expected_mime_type) ||
      typeof result.expected_size !== "number" ||
      !result.storage_path
    ) {
      return null;
    }

    return {
      expectedMimeType: result.expected_mime_type,
      expectedSize: result.expected_size,
      presentationId: result.presentation_id,
      storagePath: result.storage_path,
      uploadId: result.upload_id,
      userId: result.user_id
    } satisfies ClaimedMcpPresentationImageUpload;
  }

  async storeImage(input: { bytes: Uint8Array; path: string }) {
    const { error } = await this.client.storage
      .from(presentationImagesBucket)
      .upload(input.path, input.bytes, {
        cacheControl: String(pitchAssetCacheControlSeconds),
        contentType: "image/webp",
        upsert: false
      });
    if (error) throw error;
  }

  async completeUpload(uploadId: string, storedSize: number) {
    const { data, error } = await this.client.rpc("mcp_complete_presentation_image_upload", {
      stored_size: storedSize,
      target_upload_id: uploadId
    });
    if (error) throw error;
    return data;
  }

  async rejectUpload(uploadId: string) {
    const { error } = await this.client.rpc("mcp_reject_presentation_image_upload", {
      target_upload_id: uploadId
    });
    if (error) throw error;
  }

  async removeStoredImage(path: string) {
    const { error } = await this.client.storage.from(presentationImagesBucket).remove([path]);
    if (error) throw error;
  }

  async finalizeUpload(input: {
    presentationId: string;
    uploadId: string;
    userId: string;
  }): Promise<CompletedMcpPresentationImage> {
    const { data, error } = await this.client
      .from("mcp_image_upload_intents")
      .select("id,actual_size,status,storage_path")
      .eq("id", input.uploadId)
      .eq("presentation_id", input.presentationId)
      .eq("user_id", input.userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Image upload not found or not accessible.");
    if (data.status !== "completed" || data.actual_size === null) {
      throw new Error("The image upload has not completed.");
    }

    return {
      id: data.id,
      mimeType: "image/webp",
      path: data.storage_path,
      size: data.actual_size,
      src: presentationImageSource(data.storage_path)
    };
  }
}

function createUploadToken() {
  return `slx_up_${randomBytes(32).toString("base64url")}`;
}

function hashUploadToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function isMcpImageMimeType(value: string | null): value is McpPresentationImageMimeType {
  return value === "image/jpeg" || value === "image/png" || value === "image/webp";
}
