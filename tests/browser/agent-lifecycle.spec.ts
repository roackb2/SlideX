import { expect, test, type Locator, type Page, type Route } from "@playwright/test";
import { defaultMdx } from "../../core/motion-doc/presets/defaultMdx";

const timestamp = "2026-07-12T00:00:00.000Z";
const anonymousAccessToken = "test-anonymous-access-token";
const defaultModelKey = "sk-test-current-tab-only-key";
const workspaceOwnerId = "test-workspace-user";
const workspacePresentationId = "test-presentation";

test("keeps one conversational deck across turns, refresh, detach, and explicit delete", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "Make the opening slide clearer");
  await expect(panel.getByText("Turn 1 complete", { exact: true })).toBeVisible();
  await expect(panel.getByText("apply motiondoc", { exact: true })).toBeVisible();

  await submitAgentMessage(page, "Now make the title more concise");
  await expect(panel.getByText("Turn 2 complete", { exact: true })).toBeVisible();

  expect(agent.startRequests).toHaveLength(2);
  expect(agent.startRequests[0]?.sessionId).toBeUndefined();
  expect(agent.startRequests[1]?.sessionId).toBe("session-1");
  expect(agent.startRequests[1]?.motionDoc).toBe(agent.producedMotionDocs[0]);

  await page.reload();
  await page.getByRole("button", { name: "Toggle SlideX agent" }).click();
  await expect(panel.getByText("Make the opening slide clearer", { exact: true })).toBeVisible();
  await expect(panel.getByText("Turn 2 complete", { exact: true })).toBeVisible();
  expect(agent.sessionReads).toBeGreaterThan(0);

  await panel.getByRole("button", { name: "Agent settings" }).click();
  await panel.getByRole("button", { name: "New conversation" }).click();
  const resetDialog = page.getByRole("alertdialog", { name: "Start a new conversation?" });
  await expect(resetDialog).toBeVisible();
  await resetDialog.getByRole("button", { name: "Keep conversation" }).click();
  await expect(panel.getByText("Turn 2 complete", { exact: true })).toBeVisible();
  await panel.getByRole("button", { name: "New conversation" }).click();
  await resetDialog.getByRole("button", { name: "New conversation" }).click();
  await expect(panel.getByText("Edit this deck conversationally", { exact: true })).toBeVisible();
  await expect(panel.getByText(
    "New conversation started. The previous conversation was kept.",
    { exact: true }
  )).toBeVisible();
  expect(agent.resets).toBe(0);

  await submitAgentMessage(page, "Add one final polish pass");
  await expect(panel.getByText("Turn 3 complete", { exact: true })).toBeVisible();

  expect(agent.startRequests).toHaveLength(3);
  expect(agent.startRequests[2]?.sessionId).toBeUndefined();
  expect(agent.startRequests[2]?.motionDoc).toBe(agent.producedMotionDocs[1]);

  await panel.getByRole("button", { name: "Delete conversation" }).click();
  const deleteDialog = page.getByRole("alertdialog", {
    name: "Delete this conversation?"
  });
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole("button", { name: "Keep conversation" }).click();
  await expect(panel.getByText("Turn 3 complete", { exact: true })).toBeVisible();
  await panel.getByRole("button", { name: "Delete conversation" }).click();
  await deleteDialog.getByRole("button", { name: "Delete conversation" }).click();
  await expect(panel.getByText("Conversation deleted. The current deck was kept.", {
    exact: true
  })).toBeVisible();
  expect(agent.resets).toBe(1);
  expect(consoleErrors).toEqual([]);
});

