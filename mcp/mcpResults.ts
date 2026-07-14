import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function runMcpTool<T>(callback: () => T): CallToolResult {
  try {
    return jsonMcpResult(callback());
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : String(error)
        }
      ],
      isError: true
    };
  }
}

export function jsonMcpResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: toJson(data)
      }
    ],
    structuredContent: {
      result: data
    }
  };
}

export function toJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}
