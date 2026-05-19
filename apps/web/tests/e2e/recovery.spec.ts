import { test, expect } from "@playwright/test";

test.describe("Recovery", () => {
  test("recovery page renders wellness recovery layout", async ({ page }) => {
    await page.goto("/recovery");

    await expect(page).toHaveTitle(/recovery \| hey auryn/i);
    await expect(page.getByText(/active focus/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /^recovery protocol$/i })).toBeVisible();
    await expect(page.getByText(/expected healing time/i)).toBeVisible();
    await expect(page.getByText(/nutrition overview/i)).toBeVisible();
    await expect(page.getByText(/your plan essentials/i)).toBeVisible();
    await expect(page.getByPlaceholder(/ask auryn anything/i)).toBeVisible();
  });
});
