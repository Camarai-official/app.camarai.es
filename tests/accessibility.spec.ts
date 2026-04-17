import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Tests de Accesibilidad (Informativos)', () => {
  test('página de cartas - escanear accesibilidad', async ({ page }) => {
    await page.goto('/cartas');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    console.log(`\n=== Violaciones de accesibilidad en /cartas ===`);
    console.log(`Total: ${accessibilityScanResults.violations.length}`);
    
    if (accessibilityScanResults.violations.length > 0) {
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`  [${violation.impact}] ${violation.id}: ${violation.description}`);
      });
    }
    
    console.log(`Pases: ${accessibilityScanResults.passes.length}`);
  });

  test('página de comandas - escanear accesibilidad', async ({ page }) => {
    await page.goto('/comandas');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    console.log(`\n=== Violaciones de accesibilidad en /comandas ===`);
    console.log(`Total: ${accessibilityScanResults.violations.length}`);
    
    if (accessibilityScanResults.violations.length > 0) {
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`  [${violation.impact}] ${violation.id}: ${violation.description}`);
      });
    }
    
    console.log(`Pases: ${accessibilityScanResults.passes.length}`);
  });

  test('página de ambientes - escanear accesibilidad', async ({ page }) => {
    await page.goto('/ambientes');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    console.log(`\n=== Violaciones de accesibilidad en /ambientes ===`);
    console.log(`Total: ${accessibilityScanResults.violations.length}`);
    
    if (accessibilityScanResults.violations.length > 0) {
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`  [${violation.impact}] ${violation.id}: ${violation.description}`);
      });
    }
    
    console.log(`Pases: ${accessibilityScanResults.passes.length}`);
  });

  test('página principal - escanear accesibilidad', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    console.log(`\n=== Violaciones de accesibilidad en / ===`);
    console.log(`Total: ${accessibilityScanResults.violations.length}`);
    
    if (accessibilityScanResults.violations.length > 0) {
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`  [${violation.impact}] ${violation.id}: ${violation.description}`);
      });
    }
    
    console.log(`Pases: ${accessibilityScanResults.passes.length}`);
  });
});
