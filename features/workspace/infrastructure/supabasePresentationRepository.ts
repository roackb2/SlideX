import type { SupabaseClient } from "@supabase/supabase-js";
import type { GuestDemoImportInput } from "@/features/workspace/application/guestDemoImport";
import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";

type SlideXSupabaseClient = SupabaseClient;

type PresentationRow = {
  created_at: string;
  id: string;
  kind: WorkspacePresentation["kind"];
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
    kind: row.kind,
    lastOpenedAt: row.last_opened_at,
    ownerId: row.user_id,
    source: row.source,
    sourceRevision: row.source_revision,
    templateId: row.template_id ?? undefined,
    title: row.title,
    updatedAt: row.updated_at
  };
}

const presentationColumns = "id,user_id,title,kind,source,source_revision,template_id,created_at,updated_at,last_opened_at" as const;

export const workspacePresentationPageSize = 12;

type ListSupabasePresentationsOptions = {
  limit?: number;
  offset?: number;
  searchQuery?: string;
};

export async function listSupabasePresentations(
  client: SlideXSupabaseClient,
  {
    limit = workspacePresentationPageSize,
    offset = 0,
    searchQuery = ""
  }: ListSupabasePresentationsOptions = {}
) {
  let query = client
    .from("presentations")
    .select(presentationColumns, { count: "exact" })
    .order("last_opened_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  const normalizedSearchQuery = searchQuery.trim();
  if (normalizedSearchQuery) {
    query = query.ilike("title", `%${normalizedSearchQuery}%`);
  }

  const { count, data, error } = await query;

  if (error) throw error;
  return {
    items: data.map(toWorkspacePresentation),
    totalCount: count ?? 0
  };
}

export async function createSupabasePresentation(
  client: SlideXSupabaseClient,
  input: Pick<WorkspacePresentation, "source" | "title"> & {
    importId?: string;
    kind?: WorkspacePresentation["kind"];
    templateId?: string;
  }
) {
  const templateId = await resolveOfficialTemplateId(client, input.templateId);
  const { data, error } = await client
    .from("presentations")
    .insert({
      guest_import_id: input.importId ?? null,
      kind: input.kind ?? "presentation",
      source: input.source,
      template_id: templateId,
      title: input.title.trim()
    })
    .select(presentationColumns)
    .single();

  if (error) throw error;
  return toWorkspacePresentation(data);
}

export async function findSupabasePresentationByImportId(
  client: SlideXSupabaseClient,
  importId: string
) {
  const { data, error } = await client
    .from("presentations")
    .select(presentationColumns)
    .eq("guest_import_id", importId)
    .maybeSingle();

  if (error) throw error;
  return data ? toWorkspacePresentation(data) : null;
}

export async function duplicateSupabasePresentation(
  client: SlideXSupabaseClient,
  presentation: WorkspacePresentation,
  title: string
) {
  return createSupabasePresentation(client, {
    kind: "presentation",
    source: presentation.source,
    templateId: presentation.templateId,
    title
  });
}

export async function renameSupabasePresentation(
  client: SlideXSupabaseClient,
  presentation: WorkspacePresentation,
  title: string
) {
  const result = await updateSupabasePresentation(
    client,
    presentation.id,
    presentation.sourceRevision,
    { source: presentation.source, title }
  );

  return {
    ...presentation,
    sourceRevision: result.sourceRevision,
    title: title.trim(),
    updatedAt: result.updatedAt
  };
}

function isPresentationRow(value: unknown): value is PresentationRow {
  if (typeof value !== "object" || value === null) return false;
  return (
    "created_at" in value && typeof value.created_at === "string" &&
    "id" in value && typeof value.id === "string" &&
    "kind" in value && (value.kind === "presentation" || value.kind === "template") &&
    "last_opened_at" in value && typeof value.last_opened_at === "string" &&
    "source" in value && typeof value.source === "string" &&
    "source_revision" in value && typeof value.source_revision === "number" &&
    "template_id" in value && (value.template_id === null || typeof value.template_id === "string") &&
    "title" in value && typeof value.title === "string" &&
    "updated_at" in value && typeof value.updated_at === "string" &&
    "user_id" in value && typeof value.user_id === "string"
  );
}

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseSupabasePresentationRealtimeChange(value: unknown, expectedOwnerId: string) {
  if (
    !isUnknownRecord(value) ||
    value.type !== "broadcast" ||
    !isUnknownRecord(value.payload) ||
    value.payload.schema !== "public" ||
    value.payload.table !== "presentations"
  ) return null;
  const operation = value.payload.operation;
  if (operation !== "INSERT" && operation !== "UPDATE" && operation !== "DELETE") return null;
  if (value.event !== operation) return null;
  const record = operation === "DELETE" ? value.payload.old_record : value.payload.record;
  if (!isPresentationRow(record) || record.user_id !== expectedOwnerId) return null;
  return {
    event: operation,
    presentation: toWorkspacePresentation(record)
  };
}

type WorkspaceStarterInput = Pick<WorkspacePresentation, "source" | "title"> & {
  templateId: string;
};

export async function ensureSupabaseWorkspaceStarterPresentations(
  client: SlideXSupabaseClient,
  starters: WorkspaceStarterInput[]
) {
  if (starters.length === 0) return;

  const templateIds = starters.map((starter) => starter.templateId);
  const { data: catalogRows, error: catalogError } = await client
    .from("official_templates")
    .select("id")
    .in("id", templateIds);
  if (catalogError) throw catalogError;

  const activeTemplateIds = new Set(catalogRows.map((template) => template.id));
  const { data: existingRows, error: existingError } = await client
    .from("presentations")
    .select("template_id")
    .eq("kind", "template")
    .in("template_id", templateIds);
  if (existingError) throw existingError;

  const existingTemplateIds = new Set(existingRows.flatMap((presentation) => (
    presentation.template_id ? [presentation.template_id] : []
  )));

  for (const starter of starters) {
    if (!activeTemplateIds.has(starter.templateId) || existingTemplateIds.has(starter.templateId)) {
      continue;
    }

    const { error } = await client.from("presentations").insert({
      kind: "template",
      source: starter.source,
      template_id: starter.templateId,
      title: starter.title
    });

    // Concurrent tabs can both observe a missing starter. The partial unique
    // index makes one insert win and lets the other safely continue.
    if (error && error.code !== "23505") throw error;
  }
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
    .select(presentationColumns)
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

export async function updateSupabasePresentationTemplate(
  client: SlideXSupabaseClient,
  presentationId: string,
  templateId?: string
) {
  const resolvedTemplateId = await resolveOfficialTemplateId(client, templateId);
  const { error } = await client
    .from("presentations")
    .update({ template_id: resolvedTemplateId })
    .eq("id", presentationId);

  if (error) throw error;
  return resolvedTemplateId ?? undefined;
}

async function resolveOfficialTemplateId(
  client: SlideXSupabaseClient,
  templateId?: string
) {
  if (!templateId) return null;

  const { data, error } = await client
    .from("official_templates")
    .select("id")
    .eq("id", templateId)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
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
