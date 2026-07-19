import { expect, test } from "@playwright/test";
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
  <Text id="block-target" x={10} y={15} w={45} h={20}>Remote target</Text>
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

test("purple MCP frames stay visual-only while selection and dragging remain interactive", async ({ context, page, request }) => {
  const resetResponse = await request.post(`${supabaseFixtureURL}/test/reset`, {
    data: {
      mcpOperationEvents: operationRows(),
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
  expect(resetResponse.ok()).toBe(true);
  await context.addCookies([{
    domain: "127.0.0.1",
    name: "sb-127-auth-token",
    path: "/",
    sameSite: "Lax",
    value: productSession.cookie
  }]);
  await installSupabaseRealtimeFixture(page);

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

function operationRows() {
  const now = new Date();
  const completedAt = new Date(now.getTime() - 500).toISOString();
  const createdAt = new Date(now.getTime() - 1_000).toISOString();
  return [
    operationRow({
      completedAt: null,
      completedRevision: null,
      createdAt: now.toISOString(),
      id: "1d256aac-2138-4e55-8d95-eb879bc451dc",
      status: "running"
    }),
    operationRow({
      completedAt,
      completedRevision: 5,
      createdAt,
      id: "3c9adb49-b004-4421-b506-e067e87f453c",
      status: "completed"
    })
  ];
}

function operationRow({
  completedAt,
  completedRevision,
  createdAt,
  id,
  status
}: {
  completedAt: string | null;
  completedRevision: number | null;
  createdAt: string;
  id: string;
  status: "completed" | "running";
}) {
  return {
    client_id: "slx_client_codex",
    client_name: "Codex",
    completed_at: completedAt,
    completed_revision: completedRevision,
    created_at: createdAt,
    error_code: null,
    expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    id,
    node_id: "block-target",
    presentation_id: presentationId,
    slide_index: 0,
    status,
    target_kind: "block",
    tool_name: "slidex_update_canvas_node",
    updated_at: completedAt ?? createdAt,
    user_id: ownerId
  };
}
