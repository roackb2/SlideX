import {
  ArrowRight,
  Eye,
  ImagePlus,
  LockKeyhole,
  PencilLine,
  ShieldCheck,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { appRoutes } from "@/common/lib/appRoutes";
import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import { createSupabaseServerClient } from "@/common/lib/supabase/serverClient";
import { resolveSiteOrigin } from "@/common/lib/siteUrl";
import {
  mcpAuthorizationRequestSchema,
  isExactMcpRedirectUri,
  normalizeMcpScopes,
  type McpOAuthScope
} from "@/mcp/oauth";
import { mcpResourceUrl } from "@/mcp/oauthMetadata";
import {
  hashMcpAuthorizationRequest,
  recordMcpOAuthSecurityEvent
} from "@/mcp/oauthSecurity";
import { consumeMcpOAuthRateLimit } from "@/mcp/oauthRateLimit";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";

import { AuthorizationActions } from "./AuthorizationActions";

type McpAuthorizePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type PermissionDescription = {
  description: string;
  icon: LucideIcon;
  isPrivate?: boolean;
  title: string;
};

const permissionDescriptions: Record<McpOAuthScope, PermissionDescription> = {
  "presentations:read": {
    description: "View the content and structure of presentations you own.",
    icon: Eye,
    title: "Read presentation content"
  },
  "presentations:write": {
    description: "Create and save changes to presentations you own.",
    icon: PencilLine,
    title: "Edit presentations"
  },
  "presentation-assets:write": {
    description: "Upload private images only to presentations owned by this account.",
    icon: ImagePlus,
    isPrivate: true,
    title: "Upload private presentation images"
  }
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
  const requestHeaders = new Headers(await headers());
  const rateLimit = await consumeMcpOAuthRateLimit({
    headers: requestHeaders,
    identity: "ip",
    kind: "authorize",
    store
  }).catch(() => null);
  if (!rateLimit) {
    return <AuthorizationError message="Authorization is temporarily unavailable." />;
  }
  if (!rateLimit.allowed) {
    await recordMcpOAuthSecurityEvent({
      errorCode: "authorize_ip",
      eventType: "rate_limit_triggered",
      headers: requestHeaders,
      route: "/mcp/authorize",
      severity: "medium",
      store
    });
    return <AuthorizationError message="Too many authorization attempts. Try again shortly." />;
  }

  const client = await store.getClient(parsed.data.client_id).catch(() => undefined);
  if (client === undefined) {
    return <AuthorizationError message="Authorization is temporarily unavailable." />;
  }
  if (
    !client ||
    !client.grant_types.includes("authorization_code") ||
    !client.response_types.includes("code")
  ) {
    return <AuthorizationError message="This MCP client is not registered with SlideX." />;
  }
  if (!isExactMcpRedirectUri(parsed.data.redirect_uri, client.redirect_uris)) {
    await recordMcpOAuthSecurityEvent({
      clientId: client.client_id,
      errorCode: "invalid_client",
      eventType: "redirect_mismatch",
      headers: requestHeaders,
      route: "/mcp/authorize",
      severity: "medium",
      store
    });
    return <AuthorizationError message="This MCP client is not registered with SlideX." />;
  }

  const clientRateLimit = await consumeMcpOAuthRateLimit({
    clientId: client.client_id,
    headers: requestHeaders,
    identity: "client_ip",
    kind: "authorize",
    store
  }).catch(() => null);
  if (!clientRateLimit) {
    return <AuthorizationError message="Authorization is temporarily unavailable." />;
  }
  if (!clientRateLimit.allowed) {
    await recordMcpOAuthSecurityEvent({
      clientId: client.client_id,
      errorCode: "authorize_client",
      eventType: "rate_limit_triggered",
      headers: requestHeaders,
      route: "/mcp/authorize",
      severity: "medium",
      store
    });
    return <AuthorizationError message="Too many authorization attempts. Try again shortly." />;
  }

  if (parsed.data.resource !== mcpResourceUrl(resolveSiteOrigin())) {
    return <AuthorizationError message="This MCP client requested an invalid SlideX resource." />;
  }

  let scopes: McpOAuthScope[];
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

  const redirectHost = new URL(parsed.data.redirect_uri).host;
  const email = data.user.email ?? "your SlideX account";
  const consentNonce = await store.issueConsentRequest({
    clientId: parsed.data.client_id,
    requestHash: hashMcpAuthorizationRequest(parsed.data),
    userId: data.user.id
  }).catch(() => null);
  if (!consentNonce) {
    return <AuthorizationError message="Authorization is temporarily unavailable." />;
  }

  return (
    <AuthorizationShell>
      <section
        aria-labelledby="authorization-title"
        className="w-full max-w-[560px] rounded-[18px] border border-white/[0.10] bg-[#191919]/95 px-6 py-7 shadow-[0_32px_100px_rgba(0,0,0,0.38)] backdrop-blur-sm sm:px-9 sm:py-9"
      >
        <header className="flex items-center justify-between gap-5 border-b border-white/[0.08] pb-6">
          <SlideXWordmark />
          <span className="rounded-full border border-[#9eb4ff]/20 bg-[#9eb4ff]/[0.08] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-[#b9c8ff]">
            MCP CONNECTION
          </span>
        </header>

        <div className="pt-7">
          <p className="flex items-center gap-2 text-[12px] font-medium text-white/42">
            <span className="max-w-[44%] truncate text-white/72" title={client.client_name}>
              {client.client_name}
            </span>
            <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-white/28" />
            <span>Connecting to SlideX</span>
          </p>
          <h1
            className="mt-3 text-[28px] font-medium tracking-[-0.035em] text-white/95 sm:text-[32px]"
            id="authorization-title"
          >
            Allow access to SlideX?
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-white/50">
            Review exactly what this MCP client can do before you continue.
          </p>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            <ConnectionDetail label="Signed in as" value={email} />
            <ConnectionDetail label="Verified redirect" value={redirectHost} />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-white/34">
            Signing in verifies your identity only. Access is granted only after you choose Allow
            access.
          </p>
        </div>

        <div className="mt-7" aria-labelledby="requested-permissions">
          <div className="flex items-center justify-between gap-4">
            <h2
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38"
              id="requested-permissions"
            >
              Requested permissions
            </h2>
            <span className="text-[11px] text-white/30">
              {scopes.length} {scopes.length === 1 ? "permission" : "permissions"}
            </span>
          </div>

          <ul className="mt-3 overflow-hidden rounded-[12px] border border-white/[0.09] bg-black/[0.13]">
            {scopes.map((scope) => {
              const permission = permissionDescriptions[scope];
              const Icon = permission.icon;
              return (
                <li
                  className="flex gap-3.5 border-b border-white/[0.07] px-4 py-4 last:border-b-0 sm:px-5"
                  key={scope}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-white/[0.08] bg-white/[0.045] text-white/65">
                    <Icon aria-hidden="true" className="size-[17px]" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-white/88">
                      {permission.title}
                      {permission.isPrivate ? (
                        <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-200/75">
                          Private
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-[12px] leading-[1.55] text-white/42">
                      {permission.description}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-5 flex gap-3 rounded-[10px] border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 text-[11px] leading-[1.55] text-white/40">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#aebfff]/70" />
          <p>
            You can revoke MCP access at any time. Uploaded images stay private and are never
            turned into public Storage URLs.
          </p>
        </div>

        <form action="/api/mcp/oauth/authorize/" className="mt-6" method="post">
          {Object.entries(input).map(([name, value]) => (
            <input key={name} name={name} type="hidden" value={value} />
          ))}
          <input name="consent_nonce" type="hidden" value={consentNonce} />
          <AuthorizationActions />
        </form>
      </section>
    </AuthorizationShell>
  );
}

function AuthorizationError({ message }: { message: string }) {
  return (
    <AuthorizationShell>
      <section
        aria-labelledby="authorization-error-title"
        className="w-full max-w-[560px] rounded-[18px] border border-white/[0.10] bg-[#191919]/95 px-7 py-8 text-center shadow-[0_32px_100px_rgba(0,0,0,0.38)] sm:px-10 sm:py-10"
      >
        <div className="flex justify-center">
          <SlideXWordmark />
        </div>
        <span className="mx-auto mt-7 flex size-11 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.035] text-white/55">
          <LockKeyhole aria-hidden="true" className="size-5" strokeWidth={1.6} />
        </span>
        <h1 className="mt-5 text-[25px] font-medium tracking-[-0.025em]" id="authorization-error-title">
          Authorization unavailable
        </h1>
        <p className="mx-auto mt-3 max-w-[390px] text-[14px] leading-6 text-white/47">{message}</p>
        <Link
          className="mt-7 inline-flex h-11 items-center justify-center rounded-[9px] border border-white/[0.13] px-5 text-[13px] font-medium text-white/70 outline-none transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#191919] motion-reduce:transition-none"
          href={appRoutes.workspace}
        >
          Return to SlideX
        </Link>
      </section>
    </AuthorizationShell>
  );
}

function AuthorizationShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#101010] px-4 py-8 text-[#f3f3f0] sm:px-6 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(114,139,225,0.10),transparent_38%)]"
      />
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </main>
  );
}

function SlideXWordmark() {
  return (
    <div aria-label="SlideX" className="flex items-baseline text-[20px] font-semibold tracking-[-0.045em]">
      <span className="text-white/90">Slide</span>
      <span className="bg-gradient-to-br from-[#91b8ff] to-[#a78bfa] bg-clip-text text-transparent">X</span>
    </div>
  );
}

function ConnectionDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[10px] border border-white/[0.075] bg-white/[0.025] px-3.5 py-3">
      <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
        {label}
      </span>
      <span className="mt-1.5 block truncate text-[12px] text-white/70" title={value}>
        {value}
      </span>
    </div>
  );
}
