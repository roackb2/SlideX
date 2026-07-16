import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { McpPresentationStore } from "@/mcp/presentationStore";
import { registerRemotePresentationReadTools } from "@/mcp/remotePresentationReadMcp";
import { registerRemotePresentationWriteTools } from "@/mcp/remotePresentationWriteMcp";

type RemotePresentationMcpOptions = {
  enableWrites: boolean;
  presentationStore: McpPresentationStore;
};

export function registerRemotePresentationMcp(
  server: McpServer,
  { enableWrites, presentationStore }: RemotePresentationMcpOptions
) {
  registerRemotePresentationReadTools(server, presentationStore);

  if (enableWrites) {
    registerRemotePresentationWriteTools(server, presentationStore);
  }
}
