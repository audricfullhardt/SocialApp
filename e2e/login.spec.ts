import { test, expect } from "@playwright/test";

test.describe("Authentification", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("devrait afficher la page d'accueil", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Mini Réseau Social/);
    await expect(
      page.getByRole("heading", { name: /Mini Réseau Social/i }),
    ).toBeVisible();
  });

  test("devrait naviguer vers la page de login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /login/i }).click();
    await expect(page).toHaveURL("/login");
    await expect(
      page.getByRole("heading", { name: /connexion/i }),
    ).toBeVisible();
  });

  test("devrait afficher les champs du formulaire de login", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("login-submit")).toBeVisible();
  });

  test("devrait afficher une erreur si les champs sont vides", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL("/login");
  });

  test("devrait avoir un lien vers la page d'inscription", async ({
    page,
  }) => {
    await page.goto("/login");

    const registerLink = page.getByRole("link", {
      name: /créer un compte/i,
    });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL("/register");
  });

  test("devrait afficher le formulaire de mot de passe oublié", async ({
    page,
  }) => {
    await page.goto("/login");

    await page
      .getByRole("button", { name: /mot de passe oublié/i })
      .click();

    await expect(
      page.getByRole("heading", { name: /mot de passe oublié/i }),
    ).toBeVisible();
  });
});
