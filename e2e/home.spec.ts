import { test, expect } from "./helpers/fixtures";

test.describe("Home page", () => {
  test("displays the Auryn heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /auryn/i })).toBeVisible();
  });

  test("displays the tagline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/ai wellness companion/i)).toBeVisible();
  });
});
