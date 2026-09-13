import { test, expect } from "@playwright/test";
import { loginAs, testUserCredentials } from "./helpers/auth";

/**
 * Authenticated Hello call from the home page.
 *
 * Matches the root SETUP_GUIDE.md verify path: login → Hello.
 *
 * Prerequisites:
 *   - Seeded user (python seed.py)
 *   - Backend on :8080
 */
test.describe("Hello", () => {
  test("should call /api/v1/hello after sign-in", async ({ page }) => {
    const { email, password } = testUserCredentials();

    await loginAs(page, email, password);
    await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

    await page.getByRole("button", { name: "Hello" }).click();

    const payload = page.locator("pre");
    await expect(payload).toBeVisible({ timeout: 15_000 });
    await expect(payload).toContainText('"message": "hello"');
    await expect(payload).toContainText('"authenticated": true');
    await expect(payload).toContainText(email);
  });
});
