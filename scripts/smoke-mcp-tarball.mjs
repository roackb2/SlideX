import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const rootDir = path.resolve(import.meta.dirname, "..");
const packageDir = path.join(rootDir, "packages/slidex-mcp-server");
const scratchDir = await mkdtemp(path.join(os.tmpdir(), "slidex-mcp-tarball-"));

try {
  const tarballName = execFileSync(
    "npm",
    ["pack", packageDir, "--pack-destination", scratchDir, "--silent"],
    { cwd: rootDir, encoding: "utf8" }
  ).trim().split(/\r?\n/).at(-1);

  if (!tarballName) throw new Error("npm pack did not produce a tarball.");

  const tarballPath = path.join(scratchDir, tarballName);
  const installDir = path.join(scratchDir, "install");
  execFileSync("npm", ["install", "--prefix", installDir, tarballPath], {
    cwd: rootDir,
    stdio: "inherit"
  });

  const serverPath = path.join(
    installDir,
    "node_modules/@z7589xxz758/slidex-mcp-server/dist/server.mjs"
  );
  const outputPath = path.join(scratchDir, "tarball-smoke.pptx");
  const transport = new StdioClientTransport({
    args: [serverPath],
    command: process.execPath,
    stderr: "pipe"
  });
  transport.stderr?.on("data", (chunk) => process.stderr.write(chunk));

  const client = new Client({ name: "slidex-tarball-smoke", version: "0.2.0" });

  try {
    await client.connect(transport);
    const listed = await client.listTools();
    const toolNames = new Set(listed.tools.map((tool) => tool.name));

    for (const name of [
      "slidex_get_motion_doc_schema",
      "slidex_list_shaders",
      "slidex_export_pptx"
    ]) {
      if (!toolNames.has(name)) throw new Error(`The tarball is missing ${name}.`);
    }

    const blockTypes = await client.callTool({
      arguments: {},
      name: "slidex_list_block_types"
    });
    const actualTypes = blockTypes.structuredContent?.result?.blockTypes;
    const expectedTypes = ["Text", "Image", "Video", "Icon", "Table", "ShapeRectangle"];
    if (JSON.stringify(actualTypes) !== JSON.stringify(expectedTypes)) {
      throw new Error("The tarball exposed an unexpected add-block surface.");
    }

    const exported = await client.callTool({
      arguments: {
        outputPath,
        source: `# Tarball smoke

<Slide duration={5} theme="dark" background="#000000" shader="mesh-gradient" shaderPreset="Default">
  <Text x={10} y={10} w={80} h={20}>Tarball smoke</Text>
</Slide>`
      },
      name: "slidex_export_pptx"
    });

    if (exported.isError || !existsSync(outputPath)) {
      throw new Error("The installed tarball could not export a PowerPoint file.");
    }

    execFileSync("unzip", ["-t", outputPath], { stdio: "ignore" });
    const entries = execFileSync("unzip", ["-Z1", outputPath], { encoding: "utf8" });
    for (const entry of ["[Content_Types].xml", "ppt/presentation.xml", "ppt/slides/slide1.xml"]) {
      if (!entries.split(/\r?\n/).includes(entry)) {
        throw new Error(`The PowerPoint package is missing ${entry}.`);
      }
    }

    process.stdout.write(
      `${JSON.stringify({ pptxStructure: "valid", toolCount: listed.tools.length })}\n`
    );
  } finally {
    await client.close();
  }
} finally {
  await rm(scratchDir, { force: true, recursive: true });
}
