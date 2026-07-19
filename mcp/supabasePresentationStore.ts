import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/common/lib/supabase/database.types";
import type {
  McpPresentation,
  McpPresentationSummary,
  McpPresentationStore,
  SavedMcpPresentation,
  SaveMcpPresentationInput
} from "@/mcp/presentationStore";

const presentationColumns = "id,title,source,source_revision,updated_at,last_opened_at";
const presentationSummaryColumns = "id,title,source_revision,updated_at,last_opened_at";

export class SupabaseMcpPresentationStore implements McpPresentationStore {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly userId: string,
    private readonly observeQueryDuration?: (durationMs: number) => void
  ) {}

  async getPresentation(presentationId?: string) {
    let query = this.client
      .from("presentations")
      .select(presentationColumns)
      .eq("user_id", this.userId);

    query = presentationId
      ? query.eq("id", presentationId)
      : query.order("last_opened_at", { ascending: false }).limit(1);

    const { data, error } = await this.measureQuery(() => query.maybeSingle());

    if (error) throw error;
    if (!data) {
      throw new Error(
        presentationId
          ? "Presentation not found or not accessible."
          : "No presentation is available. Open or create a presentation in SlideX first."
      );
    }
    return toMcpPresentation(data);
  }

  async getPresentationSummary(presentationId?: string) {
    let query = this.client
      .from("presentations")
      .select(presentationSummaryColumns)
      .eq("user_id", this.userId);

    query = presentationId
      ? query.eq("id", presentationId)
      : query.order("last_opened_at", { ascending: false }).limit(1);

    const { data, error } = await this.measureQuery(() => query.maybeSingle());

    if (error) throw error;
    if (!data) {
      throw new Error(
        presentationId
          ? "Presentation not found or not accessible."
          : "No presentation is available. Open or create a presentation in SlideX first."
      );
    }
    return toMcpPresentationSummary(data);
  }

  async listPresentations(limit = 20) {
    const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
    const query = this.client
      .from("presentations")
      .select(presentationSummaryColumns)
      .eq("user_id", this.userId)
      .order("last_opened_at", { ascending: false })
      .limit(safeLimit);
    const { data, error } = await this.measureQuery(() => query);

    if (error) throw error;
    return data.map(toMcpPresentationSummary);
  }

  async savePresentation(input: SaveMcpPresentationInput) {
    const { data, error } = await this.measureQuery(() =>
      this.client.rpc(
        "mcp_compare_and_swap_presentation_document",
        {
          actor_user_id: this.userId,
          expected_source_revision: input.expectedRevision,
          next_source: input.source,
          target_presentation_id: input.presentationId
        }
      )
    );

    if (error?.code === "40001") {
      throw new Error("The presentation changed. Read it again before saving.");
    }
    if (error?.code === "42501") {
      throw new Error("Presentation not found or not accessible.");
    }
    if (error) throw error;

    const result = data[0];
    if (!result) throw new Error("The presentation save did not return a revision.");
    if (result.result_status === "conflict") {
      throw new Error("The presentation changed. Read it again before saving.");
    }
    if (result.result_status === "inaccessible") {
      throw new Error("Presentation not found or not accessible.");
    }
    if (
      result.source_revision === null ||
      result.title === null ||
      result.updated_at === null
    ) {
      throw new Error("The presentation save did not return a complete revision.");
    }

    return {
      id: result.presentation_id,
      sourceRevision: result.source_revision,
      title: result.title,
      updatedAt: result.updated_at
    } satisfies SavedMcpPresentation;
  }

  private async measureQuery<T>(callback: () => PromiseLike<T>) {
    const startedAt = performance.now();
    try {
      return await callback();
    } finally {
      this.observeQueryDuration?.(performance.now() - startedAt);
    }
  }
}

function toMcpPresentation(row: {
  id: string;
  last_opened_at: string;
  source: string;
  source_revision: number;
  title: string;
  updated_at: string;
}) {
  return {
    id: row.id,
    lastOpenedAt: row.last_opened_at,
    source: row.source,
    sourceRevision: row.source_revision,
    title: row.title,
    updatedAt: row.updated_at
  } satisfies McpPresentation;
}

function toMcpPresentationSummary(row: {
  id: string;
  last_opened_at: string;
  source_revision: number;
  title: string;
  updated_at: string;
}) {
  return {
    id: row.id,
    lastOpenedAt: row.last_opened_at,
    sourceRevision: row.source_revision,
    title: row.title,
    updatedAt: row.updated_at
  } satisfies McpPresentationSummary;
}
