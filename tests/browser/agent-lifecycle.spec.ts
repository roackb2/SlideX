import { expect, test, type Locator, type Page, type Route } from "@playwright/test";

const timestamp = "2026-07-12T00:00:00.000Z";

test("keeps one conversational deck across turns, refresh, and chat reset", async ({ page }) => {
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
    "New conversation started. The current deck was kept.",
    { exact: true }
  )).toBeVisible();

  await submitAgentMessage(page, "Add one final polish pass");
  await expect(panel.getByText("Turn 3 complete", { exact: true })).toBeVisible();

  expect(agent.resets).toBe(1);
  expect(agent.startRequests).toHaveLength(3);
  expect(agent.startRequests[2]?.sessionId).toBeUndefined();
  expect(agent.startRequests[2]?.motionDoc).toBe(agent.producedMotionDocs[1]);
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
  await page.addInitScript(() => {
    localStorage.setItem("slidex_has_completed_onboarding", "true");
  });
  await page.route("**/api/agent/**", (route) => agent.handle(route));
  await page.goto("/workspace/pitch/");
  await page.getByRole("button", { name: "Toggle SlideX agent" }).click();
  const panel = page.getByRole("complementary", { name: "SlideX agent" });
  await expect(panel).toBeVisible();
  return { consoleErrors, panel };
}

async function submitAgentMessage(page: Page, message: string): Promise<void> {
  const input = page.getByLabel("Message the SlideX agent");
  await input.fill(message);
  await page.getByRole("button", { name: "Send" }).click();
}

type StartRequest = {
  sessionId?: string;
  title: string;
  message: string;
  motionDoc: string;
  sourceRevision: string;
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
  detached: boolean;
  events?: FixtureAgentEvent[];
  request: StartRequest;
  runId: string;
  sessionId: string;
  turn: number;
};

type FixtureAgentEvent = {
  kind: "activity" | "result";
  runId: string;
  sequence: number;
  timestamp: string;
  activity?: unknown;
  result?: unknown;
};

/**
 * Protocol fixture only: it gives the editor deterministic HTTP/SSE responses
 * while the server repository separately verifies its real route and run
 * service. Product lifecycle rules must stay in production code, not here.
 */
class DeterministicAgentApi {
  readonly producedMotionDocs: string[] = [];
  readonly startRequests: StartRequest[] = [];
  resets = 0;
  sessionReads = 0;

  private nextSession = 1;
  private nextTurn = 1;
  private activeRun?: { runId: string; acceptedAt: string };
  private detachUpcomingRun = false;
  private session?: Session;
  private readonly runs = new Map<string, AcceptedRun>();

  detachNextRun(): void {
    this.detachUpcomingRun = true;
  }

  completeDetachedRun(): void {
    const run = this.activeRun ? this.runs.get(this.activeRun.runId) : undefined;
    if (!run?.detached) {
      throw new Error("No detached agent run is active");
    }
    this.completeRun(run);
  }

  async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === "POST" && url.pathname === "/api/agent/runs") {
      await this.start(route);
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
    const request = route.request().postDataJSON() as StartRequest;
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
    const detached = this.detachUpcomingRun;
    this.detachUpcomingRun = false;
    this.runs.set(runId, { detached, request, runId, sessionId, turn });
    this.activeRun = { runId, acceptedAt: timestamp };
    this.startRequests.push(request);

    await route.fulfill({
      json: {
        accepted: true,
        runId,
        acceptedAt: timestamp,
        session: this.session
      },
      status: 202
    });
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

    if (run.detached && !run.events) {
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

    const events = this.completeRun(run);
    const afterSequence = Number(url.searchParams.get("after") ?? "0");
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
