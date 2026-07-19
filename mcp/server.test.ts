import assert from "node:assert/strict";
import test from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { createSlideXMcpServer } from "@/mcp/server";
import type {
  McpPresentationImageUploadStore,
  PreparedMcpPresentationImageUpload
} from "@/mcp/presentationImageUploadStore";
import type {
  CompleteMcpOperationInput,
  FailMcpOperationInput,
  McpOperationActivityStore,
  StartMcpOperationInput
} from "@/mcp/operationActivity";
import type { McpPresentationStore } from "@/mcp/presentationStore";

const presentationId = "89e45398-5fd4-4b7b-b9cf-0954dd2ac364";
const source = `# MCP contract

<Slide duration={5} theme="dark" background="#000000">
  <Text x={10} y={10} w={80} h={20}>Hello</Text>
</Slide>`;

test("local MCP exposes the bounded block, shader, schema, and PPTX tools", async () => {
  const connection = await connectMcp({ enableWorkspaceSkills: false });

  try {
    assert.equal(connection.client.getServerVersion()?.version, "0.6.0");
    const tools = await connection.client.listTools();
    const names = tools.tools.map((tool) => tool.name);

    for (const required of [
      "slidex_update_block",
      "slidex_delete_block",
      "slidex_duplicate_block",
      "slidex_reorder_block",
      "slidex_get_motion_doc_schema",
      "slidex_list_shaders",
      "slidex_get_shader",
      "slidex_apply_shader_preset",
      "slidex_export_pptx"
    ]) {
      assert.ok(names.includes(required), `${required} must be registered`);
    }

    const result = await connection.client.callTool({
      name: "slidex_list_block_types",
      arguments: {}
    });
    assert.equal(result.isError, undefined);
    assert.deepEqual(result.structuredContent, {
      result: {
        blockTypes: ["Text", "Image", "Video", "Icon", "Table", "ShapeRectangle"]
      }
    });
  } finally {
    await connection.close();
  }
});

