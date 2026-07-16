import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { summarizeMotionDoc } from "@/core/motion-doc/application/motionDocAutomation";
import { jsonMcpResult } from "@/mcp/mcpResults";
import type { McpPresentation, McpPresentationStore } from "@/mcp/presentationStore";

export async function mutatePresentation(
  store: McpPresentationStore,
  presentationId: string | undefined,
  expectedRevision: number,
  mutate: (source: string) => { source: string; [key: string]: unknown }
) {
  return runAsyncMcpTool(async () => {
    const current = await store.getPresentation(presentationId);
    if (current.sourceRevision !== expectedRevision) {
      throw new Error(
        `The presentation changed. Current revision is ${current.sourceRevision}; read it again before saving.`
      );
    }

    const mutation = mutate(current.source);
    assertValidSource(mutation.source);
    const presentation = await store.savePresentation({
      expectedRevision,
      presentationId: current.id,
      source: mutation.source
    });

    const details: Record<string, unknown> = { ...mutation };
    delete details.source;
    delete details.summary;
    return {
      ...details,
      autoSelected: presentationId === undefined,
      presentation
    };
  });
}

export function readWithPresentation<T>(
  store: McpPresentationStore,
  presentationId: string | undefined,
  read: (presentation: McpPresentation) => T
) {
  return runAsyncMcpTool(async () => {
    const presentation = await store.getPresentation(presentationId);
    return {
      autoSelected: presentationId === undefined,
      presentation: presentationSummary(presentation),
      result: read(presentation)
    };
  });
}

export function presentationSummary(presentation: McpPresentation) {
  return {
    id: presentation.id,
    lastOpenedAt: presentation.lastOpenedAt,
    sourceRevision: presentation.sourceRevision,
    title: presentation.title,
    updatedAt: presentation.updatedAt
  };
}

export function assertValidSource(source: string) {
  if (!summarizeMotionDoc(source).validation.isValid) {
    throw new Error("The MotionDoc source is invalid and was not saved.");
  }
}

export async function runAsyncMcpTool<T>(
  callback: () => Promise<T>
): Promise<CallToolResult> {
  try {
    return jsonMcpResult(await callback());
  } catch (error) {
    return {
      content: [
        {
          text: error instanceof Error ? error.message : String(error),
          type: "text"
        }
      ],
      isError: true
    };
  }
}