test("keeps the agent runtime and current-tab composer state when the panel remounts", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  agent.holdNextRun();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await setAgentApiKey(panel, "sk-panel-remount-key");
  await page.getByLabel("Message the SlideX agent").fill("Keep running while hidden");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(panel.getByRole("button", { name: "Stop" })).toBeVisible();

  await page.getByRole("button", { name: "Toggle SlideX agent" }).click();
  await expect(panel).toBeHidden();
  await page.getByRole("button", { name: "Toggle SlideX agent" }).click();
  await expect(panel.getByRole("button", { name: "Stop" })).toBeVisible();
  await panel.getByRole("button", { name: "Agent settings" }).click();
  await expect(panel.getByLabel("OpenAI API key")).toHaveValue(
    "sk-panel-remount-key"
  );

  await panel.getByRole("button", { name: "Stop" }).click();
  await expect(panel.getByText("Run cancelled.", { exact: true })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("keeps long conversations inside a scrollable agent panel", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);
  const longRequest = [
    "Preserve the existing deck while explaining every requested change clearly.",
    "Keep all unaffected slides unchanged and validate the final MotionDoc.",
    "Use concise presentation copy and maintain the established visual system."
  ].join(" ").repeat(5);

  for (let turn = 1; turn <= 3; turn += 1) {
    await submitAgentMessage(page, `${longRequest} Turn ${turn}.`);
    await expect(panel.getByText(`Turn ${turn} complete`, { exact: true })).toBeVisible();
  }

  const scrollRegion = panel.getByRole("region", {
    name: "Agent conversation and activity"
  });
  const layout = await scrollRegion.evaluate((element) => {
    const panelElement = element.closest("aside");
    const composer = panelElement?.querySelector("form");
    return {
      clientHeight: element.clientHeight,
      composerBottom: composer?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY,
      panelBottom: panelElement?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY,
      scrollHeight: element.scrollHeight,
      viewportHeight: window.innerHeight
    };
  });

  expect(layout.panelBottom).toBeLessThanOrEqual(layout.viewportHeight + 1);
  expect(layout.composerBottom).toBeLessThanOrEqual(layout.viewportHeight + 1);
  expect(layout.scrollHeight).toBeGreaterThan(layout.clientHeight);

  await scrollRegion.evaluate((element) => {
    element.scrollTop = 0;
    element.scrollTo({ top: element.scrollHeight });
  });
  await expect.poll(() => scrollRegion.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(consoleErrors).toEqual([]);
});

test("keeps the model key only in current-tab memory", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);
  const sentinel = "sk-ephemeral-browser-sentinel-key";

  await setAgentApiKey(panel, sentinel);
  await panel.getByRole("button", { name: "Forget key" }).click();
  await expect(panel.getByLabel("OpenAI API key")).toHaveValue("");
  await submitAgentMessage(page, "Use a current-tab key", sentinel);
  await expect(panel.getByText("Turn 1 complete", { exact: true })).toBeVisible();

  expect(agent.startRequests[0]?.llmApiKey).toBe(sentinel);
  const browserStorage = await page.evaluate(() => JSON.stringify({
    local: { ...localStorage },
    session: { ...sessionStorage },
    cookies: document.cookie
  }));
  expect(browserStorage).not.toContain(sentinel);

  await page.reload();
  await page.getByRole("button", { name: "Toggle SlideX agent" }).click();
  await panel.getByRole("button", { name: "Agent settings" }).click();
  await expect(panel.getByLabel("OpenAI API key")).toHaveValue("");
  expect(agent.authorizationHeaders.every(
    (header) => header === `Bearer ${anonymousAccessToken}`
  )).toBe(true);
  expect(consoleErrors).toEqual([]);
});

test("puts a rejected model key next to the key input and allows retry", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  agent.rejectNextCredential();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "Use a rejected key", "sk-rejected-model-key");
  await expect(panel.locator("#slidex-agent-api-key-error")).toHaveText(
    "OpenAI rejected this API key. Check the key and try again."
  );
  await expect(panel.getByLabel("OpenAI API key")).toBeFocused();

  await submitAgentMessage(page, "Retry with a working key", "sk-working-model-key");
  await expect(panel.getByText("Turn 2 complete", { exact: true })).toBeVisible();
  expect(agent.startRequests).toHaveLength(2);
  expect(consoleErrors).toEqual([]);
});

