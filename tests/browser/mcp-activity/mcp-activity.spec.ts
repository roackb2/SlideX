import { expect, test, type Locator } from "@playwright/test";

const ownerId = "729c3ccc-09e6-47d8-a49f-66a8395c041c";
const presentationId = "3ffb8bd0-f055-415d-8ec5-29c7effdecd2";

test("purple MCP frames and Canvas cursor stay visual-only while editing remains interactive", async ({ context, page, request }) => {
  await request.post("http://127.0.0.1:54329/__test/activity-mode?value=mixed");
  await context.addCookies([{
    domain: "127.0.0.1",
    name: "sb-127-auth-token",
    path: "/",
    sameSite: "Lax",
    value: sessionCookieValue()
  }]);

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
  const [railBox, canvasBox] = await Promise.all([activityRail.boundingBox(), page.locator("#canvas-v4").boundingBox()]);
  expect(railBox).not.toBeNull();
  expect(canvasBox).not.toBeNull();
  expect(Math.abs((railBox!.x + railBox!.width / 2) - (canvasBox!.x + canvasBox!.width / 2))).toBeLessThan(2);
  expect(Math.abs((railBox!.y + railBox!.height / 2) - (canvasBox!.y + canvasBox!.height / 2))).toBeLessThan(2);

  const blockControl = page.locator('[data-frame-control][data-block-index="0"]');
  await blockControl.click({ position: { x: 20, y: 20 } });
  const beforeLeft = await blockControl.evaluate((element) => (element as HTMLElement).style.left);
  const moveHalo = blockControl.locator("span.cursor-move").first();
  const box = await moveHalo.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + 26, box!.y + box!.height / 2 + 8, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => blockControl.evaluate((element) => (element as HTMLElement).style.left))
    .not.toBe(beforeLeft);
  await page.keyboard.press("ArrowRight");
  await expect(runningFrame).toBeVisible();
  await page.locator("[data-canvas-next-slide]").click();
  await expect(page.locator("[data-mcp-cursor-layer] [data-mcp-cursor-state]")).toHaveCount(0);
});

test("Canvas cursor renders completed and failed terminal states", async ({ context, page, request }) => {
  await context.addCookies([{
    domain: "127.0.0.1",
    name: "sb-127-auth-token",
    path: "/",
    sameSite: "Lax",
    value: sessionCookieValue()
  }]);

  await request.post("http://127.0.0.1:54329/__test/activity-mode?value=success");
  await page.goto(`/workspace/pitch/?presentation=${presentationId}`);
  await expect(page.locator('[data-mcp-cursor-state="settled-success"]')).toBeVisible();

  await request.post("http://127.0.0.1:54329/__test/activity-mode?value=failure");
  await page.reload();
  const failedCursor = page.locator('[data-mcp-cursor-state="settled-failure"]');
  await expect(failedCursor).toBeVisible();
  await expect(failedCursor).toHaveAttribute("data-mcp-operation-status", "failed");
  await expect(page.locator('[data-mcp-operation-status="failed"]:not([data-mcp-cursor-state])')).toHaveCSS("border-top-style", "dashed");
});

test("Canvas cursor respects reduced motion and both non-DOM fallbacks", async ({ context, page, request }) => {
  await context.addCookies([{
    domain: "127.0.0.1",
    name: "sb-127-auth-token",
    path: "/",
    sameSite: "Lax",
    value: sessionCookieValue()
  }]);
  await page.emulateMedia({ reducedMotion: "reduce" });

  await request.post("http://127.0.0.1:54329/__test/activity-mode?value=running");
  await page.goto(`/workspace/pitch/?presentation=${presentationId}`);
  const reducedCursor = page.locator('[data-mcp-cursor-state="running"]');
  await expect(reducedCursor).toBeVisible();
  await expect(reducedCursor).toHaveCSS("transition-duration", "0s");

  await request.post("http://127.0.0.1:54329/__test/activity-mode?value=motion-doc");
  await page.reload();
  await expect(page.locator('[data-mcp-cursor-position-source="motion-doc"]')).toBeVisible();

  await request.post("http://127.0.0.1:54329/__test/activity-mode?value=center");
  await page.reload();
  await expect(page.locator('[data-mcp-cursor-position-source="slide-center"]')).toBeVisible();
});

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

function sessionCookieValue() {
  const now = Math.floor(Date.now() / 1000);
  const user = {
    id: ownerId,
    aud: "authenticated",
    role: "authenticated",
    email: "visual-test@example.com",
    phone: "",
    app_metadata: { provider: "google", providers: ["google"] },
    user_metadata: { full_name: "Visual Test" },
    identities: [],
    created_at: "2026-07-19T00:00:00.000Z",
    updated_at: "2026-07-19T00:00:00.000Z",
    is_anonymous: false
  };
  const accessToken = [
    base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    base64Url(JSON.stringify({
      aud: "authenticated",
      exp: now + 86_400,
      iat: now,
      iss: "http://127.0.0.1:54329/auth/v1",
      role: "authenticated",
      sub: ownerId
    })),
    "test-signature"
  ].join(".");
  const session = {
    access_token: accessToken,
    expires_at: now + 86_400,
    expires_in: 86_400,
    refresh_token: "test-refresh-token",
    token_type: "bearer",
    user
  };
  return `base64-${base64Url(JSON.stringify(session))}`;
}

function base64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}
