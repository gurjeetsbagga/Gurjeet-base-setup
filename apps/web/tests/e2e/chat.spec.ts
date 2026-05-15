import { test, expect } from "@playwright/test";

test.describe("Chat experience", () => {
  test("landing page links to chat", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /start a conversation/i })).toBeVisible();
  });

  test("chat page loads with welcome message", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByText(/wellness companion/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabelText(/message to auryn/i)).toBeVisible();
  });

  test("can type and send a demo message", async ({ page }) => {
    await page.goto("/chat");
    const input = page.getByLabelText(/message to auryn/i);
    await input.fill("I feel a bit tired today");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("I feel a bit tired today")).toBeVisible();
  });

  test("shows assistant reply after send in demo mode", async ({ page }) => {
    await page.goto("/chat");
    await page.getByLabelText(/message to auryn/i).fill("Hello Auryn");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/thank you for sharing|wellness companion/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
