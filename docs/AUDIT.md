# Auditoría Técnica (UI)

## Alcance y estado de verificación

- Frontend UI (Next 14 + TS + Tailwind). Sin backend ni API real.
- Verificación pendiente en esta pasada: build/lint/typecheck.
- CI configurado en `.github/workflows/ci.yml` (lint + typecheck + build + e2e).

## Resumen del proyecto

Sistema de gestión de restaurantes con foco en WhatsApp como canal principal.
Incluye plano de mesas interactivo, gestión de personal con fichaje, librería de productos y reportes.

## Hallazgos críticos (P0/P1)

### P0

1. **Layout raíz en client**: `src/app/layout.tsx` fuerza rendering en cliente, aumenta bundle y limita SSR.
2. **Páginas monolíticas**: `src/app/personal/page.tsx`, `src/app/plano-mesas/page.tsx`, `src/app/comandas/page.tsx`, `src/app/promociones/page.tsx`, `src/app/productos/page.tsx`.
3. **Capa de datos dispersa**: mocks en `src/data/mock-data.ts`, `src/data/environments.ts`, `src/data/devices.ts` y hooks locales sin servicio común.
4. **Design system inconsistente**: hardcode de colores/hex en vistas y componentes (ej. `src/app/ambientes/page.tsx`, `src/app/categorias/page.tsx`, `src/components/features/whatsapp-preview.tsx`).
5. **Tipado laxo**: `tsconfig.json` con `strict: false` y múltiples `any` en páginas y gráficos.
6. **Flujos placeholder**: `src/app/pos/page.tsx` y `src/app/kds/page.tsx` no conectan con navegación real.

### P1

- `src/components/charts/chart-components.tsx` vacío (deuda técnica).
- Documentación de WhatsApp describe endpoints no implementados (UI-only).
- Duplicidad en configuración de impuestos (página `settings/taxes` + tab informativa en perfil).

## Mejoras recientes (UI)

- Tokens de marca definidos en `src/app/globals.css` y mapeados en `tailwind.config.js`.
- Colores por rol centralizados en `src/lib/role-colors.ts` y aplicados en cards de personal.
- KPIs sin iconos en `components/features/dashboard/kpi-cards.tsx`.
- Corrección de textos corruptos en reportes y settings.

## Malas prácticas de design system (pendientes)

1. Hex hardcodeados en vistas y componentes (colores de roles, estados y WhatsApp).
2. Estilos inline para color en cards (deberían depender de tokens o utilidades).
3. Variantes de KPIs y métricas no homogéneas en tarjetas informativas.

## Auditoría por carpetas (resumen)

- **Raíz/config**: stack correcto; `tsconfig.json` sin `strict`; falta `.gitignore` (hay `node_modules`, `.next`, `test-results`).
- **docs/**: ahora alineada con tokens y estructura; ver `docs/VIEW_AUDIT.md` para detalle por vista.
- **src/app/**: todas las rutas son client y concentran lógica + UI (falta modularización).
- **src/components/**: buena separación, pero hay hardcode de colores y un archivo vacío en charts.
- **src/data/**: mocks duplicados por dominio; falta contrato único de tipos.
- **src/hooks/**: hooks locales sin capa de servicios unificada.
- **src/lib/**: utilidades + `role-colors` (nuevo).
- **src/types/**: tipos de fichaje aislados (`fichaje.ts`).
- **tests/**: solo smoke tests con Playwright.

## Plan de cierre UI (alto nivel)

1. **Unificar datos y tipos**: mover tipos a `src/types/` y crear servicios en `src/services/`.
2. **Separar layout server/client** para reducir JS y mejorar SSR.
3. **Modularizar páginas grandes** y extraer hooks por dominio.
4. **Normalizar design system**: tokens + remover hardcodeos.
5. **Tipado estricto**: activar `strict` y reducir `any` en vistas críticas.
6. **QA mínimo**: tests unitarios de helpers + smoke tests por dominio.

## Despliegue local

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

## Documentación relacionada

- `docs/VIEW_AUDIT.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/COMPONENT_CATALOG.md`
- `docs/OPTIMIZATION_TASKLIST.md`