test("remote MCP keeps reads available but gates saves and local PPTX export", async () => {
  const store = createPresentationStore();
  const readOnly = await connectMcp({
    enablePresentationWrites: false,
    profile: "remote",
    presentationStore: store
  });

  try {
    const readOnlyTools = (await readOnly.client.listTools()).tools;
    const names = readOnlyTools.map((tool) => tool.name);
    assert.ok(names.includes("slidex_list_presentations"));
    assert.ok(names.includes("slidex_get_presentation"));
    assert.ok(names.includes("slidex_get_canvas_nodes"));
    assert.ok(!names.includes("slidex_save_presentation"));
    assert.ok(!names.includes("slidex_export_pptx"));
    assert.ok(!names.includes("slidex_create_deck"));
    assert.ok(!names.includes("slidex_export_html"));
    assert.ok(!names.includes("slidex_prepare_presentation_image_upload"));
    assert.ok(!names.includes("slidex_finalize_presentation_image_upload"));

    for (const tool of readOnlyTools.filter((tool) => tool.name !== "slidex_list_presentations")) {
      assert.ok(tool.inputSchema.properties?.presentationId, `${tool.name} accepts presentationId`);
      assert.ok(!tool.inputSchema.required?.includes("presentationId"));
    }

    const result = await readOnly.client.callTool({
      name: "slidex_get_presentation",
      arguments: {}
    });
    assert.equal(result.isError, undefined);
    assert.equal(
      (result.structuredContent as {
        result: { autoSelected: boolean; presentation: { sourceRevision: number } };
      }).result.presentation.sourceRevision,
      4
    );
    assert.equal(
      "source" in (result.structuredContent as {
        result: { presentation: Record<string, unknown> };
      }).result.presentation,
      false
    );
    assert.equal(
      (result.structuredContent as { result: { autoSelected: boolean } }).result.autoSelected,
      true
    );

    const canvasResult = await readOnly.client.callTool({
      name: "slidex_get_canvas_nodes",
      arguments: { slideIndex: 0 }
    });
    assert.equal(canvasResult.isError, undefined);
    assert.equal(
      (canvasResult.structuredContent as {
        result: { presentation: { id: string }; result: { slides: Array<{ nodes: unknown[] }> } };
      }).result.result.slides[0]?.nodes.length,
      1
    );
  } finally {
    await readOnly.close();
  }

  const operationActivity = createOperationActivityStore();
  const writable = await connectMcp({
    enablePresentationWrites: true,
    operationActivity,
    profile: "remote",
    presentationStore: store
  });

  try {
    const writableTools = (await writable.client.listTools()).tools;
    const names = writableTools.map((tool) => tool.name);
    assert.ok(names.includes("slidex_get_presentation"));
    assert.ok(names.includes("slidex_save_presentation"));
    assert.ok(names.includes("slidex_update_canvas_node"));
    assert.ok(!names.includes("slidex_prepare_presentation_image_upload"));

    const writeToolNames = [
      "slidex_save_presentation",
      "slidex_add_block",
      "slidex_update_block",
      "slidex_update_canvas_node",
      "slidex_delete_block",
      "slidex_duplicate_block",
      "slidex_reorder_block",
      "slidex_apply_shader_preset",
      "slidex_add_slide_from_layout",
      "slidex_replace_slide_with_layout"
    ];
    for (const name of writeToolNames) {
      const tool = writableTools.find((candidate) => candidate.name === name);
      assert.ok(tool?.inputSchema.required?.includes("presentationId"));
      assert.ok(tool?.inputSchema.required?.includes("expectedRevision"));
    }

    const result = await writable.client.callTool({
      name: "slidex_save_presentation",
      arguments: { expectedRevision: 4, presentationId, source }
    });
    assert.equal(result.isError, undefined);
    assert.equal(
      (result.structuredContent as {
        result: { presentation: { sourceRevision: number } };
      }).result.presentation.sourceRevision,
      5
    );
    assert.equal(
      (result.structuredContent as {
        result: { presentation: { lastOpenedAt: string } };
      }).result.presentation.lastOpenedAt,
      "2026-07-16T00:00:02.000Z"
    );
    assert.equal(
      "source" in (result.structuredContent as {
        result: { presentation: Record<string, unknown> };
      }).result.presentation,
      false
    );

    const canvasUpdateResult = await writable.client.callTool({
      name: "slidex_update_canvas_node",
      arguments: {
        expectedRevision: 4,
        frame: { x: 11.125, y: 12.25 },
        nodeId: "Text-legacy-0",
        presentationId,
        slideIndex: 0
      }
    });
    assert.equal(canvasUpdateResult.isError, undefined);
    assert.deepEqual(
      (canvasUpdateResult.structuredContent as {
        result: { node: { framePercent: { x: number; y: number } } };
      }).result.node.framePercent,
      { h: 20, w: 80, x: 11.125, y: 12.25 }
    );

    const shaderResult = await writable.client.callTool({
      name: "slidex_apply_shader_preset",
      arguments: {
        expectedRevision: 4,
        presentationId,
        shaderId: "mesh-gradient",
        slideIndex: 0
      }
    });
    assert.equal(shaderResult.isError, undefined);
    assert.equal(
      "source" in (shaderResult.structuredContent as {
        result: { presentation: Record<string, unknown> };
      }).result.presentation,
      false
    );

    assert.deepEqual(
      operationActivity.started.map(({ target, toolName }) => ({ target, toolName })),
      [
        { target: { kind: "presentation" }, toolName: "slidex_save_presentation" },
        { target: { kind: "block", nodeId: "Text-legacy-0", slideIndex: 0 }, toolName: "slidex_update_canvas_node" },
        { target: { kind: "slide", slideIndex: 0 }, toolName: "slidex_apply_shader_preset" }
      ]
    );
    assert.deepEqual(
      operationActivity.completed.map(({ completedRevision, target }) => ({ completedRevision, target })),
      [
        { completedRevision: 5, target: { kind: "presentation" } },
        { completedRevision: 5, target: { kind: "block", nodeId: "Text-legacy-0", slideIndex: 0 } },
        { completedRevision: 5, target: { kind: "slide", slideIndex: 0 } }
      ]
    );
  } finally {
    await writable.close();
  }
});

