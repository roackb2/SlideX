import { NextResponse, type NextRequest } from "next/server";
import { appRoutes } from "@/common/lib/appRoutes";
import { appUrl } from "@/common/lib/siteUrl";
import { createSupabaseServerClient } from "@/common/lib/supabase/serverClient";
import { resolveSafeAuthNextPath } from "@/features/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = resolveSafeAuthNextPath(
    request.nextUrl.searchParams.get("next"),
    appRoutes.workspace
  );

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(appUrl(request, nextPath));
    }
  }

  const loginUrl = appUrl(request, appRoutes.login);
  loginUrl.searchParams.set("error", "oauth_callback_failed");
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}
