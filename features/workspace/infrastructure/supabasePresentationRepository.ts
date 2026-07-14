import type { SupabaseClient } from "@supabase/supabase-js";
import type { GuestDemoImportInput } from "@/features/workspace/application/guestDemoImport";
import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";

type SlideXSupabaseClient = SupabaseClient;

type PresentationRow = {
  created_at: string;
  id: string;
  last_opened_at: string;
  source: string;
  source_revision: number;
  template_id: string | null;
  title: string;
  updated_at: string;
  user_id: string;
};

function toWorkspacePresentation(row: PresentationRow): WorkspacePresentation {
  return {
    createdAt: row.created_at,
    id: row.id,
    kind: "presentation",
    lastOpenedAt: row.last_opened_at,
    ownerId: row.user_id,
    source: row.source,
    sourceRevision: row.source_revision,
    templateId: row.template_id ?? undefined,
    title: row.title,
    updatedAt: row.updated_at
  };
}

function isPresentationRow(value: unknown): value is PresentationRow {
  if (typeof value !== "object" || value === null) return false;
  return (
    "created_at" in value && typeof value.created_at === "string" &&
    "id" in value && typeof value.id === "string" &&
    "last_opened_at" in value && typeof value.last_opened_at === "string" &&
    "source" in value && typeof value.source === "string" &&
    "source_revision" in value && typeof value.source_revision === "number" &&
    "template_id" in value && (value.template_id === null || typeof value.template_id === "string") &&
    "title" in value && typeof value.title === "string" &&
    "updated_at" in value && typeof value.updated_at === "string" &&
    "user_id" in value && typeof value.user_id === "string"
  );
}

export async function importGuestDemoPresentation(input: GuestDemoImportInput) {
  const response = await fetch("/api/presentations/import-demo", {
    body: JSON.stringify(input),
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    method: "POST"
  });
  const payload: unknown = await response.json().catch(() => null);
  const presentation = typeof payload === "object" && payload !== null && "presentation" in payload
    ? payload.presentation
    : null;

  if (!response.ok || !isPresentationRow(presentation)) {
    throw new Error("The demo presentation could not be saved to your workspace.");
  }

  return toWorkspacePresentation(presentation);
}

export async function getSupabasePresentation(
  client: SlideXSupabaseClient,
  presentationId: string
) {
  const { error: touchError } = await client.rpc("touch_presentation_opened", {
    target_presentation_id: presentationId
  });
  if (touchError) throw touchError;

  const { data, error } = await client
    .from("presentations")
    .select("id,user_id,title,source,source_revision,template_id,created_at,updated_at,last_opened_at")
    .eq("id", presentationId)
    .maybeSingle();

  if (error) throw error;
  return data ? toWorkspacePresentation(data) : null;
}

export async function updateSupabasePresentation(
  client: SlideXSupabaseClient,
  presentationId: string,
  expectedSourceRevision: number,
  updates: Pick<WorkspacePresentation, "source" | "title">
) {
  const { data, error } = await client.rpc("compare_and_swap_presentation_source", {
    expected_source_revision: expectedSourceRevision,
    next_source: updates.source,
    next_title: updates.title.trim(),
    target_presentation_id: presentationId
  });

  if (error?.code === "40001") {
    throw new PresentationRevisionConflictError();
  }
  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : null;
  if (!result || typeof result.source_revision !== "number") {
    throw new Error("The presentation save did not return a new source revision.");
  }

  return {
    sourceRevision: result.source_revision,
    updatedAt: typeof result.updated_at === "string" ? result.updated_at : new Date().toISOString()
  };
}

export class PresentationRevisionConflictError extends Error {
  constructor() {
    super("The presentation changed in another editor or Agent session.");
    this.name = "PresentationRevisionConflictError";
  }
}

export async function deleteSupabasePresentation(
  client: SlideXSupabaseClient,
  presentationId: string
) {
  const { error } = await client.functions.invoke("delete-presentation", {
    body: { presentationId }
  });

  if (error) throw new Error(error.message);
}
