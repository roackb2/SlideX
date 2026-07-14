import { existsSync, statSync } from "node:fs";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entryPoint = path.join(rootDir, "mcp/server.ts");
const outdir = path.join(rootDir, "packages/slidex-mcp-server/dist");
const outfile = path.join(outdir, "server.mjs");

await mkdir(outdir, { recursive: true });

await build({
  absWorkingDir: rootDir,
  banner: {
    js: "#!/usr/bin/env node"
  },
  bundle: true,
  entryPoints: [entryPoint],
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
