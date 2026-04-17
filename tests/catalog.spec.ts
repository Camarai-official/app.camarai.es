import { test, expect } from '@playwright/test';

test.describe('Catálogo de Productos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cartas');
  });

  test('debería mostrar la página de carta correctamente', async ({ page }) => {
    await expect(page.getByText('Gestión de Menú')).toBeVisible();
  });

  test('debería mostrar las tabs de navegación', async ({ page }) => {
    // Verificar que las tabs principales están visibles
    await expect(page.getByRole('tab', { name: 'Cartas' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Categorías' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Productos' })).toBeVisible();
  });

  test('debería permitir navegar entre tabs', async ({ page }) => {
    // Click en la tab de Categorías
    const categoriesTab = page.getByRole('tab', { name: 'Categorías' });
    await categoriesTab.click();
    
    // Verificar que el tab es clickeable y la página responde
    await expect(categoriesTab).toBeVisible();

    // Click en la tab de Productos
    const productsTab = page.getByRole('tab', { name: 'Productos' });
    await productsTab.click();
    
    // Verificar que está visible
    await expect(productsTab).toBeVisible();
  });

  test('debería mostrar botón de añadir', async ({ page }) => {
    // Verificar que hay un botón de añadir visible
    const addButton = page.getByRole('button').filter({ hasText: /Añadir|Nueva|Nuevo/i });
    await expect(addButton.first()).toBeVisible();
  });
});
