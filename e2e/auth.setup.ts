import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth", "user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/login");

  await page.getByTestId("login-email").fill("test@test.fr");
  await page.getByTestId("login-password").fill("12345678");
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/channels/, { timeout: 15000 });

  await page.context().storageState({ path: authFile });
});
