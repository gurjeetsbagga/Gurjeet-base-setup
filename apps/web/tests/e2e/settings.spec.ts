import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("settings page renders profile and privacy", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByText(/profile & settings/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /^settings$/i })).toBeVisible();
    await expect(page.getByText(/account management/i)).toBeVisible();
    await expect(page.getByText(/privacy controls/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /save changes/i })).toBeVisible();
    await expect(page.getByRole("switch", { name: /care team/i })).toBeVisible();
  });
});
