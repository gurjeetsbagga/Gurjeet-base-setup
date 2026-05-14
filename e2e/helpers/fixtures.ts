import { test as base } from "@playwright/test";

/**
 * Extend the base Playwright test with reusable fixtures.
 * Add authenticated page, test data, or API helpers here as the app grows.
 */
export const test = base.extend<{
  apiURL: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  apiURL: async ({}, use) => {
    const url = process.env.API_URL ?? "http://localhost:4000";
    await use(url);
  },
});

export { expect } from "@playwright/test";
