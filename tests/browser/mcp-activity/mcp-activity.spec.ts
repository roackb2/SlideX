import { expect, test } from "@playwright/test";

const ownerId = "729c3ccc-09e6-47d8-a49f-66a8395c041c";
const presentationId = "3ffb8bd0-f055-415d-8ec5-29c7effdecd2";

test("purple MCP frames stay visual-only while selection and dragging remain interactive", async ({ context, page }) => {
  await context.addCookies([{
    domain: "127.0.0.1",
    name: "sb-127-auth-token",
    path: "/",
    sameSite: "Lax",
    value: sessionCookieValue()
  }]);

  await page.goto(`/workspace/pitch/?presentation=${presentationId}`);

  const runningFrame = page.locator('[data-mcp-node-id="block-target"][data-mcp-operation-status="running"]');
  await expect(runningFrame).toBeVisible();
  await expect(runningFrame).toContainText("AI · Codex");
  await expect(runningFrame).toHaveCSS("border-top-color", "rgb(139, 92, 246)");
  await expect(runningFrame).toHaveCSS("border-top-style", "solid");
  expect(await runningFrame.evaluate((element) => getComputedStyle(element.parentElement!).pointerEvents)).toBe("none");

  const completedFrame = page.locator('[data-mcp-node-id="block-target"][data-mcp-operation-status="completed"]');
  await expect(completedFrame).toBeVisible();
  await expect(completedFrame).toHaveAttribute("data-mcp-completed-revision", "5");

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
});

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
