import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/common/lib/supabase/serverClient";
import { isPresentationImageStoragePath } from "@/features/pitch";

const privateImageHeaders = {
  "cache-control": "private, no-store",
  "content-disposition": "inline",
  "x-content-type-options": "nosniff"
};

type PresentationImageRouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: NextRequest, context: PresentationImageRouteContext) {
  const { path: pathSegments } = await context.params;
  const storagePath = pathSegments.join("/");

  if (!isPresentationImageStoragePath(storagePath)) {
    return NextResponse.json({ error: "invalid_image_path" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  if (pathSegments[0] !== userData.user.id) {
    return NextResponse.json({ error: "image_not_found" }, { status: 404 });
  }

  const { data: image, error } = await supabase.storage
    .from("presentation-images")
    .download(storagePath);

  if (error || !image) {
    return NextResponse.json({ error: "image_not_found" }, { status: 404 });
  }

  return new Response(image, {
    headers: {
      ...privateImageHeaders,
      "content-length": String(image.size),
      "content-type": image.type || "application/octet-stream"
    }
  });
}
