import Link from "next/link";
import { redirect } from "next/navigation";

import { appRoutes } from "@/common/lib/appRoutes";
import { resolveSiteOrigin } from "@/common/lib/siteUrl";
import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import { createSupabaseServerClient } from "@/common/lib/supabase/serverClient";
import { mcpAuthorizationRequestSchema, normalizeMcpScopes } from "@/mcp/oauth";
import { mcpResourceUrl } from "@/mcp/oauthMetadata";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";

type McpAuthorizePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function McpAuthorizePage({ searchParams }: McpAuthorizePageProps) {
  const rawParams = await searchParams;
  const input = Object.fromEntries(
    Object.entries(rawParams).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value]] : []
    )
  );
  const parsed = mcpAuthorizationRequestSchema.safeParse(input);

  if (!parsed.success) {
    return <AuthorizationError message="This MCP authorization request is invalid." />;
  }

  const store = new SupabaseMcpOAuthStore(createSupabaseAdminClient());
  const client = await store.getClient(parsed.data.client_id);
  if (
    !client ||
    !client.grant_types.includes("authorization_code") ||
    !client.response_types.includes("code") ||
    !client.redirect_uris.includes(parsed.data.redirect_uri)
  ) {
    return <AuthorizationError message="This MCP client is not registered with SlideX." />;
  }

  if (parsed.data.resource !== mcpResourceUrl(resolveSiteOrigin())) {
    return <AuthorizationError message="This MCP client requested an invalid SlideX resource." />;
  }

  let scopes: string[];
  try {
    scopes = normalizeMcpScopes(parsed.data.scope);
  } catch {
    return <AuthorizationError message="This MCP client requested an unsupported permission." />;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const next = `/mcp/authorize/?${new URLSearchParams(input).toString()}`;
    redirect(`${appRoutes.login}?next=${encodeURIComponent(next)}`);
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#111111] px-5 py-12 text-[#f3f3f0]">
      <section className="w-full max-w-[520px] rounded-[12px] border border-white/[0.11] bg-[#1a1a1a] px-7 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:px-9 sm:py-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/35">SlideX MCP</p>
        <h1 className="mt-3 text-[28px] font-medium tracking-[-0.035em] text-white/92">
          Authorize {client.client_name}
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-white/48">
          This MCP client is requesting access to presentations owned by {data.user.email ?? "your SlideX account"}.
        </p>

        <ul className="mt-6 space-y-2 rounded-[8px] border border-white/[0.08] bg-black/20 px-4 py-4 text-[13px] text-white/66">
          {scopes.map((scope) => (
            <li key={scope}>{scope === "presentations:read" ? "Read presentation source" : "Save presentation changes"}</li>
          ))}
        </ul>

        <form action="/api/mcp/oauth/authorize/" className="mt-7 flex gap-3" method="post">
          {Object.entries(input).map(([name, value]) => (
            <input key={name} name={name} type="hidden" value={value} />
          ))}
          <button className="h-11 flex-1 rounded-[7px] border border-white/12 text-[14px] text-white/62 hover:bg-white/[0.04]" name="decision" type="submit" value="deny">
            Deny
          </button>
          <button className="h-11 flex-1 rounded-[7px] bg-[#f1f0eb] text-[14px] font-medium text-[#171717] hover:bg-white" name="decision" type="submit" value="allow">
            Allow
          </button>
        </form>
      </section>
    </main>
  );
}

function AuthorizationError({ message }: { message: string }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#111111] px-5 text-[#f3f3f0]">
      <section className="w-full max-w-[480px] rounded-[12px] border border-white/[0.11] bg-[#1a1a1a] px-8 py-9 text-center">
        <h1 className="text-[24px] font-medium">Authorization unavailable</h1>
        <p className="mt-3 text-[14px] leading-6 text-white/48">{message}</p>
        <Link className="mt-6 inline-block text-[13px] text-white/70 underline" href={appRoutes.workspace}>Return to SlideX</Link>
      </section>
    </main>
  );
}