test("resumes a refreshed active run from its persisted cursor", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "Create the conversation");
  await expect(panel.getByText("Turn 1 complete", { exact: true })).toBeVisible();
  const runId = agent.startBackgroundRun("Continue from retained progress");
  await page.evaluate(({ activeRunId, presentationId }) => {
    const storageKey = "slidex_agent_presentation_bindings_v1";
    const bindings = JSON.parse(
      sessionStorage.getItem(storageKey) ?? "{}"
    ) as Record<string, Record<string, unknown>>;
    sessionStorage.setItem(storageKey, JSON.stringify({
      ...bindings,
      [presentationId]: {
        ...bindings[presentationId],
        presentationId,
        sessionId: "session-1",
        runId: activeRunId,
        afterSequence: 2
      }
    }));
  }, {
    activeRunId: runId,
    presentationId: workspacePresentationId
  });

  await page.reload();
  await page.getByRole("button", { name: "Toggle SlideX agent" }).click();

  await expect(panel.getByText("Continue from retained progress", { exact: true })).toBeVisible();
  await expect(panel.getByText("Turn 2 complete", { exact: true })).toBeVisible();
  expect(agent.subscriptionCursors.at(-1)).toBe(2);
  expect(consoleErrors).toEqual([]);
});

test("keeps the selected conversation when content is imported into the same presentation", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "Create a conversation for the first Untitled deck");
  await expect(panel.getByText("Turn 1 complete", { exact: true })).toBeVisible();
  const importedMotionDoc = agent.startRequests[0]?.motionDoc;
  expect(importedMotionDoc).toBeTruthy();

  await page.getByRole("button", { name: "Export presentation", exact: true }).click();
  const fileDialog = page.getByRole("dialog", { name: "Presentation file" });
  await fileDialog.getByRole("tab", { name: "Import" }).click();
  await fileDialog.locator('input[type="file"]').setInputFiles({
    name: "Untitled.mdx",
    mimeType: "text/markdown",
    buffer: Buffer.from(importedMotionDoc ?? "")
  });

  await expect(fileDialog).toBeHidden();
  await expect(panel.getByText(
    "Create a conversation for the first Untitled deck",
    { exact: true }
  )).toBeVisible();
  expect(agent.resets).toBe(0);

  await submitAgentMessage(page, "Continue the conversation after importing content");
  await expect(panel.getByText("Turn 2 complete", { exact: true })).toBeVisible();

  expect(agent.startRequests).toHaveLength(2);
  expect(agent.startRequests.map(({ title }) => title)).toEqual([
    "Untitled",
    "Untitled"
  ]);
  expect(agent.startRequests[1]?.sessionId).toBe("session-1");
  expect(agent.startRequests[1]?.motionDoc).toBe(importedMotionDoc);
  expect(consoleErrors).toEqual([]);
});

test("recovers a completed run after live replay expires", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  agent.detachNextRun();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "Make the opening slide bolder");
  await expect(panel.getByText("Live agent progress is no longer available", {
    exact: true
  })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Check status" })).toBeVisible();

  agent.completeDetachedRun();
  await panel.getByRole("button", { name: "Check status" }).click();
  await expect(panel.getByText("Turn 1 complete", { exact: true })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Check status" })).toBeHidden();

  await submitAgentMessage(page, "Add a concise subtitle");
  await expect(panel.getByText("Turn 2 complete", { exact: true })).toBeVisible();
  expect(agent.startRequests[1]?.motionDoc).toBe(agent.producedMotionDocs[0]);
  expect(consoleErrors).toHaveLength(1);
  expect(consoleErrors[0]).toContain("409 (Conflict)");
});