test("remote presentation reads keep large sources opt-in and out of structured content", async () => {
  const largePayload = "x".repeat(2 * 1024 * 1024 - 1024);
  const largeSource = `# Large presentation\n\n${largePayload}`;
  let fullReads = 0;
  let summaryReads = 0;
  const store: McpPresentationStore = {
    async getPresentation(id) {
      fullReads += 1;
      return {
        id: id ?? presentationId,
        lastOpenedAt: "2026-07-16T00:00:02.000Z",
        source: largeSource,
        sourceRevision: 12,
        title: "Large presentation",
        updatedAt: "2026-07-16T00:00:00.000Z"
      };
    },
    async getPresentationSummary(id) {
      summaryReads += 1;
      return {
        id: id ?? presentationId,
        lastOpenedAt: "2026-07-16T00:00:02.000Z",
        sourceRevision: 12,
        title: "Large presentation",
        updatedAt: "2026-07-16T00:00:00.000Z"
      };
    },
    async listPresentations() {
      return [];
    },
    async savePresentation() {
      throw new Error("Not used by read tests.");
    }
  };
  const connection = await connectMcp({
    enablePresentationWrites: false,
    profile: "remote",
    presentationStore: store
  });

  try {
    const summaryResult = await connection.client.callTool({
      arguments: {},
      name: "slidex_get_presentation"
    });
    const summaryText = (summaryResult.content as ToolContent[]).find(isToolTextContent);
    assert.ok(summaryText && summaryText.type === "text");
    assert.ok(Buffer.byteLength(JSON.stringify(summaryResult), "utf8") < 10_000);
    assert.equal(summaryText.text.includes(largePayload), false);
    assert.equal(fullReads, 0);
    assert.equal(summaryReads, 1);

    const fullResult = await connection.client.callTool({
      arguments: { includeSource: true },
      name: "slidex_get_presentation"
    });
    const fullText = (fullResult.content as ToolContent[]).find(isToolTextContent);
    assert.ok(fullText && fullText.type === "text");
    assert.equal(
      (JSON.parse(fullText.text) as { presentation: { source: string } }).presentation.source,
      largeSource
    );
    assert.equal(
      "source" in (fullResult.structuredContent as {
        result: { presentation: Record<string, unknown> };
      }).result.presentation,
      false
    );
    assert.equal(JSON.stringify(fullResult).split(largePayload).length - 1, 1);
    assert.equal(fullReads, 1);
    assert.equal(summaryReads, 1);
  } finally {
    await connection.close();
  }
});

type ToolContent = { type: string; text?: string };

function isToolTextContent(item: ToolContent): item is { type: "text"; text: string } {
  return item.type === "text" && typeof item.text === "string";
}

test("remote catalog reads use presentation summaries without loading source", async () => {
  let fullReads = 0;
  let summaryReads = 0;
  const store: McpPresentationStore = {
    ...createPresentationStore(),
    async getPresentation() {
      fullReads += 1;
      throw new Error("Catalog tools must not load presentation source.");
    },
    async getPresentationSummary(id) {
      summaryReads += 1;
      return {
        id: id ?? presentationId,
        lastOpenedAt: "2026-07-16T00:00:02.000Z",
        sourceRevision: 4,
        title: "MCP contract",
        updatedAt: "2026-07-16T00:00:00.000Z"
      };
    }
  };
  const connection = await connectMcp({
    enablePresentationWrites: false,
    profile: "remote",
    presentationStore: store
  });

  try {
    const calls = [
      { arguments: {}, name: "slidex_list_block_types" },
      { arguments: {}, name: "slidex_get_motion_doc_schema" },
      { arguments: {}, name: "slidex_list_shaders" },
      { arguments: { shaderId: "mesh-gradient" }, name: "slidex_get_shader" },
      { arguments: {}, name: "slidex_list_slide_layouts" },
      { arguments: { layoutId: "title" }, name: "slidex_get_slide_layout" }
    ];

    for (const call of calls) {
      const result = await connection.client.callTool(call);
      assert.equal(result.isError, undefined, `${call.name} succeeds from summary metadata`);
    }
    assert.equal(fullReads, 0);
    assert.equal(summaryReads, calls.length);
  } finally {
    await connection.close();
  }
});

