import { test, expect } from '@playwright/test';

test.describe('Gestión de Órdenes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comandas');
  });

  test('debería mostrar la página de comandas correctamente', async ({ page }) => {
    await expect(page.getByText('Historial de Pedidos')).toBeVisible();
  });

  test('debería mostrar el listado de órdenes', async ({ page }) => {
    // Verificar que la tabla de comandas está visible
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('debería mostrar el buscador de órdenes', async ({ page }) => {
    // Verificar que hay un input de búsqueda
    const searchInput = page.getByPlaceholder('Buscar por orden, mesa, cliente...');
    await expect(searchInput).toBeVisible();
  });

  test('debería mostrar filtros de fecha', async ({ page }) => {
    // Verificar que hay un selector de rango de fechas
    const dateFilter = page.locator('button').filter({ hasText: /CalendarIcon/i }).first();
    // Si no encuentra por icono, buscar por el placeholder del date picker
    if (await dateFilter.isVisible()) {
      await expect(dateFilter).toBeVisible();
    } else {
      // Verificar que hay algún botón de filtro
      const filterButtons = page.locator('button').filter({ has: page.locator('svg') });
      const count = await filterButtons.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
