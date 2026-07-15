import type { SupabaseClient } from "@supabase/supabase-js";
import type { OfficialTemplateMetadata } from "@/features/workspace/domain/officialTemplate";

type OfficialTemplateRow = {
  description: string;
  id: string;
  name: string;
  sort_order: number;
  thumbnail_url: string | null;
};

const officialTemplateColumns = "id,name,description,thumbnail_url,sort_order" as const;

function toOfficialTemplateMetadata(row: OfficialTemplateRow): OfficialTemplateMetadata {
  return {
    description: row.description,
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    thumbnailUrl: row.thumbnail_url ?? undefined
  };
}

export async function listSupabaseOfficialTemplates(client: SupabaseClient) {
  const { data, error } = await client
    .from("official_templates")
    .select(officialTemplateColumns)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data.map(toOfficialTemplateMetadata);
}