test("protects manual deck edits when a detached run later completes", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  agent.detachNextRun();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "Rewrite the opening slide");
  await expect(panel.getByRole("button", { name: "Check status" })).toBeVisible();
  await page.getByRole("button", { name: "New Slide Blank slide" }).click();

  agent.completeDetachedRun();
  await panel.getByRole("button", { name: "Check status" }).click();
  await expect(panel.getByText("The deck changed during this run", { exact: true })).toBeVisible();
  await panel.getByRole("button", { name: "Keep mine" }).click();

  await submitAgentMessage(page, "Polish my current version");
  await expect(panel.getByText("Turn 2 complete", { exact: true })).toBeVisible();
  expect(agent.startRequests[1]?.motionDoc).not.toBe(agent.producedMotionDocs[0]);
  expect(consoleErrors).toHaveLength(1);
  expect(consoleErrors[0]).toContain("409 (Conflict)");
});

test("clears a stale conversation binding and starts fresh", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "Create the first conversation");
  await expect(panel.getByText("Turn 1 complete", { exact: true })).toBeVisible();
  agent.expireSession();

  await page.reload();
  await page.getByRole("button", { name: "Toggle SlideX agent" }).click();
  await expect(panel.getByText(
    "The previous conversation was unavailable, so a new one will start.",
    { exact: true }
  )).toBeVisible();

  await submitAgentMessage(page, "Create a fresh conversation");
  await expect(panel.getByText("Turn 2 complete", { exact: true })).toBeVisible();
  expect(agent.startRequests[1]?.sessionId).toBeUndefined();
  expect(consoleErrors).toHaveLength(1);
  expect(consoleErrors[0]).toContain("404 (Not Found)");
});

test("cancels an accepted run and returns the composer to idle", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  agent.holdNextRun();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "Start a long-running edit");
  const stop = panel.getByRole("button", { name: "Stop" });
  await expect(stop).toBeVisible();
  await stop.click();

  await expect(panel.getByText("Run cancelled.", { exact: true })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Send" })).toBeVisible();
  expect(agent.cancellations).toBe(1);
  expect(consoleErrors).toEqual([]);
});

test("shows a sanitized start failure and allows a clean retry", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  agent.failNextStart({
    status: 500,
    code: "internal_error",
    message: "The agent service could not complete the request"
  });
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "This request will fail safely");
  await expect(panel.getByRole("alert")).toHaveText(
    "The agent service could not complete the request"
  );

  await submitAgentMessage(page, "Retry the request");
  await expect(panel.getByText("Turn 1 complete", { exact: true })).toBeVisible();
  expect(agent.startRequests).toHaveLength(1);
  expect(consoleErrors).toHaveLength(1);
  expect(consoleErrors[0]).toContain("500 (Internal Server Error)");
});

test("reattaches to the server run after an active-run conflict", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "Create a conversation");
  await expect(panel.getByText("Turn 1 complete", { exact: true })).toBeVisible();
  agent.startBackgroundRun("Continue editing in the active run");

  await submitAgentMessage(page, "Collide with the active run");
  await expect(panel.getByText("Turn 2 complete", { exact: true })).toBeVisible();
  await expect(panel.getByText("The deck changed during this run", { exact: true })).toBeVisible();
  expect(consoleErrors).toHaveLength(1);
  expect(consoleErrors[0]).toContain("409 (Conflict)");
});

test("recovers an accepted run after its event stream cannot be opened", async ({ page }) => {
  const agent = new DeterministicAgentApi();
  agent.failNextSubscription({
    status: 400,
    code: "invalid_request",
    message: "Live updates could not be opened"
  });
  const { consoleErrors, panel } = await openAgentPanel(page, agent);

  await submitAgentMessage(page, "Start an edit whose live stream fails");
  await expect(panel.getByRole("alert")).toHaveText("Live updates could not be opened");
  await expect(panel.getByText("Live progress unavailable", { exact: true })).toBeVisible();
  const checkStatus = panel.getByRole("button", { name: "Check status" });
  await expect(checkStatus).toBeVisible();

  agent.completeActiveRun();
  await checkStatus.click();
  await expect(panel.getByText("Turn 1 complete", { exact: true })).toBeVisible();
  await expect(checkStatus).toBeHidden();
  expect(consoleErrors).toHaveLength(1);
  expect(consoleErrors[0]).toContain("400 (Bad Request)");
});

