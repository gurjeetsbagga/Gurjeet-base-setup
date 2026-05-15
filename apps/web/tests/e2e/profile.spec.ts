import { test, expect } from "@playwright/test";

test.describe("Profile page", () => {
  test("profile form renders wellness and memory sections", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: /about you/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/memory & notes/i)).toBeVisible();
    await expect(page.getByLabelText(/wellness goal/i)).toBeVisible();
  });
});
