import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const artifactRoot = path.resolve(process.env.NEXT_DIST_DIR ?? ".next", "static");
const prohibitedLiterals = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "MCP_OAUTH_RATE_LIMIT_SECRET",
  "MCP_OAUTH_AUDIT_HMAC_SECRET"
];
const configuredSecretNames = Object.keys(process.env).filter((name) => (
  name === "SUPABASE_SERVICE_ROLE_KEY" ||
  name === "MCP_OAUTH_RATE_LIMIT_SECRET" ||
  name === "MCP_OAUTH_AUDIT_HMAC_SECRET" ||
  /_(?:CLIENT|HMAC)_SECRET$/.test(name)
));
const configuredSecrets = configuredSecretNames
  .map((name) => process.env[name])
  .filter((value) => typeof value === "string" && value.length >= 16);

let failed = false;
for (const filePath of await walk(artifactRoot)) {
  if (!/\.(?:css|html|js|json|map|txt)$/i.test(filePath)) continue;
  const content = await readFile(filePath, "utf8");
  if (
    prohibitedLiterals.some((literal) => content.includes(literal)) ||
    configuredSecrets.some((secret) => content.includes(secret)) ||
    /NEXT_PUBLIC_[A-Z0-9_]*(?:SERVICE_ROLE|CLIENT_SECRET|HMAC_SECRET)/.test(content) ||
    /\bsb_secret_[A-Za-z0-9_-]+/.test(content)
  ) {
    failed = true;
    break;
  }
}

process.stdout.write(`Client artifact secret scan: ${failed ? "FAIL" : "PASS"}\n`);
if (failed) process.exitCode = 1;

async function walk(directory) {
  const files = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    process.stdout.write("Client artifact secret scan: FAIL\n");
    process.exit(1);
  }
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}
