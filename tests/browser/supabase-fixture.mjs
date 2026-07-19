import http from "node:http";

const port = numericArgument("--port", 54328);
const appOrigin = stringArgument("--app-origin", "http://127.0.0.1:3100");
const presentations = new Map();
let mcpOperationEvents = [];
let user;

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  addCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204).end();
    return;
  }
  if (url.pathname === "/health") {
    json(response, { ok: true });
    return;
  }
  if (request.method === "POST" && url.pathname === "/test/reset") {
    const input = await readJson(request);
    user = input.user;
    mcpOperationEvents = Array.isArray(input.mcpOperationEvents)
      ? input.mcpOperationEvents
      : [];
    presentations.clear();
    if (!upsertPresentation(input.presentation)) {
      json(response, { message: "A test presentation requires id, ownerId, and source" }, 400);
      return;
    }
    json(response, { ok: true });
    return;
  }
  if (request.method === "POST" && url.pathname === "/test/presentations") {
    if (!upsertPresentation(await readJson(request))) {
      json(response, { message: "A test presentation requires id, ownerId, and source" }, 400);
      return;
    }
    json(response, { ok: true });
    return;
  }
  if (url.pathname === "/auth/v1/user") {
    json(response, user ?? { message: "Test user is not initialized" }, user ? 200 : 401);
    return;
  }
  if (url.pathname === "/rest/v1/rpc/touch_presentation_opened") {
    const input = await readJson(request);
    const presentation = presentations.get(input.target_presentation_id);
    if (presentation) {
      presentation.last_opened_at = new Date().toISOString();
    }
    json(response, null);
    return;
  }
  if (url.pathname === "/rest/v1/rpc/compare_and_swap_presentation_document") {
    const input = await readJson(request);
    const presentation = presentations.get(input.target_presentation_id);
    if (!presentation) {
      json(response, { code: "PGRST116", message: "Presentation not found" }, 404);
      return;
    }
    if (presentation.source_revision !== input.expected_source_revision) {
      json(response, { code: "40001", message: "Presentation revision conflict" }, 409);
      return;
    }
    const updatedAt = new Date().toISOString();
    Object.assign(presentation, {
      editor_template_id: input.next_editor_template_id ?? null,
      source: input.next_source,
      source_revision: presentation.source_revision + 1,
      title: input.next_title,
      updated_at: updatedAt
    });
    json(response, [{
      editor_template_id: presentation.editor_template_id,
      presentation_id: presentation.id,
      source_revision: presentation.source_revision,
      updated_at: updatedAt
    }]);
    return;
  }
  if (request.method === "GET" && url.pathname === "/rest/v1/presentations") {
    const presentationId = url.searchParams.get("id")?.replace(/^eq\./, "");
    json(response, presentationId ? presentations.get(presentationId) ?? null : null);
    return;
  }
  if (url.pathname === "/rest/v1/mcp_operation_events") {
    json(response, mcpOperationEvents);
    return;
  }
  if (url.pathname === "/rest/v1/slide_comments") {
    json(response, []);
    return;
  }

  json(response, { message: "Not found" }, 404);
});

server.listen(port, "127.0.0.1");

function upsertPresentation(input) {
  if (!input?.id || !input.ownerId || typeof input.source !== "string") {
    return false;
  }
  const existing = presentations.get(input.id);
  const now = input.updatedAt ?? input.createdAt ?? new Date().toISOString();
  presentations.set(input.id, {
    created_at: input.createdAt ?? existing?.created_at ?? now,
    editor_template_id: input.editorTemplateId ?? existing?.editor_template_id ?? null,
    id: input.id,
    kind: "presentation",
    last_opened_at: input.lastOpenedAt ?? existing?.last_opened_at ?? now,
    source: input.source,
    source_revision: input.sourceRevision ?? existing?.source_revision ?? 0,
    template_id: input.templateId ?? existing?.template_id ?? null,
    title: input.title ?? existing?.title ?? "Untitled",
    updated_at: now,
    user_id: input.ownerId
  });
  return true;
}

function addCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "accept-profile, authorization, apikey, content-profile, content-type, prefer, range, x-client-info, x-retry-count"
  );
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Origin", appOrigin);
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

function numericArgument(name, fallback) {
  return Number(stringArgument(name, String(fallback)));
}

function stringArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1] ?? fallback;
}
