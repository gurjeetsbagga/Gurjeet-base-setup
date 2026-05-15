import { test, expect } from "@playwright/test";

test.describe("PhysicianOS Recovery", () => {
  test("recovery page renders wellness recovery layout", async ({ page }) => {
    await page.goto("/recovery");

    await expect(page.getByText(/physicianos recovery/i)).toBeVisible();
    await expect(page.getByText(/active focus/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /^physicianos$/i })).toBeVisible();
    await expect(page.getByText(/expected healing time/i)).toBeVisible();
    await expect(page.getByText(/nutrition overview/i)).toBeVisible();
    await expect(page.getByText(/your plan essentials/i)).toBeVisible();
    await expect(page.getByPlaceholder(/ask auryn anything/i)).toBeVisible();
  });
});