test("remote MCP exposes private image tools only when the asset scope is configured", async () => {
  const imageStore = createImageUploadStore();
  const operationActivity = createOperationActivityStore();
  const connection = await connectMcp({
    enablePresentationWrites: false,
    imageUploads: {
      origin: "https://slidex.example",
      store: imageStore,
      userId: "893301ee-2be1-4c01-8827-c13788233c24"
    },
    operationActivity,
    profile: "remote",
    presentationStore: createPresentationStore()
  });

  try {
    const tools = (await connection.client.listTools()).tools;
    const names = tools.map((tool) => tool.name);
    assert.ok(names.includes("slidex_prepare_presentation_image_upload"));
    assert.ok(names.includes("slidex_finalize_presentation_image_upload"));
    assert.ok(!names.includes("slidex_save_presentation"));

    const prepared = await connection.client.callTool({
      arguments: {
        byteLength: 1234,
        contentType: "image/png",
        presentationId
      },
      name: "slidex_prepare_presentation_image_upload"
    });
    assert.equal(prepared.isError, undefined);
    assert.equal(
      (prepared.structuredContent as { result: PreparedMcpPresentationImageUpload })
        .result.status,
      "prepared"
    );

    const finalized = await connection.client.callTool({
      arguments: {
        presentationId,
        uploadId: "f0448734-e07c-4c85-a20a-7f059709fe65"
      },
      name: "slidex_finalize_presentation_image_upload"
    });
    assert.equal(finalized.isError, undefined);
    assert.match(
      (finalized.structuredContent as { result: { src: string } }).result.src,
      /^\/api\/presentation-images\//
    );
    assert.deepEqual(
      operationActivity.started.map(({ target, toolName }) => ({ target, toolName })),
      [
        { target: { kind: "presentation" }, toolName: "slidex_prepare_presentation_image_upload" },
        { target: { kind: "presentation" }, toolName: "slidex_finalize_presentation_image_upload" }
      ]
    );
    assert.equal(operationActivity.completed.every((item) => item.completedRevision === undefined), true);
  } finally {
    await connection.close();
  }
});

test("remote writes map every mutation to a safe visual target and sanitize conflicts", async () => {
  const operationActivity = createOperationActivityStore();
  const connection = await connectMcp({
    enablePresentationWrites: true,
    operationActivity,
    profile: "remote",
    presentationStore: createPresentationStore()
  });

  try {
    const calls = [
      {
        arguments: { expectedRevision: 4, presentationId, slideIndex: 0, type: "ShapeRectangle" },
        name: "slidex_add_block"
      },
      {
        arguments: { blockIndex: 0, expectedRevision: 4, presentationId, slideIndex: 0, text: "Updated" },
        name: "slidex_update_block"
      },
      {
        arguments: { blockIndex: 0, expectedRevision: 4, presentationId, slideIndex: 0 },
        name: "slidex_delete_block"
      },
      {
        arguments: { blockIndex: 0, expectedRevision: 4, offset: 2, presentationId, slideIndex: 0 },
        name: "slidex_duplicate_block"
      },
      {
        arguments: { expectedRevision: 4, fromIndex: 0, presentationId, slideIndex: 0, toIndex: 0 },
        name: "slidex_reorder_block"
      },
      {
        arguments: { expectedRevision: 4, layoutId: "title", presentationId },
        name: "slidex_add_slide_from_layout"
      },
      {
        arguments: { expectedRevision: 4, layoutId: "title", presentationId, slideIndex: 0 },
        name: "slidex_replace_slide_with_layout"
      }
    ];

    for (const call of calls) {
      const result = await connection.client.callTool(call);
      assert.equal(result.isError, undefined, `${call.name} succeeds`);
    }

    assert.deepEqual(
      operationActivity.started.map(({ target, toolName }) => ({ kind: target.kind, toolName })),
      [
        { kind: "slide", toolName: "slidex_add_block" },
        { kind: "block", toolName: "slidex_update_block" },
        { kind: "block", toolName: "slidex_delete_block" },
        { kind: "block", toolName: "slidex_duplicate_block" },
        { kind: "block", toolName: "slidex_reorder_block" },
        { kind: "presentation", toolName: "slidex_add_slide_from_layout" },
        { kind: "slide", toolName: "slidex_replace_slide_with_layout" }
      ]
    );
    assert.deepEqual(
      operationActivity.completed.map(({ target }) => target?.kind),
      ["block", "block", "slide", "block", "block", "slide", "slide"]
    );

    const conflict = await connection.client.callTool({
      arguments: { expectedRevision: 3, presentationId, source },
      name: "slidex_save_presentation"
    });
    assert.equal(conflict.isError, true);
    assert.equal(operationActivity.failed.at(-1)?.errorCode, "revision_conflict");
    assert.ok(!JSON.stringify(operationActivity.failed).includes("Current revision"));
  } finally {
    await connection.close();
  }
});

