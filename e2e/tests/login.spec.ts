import { test, expect } from "@playwright/test";
import {
  fillEmailSignIn,
  openEmailSignIn,
  testUserCredentials,
} from "./helpers/auth";

/**
 * Email/password login against a seeded auth user.
 *
 * Defaults match supabase python seeds:
 *   test@example.com / password123
 * Override with TEST_USER_EMAIL and TEST_USER_PASSWORD in e2e/.env.
 */
test.describe("Login", () => {
  test("should sign in with seeded email and reach the home page", async ({
    page,
  }) => {
    const { email, password } = testUserCredentials();

    await openEmailSignIn(page);
    await fillEmailSignIn(page, email, password);

    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 15_000,
    });
    await expect(page).toHaveURL("/");
    await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });

  test("should stay on login after a wrong password", async ({ page }) => {
    const { email } = testUserCredentials();

    await openEmailSignIn(page);
    await fillEmailSignIn(page, email, "wrong-password-xxxxx");

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
