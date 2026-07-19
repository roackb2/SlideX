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
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;
    return NextResponse.redirect(redirectUrl, 308);
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)"
  ]
};
