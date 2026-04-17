import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('settings page loads', async ({ page }) => {
    await page.goto('/settings/profile');
    // Verificar que la página carga correctamente usando el título
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('ambientes page loads', async ({ page }) => {
    await page.goto('/ambientes');
    // Verificar que la página de ambientes carga usando el título
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('cartas page loads', async ({ page }) => {
    await page.goto('/cartas');
    // Verificar que la página de cartas carga
    await expect(page.getByText('Gestión de Menú')).toBeVisible();
  });

  test('comandas page loads', async ({ page }) => {
    await page.goto('/comandas');
    // Verificar que la página de comandas carga
    await expect(page.getByText('Historial de Pedidos')).toBeVisible();
  });
});
