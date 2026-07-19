import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { summarizeMotionDoc } from "@/core/motion-doc/application/motionDocAutomation";
import { jsonMcpResult } from "@/mcp/mcpResults";
import {
  safelyCompleteMcpOperation,
  safelyFailMcpOperation,
  safelyStartMcpOperation,
  type McpOperationActivityStore,
  type McpOperationTarget
} from "@/mcp/operationActivity";
import type {
  McpPresentation,
  McpPresentationStore,
  McpPresentationSummary
} from "@/mcp/presentationStore";

type MotionDocMutation = { source: string; [key: string]: unknown };

type MutationActivityOptions = {
  activity?: McpOperationActivityStore;
  completedTarget?: (input: {
    mutation: MotionDocMutation;
    nextSource: string;
    previousSource: string;
  }) => McpOperationTarget;
  target: McpOperationTarget | ((source: string) => McpOperationTarget);
  toolName: string;
};

export async function mutatePresentation(
  store: McpPresentationStore,
  presentationId: string | undefined,
  expectedRevision: number,
  mutate: (source: string) => MotionDocMutation,
  activityOptions?: MutationActivityOptions
) {
  return runAsyncMcpTool(async () => {
    const current = await store.getPresentation(presentationId);
    const initialTarget = resolveActivityTarget(activityOptions?.target, current.source);
    const operationId = activityOptions
      ? await safelyStartMcpOperation(activityOptions.activity, {
          presentationId: current.id,
          target: initialTarget,
          toolName: activityOptions.toolName
        })
      : undefined;

    try {
      if (current.sourceRevision !== expectedRevision) {
        throw new Error(
          `The presentation changed. Current revision is ${current.sourceRevision}; read it again before saving.`
        );
      }

      const mutation = mutate(current.source);
      assertValidSource(mutation.source);
      const savedPresentation = await store.savePresentation({
        expectedRevision,
        presentationId: current.id,
        source: mutation.source
      });
      const presentation = presentationSummary({
        ...savedPresentation,
        lastOpenedAt: current.lastOpenedAt
      });
      const completedTarget = activityOptions?.completedTarget
        ? resolveCompletedActivityTarget(activityOptions.completedTarget, {
            mutation,
            nextSource: mutation.source,
            previousSource: current.source
          }, initialTarget)
        : initialTarget;
      if (operationId) {
        await safelyCompleteMcpOperation(activityOptions?.activity, {
          completedRevision: presentation.sourceRevision,
          operationId,
          target: completedTarget
        });
      }

      const details: Record<string, unknown> = { ...mutation };
      delete details.source;
      delete details.summary;
      return {
        ...details,
        autoSelected: presentationId === undefined,
        presentation: presentationSummary(presentation)
      };
    } catch (error) {
      await safelyFailMcpOperation(activityOptions?.activity, operationId, error);
      throw error;
    }
  });
}

export function runTrackedMcpTool<T>(
  activity: McpOperationActivityStore | undefined,
  input: {
    presentationId: string;
    target: McpOperationTarget;
    toolName: string;
  },
  callback: () => Promise<T>
) {
  return runAsyncMcpTool(async () => {
    const operationId = await safelyStartMcpOperation(activity, input);
    try {
      const result = await callback();
      if (operationId) {
        await safelyCompleteMcpOperation(activity, { operationId, target: input.target });
      }
      return result;
    } catch (error) {
      await safelyFailMcpOperation(activity, operationId, error);
      throw error;
    }
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

export function readWithPresentationSummary<T>(
  store: McpPresentationStore,
  presentationId: string | undefined,
  read: (presentation: McpPresentationSummary) => T
) {
  return runAsyncMcpTool(async () => {
    const presentation = await store.getPresentationSummary(presentationId);
    return {
      autoSelected: presentationId === undefined,
      presentation,
      result: read(presentation)
    };
  });
}

export function presentationSummary(
  presentation: McpPresentationSummary
): McpPresentationSummary {
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

export async function runAsyncMcpTool<T, Structured = T>(
  callback: () => Promise<T>,
  toStructuredResult?: (result: T) => Structured
): Promise<CallToolResult> {
  try {
    const result = await callback();
    return jsonMcpResult(result, toStructuredResult?.(result) ?? result);
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

function resolveActivityTarget(
  target: MutationActivityOptions["target"] | undefined,
  source: string
): McpOperationTarget {
  if (!target) return { kind: "presentation" };
  try {
    return typeof target === "function" ? target(source) : target;
  } catch {
    return { kind: "presentation" };
  }
}

function resolveCompletedActivityTarget(
  resolver: NonNullable<MutationActivityOptions["completedTarget"]>,
  input: Parameters<NonNullable<MutationActivityOptions["completedTarget"]>>[0],
  fallback: McpOperationTarget
) {
  try {
    return resolver(input);
  } catch {
    return fallback;
  }
}
