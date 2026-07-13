"use client";

import {
  createClient as createSupabaseClient,
  type SupabaseClient
} from "@supabase/supabase-js";

type AgentIdentitySession = {
  access_token: string;
};

type AgentIdentityResponse = Promise<{
  data: { session: AgentIdentitySession | null };
  error: Error | null;
}>;

export type SlideXAgentIdentityClient = {
  auth: {
    getSession(): AgentIdentityResponse;
    signInAnonymously(): AgentIdentityResponse;
  };
};

export type SlideXAgentIdentityServiceOptions = {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
  createClient?: (
    url: string,
    publishableKey: string
  ) => SlideXAgentIdentityClient;
};

const IDENTITY_CONFIGURATION_ERROR =
  "SlideX agent sign-in is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";
const IDENTITY_SESSION_ERROR =
  "SlideX could not create an anonymous session. Try again.";

/**
 * Owns the editor's anonymous product identity.
 *
 * The Supabase session may persist in browser storage so a deck conversation
 * remains owned across refresh. This service never receives or stores the
 * user's model API key; product identity and model credentials are separate
 * boundaries.
 */
export class SlideXAgentIdentityService {
  private client?: SlideXAgentIdentityClient;
  private accessTokenPromise?: Promise<string>;
  private readonly createClient: NonNullable<SlideXAgentIdentityServiceOptions["createClient"]>;

  constructor(private readonly options: SlideXAgentIdentityServiceOptions) {
    this.createClient = options.createClient ?? createBrowserClient;
  }

  async authorizationHeaders(): Promise<HeadersInit> {
    return { Authorization: `Bearer ${await this.accessToken()}` };
  }

  accessToken(): Promise<string> {
    if (this.accessTokenPromise) {
      return this.accessTokenPromise;
    }

    const pending = this.resolveAccessToken();
    this.accessTokenPromise = pending;
    void pending.then(
      () => this.clearPendingToken(pending),
      () => this.clearPendingToken(pending)
    );
    return pending;
  }

  private clearPendingToken(pending: Promise<string>): void {
    if (this.accessTokenPromise === pending) {
      this.accessTokenPromise = undefined;
    }
  }

  private async resolveAccessToken(): Promise<string> {
    const client = this.resolveClient();
    const current = await client.auth.getSession();
    if (current.error) {
      throw new SlideXAgentIdentityError(IDENTITY_SESSION_ERROR);
    }
    if (current.data.session?.access_token) {
      return current.data.session.access_token;
    }

    const created = await client.auth.signInAnonymously();
    const accessToken = created.data.session?.access_token;
    if (created.error || !accessToken) {
      throw new SlideXAgentIdentityError(IDENTITY_SESSION_ERROR);
    }
    return accessToken;
  }

  private resolveClient(): SlideXAgentIdentityClient {
    if (this.client) {
      return this.client;
    }
    if (!this.options.supabaseUrl || !this.options.supabasePublishableKey) {
      throw new SlideXAgentIdentityError(IDENTITY_CONFIGURATION_ERROR);
    }
    this.client = this.createClient(
      this.options.supabaseUrl,
      this.options.supabasePublishableKey
    );
    return this.client;
  }
}

export class SlideXAgentIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SlideXAgentIdentityError";
  }
}

export const slideXAgentIdentity = new SlideXAgentIdentityService({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
});

function createBrowserClient(
  url: string,
  publishableKey: string
): SupabaseClient {
  return createSupabaseClient(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true
    }
  });
}
