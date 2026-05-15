import { test, expect } from "@playwright/test";

test.describe("Onboarding", () => {
  test("onboarding page renders step 1", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { name: /welcome to auryn/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByLabelText(/first name/i)).toBeVisible();
  });
});