async function openAgentPanel(
  page: Page,
  agent: DeterministicAgentApi
): Promise<{ consoleErrors: string[]; panel: Locator }> {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.addInitScript(({ ownerId, presentationId, source, createdAt }) => {
    localStorage.setItem("slidex_local_auth_session_v1", JSON.stringify({
      createdAt,
      provider: "google",
      user: {
        displayName: "Agent Test User",
        email: "agent-test@example.com",
        id: ownerId
      }
    }));
    const presentationsKey = `slidex_local_presentations_v1:${ownerId}`;
    if (!localStorage.getItem(presentationsKey)) {
      localStorage.setItem(presentationsKey, JSON.stringify([{
        createdAt,
        id: presentationId,
        kind: "presentation",
        lastOpenedAt: createdAt,
        ownerId,
        source,
        title: "Untitled",
        updatedAt: createdAt
      }]));
    }
  }, {
    createdAt: timestamp,
    ownerId: workspaceOwnerId,
    presentationId: workspacePresentationId,
    source: defaultMdx
  });
  await page.route("**/auth/v1/signup", async (route) => {
    await route.fulfill({
      json: createAnonymousSessionResponse(),
      status: 200
    });
  });
  await page.route("**/api/agent/**", (route) => agent.handle(route));
  await page.goto(`/workspace/pitch/?presentation=${workspacePresentationId}`);
  await page.getByRole("button", { name: "Toggle SlideX agent" }).click();
  const panel = page.getByRole("complementary", { name: "SlideX agent" });
  await expect(panel).toBeVisible();
  return { consoleErrors, panel };
}

async function submitAgentMessage(
  page: Page,
  message: string,
  modelKey = defaultModelKey
): Promise<void> {
  const panel = page.getByRole("complementary", { name: "SlideX agent" });
  await setAgentApiKey(panel, modelKey);
  const input = page.getByLabel("Message the SlideX agent");
  await input.fill(message);
  const send = page.getByRole("button", { name: "Send" });
  await expect(send).toBeEnabled();
  await send.click();
}

async function setAgentApiKey(panel: Locator, modelKey: string): Promise<void> {
  const input = panel.getByLabel("OpenAI API key");
  if (!await input.isVisible()) {
    await panel.getByRole("button", { name: "Agent settings" }).click();
  }
  await input.fill(modelKey);
}

type StartRequest = {
  sessionId?: string;
  title: string;
  message: string;
  motionDoc: string;
  sourceRevision: string;
  llmApiKey?: string;
};

type SessionMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type Session = {
  id: string;
  title: string;
  latestMotionDoc: string;
  messages: SessionMessage[];
};

type AcceptedRun = {
  cancelled?: boolean;
  credentialRejected: boolean;
  detached: boolean;
  events?: FixtureAgentEvent[];
  held: boolean;
  release?: () => void;
  request: StartRequest;
  runId: string;
  sessionId: string;
  turn: number;
};

type FixtureAgentEvent = {
  kind: "activity" | "result" | "cancelled" | "error";
  runId: string;
  sequence: number;
  timestamp: string;
  activity?: unknown;
  error?: { code: string; message: string };
  reason?: string;
  result?: unknown;
};

type StartFailure = {
  status: number;
  code: "internal_error";
  message: string;
};

type SubscriptionFailure = {
  status: number;
  code: "invalid_request";
  message: string;
};

/**
 * Protocol fixture only: it gives the editor deterministic HTTP/SSE responses
 * while the server repository separately verifies its real route and run
 * service. Product lifecycle rules must stay in production code, not here.
 */
class DeterministicAgentApi {
  readonly authorizationHeaders: string[] = [];
  readonly producedMotionDocs: string[] = [];
  readonly startRequests: StartRequest[] = [];
  readonly subscriptionCursors: number[] = [];
  cancellations = 0;
  resets = 0;
  sessionReads = 0;

