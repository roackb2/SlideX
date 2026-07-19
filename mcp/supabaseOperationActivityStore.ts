import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/common/lib/supabase/database.types";
import type {
  CompleteMcpOperationInput,
  FailMcpOperationInput,
  McpOperationActivityStore,
  McpOperationTarget,
  StartMcpOperationInput
} from "@/mcp/operationActivity";

type SupabaseOperationActivityContext = {
  clientId: string;
  clientName: string;
  userId: string;
};

export class SupabaseMcpOperationActivityStore implements McpOperationActivityStore {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly context: SupabaseOperationActivityContext
  ) {}

  async startOperation(input: StartMcpOperationInput) {
    const { data, error } = await this.client
      .from("mcp_operation_events")
      .insert({
        client_id: this.context.clientId,
        client_name: this.context.clientName,
        presentation_id: input.presentationId,
        status: "running",
        tool_name: input.toolName,
        user_id: this.context.userId,
        ...targetColumns(input.target)
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  }

  async completeOperation(input: CompleteMcpOperationInput) {
    const update: Database["public"]["Tables"]["mcp_operation_events"]["Update"] = {
      completed_at: new Date().toISOString(),
      completed_revision: input.completedRevision,
      status: "completed"
    };
    if (input.target) Object.assign(update, targetColumns(input.target));

    const { error } = await this.client
      .from("mcp_operation_events")
      .update(update)
      .eq("id", input.operationId)
      .eq("user_id", this.context.userId)
      .eq("status", "running");

    if (error) throw error;
  }

  async failOperation(input: FailMcpOperationInput) {
    const { error } = await this.client
      .from("mcp_operation_events")
      .update({
        completed_at: new Date().toISOString(),
        error_code: input.errorCode,
        status: "failed"
      })
      .eq("id", input.operationId)
      .eq("user_id", this.context.userId)
      .eq("status", "running");

    if (error) throw error;
  }
}

function targetColumns(target: McpOperationTarget) {
  if (target.kind === "presentation") {
    return {
      node_id: null,
      slide_index: null,
      target_kind: target.kind
    } as const;
  }

  return {
    node_id: target.kind === "block" ? target.nodeId : null,
    slide_index: target.slideIndex,
    target_kind: target.kind
  } as const;
}
