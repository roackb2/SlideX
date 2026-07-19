import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import {
  applyOAuthSecurityHeaders,
  mcpOAuthRateLimitFailure,
  recordMcpOAuthSecurityEvent
} from "@/mcp/oauthSecurity";
import { consumeMcpOAuthRateLimit } from "@/mcp/oauthRateLimit";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";

export async function POST(request: Request) {
  const store = new SupabaseMcpOAuthStore(createSupabaseAdminClient());
  const rateLimit = await consumeMcpOAuthRateLimit({
    headers: request.headers,
    identity: "ip",
    kind: "revoke",
    store
  }).catch(() => null);
  if (!rateLimit) {
    return applyOAuthSecurityHeaders(new NextResponse(null, { status: 503 }));
  }
  if (!rateLimit.allowed) {
    await recordMcpOAuthSecurityEvent({
      errorCode: "revoke_ip",
      eventType: "rate_limit_triggered",
      headers: request.headers,
      route: "/api/mcp/oauth/revoke",
      severity: "medium",
      store
    });
    const failure = mcpOAuthRateLimitFailure(rateLimit.retryAfterSeconds);
    return applyOAuthSecurityHeaders(new NextResponse(null, {
      headers: failure.headers,
      status: failure.status
    }));
  }
  const form = await request.formData().catch(() => null);
  if (!form) {
    return applyOAuthSecurityHeaders(new NextResponse(null, { status: 200 }));
  }
  const token = form.get("token");
  if (typeof token === "string" && token) {
    const revoked = await store.revokeTokenFamily(token)
      .then(() => true)
      .catch(() => false);
    if (!revoked) {
      return applyOAuthSecurityHeaders(new NextResponse(null, { status: 503 }));
    }
  }
  return applyOAuthSecurityHeaders(new NextResponse(null, { status: 200 }));
}
