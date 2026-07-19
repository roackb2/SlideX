import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/common/lib/supabase/database.types";
import {
  canonicalizeMcpResource,
  createOAuthCredential,
  hashOAuthCredential,
  mcpResourcesMatch,
  type McpOAuthScope
} from "@/mcp/oauth";
import {
  createMcpConsentNonce,
  type McpOAuthRateLimitPolicy
} from "@/mcp/oauthSecurity";

type McpOAuthClientRow = Database["public"]["Tables"]["mcp_oauth_clients"]["Row"];
type McpOAuthSecurityEventRow = Database["public"]["Tables"]["mcp_oauth_security_events"]["Row"];

export type RegisterMcpClientInput = {
  clientName: string;
  grantTypes: string[];
  redirectUris: string[];
  responseTypes: string[];
};

export type McpTokenSet = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: "Bearer";
};

export class McpOAuthGrantError extends Error {
  constructor(
    readonly oauthError: "invalid_grant" | "invalid_scope",
    readonly securityEvent: "invalid_grant" | "pkce_failure" | "redirect_mismatch" | "refresh_replay",
    readonly securityUserId?: string,
    readonly securityGrantId?: string
  ) {
    super(oauthError);
    this.name = "McpOAuthGrantError";
  }
}

const ACCESS_TOKEN_SECONDS = 60 * 60;
const AUTHORIZATION_CODE_SECONDS = 5 * 60;
const CONSENT_REQUEST_SECONDS = 10 * 60;
const REFRESH_TOKEN_SECONDS = 30 * 24 * 60 * 60;

