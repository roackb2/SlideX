import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/common/lib/supabase/database.types";
import {
  createOAuthCredential,
  hashOAuthCredential,
  type McpOAuthScope,
  verifyPkceChallenge
} from "@/mcp/oauth";

type McpOAuthClientRow = Database["public"]["Tables"]["mcp_oauth_clients"]["Row"];
type McpOAuthCredentialRow = Database["public"]["Tables"]["mcp_oauth_credentials"]["Row"];

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

const ACCESS_TOKEN_SECONDS = 60 * 60;
const AUTHORIZATION_CODE_SECONDS = 5 * 60;
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
      resource: input.resource,
      scopes: input.scopes,
      user_id: input.userId
    });
    return code;
  }

  async exchangeAuthorizationCode(input: {
    clientId: string;
    code: string;
    codeVerifier: string;
    redirectUri: string;
    resource: string;
  }) {
    const credential = await this.consumeCredential(input.code, "authorization_code");
    if (
      credential.client_id !== input.clientId ||
      credential.redirect_uri !== input.redirectUri ||
      credential.resource !== input.resource ||
      !credential.code_challenge ||
      !verifyPkceChallenge(input.codeVerifier, credential.code_challenge)
    ) {
      throw new Error("invalid_grant");
    }

    return this.issueTokenSet(credential);
  }

  async exchangeRefreshToken(input: {
    clientId: string;
    refreshToken: string;
    resource: string;
    scopes?: McpOAuthScope[];
  }) {
    const credential = await this.consumeCredential(input.refreshToken, "refresh_token");
    if (credential.client_id !== input.clientId || credential.resource !== input.resource) {
      throw new Error("invalid_grant");
    }

    if (input.scopes?.some((scope) => !credential.scopes.includes(scope))) {
      throw new Error("invalid_scope");
    }

    return this.issueTokenSet({
      ...credential,
      scopes: input.scopes ?? credential.scopes
    });
  }

  async verifyAccessToken(token: string, expectedResource: string) {
    const credential = await this.findActiveCredential(token, "access_token");
    if (!credential || credential.resource !== expectedResource) {
      throw new Error("invalid_token");
    }

    return {
      clientId: credential.client_id,
      expiresAt: Math.floor(new Date(credential.expires_at).getTime() / 1000),
      resource: credential.resource,
      scopes: credential.scopes as McpOAuthScope[],
      userId: credential.user_id
    };
  }

  async revokeToken(token: string) {
    const { error } = await this.client
      .from("mcp_oauth_credentials")
      .update({ revoked_at: new Date().toISOString() })
      .eq("credential_hash", hashOAuthCredential(token))
      .is("revoked_at", null);
    if (error) throw error;
  }

  private async issueTokenSet(
    credential: Pick<McpOAuthCredentialRow, "client_id" | "resource" | "scopes" | "user_id">
  ): Promise<McpTokenSet> {
    const accessToken = createOAuthCredential("slx_at");
    const refreshToken = createOAuthCredential("slx_rt");

    const { error } = await this.client.from("mcp_oauth_credentials").insert([
      {
        client_id: credential.client_id,
        credential_hash: hashOAuthCredential(accessToken),
        credential_type: "access_token",
        expires_at: expiresAt(ACCESS_TOKEN_SECONDS),
        resource: credential.resource,
        scopes: credential.scopes,
        user_id: credential.user_id
      },
      {
        client_id: credential.client_id,
        credential_hash: hashOAuthCredential(refreshToken),
        credential_type: "refresh_token",
        expires_at: expiresAt(REFRESH_TOKEN_SECONDS),
        resource: credential.resource,
        scopes: credential.scopes,
        user_id: credential.user_id
      }
    ]);

    if (error) throw error;
    return {
      access_token: accessToken,
      expires_in: ACCESS_TOKEN_SECONDS,
      refresh_token: refreshToken,
      scope: credential.scopes.join(" "),
      token_type: "Bearer"
    };
  }

  private async insertCredential(
    credential: Database["public"]["Tables"]["mcp_oauth_credentials"]["Insert"]
  ) {
    const { error } = await this.client.from("mcp_oauth_credentials").insert(credential);
    if (error) throw error;
  }

  private async consumeCredential(
    value: string,
    type: McpOAuthCredentialRow["credential_type"]
  ) {
    const credential = await this.findActiveCredential(value, type);
    if (!credential) throw new Error("invalid_grant");

    const { data, error } = await this.client
      .from("mcp_oauth_credentials")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", credential.id)
      .is("revoked_at", null)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("invalid_grant");
    return data;
  }

  private async findActiveCredential(
    value: string,
    type: McpOAuthCredentialRow["credential_type"]
  ) {
    const { data, error } = await this.client
      .from("mcp_oauth_credentials")
      .select()
      .eq("credential_hash", hashOAuthCredential(value))
      .eq("credential_type", type)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

function expiresAt(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}
