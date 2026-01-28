import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour le flux d'authentification
 */
test.describe('Authentification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('devrait afficher la page d\'accueil', async ({ page }) => {
    await expect(page).toHaveTitle(/Mini Réseau Social/);
    await expect(page.getByRole('heading', { name: /Mini Réseau Social/i })).toBeVisible();
  });

  test('devrait naviguer vers la page de login', async ({ page }) => {
    await page.getByRole('link', { name: /se connecter/i }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
  });

  test('devrait afficher les champs du formulaire de login', async ({ page }) => {
    await page.goto('/login');
    
    // Vérifier la présence des champs
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('devrait afficher une erreur si les champs sont vides', async ({ page }) => {
    await page.goto('/login');
    
    // Cliquer sur le bouton sans remplir les champs
    await page.getByTestId('login-submit').click();
    
    // Vérifier que le formulaire ne se soumet pas (HTML5 validation)
    await expect(page).toHaveURL('/login');
  });

  test.skip('devrait se connecter avec des identifiants valides', async ({ page }) => {
    // Note: Ce test nécessite des identifiants valides
    // À configurer selon votre environnement de test
    
    await page.goto('/login');
    
    await page.getByTestId('login-email').fill('test@example.com');
    await page.getByTestId('login-password').fill('password123');
    await page.getByTestId('login-submit').click();
    
    // Vérifier la redirection vers /channels
    await expect(page).toHaveURL('/channels', { timeout: 10000 });
  });

  test('devrait afficher le toggle de thème', async ({ page }) => {
    // Vérifier la présence du dropdown de thème dans la navbar
    const themeButton = page.locator('button').filter({ hasText: /clair|sombre/i }).first();
    await expect(themeButton).toBeVisible();
  });
});
