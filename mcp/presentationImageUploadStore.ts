export const mcpPresentationImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;

export type McpPresentationImageMimeType = (typeof mcpPresentationImageMimeTypes)[number];

export type PreparedMcpPresentationImageUpload =
  | {
      retryAfterSeconds: number;
      status: "rate_limited";
      tokensRemaining: 0;
    }
  | {
      status: "quota_exceeded";
      tokensRemaining: number;
    }
  | {
      expiresAt: string;
      request: {
        headers: {
          Authorization: string;
          "Content-Type": McpPresentationImageMimeType;
        };
        method: "PUT";
        url: string;
      };
      status: "prepared";
      tokensRemaining: number;
      uploadId: string;
    };

export type ClaimedMcpPresentationImageUpload = {
  expectedMimeType: McpPresentationImageMimeType;
  expectedSize: number;
  presentationId: string;
  storagePath: string;
  uploadId: string;
  userId: string;
};

export type CompletedMcpPresentationImage = {
  id: string;
  mimeType: "image/webp";
  path: string;
  size: number;
  src: string;
};

export interface McpPresentationImageUploadStore {
  claimUpload(uploadId: string, token: string): Promise<ClaimedMcpPresentationImageUpload | null>;
  completeUpload(uploadId: string, storedSize: number): Promise<boolean>;
  finalizeUpload(input: {
    presentationId: string;
    uploadId: string;
    userId: string;
  }): Promise<CompletedMcpPresentationImage>;
  prepareUpload(input: {
    byteLength: number;
    contentType: McpPresentationImageMimeType;
    origin: string;
    presentationId: string;
    userId: string;
  }): Promise<PreparedMcpPresentationImageUpload>;
  rejectUpload(uploadId: string): Promise<void>;
  removeStoredImage(path: string): Promise<void>;
  storeImage(input: {
    bytes: Uint8Array;
    path: string;
  }): Promise<void>;
}
