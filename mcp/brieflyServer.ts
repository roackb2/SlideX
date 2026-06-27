import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerBrieflyMcp } from "./brieflyMcp";

const server = new McpServer({
  name: "briefly-builder-review",
  version: "0.1.0"
});

registerBrieflyMcp(server);

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  await server.connect(new StdioServerTransport());
  console.error("Briefly MCP server is running on stdio.");
}