  private nextSession = 1;
  private nextTurn = 1;
  private activeRun?: { runId: string; acceptedAt: string };
  private detachUpcomingRun = false;
  private holdUpcomingRun = false;
  private rejectUpcomingCredential = false;
  private nextStartFailure?: StartFailure;
  private nextSubscriptionFailure?: SubscriptionFailure;
  private session?: Session;
  private readonly runs = new Map<string, AcceptedRun>();

  detachNextRun(): void {
    this.detachUpcomingRun = true;
  }

  expireSession(): void {
    this.activeRun = undefined;
    this.session = undefined;
  }

  failNextStart(failure: StartFailure): void {
    this.nextStartFailure = failure;
  }

  holdNextRun(): void {
    this.holdUpcomingRun = true;
  }

  rejectNextCredential(): void {
    this.rejectUpcomingCredential = true;
  }

  startBackgroundRun(message: string): string {
    if (!this.session || this.activeRun) {
      throw new Error("A settled conversation is required before starting a background run");
    }
    return this.createRun({
      sessionId: this.session.id,
      title: this.session.title,
      message,
      motionDoc: this.session.latestMotionDoc,
      sourceRevision: "background-source-revision"
    }).runId;
  }

  completeDetachedRun(): void {
    const run = this.activeRun ? this.runs.get(this.activeRun.runId) : undefined;
    if (!run?.detached) {
      throw new Error("No detached agent run is active");
    }
    this.completeRun(run);
  }

  completeActiveRun(): void {
    const run = this.activeRun ? this.runs.get(this.activeRun.runId) : undefined;
    if (!run) {
      throw new Error("No agent run is active");
    }
    this.completeRun(run);
  }

  failNextSubscription(failure: SubscriptionFailure): void {
    this.nextSubscriptionFailure = failure;
  }

  async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const authorization = request.headers()["authorization"] ?? "";
    this.authorizationHeaders.push(authorization);
    if (authorization !== `Bearer ${anonymousAccessToken}`) {
      await route.fulfill({
        json: { error: { code: "auth_required", message: "Authentication required" } },
        status: 401
      });
      return;
    }

    if (request.method() === "POST" && url.pathname === "/api/agent/runs") {
      await this.start(route);
      return;
    }
    if (request.method() === "POST" && /\/api\/agent\/runs\/[^/]+\/cancel$/.test(url.pathname)) {
      await this.cancel(route, url);
      return;
    }
    if (request.method() === "GET" && /\/api\/agent\/runs\/[^/]+\/events$/.test(url.pathname)) {
      await this.subscribe(route, url);
      return;
    }
    if (request.method() === "GET" && /\/api\/agent\/sessions\/[^/]+$/.test(url.pathname)) {
      await this.readSession(route, url);
      return;
    }
    if (request.method() === "DELETE" && /\/api\/agent\/sessions\/[^/]+$/.test(url.pathname)) {
      this.session = undefined;
      this.activeRun = undefined;
      this.resets += 1;
      await route.fulfill({ json: { reset: true }, status: 200 });
      return;
    }

