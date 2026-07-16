import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = form.get("token");
  if (typeof token === "string" && token) {
    await new SupabaseMcpOAuthStore(createSupabaseAdminClient()).revokeToken(token);
  }
  return new NextResponse(null, { status: 200, headers: { "cache-control": "no-store" } });
}

