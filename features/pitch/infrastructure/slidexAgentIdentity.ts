"use client";

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
  };
};

export type SlideXAgentIdentityServiceOptions = {
  createClient: () => SlideXAgentIdentityClient;
};

const IDENTITY_CONFIGURATION_ERROR =
  "SlideX agent sign-in is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";
const IDENTITY_SESSION_ERROR =
  "SlideX could not restore your signed-in session. Sign in again.";

/**
 * Supplies the editor's signed-in product identity to the agent service.
 *
 * The application-wide Supabase browser client owns session persistence and
 * refresh. Reusing it prevents a second auth client from disagreeing about the
 * current user or creating conversations under another identity. This service
 * never receives or stores the user's model API key; product identity and
 * model credentials are separate boundaries.
 */
export class SlideXAgentIdentityService {
  private client?: SlideXAgentIdentityClient;
  private accessTokenPromise?: Promise<string>;
  private readonly createClient: NonNullable<SlideXAgentIdentityServiceOptions["createClient"]>;

  constructor(options: SlideXAgentIdentityServiceOptions) {
    this.createClient = options.createClient;
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
    const accessToken = current.data.session?.access_token;
    if (current.error || !accessToken) {
      throw new SlideXAgentIdentityError(IDENTITY_SESSION_ERROR);
    }
    return accessToken;
  }

  private resolveClient(): SlideXAgentIdentityClient {
    if (this.client) {
      return this.client;
    }
    try {
      this.client = this.createClient();
      return this.client;
    } catch {
      throw new SlideXAgentIdentityError(IDENTITY_CONFIGURATION_ERROR);
    }
  }
}

export class SlideXAgentIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SlideXAgentIdentityError";
  }
}
