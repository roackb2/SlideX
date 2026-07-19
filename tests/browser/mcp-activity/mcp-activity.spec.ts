import {
  expect,
  test,
  type APIRequestContext,
  type BrowserContext,
  type Locator,
  type Page
} from "@playwright/test";
import {
  createSupabaseFixtureSession,
  installSupabaseRealtimeFixture,
  supabaseFixtureURL
} from "../supabaseFixtureClient";

const ownerId = "729c3ccc-09e6-47d8-a49f-66a8395c041c";
const presentationId = "3ffb8bd0-f055-415d-8ec5-29c7effdecd2";
const timestamp = "2026-07-19T00:00:00.000Z";
const presentationSource = `# MCP visual test

<Slide duration={5} theme="dark" background="#111111">
  <Text id="node.with[special]:cursor" x={10} y={15} w={45} h={20}>Remote target</Text>
</Slide>
<Slide duration={5} theme="dark" background="#18181b">
  <Text id="second-slide" x={20} y={25} w={50} h={20}>Second slide</Text>
</Slide>`;
const user = {
  id: ownerId,
  aud: "authenticated",
  role: "authenticated",
  email: "visual-test@example.com",
  phone: "",
  app_metadata: { provider: "google", providers: ["google"] },
  user_metadata: { full_name: "Visual Test" },
  identities: [],
  created_at: timestamp,
  updated_at: timestamp,
  is_anonymous: false
};
const productSession = createSupabaseFixtureSession(user);

type ActivityMode = "center" | "failure" | "mixed" | "motion-doc" | "running" | "success";

