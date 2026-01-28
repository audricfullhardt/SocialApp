import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour la navigation et les channels
 */
test.describe('Channels', () => {
  test.skip('devrait afficher la liste des channels (nécessite auth)', async ({ page }) => {
    // Note: Ce test nécessite d'être authentifié
    // Dans un vrai projet, on utiliserait un setup avec authentification
    
    await page.goto('/channels');
    
    await expect(page.getByTestId('channels-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: /channels/i })).toBeVisible();
  });

  test.skip('devrait créer une nouvelle publication (nécessite auth)', async ({ page }) => {
    // Note: Ce test nécessite d'être authentifié et sur un channel
    
    // Supposons qu'on est sur /channels/1
    await page.goto('/channels/1');
    
    // Remplir le formulaire de création
    await page.getByTestId('publication-title').fill('Test Publication E2E');
    await page.getByTestId('publication-body').fill('Ceci est un test E2E automatisé');
    
    // Soumettre
    await page.getByTestId('publication-submit').click();
    
    // Vérifier le toast de succès
    await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 5000 });
    
    // Vérifier que la publication apparaît dans la liste
    await expect(page.getByText('Test Publication E2E')).toBeVisible();
  });

  test('devrait avoir une navigation fonctionnelle', async ({ page }) => {
    await page.goto('/');
    
    // Cliquer sur "Explorer" ou "Channels" dans la navbar
    const channelsLink = page.getByRole('link', { name: /channels/i }).first();
    await channelsLink.click();
    
    await expect(page).toHaveURL(/\/channels/);
  });
});
