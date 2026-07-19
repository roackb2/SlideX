import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  McpOperationActivity,
  McpOperationActivityTarget
} from "@/features/workspace/domain/mcpOperationActivity";

type OperationRow = {
  client_id: string;
  client_name: string;
  completed_at: string | null;
  completed_revision: number | null;
  created_at: string;
  error_code: string | null;
  expires_at: string;
  id: string;
  node_id: string | null;
  presentation_id: string;
  slide_index: number | null;
  status: "running" | "completed" | "failed";
  target_kind: "presentation" | "slide" | "block";
  tool_name: string;
  updated_at: string;
  user_id: string;
};
type SlideXSupabaseClient = SupabaseClient;

const activityColumns = "id,user_id,presentation_id,client_id,client_name,tool_name,status,target_kind,slide_index,node_id,completed_revision,error_code,created_at,updated_at,completed_at,expires_at";

export async function listSupabaseMcpOperationActivities(
  client: SlideXSupabaseClient,
  options: { limit?: number; presentationId?: string } = {}
) {
  let query = client
    .from("mcp_operation_events")
    .select(activityColumns)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(options.limit ?? 50, 1), 100));

  if (options.presentationId) query = query.eq("presentation_id", options.presentationId);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(toMcpOperationActivity);
}

export function parseSupabaseMcpOperationRealtimeChange(
  value: unknown,
  expectedOwnerId: string
) {
  if (
    !isUnknownRecord(value) ||
    value.type !== "broadcast" ||
    !isUnknownRecord(value.payload) ||
    value.payload.schema !== "public" ||
    value.payload.table !== "mcp_operation_events"
  ) return null;

  const operation = value.payload.operation;
  if (operation !== "INSERT" && operation !== "UPDATE" && operation !== "DELETE") return null;
  if (value.event !== operation) return null;
  const record = operation === "DELETE" ? value.payload.old_record : value.payload.record;
  if (!isOperationRow(record) || record.user_id !== expectedOwnerId) return null;

  return {
    activity: toMcpOperationActivity(record),
    event: operation
  } as const;
}

function toMcpOperationActivity(row: OperationRow): McpOperationActivity {
  return {
    clientId: row.client_id,
    clientName: row.client_name,
    completedAt: row.completed_at ?? undefined,
    completedRevision: row.completed_revision ?? undefined,
    createdAt: row.created_at,
    errorCode: row.error_code ?? undefined,
    expiresAt: row.expires_at,
    id: row.id,
    presentationId: row.presentation_id,
    status: row.status,
    target: targetFromRow(row),
    toolName: row.tool_name,
    updatedAt: row.updated_at
  };
}

function targetFromRow(row: OperationRow): McpOperationActivityTarget {
  if (row.target_kind === "block" && row.slide_index !== null && row.node_id) {
    return { kind: "block", nodeId: row.node_id, slideIndex: row.slide_index };
  }
  if (row.target_kind === "slide" && row.slide_index !== null) {
    return { kind: "slide", slideIndex: row.slide_index };
  }
  return { kind: "presentation" };
}

function isOperationRow(value: unknown): value is OperationRow {
  if (!isUnknownRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.user_id === "string" &&
    typeof value.presentation_id === "string" &&
    typeof value.client_id === "string" &&
    typeof value.client_name === "string" &&
    typeof value.tool_name === "string" &&
    (value.status === "running" || value.status === "completed" || value.status === "failed") &&
    (value.target_kind === "presentation" || value.target_kind === "slide" || value.target_kind === "block") &&
    (value.slide_index === null || typeof value.slide_index === "number") &&
    (value.node_id === null || typeof value.node_id === "string") &&
    (value.completed_revision === null || typeof value.completed_revision === "number") &&
    (value.error_code === null || typeof value.error_code === "string") &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string" &&
    (value.completed_at === null || typeof value.completed_at === "string") &&
    typeof value.expires_at === "string"
  );
}

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
