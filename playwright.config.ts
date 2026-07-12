import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "line",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: "npm run dev:no-clean -- --hostname 127.0.0.1 --port 3100",
    env: {
      NEXT_PUBLIC_SLIDEX_AGENT_ENABLED: "true",
      NEXT_PUBLIC_SLIDEX_AGENT_SERVER_URL: baseURL,
      NEXT_PUBLIC_SUPABASE_URL: baseURL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key"
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: `${baseURL}/workspace/pitch/`
  }
});
