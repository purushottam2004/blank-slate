import { test, expect } from "@playwright/test";

/**
 * Smoke test: visit the app homepage.
 *
 * This test verifies that:
 *   1. The frontend server is running and reachable.
 *   2. The page loads without crashing.
 *   3. Unauthenticated users are sent to /login.
 *
 * Prerequisites:
 *   - Frontend running on BASE_URL / WEB2_BASE_URL (Playwright starts preview)
 */
test.describe("Smoke Tests", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/.+/);

    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
  });

  test("should redirect unauthenticated users to /login", async ({ page }) => {
    await page.goto("/");

    await page.waitForURL("**/login**");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});
