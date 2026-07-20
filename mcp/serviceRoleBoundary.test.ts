import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { readSupabasePublicEnvironment } from "@/common/lib/supabase/env";

const adminClientUrl = new URL("../common/lib/supabase/adminClient.ts", import.meta.url);
const browserClientUrl = new URL("../common/lib/supabase/browserClient.ts", import.meta.url);

test("Supabase admin credentials stay behind a server-only module boundary", async () => {
  const [adminSource, browserSource] = await Promise.all([
    readFile(adminClientUrl, "utf8"),
    readFile(browserClientUrl, "utf8")
  ]);

  assert.match(adminSource, /^import "server-only";/);
  assert.match(adminSource, /process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(browserSource, /adminClient|SUPABASE_SERVICE_ROLE_KEY|serviceRoleKey/);
});

test("browser environment rejects secret-style and service-role Supabase keys", () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.example";

  try {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_secret_placeholder";
    assert.throws(() => readSupabasePublicEnvironment(), /cannot be used by browser code/);

    const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url");
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = `${header}.${payload}.placeholder`;
    assert.throws(() => readSupabasePublicEnvironment(), /cannot be used by browser code/);
  } finally {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousKey;
  }
});
