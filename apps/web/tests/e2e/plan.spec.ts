import { test, expect } from "@playwright/test";

test.describe("Plan — Explore and Personalize", () => {
  test("plan page renders chat and context panel", async ({ page }) => {
    await page.goto("/plan");

    await expect(page.getByText(/explore and personalize/i)).toBeVisible();
    await expect(page.getByText(/can diet help/i)).toBeVisible();
    await expect(page.getByText(/diet & sleep connection/i)).toBeVisible();
    await expect(page.getByLabelText(/ask auryn anything/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /7-day/i })).toBeVisible();
  });
});
