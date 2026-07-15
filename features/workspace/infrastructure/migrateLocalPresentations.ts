import type { SupabaseClient } from "@supabase/supabase-js";
import {
  clearLocalPresentations,
  listLocalPresentations
} from "@/features/workspace/infrastructure/localPresentationRepository";
import {
  createSupabasePresentation,
  findSupabasePresentationByImportId
} from "@/features/workspace/infrastructure/supabasePresentationRepository";

export async function migrateLocalPresentationsToSupabase(
  client: SupabaseClient,
  ownerId: string
) {
  const localPresentations = listLocalPresentations(ownerId);
  if (localPresentations.length === 0) return;

  for (const presentation of localPresentations) {
    const importId = await deterministicImportId(ownerId, presentation.id);
    const existing = await findSupabasePresentationByImportId(client, importId);
    if (existing) continue;

    await createSupabasePresentation(client, {
      importId,
      kind: presentation.kind,
      source: presentation.source,
      templateId: presentation.templateId,
      title: presentation.title
    });
  }

  clearLocalPresentations(ownerId);
}

async function deterministicImportId(ownerId: string, presentationId: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`local-presentation:${ownerId}:${presentationId}`)
  ));

  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes.slice(0, 16), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
