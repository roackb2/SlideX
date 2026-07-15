import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/common/lib/supabase/serverClient";
import {
  deleteSupabasePresentationImage,
  parsePresentationImageUploadFormData,
  PitchAssetFileError,
  presentationImageStoragePathIdentity,
  presentationImageUploadRequestByteLimit,
  uploadSupabasePresentationImage
} from "@/features/pitch";

const presentationImageDeleteRequestByteLimit = 4096;

export async function DELETE(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > presentationImageDeleteRequestByteLimit) {
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
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const storagePath = requestBody && typeof requestBody === "object" && "path" in requestBody
    ? requestBody.path
    : null;
  const identity = typeof storagePath === "string"
    ? presentationImageStoragePathIdentity(storagePath)
    : null;
  if (typeof storagePath !== "string" || !identity) {
    return NextResponse.json({ error: "invalid_image_path" }, { status: 400 });
  }
  if (identity.userId !== userId) {
    return NextResponse.json({ error: "image_not_found" }, { status: 404 });
  }

  const { data: presentation, error: presentationError } = await supabase
    .from("presentations")
    .select("id")
    .eq("id", identity.presentationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (presentationError) {
    return NextResponse.json({ error: "presentation_lookup_failed" }, { status: 500 });
  }
  if (!presentation) {
    return NextResponse.json({ error: "image_not_found" }, { status: 404 });
  }

  try {
    await deleteSupabasePresentationImage(supabase, { path: storagePath });
    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "image_delete_failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > presentationImageUploadRequestByteLimit) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string") {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const parsedInput = parsePresentationImageUploadFormData(formData);
  if (!parsedInput.success) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }

  const { data: presentation, error: presentationError } = await supabase
    .from("presentations")
    .select("id")
    .eq("id", parsedInput.data.presentationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (presentationError) {
    return NextResponse.json({ error: "presentation_lookup_failed" }, { status: 500 });
  }
  if (!presentation) {
    return NextResponse.json({ error: "presentation_not_found" }, { status: 404 });
  }

  try {
    const image = await uploadSupabasePresentationImage(supabase, parsedInput.data);
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    if (error instanceof PitchAssetFileError) {
      return NextResponse.json(
        { error: "invalid_image", message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "image_upload_failed" }, { status: 500 });
  }
}
