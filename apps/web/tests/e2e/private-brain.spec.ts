import { test, expect } from "@playwright/test";

test.describe("Private Brain", () => {
  test("private brain page renders memory experience", async ({ page }) => {
    await page.goto("/private-brain");

    await expect(page.getByRole("heading", { name: /^private brain$/i })).toBeVisible();
    await expect(page.getByText(/your memory\. your truth/i)).toBeVisible();
    await expect(page.getByLabelText(/search your memories/i)).toBeVisible();
    await expect(page.getByText(/your memory threads/i)).toBeVisible();
    await expect(page.getByText(/your brain is always learning/i)).toBeVisible();
    await expect(page.getByText(/memory tools/i)).toBeVisible();
    await expect(page.getByPlaceholder(/ask auryn anything/i)).toBeVisible();
  });
});