export class SupabaseMcpOAuthStore {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async registerClient(input: RegisterMcpClientInput) {
    const clientId = `slx_client_${crypto.randomUUID()}`;
    const { data, error } = await this.client
      .from("mcp_oauth_clients")
      .insert({
        client_id: clientId,
        client_name: input.clientName,
        grant_types: input.grantTypes,
        redirect_uris: input.redirectUris,
        response_types: input.responseTypes,
        token_endpoint_auth_method: "none"
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getClient(clientId: string) {
    const { data, error } = await this.client
      .from("mcp_oauth_clients")
      .select()
      .eq("client_id", clientId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async issueAuthorizationCode(input: {
    client: McpOAuthClientRow;
    codeChallenge: string;
    redirectUri: string;
    resource: string;
    scopes: McpOAuthScope[];
    userId: string;
  }) {
    const code = createOAuthCredential("slx_ac");
    await this.insertCredential({
      client_id: input.client.client_id,
      code_challenge: input.codeChallenge,
      credential_hash: hashOAuthCredential(code),
      credential_type: "authorization_code",
      expires_at: expiresAt(AUTHORIZATION_CODE_SECONDS),
      redirect_uri: input.redirectUri,
      resource: canonicalizeMcpResource(input.resource),
      scopes: input.scopes,
      user_id: input.userId
    });
    return code;
  }

  async issueConsentRequest(input: {
    clientId: string;
    requestHash: string;
    userId: string;
  }) {
    const nonce = createMcpConsentNonce();
    const { data, error } = await this.client.rpc("mcp_issue_oauth_consent_request", {
      actor_user_id: input.userId,
      authorization_request_hash: input.requestHash,
      consent_expires_at: expiresAt(CONSENT_REQUEST_SECONDS),
      consent_nonce_hash: hashOAuthCredential(nonce),
      oauth_client_id: input.clientId
    });

    if (error) throw error;
    if (!data) throw new Error("consent_request_failed");
    return nonce;
  }

  async consumeConsentRequest(input: {
    clientId: string;
    nonce: string;
    requestHash: string;
    userId: string;
  }) {
    const { data, error } = await this.client.rpc("mcp_consume_oauth_consent_request", {
      actor_user_id: input.userId,
      authorization_request_hash: input.requestHash,
      consent_nonce_hash: hashOAuthCredential(input.nonce),
      oauth_client_id: input.clientId
    });

    if (error) throw error;
    return data;
  }

  async consumeRateLimit(bucketHash: string, policy: McpOAuthRateLimitPolicy) {
    const { data, error } = await this.client.rpc("mcp_consume_oauth_rate_limit", {
      bucket_capacity: policy.capacity,
      refill_interval_seconds: policy.refillSeconds,
      target_bucket_hash: bucketHash
    });

    if (error) throw error;
    const result = data[0];
    if (!result) throw new Error("oauth_rate_limit_failed");
    return {
      allowed: result.allowed,
      retryAfterSeconds: result.retry_after_seconds,
      tokensRemaining: result.tokens_remaining
    };
  }

  async exchangeAuthorizationCode(input: {
    clientId: string;
    code: string;
    codeChallenge: string;
    redirectUri: string;
    resource: string;
  }) {
    const accessToken = createOAuthCredential("slx_at");
    const refreshToken = createOAuthCredential("slx_rt");
    const { data, error } = await this.client.rpc("mcp_exchange_oauth_authorization_code", {
      issued_access_expires_at: expiresAt(ACCESS_TOKEN_SECONDS),
      issued_access_hash: hashOAuthCredential(accessToken),
      issued_refresh_expires_at: expiresAt(REFRESH_TOKEN_SECONDS),
      issued_refresh_hash: hashOAuthCredential(refreshToken),
      oauth_client_id: input.clientId,
      oauth_redirect_uri: input.redirectUri,
      oauth_resource: canonicalizeMcpResource(input.resource),
      presented_code_challenge: input.codeChallenge,
      presented_code_hash: hashOAuthCredential(input.code)
    });

    if (error) throw error;
    const result = data[0];
    if (!result || result.result_status !== "exchanged" || !result.granted_scopes) {
      const securityEvent = result?.result_status === "pkce_failure"
        ? "pkce_failure"
        : result?.result_status === "redirect_mismatch"
          ? "redirect_mismatch"
          : "invalid_grant";
      throw new McpOAuthGrantError(
        "invalid_grant",
        securityEvent,
        result?.security_user_id ?? undefined,
        result?.security_grant_id ?? undefined
      );
    }

    return tokenSet(accessToken, refreshToken, result.granted_scopes);
  }

  async exchangeRefreshToken(input: {
    clientId: string;
    refreshToken: string;
    resource: string;
    scopes?: McpOAuthScope[];
  }) {
    const accessToken = createOAuthCredential("slx_at");
    const refreshToken = createOAuthCredential("slx_rt");
    const { data, error } = await this.client.rpc("mcp_rotate_oauth_refresh_token", {
      issued_access_expires_at: expiresAt(ACCESS_TOKEN_SECONDS),
      issued_access_hash: hashOAuthCredential(accessToken),
      issued_refresh_expires_at: expiresAt(REFRESH_TOKEN_SECONDS),
      issued_refresh_hash: hashOAuthCredential(refreshToken),
      oauth_client_id: input.clientId,
      oauth_resource: canonicalizeMcpResource(input.resource),
      presented_refresh_hash: hashOAuthCredential(input.refreshToken),
      requested_scopes: input.scopes ?? null
    });

    if (error) throw error;
    const result = data[0];
    if (!result || result.result_status !== "rotated" || !result.granted_scopes) {
      const oauthError = result?.result_status === "invalid_scope" ? "invalid_scope" : "invalid_grant";
      const securityEvent = result?.result_status === "refresh_replay"
        ? "refresh_replay"
        : "invalid_grant";
      throw new McpOAuthGrantError(
        oauthError,
        securityEvent,
        result?.security_user_id ?? undefined,
        result?.security_grant_id ?? undefined
      );
    }

    return tokenSet(accessToken, refreshToken, result.granted_scopes);
  }

  async verifyAccessToken(token: string, expectedResource: string) {
    const { data: credential, error } = await this.client
      .from("mcp_oauth_credentials")
      .select("client_id,expires_at,resource,scopes,user_id")
      .eq("credential_hash", hashOAuthCredential(token))
      .eq("credential_type", "access_token")
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    if (!credential || !mcpResourcesMatch(credential.resource, expectedResource)) {
      throw new Error("invalid_token");
    }

    return {
      clientId: credential.client_id,
      expiresAt: Math.floor(new Date(credential.expires_at).getTime() / 1000),
      resource: canonicalizeMcpResource(credential.resource),
      scopes: credential.scopes as McpOAuthScope[],
      userId: credential.user_id
    };
  }

  async revokeTokenFamily(token: string) {
    const { error } = await this.client.rpc("mcp_revoke_oauth_grant_family", {
      presented_credential_hash: hashOAuthCredential(token)
    });
    if (error) throw error;
  }

  async recordSecurityEvent(input: {
    clientHash?: string;
    errorCode?: string;
    eventType: McpOAuthSecurityEventRow["event_type"];
    grantHash?: string;
    ipHash?: string;
    requestId?: string;
    route: string;
    severity: McpOAuthSecurityEventRow["severity"];
    userHash?: string;
  }) {
    const { error } = await this.client.rpc("mcp_record_oauth_security_event", {
      security_client_hash: input.clientHash ?? null,
      security_error_code: input.errorCode ?? null,
      security_event_type: input.eventType,
      security_grant_hash: input.grantHash ?? null,
      security_ip_hash: input.ipHash ?? null,
      security_request_id: input.requestId ?? null,
      security_route: input.route,
      security_severity: input.severity,
      security_user_hash: input.userHash ?? null
    });
    if (error) throw error;
  }

  private async insertCredential(
    credential: Database["public"]["Tables"]["mcp_oauth_credentials"]["Insert"]
  ) {
    const { error } = await this.client.from("mcp_oauth_credentials").insert(credential);
    if (error) throw error;
  }
}

function expiresAt(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function tokenSet(
  accessToken: string,
  refreshToken: string,
  scopes: readonly string[]
): McpTokenSet {
  return {
    access_token: accessToken,
    expires_in: ACCESS_TOKEN_SECONDS,
    refresh_token: refreshToken,
    scope: scopes.join(" "),
    token_type: "Bearer"
  };
}
