import { defineConfig, devices } from "@playwright/test";

const appPort = 3102;
const fixturePort = 54328;
const baseURL = `http://127.0.0.1:${appPort}`;
const fixtureURL = `http://127.0.0.1:${fixturePort}`;

export default defineConfig({
  testDir: "./tests/browser/mcp-activity",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },
  webServer: [
    {
      command: `node tests/browser/supabase-fixture.mjs --port ${fixturePort} --app-origin ${baseURL}`,
      reuseExistingServer: false,
      timeout: 30_000,
      url: `${fixtureURL}/health`
    },
    {
      command: `npm run dev:no-clean -- --hostname 127.0.0.1 --port ${appPort}`,
      env: {
        NEXT_PUBLIC_SLIDEX_AGENT_ENABLED: "false",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
        NEXT_PUBLIC_SUPABASE_URL: fixtureURL
      },
      reuseExistingServer: false,
      timeout: 120_000,
      url: `${baseURL}/workspace/pitch/?demo=1`
    }
  ]
});
