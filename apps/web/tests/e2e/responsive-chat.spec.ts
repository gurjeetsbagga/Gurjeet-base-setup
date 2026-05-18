import { test, expect } from "@playwright/test";

test.describe("Responsive chat", () => {
  test("mobile viewport shows chat input", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/chat");
    await expect(page.getByLabelText(/ask auryn anything/i)).toBeVisible();
  });

  test("desktop viewport shows chat input", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/chat");
    await expect(page.getByLabelText(/ask auryn anything/i)).toBeVisible();
  });
});
