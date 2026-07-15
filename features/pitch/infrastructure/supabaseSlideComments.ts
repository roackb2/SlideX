import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SlideComment,
  SlideComments
} from "@/features/pitch/application/slideComments";

type Client = SupabaseClient;
type SlideCommentRow = {
  body: string;
  created_at: string;
  id: string;
  is_resolved: boolean;
  presentation_id: string;
  slide_index: number;
  updated_at: string;
  user_id: string;
};

const columns = "id,user_id,presentation_id,slide_index,body,is_resolved,created_at,updated_at" as const;

export async function listSupabaseSlideComments(client: Client, presentationId: string) {
  const { data, error } = await client
    .from("slide_comments")
    .select(columns)
    .eq("presentation_id", presentationId)
    .eq("is_resolved", false)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return groupRows(data);
}

export async function createSupabaseSlideComment(
  client: Client,
  presentationId: string,
  slideIndex: number,
  body: string
) {
  const { data, error } = await client
    .from("slide_comments")
    .insert({ body: body.trim(), presentation_id: presentationId, slide_index: slideIndex })
    .select(columns)
    .single();

  if (error) throw error;
  return toSlideComment(data, 1);
}

export async function resolveSupabaseSlideComment(
  client: Client,
  presentationId: string,
  commentId: string
) {
  const { data, error } = await client
    .from("slide_comments")
    .update({ is_resolved: true })
    .eq("id", commentId)
    .eq("presentation_id", presentationId)
    .select(columns)
    .single();

  if (error) throw error;
  return toSlideComment(data, 1);
}

export function parseSupabaseSlideCommentResolution(value: unknown) {
  if (typeof value !== "object" || value === null) return null;
  if (!("id" in value) || typeof value.id !== "string") return null;
  if (!("slide_index" in value) || typeof value.slide_index !== "number") return null;
  if (!("is_resolved" in value) || typeof value.is_resolved !== "boolean") return null;

  return {
    commentId: value.id,
    isResolved: value.is_resolved,
    slideIndex: value.slide_index
  };
}

function groupRows(rows: SlideCommentRow[]): SlideComments {
  const grouped: SlideComments = {};
  for (const row of rows) {
    const slideComments = grouped[row.slide_index] ?? [];
    grouped[row.slide_index] = [...slideComments, toSlideComment(row, slideComments.length + 1)];
  }
  return grouped;
}

function toSlideComment(row: SlideCommentRow, version: number): SlideComment {
  return {
    authorId: row.user_id,
    authorName: "You",
    body: row.body,
    createdAt: row.created_at,
    id: row.id,
    resolvedAt: row.is_resolved ? row.updated_at : null,
    status: row.is_resolved ? "resolved" : "open",
    updatedAt: row.updated_at,
    version
  };
}
