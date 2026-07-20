import { NextResponse, type NextRequest } from "next/server";

import {
  isMcpTransportPath,
  trailingSlashRedirectPath
} from "@/common/lib/trailingSlashRedirect";
import { updateSupabaseSession } from "@/common/lib/supabase/proxySession";

export async function proxy(request: NextRequest) {
  if (isMcpTransportPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const redirectPath = trailingSlashRedirectPath(
    request.nextUrl.pathname,
    request.headers.has("x-nextjs-data")
  );
  if (redirectPath) {
    // NextURL applies the project's trailingSlash normalization while it is
    // mutated, which can turn `/login/` back into `/login` and create a
    // self-redirect. A native URL preserves the canonical path exactly.
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = redirectPath;
    const redirectResponse = NextResponse.redirect(redirectUrl, 307);
    redirectResponse.headers.set("Cache-Control", "no-store");
    redirectResponse.headers.set("Pragma", "no-cache");
    return redirectResponse;
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)"
  ]
};
