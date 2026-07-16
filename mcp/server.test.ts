import assert from "node:assert/strict";
import test from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { createSlideXMcpServer } from "@/mcp/server";
import type { McpPresentationStore } from "@/mcp/presentationStore";

const presentationId = "89e45398-5fd4-4b7b-b9cf-0954dd2ac364";
const source = `# MCP contract

<Slide duration={5} theme="dark" background="#000000">
  <Text x={10} y={10} w={80} h={20}>Hello</Text>
</Slide>`;

test("local MCP v0.2 exposes the bounded block, shader, schema, and PPTX tools", async () => {
  const connection = await connectMcp({ enableWorkspaceSkills: false });

  try {
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
    const names = (await readOnly.client.listTools()).tools.map((tool) => tool.name);
    assert.ok(names.includes("slidex_get_presentation"));
    assert.ok(!names.includes("slidex_save_presentation"));
    assert.ok(!names.includes("slidex_export_pptx"));
    assert.ok(!names.includes("slidex_create_deck"));
    assert.ok(!names.includes("slidex_export_html"));

    for (const tool of (await readOnly.client.listTools()).tools) {
      assert.ok(tool.inputSchema.properties?.presentationId, `${tool.name} requires presentationId`);
      assert.ok(tool.inputSchema.required?.includes("presentationId"));
    }

    const result = await readOnly.client.callTool({
      name: "slidex_get_presentation",
      arguments: { presentationId }
    });
    assert.equal(result.isError, undefined);
    assert.equal(
      (result.structuredContent as { result: { sourceRevision: number } }).result.sourceRevision,
      4
    );
  } finally {
    await readOnly.close();
  }

  const writable = await connectMcp({
    enablePresentationWrites: true,
    profile: "remote",
    presentationStore: store
  });

  try {
    const writableTools = (await writable.client.listTools()).tools;
    const names = writableTools.map((tool) => tool.name);
    assert.ok(names.includes("slidex_get_presentation"));
    assert.ok(names.includes("slidex_save_presentation"));

    for (const tool of writableTools) {
      assert.ok(tool.inputSchema.properties?.presentationId, `${tool.name} requires presentationId`);
      assert.ok(tool.inputSchema.required?.includes("presentationId"));
    }
    for (const name of [
      "slidex_save_presentation",
      "slidex_add_block",
      "slidex_update_block",
      "slidex_delete_block",
      "slidex_duplicate_block",
      "slidex_reorder_block",
      "slidex_apply_shader_preset",
      "slidex_add_slide_from_layout",
      "slidex_replace_slide_with_layout"
    ]) {
      const tool = writableTools.find((candidate) => candidate.name === name);
      assert.ok(tool?.inputSchema.required?.includes("expectedRevision"));
    }

    const result = await writable.client.callTool({
      name: "slidex_save_presentation",
      arguments: { expectedRevision: 4, presentationId, source }
    });
    assert.equal(result.isError, undefined);
    assert.equal(
      (result.structuredContent as { result: { sourceRevision: number } }).result.sourceRevision,
      5
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
    assert.match(
      (shaderResult.structuredContent as { result: { presentation: { source: string } } })
        .result.presentation.source,
      /shader="mesh-gradient"/
    );
  } finally {
    await writable.close();
  }
});

function createPresentationStore(): McpPresentationStore {
  return {
    async getPresentation(id) {
      return {
        id,
        source,
        sourceRevision: 4,
        title: "MCP contract",
        updatedAt: "2026-07-16T00:00:00.000Z"
      };
    },
    async savePresentation(input) {
      assert.equal(input.presentationId, presentationId);
      assert.equal(input.expectedRevision, 4);
      return {
        id: input.presentationId,
        source: input.source,
        sourceRevision: 5,
        title: "MCP contract",
        updatedAt: "2026-07-16T00:00:01.000Z"
      };
    }
  };
}

async function connectMcp(options: Parameters<typeof createSlideXMcpServer>[0]) {
  const server = createSlideXMcpServer(options);
  const client = new Client({ name: "slidex-contract-test", version: "0.2.0" });
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
