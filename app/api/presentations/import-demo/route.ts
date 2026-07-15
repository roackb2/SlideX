import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/common/lib/supabase/serverClient";
import {
  parseGuestDemoImportInput,
  presentationSourceByteLimit
} from "@/features/workspace";

const maximumJsonRequestBytes = presentationSourceByteLimit + 16_384;

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maximumJsonRequestBytes) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string") {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  let requestBody: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maximumJsonRequestBytes) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }
    requestBody = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsedInput = parseGuestDemoImportInput(requestBody);
  if (!parsedInput.success) {
    return NextResponse.json(
      { error: "invalid_fields", issues: parsedInput.issues },
      { status: 400 }
    );
  }

  const { data: template } = await supabase
    .from("official_templates")
    .select("id")
    .eq("id", parsedInput.data.templateId)
    .eq("is_active", true)
    .maybeSingle();

  if (!template) {
    return NextResponse.json({ error: "invalid_template" }, { status: 400 });
  }

  const insertPayload = {
    editor_template_id: parsedInput.data.editorTemplateId ?? null,
    guest_import_id: parsedInput.data.importId,
    source: parsedInput.data.source,
    template_id: template.id,
    title: parsedInput.data.title
  };
  const { data: insertedPresentation, error: insertError } = await supabase
    .from("presentations")
    .upsert(insertPayload, {
      defaultToNull: false,
      ignoreDuplicates: true,
      onConflict: "user_id,guest_import_id"
    })
    .select("id,user_id,title,kind,source,source_revision,template_id,editor_template_id,created_at,updated_at,last_opened_at")
    .maybeSingle();

  if (insertError) {
    return NextResponse.json({ error: "presentation_import_failed" }, { status: 500 });
  }

  const presentationResult = insertedPresentation
    ? { data: insertedPresentation, error: null }
    : await supabase
        .from("presentations")
        .select("id,user_id,title,kind,source,source_revision,template_id,editor_template_id,created_at,updated_at,last_opened_at")
        .eq("guest_import_id", parsedInput.data.importId)
        .eq("user_id", userId)
        .single();

  if (presentationResult.error || !presentationResult.data) {
    return NextResponse.json({ error: "presentation_import_failed" }, { status: 500 });
  }

  return NextResponse.json({ presentation: presentationResult.data }, { status: 200 });
}
