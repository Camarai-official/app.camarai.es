import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

test.describe('Tests de Performance (Informativos)', () => {
  test('performance de página principal', async ({ page }) => {
    await page.goto('/');
    
    // Medir tiempo de carga
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
      };
    });
    
    console.log('\n=== Métricas de Performance - Página Principal ===');
    console.log(`DOM Content Loaded: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`Load Complete: ${performanceMetrics.loadComplete.toFixed(2)}ms`);
    console.log(`First Paint: ${performanceMetrics.firstPaint.toFixed(2)}ms`);
    
    // Verificar que la página carga en un tiempo razonable
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000);
  });

  test('performance de página de cartas', async ({ page }) => {
    await page.goto('/cartas');
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });
    
    console.log('\n=== Métricas de Performance - Página de Cartas ===');
    console.log(`DOM Content Loaded: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`Load Complete: ${performanceMetrics.loadComplete.toFixed(2)}ms`);
    
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000);
  });

  test('performance de página de comandas', async ({ page }) => {
    await page.goto('/comandas');
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });
    
    console.log('\n=== Métricas de Performance - Página de Comandas ===');
    console.log(`DOM Content Loaded: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`Load Complete: ${performanceMetrics.loadComplete.toFixed(2)}ms`);
    
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000);
  });
});
