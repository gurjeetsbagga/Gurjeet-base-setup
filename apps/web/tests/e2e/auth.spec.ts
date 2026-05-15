import { test, expect } from "@playwright/test";

test.describe("Authentication pages", () => {
  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /log in to your account/i })).toBeVisible();
    await expect(page.getByLabelText(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  });

  test("signup page renders form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /begin your journey/i })).toBeVisible();
    await expect(page.getByLabelText(/name/i)).toBeVisible();
  });

  test("login validates short password client-side", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabelText(/email/i).fill("test@auryn.dev");
    await page.getByLabelText(/password/i).fill("short");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByRole("alert")).toContainText(/8 characters/i);
  });
});
