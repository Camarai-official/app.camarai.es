import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('settings tabs respond to url and clicks', async ({ page }) => {
    await page.goto('/settings/profile?tab=establishment');
    const establishmentTab = page.getByRole('tab', { name: /Establecimiento/i });
    await expect(establishmentTab).toHaveAttribute('aria-selected', 'true');

    const companyTab = page.getByRole('tab', { name: /Empresa/i });
    await companyTab.click();
    await expect(companyTab).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/tab=company/);

    const devicesTab = page.getByRole('tab', { name: /Dispositivos/i });
    await devicesTab.click();
    await expect(devicesTab).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/tab=devices/);
  });

  test('create card is last in ambientes grid', async ({ page }) => {
    await page.goto('/ambientes');
    const grid = page.locator('main .grid').first();
    const items = grid.locator('> *');
    await expect(items.last()).toContainText(/Crear Nuev/i);
  });

  test('create card is last in carta tabs', async ({ page }) => {
    await page.goto('/carta');
    const activePanel = page.locator('[role="tabpanel"][data-state="active"]');
    const items = activePanel.locator('div.grid').first().locator('> *');
    await expect(items.last()).toContainText(/Crear Nuev/i);

    const menusTab = page.getByRole('tab', { name: /Combos/i });
    await menusTab.click();
    const menusPanel = page.locator('[role="tabpanel"][data-state="active"]');
    const menuItems = menusPanel.locator('div.grid').first().locator('> *');
    await expect(menuItems.last()).toContainText(/Crear Nuev/i);
  });
});
