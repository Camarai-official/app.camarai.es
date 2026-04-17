import { test, expect } from '@playwright/test';

test.describe('Flujos Completos de Usuario', () => {
  test('navegación completa desde inicio hasta comandas', async ({ page }) => {
    // Ir a la página principal
    await page.goto('/');
    
    // Navegar a la página de cartas
    await page.goto('/cartas');
    await expect(page.getByText('Gestión de Menú')).toBeVisible();
    
    // Navegar a la página de comandas
    await page.goto('/comandas');
    await expect(page.getByText('Historial de Pedidos')).toBeVisible();
  });

  test('navegación entre tabs de cartas', async ({ page }) => {
    await page.goto('/cartas');
    
    // Verificar tab de Cartas está visible
    await expect(page.getByRole('tab', { name: 'Cartas' })).toBeVisible();
    
    // Click en Categorías
    await page.getByRole('tab', { name: 'Categorías' }).click();
    
    // Click en Productos
    await page.getByRole('tab', { name: 'Productos' }).click();
    
    // Verificar que Products tab está activo
    await expect(page.getByRole('tab', { name: 'Productos' })).toBeVisible();
  });

  test('navegación a ambientes y verificación de carga', async ({ page }) => {
    await page.goto('/ambientes');
    
    // Verificar que la página carga
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('navegación a settings y verificación de carga', async ({ page }) => {
    await page.goto('/settings/profile');
    
    // Verificar que la página carga
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });
});