test("activity recording failures never fail an authorized revision-safe write", async () => {
  const unavailableActivity: McpOperationActivityStore = {
    async completeOperation() {
      throw new Error("activity database unavailable");
    },
    async failOperation() {
      throw new Error("activity database unavailable");
    },
    async startOperation() {
      throw new Error("activity database unavailable");
    }
  };
  const connection = await connectMcp({
    enablePresentationWrites: true,
    operationActivity: unavailableActivity,
    profile: "remote",
    presentationStore: createPresentationStore()
  });

  try {
    const result = await connection.client.callTool({
      arguments: { expectedRevision: 4, presentationId, source },
      name: "slidex_save_presentation"
    });
    assert.equal(result.isError, undefined);
    assert.equal(
      (result.structuredContent as { result: { presentation: { sourceRevision: number } } })
        .result.presentation.sourceRevision,
      5
    );
  } finally {
    await connection.close();
  }
});

function createPresentationStore(): McpPresentationStore {
  return {
    async getPresentation(id) {
      return {
        id: id ?? presentationId,
        lastOpenedAt: "2026-07-16T00:00:02.000Z",
        source,
        sourceRevision: 4,
        title: "MCP contract",
        updatedAt: "2026-07-16T00:00:00.000Z"
      };
    },
    async getPresentationSummary(id) {
      return {
        id: id ?? presentationId,
        lastOpenedAt: "2026-07-16T00:00:02.000Z",
        sourceRevision: 4,
        title: "MCP contract",
        updatedAt: "2026-07-16T00:00:00.000Z"
      };
    },
    async listPresentations() {
      return [{
        id: presentationId,
        lastOpenedAt: "2026-07-16T00:00:02.000Z",
        sourceRevision: 4,
        title: "MCP contract",
        updatedAt: "2026-07-16T00:00:00.000Z"
      }];
    },
    async savePresentation(input) {
      assert.equal(input.presentationId, presentationId);
      assert.equal(input.expectedRevision, 4);
      return {
        id: input.presentationId,
        sourceRevision: 5,
        title: "MCP contract",
        updatedAt: "2026-07-16T00:00:01.000Z"
      };
    }
  };
}

function createOperationActivityStore(): McpOperationActivityStore & {
  completed: CompleteMcpOperationInput[];
  failed: FailMcpOperationInput[];
  started: StartMcpOperationInput[];
} {
  const completed: CompleteMcpOperationInput[] = [];
  const failed: FailMcpOperationInput[] = [];
  const started: StartMcpOperationInput[] = [];
  return {
    completed,
    failed,
    started,
    async completeOperation(input) {
      completed.push(input);
    },
    async failOperation(input) {
      failed.push(input);
    },
    async startOperation(input) {
      started.push(input);
      return `operation-${started.length}`;
    }
  };
}

function createImageUploadStore(): McpPresentationImageUploadStore {
  return {
    async claimUpload() {
      throw new Error("Not used by MCP tools.");
    },
    async completeUpload() {
      throw new Error("Not used by MCP tools.");
    },
    async finalizeUpload(input) {
      return {
        id: input.uploadId,
        mimeType: "image/webp",
        path: `${input.userId}/${input.presentationId}/${input.uploadId}.webp`,
        size: 987,
        src: `/api/presentation-images/${input.userId}/${input.presentationId}/${input.uploadId}.webp`
      };
    },
    async prepareUpload(input) {
      return {
        expiresAt: "2026-07-17T03:10:00.000Z",
        request: {
          headers: {
            Authorization: "Upload test-token",
            "Content-Type": input.contentType
          },
          method: "PUT",
          url: `${input.origin}/api/mcp/presentation-image-uploads/f0448734-e07c-4c85-a20a-7f059709fe65/`
        },
        status: "prepared",
        tokensRemaining: 19,
        uploadId: "f0448734-e07c-4c85-a20a-7f059709fe65"
      };
    },
    async rejectUpload() {
      throw new Error("Not used by MCP tools.");
    },
    async removeStoredImage() {
      throw new Error("Not used by MCP tools.");
    },
    async storeImage() {
      throw new Error("Not used by MCP tools.");
    }
  };
}

async function connectMcp(options: Parameters<typeof createSlideXMcpServer>[0]) {
  const server = createSlideXMcpServer(options);
  const client = new Client({ name: "slidex-contract-test", version: "0.5.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return {
    client,
    async close() {
      await client.close();
      await server.close();
    }
  };
}
