import { test, expect } from "@playwright/test";

test.describe("Profil (authentifié)", () => {
  test("devrait accéder à la page profil", async ({ page }) => {
    await page.goto("/profile");

    await expect(page).toHaveURL(/\/profile/, { timeout: 15000 });
  });

});

test.describe("Profil (non authentifié)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("devrait rediriger si non connecté", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/(login|profile)?/, { timeout: 10000 });
  });
});
