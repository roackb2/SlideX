import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import type { McpPresentationImageUploadStore } from "@/mcp/presentationImageUploadStore";
import { mcpPresentationImageMimeTypes } from "@/mcp/presentationImageUploadStore";
import { runAsyncMcpTool } from "@/mcp/remotePresentationHelpers";
import { requiredPresentationIdSchema } from "@/mcp/remotePresentationSchemas";

const maximumImageBytes = 10 * 1024 * 1024;

export type RemotePresentationImageUploadOptions = {
  origin: string;
  store: McpPresentationImageUploadStore;
  userId: string;
};

export function registerRemotePresentationImageUploadTools(
  server: McpServer,
  options: RemotePresentationImageUploadOptions
) {
  server.registerTool(
    "slidex_prepare_presentation_image_upload",
    {
      title: "Prepare Private Presentation Image Upload",
      description:
        "Create a ten-minute, single-use upload request for a private image owned by one SlideX presentation. Upload the exact local file with the returned PUT request, then call slidex_finalize_presentation_image_upload.",
      inputSchema: {
        byteLength: z.number().int().min(1).max(maximumImageBytes),
        contentType: z.enum(mcpPresentationImageMimeTypes),
        presentationId: requiredPresentationIdSchema
      }
    },
    ({ byteLength, contentType, presentationId }) =>
      runAsyncMcpTool(() => options.store.prepareUpload({
        byteLength,
        contentType,
        origin: options.origin,
        presentationId,
        userId: options.userId
      }))
  );

  server.registerTool(
    "slidex_finalize_presentation_image_upload",
    {
      title: "Finalize Private Presentation Image Upload",
      description:
        "Return the canonical private SlideX image source after a prepared upload completed successfully. Use the returned src with an ImageBlock.",
      inputSchema: {
        presentationId: requiredPresentationIdSchema,
        uploadId: z.string().uuid()
      }
    },
    ({ presentationId, uploadId }) =>
      runAsyncMcpTool(() => options.store.finalizeUpload({
        presentationId,
        uploadId,
        userId: options.userId
      }))
  );
}
