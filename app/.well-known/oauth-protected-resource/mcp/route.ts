import { NextResponse, type NextRequest } from "next/server";

import { resolveRequestOrigin } from "@/common/lib/siteUrl";
import { mcpProtectedResourceMetadata } from "@/mcp/oauthMetadata";

export function GET(request: NextRequest) {
  return NextResponse.json(
    mcpProtectedResourceMetadata(resolveRequestOrigin(request)),
    { headers: { "cache-control": "public, max-age=300" } }
  );
}

