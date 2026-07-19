export type McpOperationActivityStatus = "running" | "completed" | "failed";

export type McpOperationActivityTarget =
  | { kind: "presentation" }
  | { kind: "slide"; slideIndex: number }
  | { kind: "block"; nodeId: string; slideIndex: number };

export type McpOperationActivity = {
  clientId: string;
  clientName: string;
  completedAt?: string;
  completedRevision?: number;
  createdAt: string;
  errorCode?: string;
  expiresAt: string;
  id: string;
  presentationId: string;
  status: McpOperationActivityStatus;
  target: McpOperationActivityTarget;
  toolName: string;
  updatedAt: string;
};
