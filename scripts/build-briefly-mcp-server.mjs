import { existsSync, statSync } from "node:fs";
import { chmod, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outdir = path.join(rootDir, "packages/briefly-mcp-server/dist");
const rubricsSourceDir = path.join(rootDir, "core/briefly/rubrics");
const rubricsOutDir = path.join(outdir, "rubrics");

await rm(outdir, { force: true, recursive: true });
await mkdir(outdir, { recursive: true });

await buildEntry("mcp/brieflyServer.ts", "server.mjs");
await cp(rubricsSourceDir, rubricsOutDir, { force: true, recursive: true });

async function buildEntry(entryPoint, outputFile) {
  const outfile = path.join(outdir, outputFile);

  await build({
    absWorkingDir: rootDir,
    banner: {
      js: "#!/usr/bin/env node"
    },
    bundle: true,
    entryPoints: [path.join(rootDir, entryPoint)],
    format: "esm",
    logLevel: "info",
    outfile,
    platform: "node",
    sourcemap: false,
    target: "node18",
    treeShaking: true,
    plugins: [
      {
        name: "root-alias",
        setup(buildContext) {
          buildContext.onResolve({ filter: /^@\// }, (args) => {
            const basePath = path.join(rootDir, args.path.slice(2));
            const resolvedPath = resolveSourcePath(basePath);

            if (!resolvedPath) {
              return {
                errors: [{ text: `Could not resolve ${args.path} from ${args.importer}` }]
              };
            }

            return {
              path: resolvedPath
            };
          });
        }
      }
    ]
  });

  const bundledSource = await readFile(outfile, "utf8");

  await writeFile(outfile, bundledSource, {
    mode: 0o755
  });

  await chmod(outfile, 0o755);
}

function resolveSourcePath(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx")
  ];

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}
