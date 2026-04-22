# Guía de Testing - Camarai Dashboard

Este proyecto tiene un stack de testing completo que incluye Unit Tests, Convex Tests y E2E Tests.

## 📋 Índice

1. [Stack de Testing](#stack-de-testing)
2. [Unit Tests (Componentes React)](#unit-tests-componentes-react)
3. [Convex Tests (Backend)](#convex-tests-backend)
4. [E2E Tests (Playwright)](#e2e-tests-playwright)
5. [Scripts Disponibles](#scripts-disponibles)
6. [Buenas Prácticas](#buenas-prácticas)

## 🛠 Stack de Testing

### Unit Tests
- **Vitest** - Framework de testing rápido y moderno
- **React Testing Library** - Testing de componentes React
- **@testing-library/user-event** - Simulación de interacciones de usuario
- **jsdom** - Implementación de DOM para testing

### Convex Tests
- **Convex Testing Utils** - Testing de mutations y queries (pendiente de integración completa)
- **Mocks personalizados** - Para componentes que usan Convex context

### E2E Tests
- **Playwright** - Testing end-to-end de flujos de usuario completos

---

## 🧪 Unit Tests (Componentes React)

### Ubicación
```
src/test/unit/
```

### Ejecutar Tests

```bash
# Ejecutar todos los unit tests
npm run test:unit

# Ejecutar con watch mode
npm run test:watch

# Ejecutar con coverage
npm run test:coverage

# Ejecutar interfaz UI de Vitest
npm run test:ui
```

### Escribir Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('debería renderizar correctamente', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hola')).toBeInTheDocument();
  });

  it('debería manejar clicks del usuario', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Mock de Convex Context

Para componentes que usan Convex:

```typescript
import { createConvexWrapper } from '@/test/mocks/convex';

const wrapper = createConvexWrapper();

render(<MyComponent />, { wrapper });
```

---

## 🔷 Convex Tests (Backend)

### Ubicación
```
src/test/convex/
```

### Estado Actual

La configuración completa de Convex Testing Utils requiere integración adicional. Actualmente tenemos placeholders listos para cuando se integre.

### Integración Futura

Para habilitar el testing completo de Convex:

1. Ejecutar `npx convex dev` en modo test
2. Descomentar la configuración en `src/test/convex/setup.ts`
3. Usar `testConvex` para crear entornos de testing aislados

```typescript
// Ejemplo futuro
import { testConvex } from 'convex/test';
import { api } from '../../convex/_generated/api';
import schema from '../../convex/schema';

const ctx = testConvex(schema, api);
const result = await ctx.runMutation(api.seedData.seedData);
```

### Documentación Oficial
https://convex.dev/docs/testing

---

## 🎭 E2E Tests (Playwright)

### Ubicación
```
tests/
```

### Ejecutar Tests

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar en modo headed (ver navegador)
npx playwright test --headed

# Ejecutar tests específicos
npx playwright test auth.spec.ts

# Ejecutar con debug
npx playwright test --debug
```

### Tests Disponibles

- **smoke.spec.ts** - Tests básicos de smoke
- **auth.spec.ts** - Tests de autenticación
- **catalog.spec.ts** - Tests del catálogo de productos
- **orders.spec.ts** - Tests de gestión de órdenes

### Escribir Tests E2E

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mi Feature', () => {
  test('debería completar el flujo', async ({ page }) => {
    await page.goto('/mi-pagina');
    
    await page.getByRole('button', { name: 'Crear' }).click();
    await page.getByLabel('Nombre').fill('Mi Test');
    await page.getByRole('button', { name: 'Guardar' }).click();
    
    await expect(page.getByText('Guardado')).toBeVisible();
  });
});
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Testing
npm test                 # Ejecutar todos los tests (Vitest)
npm run test:watch       # Ejecutar tests en modo watch
npm run test:coverage    # Ejecutar tests con coverage
npm run test:ui          # Ejecutar interfaz UI de Vitest
npm run test:unit        # Ejecutar solo unit tests
npm run test:convex      # Ejecutar solo tests de Convex
npm run test:e2e         # Ejecutar tests E2E (Playwright)

# Calidad
npm run lint             # Ejecutar ESLint
npm run typecheck        # Ejecutar TypeScript type checking
npm run format           # Formatear código con Prettier
```

---

## ✅ Buenas Prácticas

### Unit Tests

1. **Testea comportamiento, no implementación**
   - ❌ Mal: `expect(component.state.count).toBe(1)`
   - ✅ Bien: `expect(screen.getByText('1')).toBeInTheDocument()`

2. **Usa selectores accesibles**
   - ✅ `getByRole('button')`, `getByLabelText('Email')`
   - ❌ `container.querySelector('.btn-primary')`

3. **Mock dependencies externas**
   - Usa `vi.fn()` para mockear funciones
   - Usa los wrappers de Convex para componentes que dependen del backend

### E2E Tests

1. **Testea flujos críticos de usuario**
   - Login, creación de órdenes, pagos, etc.

2. **Usa data-testid cuando necesario**
   - Cuando no hay selectores accesibles disponibles

3. **Mantén tests independientes**
   - Cada test debería poder ejecutarse solo

### Convex Tests

1. **Testea lógica de negocio**
   - Validaciones, cálculos, reglas de negocio

2. **Usa datos de test aislados**
   - No dependas de datos de producción

3. **Limpia después de cada test**
   - Usa `ctx.runMutation(api.erase.eraseAllData)` si es necesario

---

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/)
- [Convex Testing](https://convex.dev/docs/testing)
