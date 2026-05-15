import { test, expect } from "@playwright/test";

test.describe("Auryn home dashboard", () => {
  test("dashboard page renders home layout", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByText(/hey auryn/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/search, ask, or explore/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /your intelligent wellness companion/i }),
    ).toBeVisible();
    await expect(page.getByText(/12 connected/i)).toBeVisible();
    await expect(page.getByText(/private brain/i)).toBeVisible();
    await expect(page.getByPlaceholder(/ask auryn anything/i)).toBeVisible();
  });
});
