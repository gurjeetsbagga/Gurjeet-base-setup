import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const apiURL = process.env.API_URL ?? "http://localhost:4000";

export default defineConfig({
  testDir: ".",
  testMatch: [
    "apps/web/tests/e2e/**/*.spec.ts",
    "apps/api/tests/e2e/**/*.spec.ts",
    "e2e/**/*.spec.ts",
  ],
  outputDir: "./e2e/results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "on-failure" }]],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"] },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : [
        {
          command: "pnpm dev:web",
          url: baseURL,
          reuseExistingServer: true,
          timeout: 30_000,
        },
        {
          command: "pnpm dev:api",
          url: `${apiURL}/health`,
          reuseExistingServer: true,
          timeout: 30_000,
        },
      ],
});