test("purple MCP frames and Canvas cursor stay visual-only while editing remains interactive", async ({ context, page, request }) => {
  await prepareAuthenticatedPage({ context, mode: "mixed", page, request });
  await page.goto(`/workspace/pitch/?presentation=${presentationId}`);

  const runningFrame = page.locator('[data-mcp-operation-id="1d256aac-2138-4e55-8d95-eb879bc451dc"][data-mcp-operation-status="running"]:not([data-mcp-cursor-state])');
  await expect(runningFrame).toBeVisible();
  await expect(runningFrame).toContainText("AI · Codex");
  await expect(runningFrame).toHaveCSS("border-top-color", "rgb(139, 92, 246)");
  await expect(runningFrame).toHaveCSS("border-top-style", "solid");
  expect(await runningFrame.evaluate((element) => getComputedStyle(element.parentElement!).pointerEvents)).toBe("none");

  const completedFrame = page.locator('[data-mcp-operation-id="3c9adb49-b004-4421-b506-e067e87f453c"][data-mcp-operation-status="completed"]:not([data-mcp-cursor-state])');
  await expect(completedFrame).toBeVisible();
  await expect(completedFrame).toHaveAttribute("data-mcp-completed-revision", "5");

  const cursorLayer = page.locator("[data-mcp-cursor-layer]");
  const cursor = cursorLayer.locator('[data-mcp-operation-id="1d256aac-2138-4e55-8d95-eb879bc451dc"]');
  const target = cursorLayer.locator("..").locator('[data-motion-doc-node-id="node.with[special]:cursor"]');
  await expect(cursor).toHaveAttribute("data-mcp-cursor-position-source", "dom");
  await expect(cursor).toHaveAttribute("data-mcp-cursor-state", "running");
  await expect(target).toHaveCount(1);
  await expect(cursorLayer.locator("[data-mcp-cursor-state]")).toHaveCount(1);
  expect(await cursorLayer.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
  await expect.poll(async () => cursorPositionError(cursor, target, cursorLayer)).toBeLessThan(0.75);

  await page.locator("[data-canvas-zoom-trigger]").click();
  await page.locator('[data-canvas-zoom-option="1"]').click();
  await expect.poll(async () => cursorPositionError(cursor, target, cursorLayer)).toBeLessThan(0.75);
  await page.setViewportSize({ width: 1180, height: 760 });
  await expect.poll(async () => cursorPositionError(cursor, target, cursorLayer)).toBeLessThan(0.75);

  const activityRail = page.locator("[data-mcp-activity-rail]");
  await expect(activityRail).toBeVisible();
  expect(await activityRail.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
  const [railBox, canvasBox] = await Promise.all([
    activityRail.boundingBox(),
    page.locator("#canvas-v4").boundingBox()
  ]);
  expect(railBox).not.toBeNull();
  expect(canvasBox).not.toBeNull();
  expect(Math.abs((railBox!.x + railBox!.width / 2) - (canvasBox!.x + canvasBox!.width / 2))).toBeLessThan(2);
  expect(Math.abs((railBox!.y + railBox!.height / 2) - (canvasBox!.y + canvasBox!.height / 2))).toBeLessThan(2);

  const blockControl = page.locator('[data-frame-control][data-block-index="0"]');
  await blockControl.click({ position: { x: 20, y: 20 } });
  const beforeLeft = await blockControl.evaluate((element) => (element as HTMLElement).style.left);
  await blockControl.hover({ position: { x: 20, y: 20 } });
  await page.mouse.down();
  await page.mouse.move(700, 420, { steps: 4 });
  await page.mouse.up();
  await expect.poll(() => blockControl.evaluate((element) => (element as HTMLElement).style.left))
    .not.toBe(beforeLeft);
  await page.keyboard.press("ArrowRight");
  await expect(runningFrame).toBeVisible();
  await page.locator("[data-canvas-next-slide]").click();
  await expect(page.locator("[data-mcp-cursor-layer] [data-mcp-cursor-state]")).toHaveCount(0);
});

test("Canvas cursor renders completed and failed terminal states", async ({ context, page, request }) => {
  await prepareAuthenticatedPage({ context, mode: "success", page, request });
  await page.goto(`/workspace/pitch/?presentation=${presentationId}`);
  await expect(page.locator('[data-mcp-cursor-state="settled-success"]')).toBeVisible();

  await resetFixture(request, "failure");
  await page.reload();
  const failedCursor = page.locator('[data-mcp-cursor-state="settled-failure"]');
  await expect(failedCursor).toBeVisible();
  await expect(failedCursor).toHaveAttribute("data-mcp-operation-status", "failed");
  await expect(page.locator('[data-mcp-operation-status="failed"]:not([data-mcp-cursor-state])')).toHaveCSS("border-top-style", "dashed");
});

test("Canvas cursor respects reduced motion and both non-DOM fallbacks", async ({ context, page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await prepareAuthenticatedPage({ context, mode: "running", page, request });
  await page.goto(`/workspace/pitch/?presentation=${presentationId}`);
  const reducedCursor = page.locator('[data-mcp-cursor-state="running"]');
  await expect(reducedCursor).toBeVisible();
  await expect(reducedCursor).toHaveCSS("transition-duration", "0s");

  await resetFixture(request, "motion-doc");
  await page.reload();
  await expect(page.locator('[data-mcp-cursor-position-source="motion-doc"]')).toBeVisible();

  await resetFixture(request, "center");
  await page.reload();
  await expect(page.locator('[data-mcp-cursor-position-source="slide-center"]')).toBeVisible();
});

async function prepareAuthenticatedPage({
  context,
  mode,
  page,
  request
}: {
  context: BrowserContext;
  mode: ActivityMode;
  page: Page;
  request: APIRequestContext;
}) {
  await resetFixture(request, mode);
  await installSupabaseRealtimeFixture(page);
  await context.addCookies([{
    domain: "127.0.0.1",
    name: "sb-127-auth-token",
    path: "/",
    sameSite: "Lax",
    value: productSession.cookie
  }]);
}

async function resetFixture(request: APIRequestContext, mode: ActivityMode) {
  const response = await request.post(`${supabaseFixtureURL}/test/reset`, {
    data: {
      mcpOperationEvents: operationRows(mode),
      presentation: {
        createdAt: timestamp,
        id: presentationId,
        ownerId,
        source: presentationSource,
        sourceRevision: 5,
        title: "MCP visual test"
      },
      user
    }
  });
  expect(response.ok()).toBe(true);
}

async function cursorPositionError(
  cursor: Locator,
  target: Locator,
  layer: Locator
) {
  const [cursorPosition, targetBox, layerBox] = await Promise.all([
    cursor.evaluate((element) => ({
      x: Number.parseFloat((element as HTMLElement).style.left),
      y: Number.parseFloat((element as HTMLElement).style.top)
    })),
    target.boundingBox(),
    layer.boundingBox()
  ]);
  if (!targetBox || !layerBox) return Number.POSITIVE_INFINITY;
  const expectedX = ((targetBox.x - layerBox.x + targetBox.width / 2) / Math.max(layerBox.width, 1)) * 100;
  const expectedY = ((targetBox.y - layerBox.y + targetBox.height / 2) / Math.max(layerBox.height, 1)) * 100;
  return Math.max(
    Math.abs(cursorPosition.x - expectedX),
    Math.abs(cursorPosition.y - expectedY)
  );
}

function operationRows(mode: ActivityMode) {
  const now = new Date();
  const completedAt = new Date(now.getTime() - 500).toISOString();
  const createdAt = new Date(now.getTime() - 1_000).toISOString();
  const runningOperation = operationRow({
    completedAt: null,
    completedRevision: null,
    createdAt: now.toISOString(),
    id: "1d256aac-2138-4e55-8d95-eb879bc451dc",
    nodeId: "node.with[special]:cursor",
    status: "running"
  });
  const completedOperation = operationRow({
    completedAt,
    completedRevision: 5,
    createdAt,
    id: "3c9adb49-b004-4421-b506-e067e87f453c",
    nodeId: "node.with[special]:cursor",
    status: "completed"
  });

  const byMode: Record<ActivityMode, ReturnType<typeof operationRow>[]> = {
    center: [operationRow({
      completedAt: null,
      completedRevision: null,
      createdAt: now.toISOString(),
      id: "cb5a8baa-6f99-4982-a5cf-dfdbfdbba8e6",
      nodeId: "missing-node",
      status: "running"
    })],
    failure: [operationRow({
      completedAt: now.toISOString(),
      completedRevision: null,
      createdAt,
      errorCode: "operation_failed",
      id: "66a58268-d150-4a68-9d4e-0f80457e40dc",
      nodeId: "node.with[special]:cursor",
      status: "failed"
    })],
    mixed: [runningOperation, completedOperation],
    "motion-doc": [operationRow({
      completedAt: null,
      completedRevision: null,
      createdAt: now.toISOString(),
      id: "a163570c-1772-407a-88cb-128307e83c25",
      nodeId: "Text-legacy-0",
      status: "running"
    })],
    running: [runningOperation],
    success: [{
      ...completedOperation,
      completed_at: now.toISOString(),
      updated_at: now.toISOString()
    }]
  };
  return byMode[mode];
}

function operationRow({
  completedAt,
  completedRevision,
  createdAt,
  errorCode = null,
  id,
  nodeId,
  status
}: {
  completedAt: string | null;
  completedRevision: number | null;
  createdAt: string;
  errorCode?: string | null;
  id: string;
  nodeId: string;
  status: "completed" | "failed" | "running";
}) {
  return {
    client_id: "slx_client_codex",
    client_name: "Codex",
    completed_at: completedAt,
    completed_revision: completedRevision,
    created_at: createdAt,
    error_code: errorCode,
    expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    id,
    node_id: nodeId,
    presentation_id: presentationId,
    slide_index: 0,
    status,
    target_kind: "block",
    tool_name: "slidex_update_canvas_node",
    updated_at: completedAt ?? createdAt,
    user_id: ownerId
  };
}
