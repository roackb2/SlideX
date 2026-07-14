import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/common/lib/supabase/database.types";
import { readSupabasePublicEnvironment } from "@/common/lib/supabase/env";

function copySessionResponse(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));

  for (const headerName of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(headerName);
    if (value) target.headers.set(headerName, value);
  }

  return target;
}

function isPublicDemo(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  return pathname === "/workspace/pitch" &&
    request.nextUrl.searchParams.get("demo") === "1";
}

function isProtectedWorkspaceRequest(request: NextRequest) {
  return request.nextUrl.pathname.startsWith("/workspace") && !isPublicDemo(request);
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { publishableKey, url } = readSupabasePublicEnvironment();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      }
    }
  });

  // Keep this immediately after client creation. It both verifies the JWT and
  // refreshes expired auth cookies when necessary.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  if (!isAuthenticated && isProtectedWorkspaceRequest(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return copySessionResponse(response, NextResponse.redirect(loginUrl));
  }

  return response;
}
