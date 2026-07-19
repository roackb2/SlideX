import http from "node:http";

const portFlagIndex = process.argv.indexOf("--port");
const port = Number(process.argv[portFlagIndex + 1] ?? 54329);
const ownerId = "729c3ccc-09e6-47d8-a49f-66a8395c041c";
const presentationId = "3ffb8bd0-f055-415d-8ec5-29c7effdecd2";
let sourceRevision = 5;
let activityMode = "mixed";
let source = `# MCP visual test

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
  created_at: "2026-07-19T00:00:00.000Z",
  updated_at: "2026-07-19T00:00:00.000Z",
  is_anonymous: false
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  cors(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204).end();
    return;
  }
  if (url.pathname === "/health") {
    json(response, { ok: true });
    return;
  }
  if (url.pathname === "/__test/activity-mode" && request.method === "POST") {
    const nextMode = url.searchParams.get("value");
    activityMode = ["mixed", "running", "success", "failure", "motion-doc", "center"].includes(nextMode ?? "")
      ? nextMode
      : "mixed";
    json(response, { ok: true });
    return;
  }
  if (url.pathname === "/auth/v1/user") {
    json(response, user);
    return;
  }
  if (url.pathname === "/rest/v1/rpc/touch_presentation_opened") {
    json(response, null);
    return;
  }
  if (url.pathname === "/rest/v1/rpc/compare_and_swap_presentation_document") {
    const body = await readJson(request);
    if (typeof body.next_source === "string") source = body.next_source;
    sourceRevision += 1;
    json(response, [{
      editor_template_id: null,
      presentation_id: presentationId,
      source_revision: sourceRevision,
      updated_at: new Date().toISOString()
    }]);
    return;
  }
  if (url.pathname === "/rest/v1/presentations") {
    json(response, {
      created_at: "2026-07-19T00:00:00.000Z",
      editor_template_id: null,
      id: presentationId,
      kind: "presentation",
      last_opened_at: new Date().toISOString(),
      source,
      source_revision: sourceRevision,
      template_id: null,
      title: "MCP visual test",
      updated_at: new Date().toISOString(),
      user_id: ownerId
    });
    return;
  }
  if (url.pathname === "/rest/v1/mcp_operation_events") {
    const now = new Date();
    const completedAt = new Date(now.getTime() - 500).toISOString();
    const createdAt = new Date(now.getTime() - 1_000).toISOString();
    const runningOperation = operationRow({
      completedAt: null,
      completedRevision: null,
      createdAt: now.toISOString(),
      id: "1d256aac-2138-4e55-8d95-eb879bc451dc",
      status: "running"
    });
    const completedOperation = operationRow({
      completedAt,
      completedRevision: 5,
      createdAt,
      id: "3c9adb49-b004-4421-b506-e067e87f453c",
      status: "completed"
    });
    const failedOperation = operationRow({
      completedAt: now.toISOString(),
      completedRevision: null,
      createdAt,
      errorCode: "operation_failed",
      id: "66a58268-d150-4a68-9d4e-0f80457e40dc",
      status: "failed"
    });
    const motionDocFallbackOperation = operationRow({
      completedAt: null,
      completedRevision: null,
      createdAt: now.toISOString(),
      id: "a163570c-1772-407a-88cb-128307e83c25",
      nodeId: "Text-legacy-0",
      status: "running"
    });
    const centerFallbackOperation = operationRow({
      completedAt: null,
      completedRevision: null,
      createdAt: now.toISOString(),
      id: "cb5a8baa-6f99-4982-a5cf-dfdbfdbba8e6",
      nodeId: "missing-node",
      status: "running"
    });
    const activities = activityMode === "running"
      ? [runningOperation]
      : activityMode === "success"
        ? [{ ...completedOperation, completed_at: now.toISOString(), updated_at: now.toISOString() }]
        : activityMode === "failure"
          ? [failedOperation]
          : activityMode === "motion-doc"
            ? [motionDocFallbackOperation]
            : activityMode === "center"
              ? [centerFallbackOperation]
          : [
              runningOperation,
              completedOperation
            ];
    json(response, activities);
    return;
  }

  json(response, { message: "Not found" }, 404);
});

server.listen(port, "127.0.0.1");

function operationRow({ completedAt, completedRevision, createdAt, errorCode = null, id, nodeId = "node.with[special]:cursor", status }) {
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

function cors(response) {
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "accept-profile, authorization, apikey, content-profile, content-type, prefer, range, x-client-info, x-retry-count");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3102");
  response.setHeader("Access-Control-Expose-Headers", "content-range");
}

function json(response, body, status = 200) {
  response.setHeader("Content-Type", "application/json");
  response.writeHead(status);
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}