    await route.fulfill({
      json: { error: { code: "run_not_found", message: "Agent route not found" } },
      status: 404
    });
  }

  private async start(route: Route): Promise<void> {
    if (this.nextStartFailure) {
      const failure = this.nextStartFailure;
      this.nextStartFailure = undefined;
      await route.fulfill({
        json: { error: { code: failure.code, message: failure.message } },
        status: failure.status
      });
      return;
    }

    const request = route.request().postDataJSON() as StartRequest;
    if (this.activeRun) {
      await route.fulfill({
        json: {
          error: {
            code: "active_run_conflict",
            message: "An agent run is already in progress for this conversation"
          }
        },
        status: 409
      });
      return;
    }

    const run = this.createRun(request, {
      credentialRejected: this.rejectUpcomingCredential,
      detached: this.detachUpcomingRun,
      held: this.holdUpcomingRun,
      recordRequest: true
    });
    this.rejectUpcomingCredential = false;
    this.detachUpcomingRun = false;
    this.holdUpcomingRun = false;

    await route.fulfill({
      json: {
        accepted: true,
        runId: run.runId,
        acceptedAt: timestamp,
        session: this.session
      },
      status: 202
    });
  }

  private createRun(
    request: StartRequest,
    options: {
      credentialRejected?: boolean;
      detached?: boolean;
      held?: boolean;
      recordRequest?: boolean;
    } = {}
  ): AcceptedRun {
    const turn = this.nextTurn++;
    const sessionId = request.sessionId ?? `session-${this.nextSession++}`;
    if (!this.session || this.session.id !== sessionId) {
      this.session = {
        id: sessionId,
        title: request.title,
        latestMotionDoc: request.motionDoc,
        messages: []
      };
    }
    this.session.messages.push({
      id: `message-user-${turn}`,
      role: "user",
      content: request.message,
      createdAt: timestamp
    });
    const runId = `run-${turn}`;
    const run = {
      credentialRejected: options.credentialRejected ?? false,
      detached: options.detached ?? false,
      held: options.held ?? false,
      request,
      runId,
      sessionId,
      turn
    } satisfies AcceptedRun;
    this.runs.set(runId, run);
    this.activeRun = { runId, acceptedAt: timestamp };
    if (options.recordRequest) {
      this.startRequests.push(request);
    }
    return run;
  }

  private async cancel(route: Route, url: URL): Promise<void> {
    const runId = url.pathname.split("/").at(-2) ?? "";
    const run = this.runs.get(runId);
    const cancelled = Boolean(run && !run.events && !run.cancelled);
    if (run && cancelled) {
      run.cancelled = true;
      this.cancellations += 1;
      run.release?.();
    }
    await route.fulfill({ json: { cancelled }, status: 200 });
  }

  private async subscribe(route: Route, url: URL): Promise<void> {
    const runId = url.pathname.split("/").at(-2) ?? "";
    const run = this.runs.get(runId);
    if (!run || !this.session || this.session.id !== run.sessionId) {
      await route.fulfill({
        json: { error: { code: "run_not_found", message: "Agent run not found" } },
        status: 404
      });
      return;
    }

    if (this.nextSubscriptionFailure) {
      const failure = this.nextSubscriptionFailure;
      this.nextSubscriptionFailure = undefined;
      await route.fulfill({
        json: { error: { code: failure.code, message: failure.message } },
        status: failure.status
      });
      return;
    }

    if (run.held && !run.cancelled && !run.events) {
      await new Promise<void>((resolve) => {
        run.release = resolve;
      });
      run.release = undefined;
    }

    if (run.detached && !run.cancelled && !run.events) {
      await route.fulfill({
        json: {
          error: {
            code: "replay_unavailable",
            message: "Live agent progress is no longer available"
          }
        },
        status: 409
      });
      return;
    }

    const afterSequence = Number(url.searchParams.get("after") ?? "0");
    this.subscriptionCursors.push(afterSequence);
    const events = run.cancelled
      ? this.completeCancelledRun(run)
      : run.credentialRejected
        ? this.completeCredentialRejectedRun(run)
        : this.completeRun(run);
    const body = events
      .filter(({ sequence }) => sequence > afterSequence)
      .map((event) => [
        `event: ${event.kind}`,
        `id: ${event.sequence}`,
        `data: ${JSON.stringify(event)}`,
        ""
      ].join("\n"))
      .join("\n") + "\n";

    await route.fulfill({
      body,
      contentType: "text/event-stream; charset=utf-8",
      status: 200
    });
  }

  private completeCancelledRun(run: AcceptedRun): FixtureAgentEvent[] {
    if (run.events) {
      return run.events;
    }
    if (!this.session || this.session.id !== run.sessionId) {
      throw new Error("Agent run session is unavailable");
    }
    this.session.messages.push({
      id: `message-assistant-${run.turn}`,
      role: "assistant",
      content: "Run cancelled.",
      createdAt: timestamp
    });
    run.events = [{
      kind: "cancelled",
      runId: run.runId,
      sequence: 1,
      timestamp,
      reason: "Cancelled by user"
    }];
    if (this.activeRun?.runId === run.runId) {
      this.activeRun = undefined;
    }
    return run.events;
  }

  private completeCredentialRejectedRun(run: AcceptedRun): FixtureAgentEvent[] {
    if (run.events) {
      return run.events;
    }
    if (!this.session || this.session.id !== run.sessionId) {
      throw new Error("Agent run session is unavailable");
    }
    const message = "OpenAI rejected this API key. Check the key and try again.";
    this.session.messages.push({
      id: `message-assistant-${run.turn}`,
      role: "assistant",
      content: message,
      createdAt: timestamp
    });
    run.events = [{
      kind: "error",
      runId: run.runId,
      sequence: 1,
      timestamp,
      error: {
        code: "model_credential_rejected",
        message
      }
    }];
    if (this.activeRun?.runId === run.runId) {
      this.activeRun = undefined;
    }
    return run.events;
  }

  private completeRun(run: AcceptedRun): FixtureAgentEvent[] {
    if (run.events) {
      return run.events;
    }
    if (!this.session || this.session.id !== run.sessionId) {
      throw new Error("Agent run session is unavailable");
    }
    const motionDoc = run.request.motionDoc.replace(/^# .+$/m, `# Agent Turn ${run.turn}`);
    const assistantMessage = `Turn ${run.turn} complete`;
    this.session.latestMotionDoc = motionDoc;
    this.session.messages.push({
      id: `message-assistant-${run.turn}`,
      role: "assistant",
      content: assistantMessage,
      createdAt: timestamp
    });
    this.producedMotionDocs.push(motionDoc);

    const events: FixtureAgentEvent[] = [
      {
        kind: "activity",
        runId: run.runId,
        sequence: 1,
        timestamp,
        activity: { type: "tool.calling", tool: "slidex_apply_motiondoc" }
      },
      {
        kind: "activity",
        runId: run.runId,
        sequence: 2,
        timestamp,
        activity: {
          type: "tool.completed",
          tool: "slidex_apply_motiondoc",
          result: { ok: true }
        }
      },
      {
        kind: "result",
        runId: run.runId,
        sequence: 3,
        timestamp,
        result: {
          session: structuredClone(this.session),
          motionDoc,
          assistantMessage,
          baseSourceRevision: run.request.sourceRevision
        }
      }
    ];
    run.events = events;
    if (this.activeRun?.runId === run.runId) {
      this.activeRun = undefined;
    }
    return events;
  }

  private async readSession(route: Route, url: URL): Promise<void> {
    this.sessionReads += 1;
    const sessionId = decodeURIComponent(url.pathname.split("/").at(-1) ?? "");
    if (!this.session || this.session.id !== sessionId) {
      await route.fulfill({
        json: { error: { code: "session_not_found", message: "Conversation not found" } },
        status: 404
      });
      return;
    }
    await route.fulfill({
      json: { session: this.session, activeRun: this.activeRun ?? null },
      status: 200
    });
  }
}

function createAnonymousSessionResponse() {
  const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  const user = {
    id: "anonymous-user",
    aud: "authenticated",
    role: "authenticated",
    email: "",
    phone: "",
    app_metadata: { provider: "anonymous", providers: [] },
    user_metadata: {},
    identities: [],
    created_at: timestamp,
    updated_at: timestamp,
    is_anonymous: true
  };
  return {
    access_token: anonymousAccessToken,
    token_type: "bearer",
    expires_in: 24 * 60 * 60,
    expires_at: expiresAt,
    refresh_token: "test-anonymous-refresh-token",
    user
  };
}
