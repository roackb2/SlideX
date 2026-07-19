import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { McpPresentationStore } from "@/mcp/presentationStore";
import type { McpOperationActivityStore } from "@/mcp/operationActivity";
import {
  registerRemotePresentationImageUploadTools,
  type RemotePresentationImageUploadOptions
} from "@/mcp/remotePresentationImageUploadMcp";
import { registerRemotePresentationReadTools } from "@/mcp/remotePresentationReadMcp";
import { registerRemotePresentationWriteTools } from "@/mcp/remotePresentationWriteMcp";

type RemotePresentationMcpOptions = {
  enableWrites: boolean;
  imageUploads?: RemotePresentationImageUploadOptions;
  operationActivity?: McpOperationActivityStore;
  presentationStore: McpPresentationStore;
};

export function registerRemotePresentationMcp(
  server: McpServer,
  { enableWrites, imageUploads, operationActivity, presentationStore }: RemotePresentationMcpOptions
) {
  registerRemotePresentationReadTools(server, presentationStore);

  if (enableWrites) {
    registerRemotePresentationWriteTools(server, presentationStore, operationActivity);
  }

  if (imageUploads) {
    registerRemotePresentationImageUploadTools(server, imageUploads, operationActivity);
  }
}
