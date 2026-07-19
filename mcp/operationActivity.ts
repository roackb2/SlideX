export type McpOperationTarget =
  | { kind: "presentation" }
  | { kind: "slide"; slideIndex: number }
  | { kind: "block"; nodeId: string; slideIndex: number };

export type StartMcpOperationInput = {
  presentationId: string;
  target: McpOperationTarget;
  toolName: string;
};

export type CompleteMcpOperationInput = {
  completedRevision?: number;
  operationId: string;
  target?: McpOperationTarget;
};

export type FailMcpOperationInput = {
  errorCode: string;
  operationId: string;
};

export interface McpOperationActivityStore {
  completeOperation(input: CompleteMcpOperationInput): Promise<void>;
  failOperation(input: FailMcpOperationInput): Promise<void>;
  startOperation(input: StartMcpOperationInput): Promise<string>;
}

export function safeMcpOperationErrorCode(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("changed") || message.includes("revision")) {
    return "revision_conflict";
  }
  if (message.includes("not found") || message.includes("not accessible")) {
    return "inaccessible";
  }
  if (message.includes("rate") && message.includes("limit")) {
    return "rate_limited";
  }
  if (message.includes("quota")) {
    return "quota_exceeded";
  }
  if (message.includes("invalid") || message.includes("outside") || message.includes("must")) {
    return "invalid_input";
  }
  return "operation_failed";
}

export async function safelyStartMcpOperation(
  activity: McpOperationActivityStore | undefined,
  input: StartMcpOperationInput
) {
  if (!activity) return undefined;
  try {
    return await activity.startOperation(input);
  } catch {
    return undefined;
  }
}

export async function safelyCompleteMcpOperation(
  activity: McpOperationActivityStore | undefined,
  input: CompleteMcpOperationInput
) {
  if (!activity) return;
  try {
    await activity.completeOperation(input);
  } catch {
    // Activity visibility is best effort and must never weaken the underlying operation.
  }
}

export async function safelyFailMcpOperation(
  activity: McpOperationActivityStore | undefined,
  operationId: string | undefined,
  error: unknown
) {
  if (!activity || !operationId) return;
  try {
    await activity.failOperation({
      errorCode: safeMcpOperationErrorCode(error),
      operationId
    });
  } catch {
    // Activity visibility is best effort and must never replace the original error.
  }
}
