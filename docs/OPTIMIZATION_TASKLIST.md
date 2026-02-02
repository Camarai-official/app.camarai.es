# Tasklist de Optimización, QA y Cierre UI

## Para qué sirve este documento

Define el backlog técnico para finalizar la UI con calidad estable.
Marca tareas cerradas con [x] y actualiza `docs/AUDIT.md` y `docs/VIEW_AUDIT.md`
al completar cambios relevantes.

## Estado de verificación (pendiente)

- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `npm run typecheck`

## Completado (UI)

- [x] Tokens de marca en `src/app/globals.css` + `tailwind.config.js`
- [x] Colores por rol centralizados en `src/lib/role-colors.ts`
- [x] KPI cards sin iconos en `components/features/dashboard/kpi-cards.tsx`
- [x] `PageHeader` con `actions` y uso en dashboard
- [x] Corrección de textos corruptos en reportes/settings
- [x] Tokens WhatsApp en componentes clave (login/config/roles)

## P0 - Bloqueantes UI

- [ ] Separar layout server/client (`src/app/layout.tsx`) para reducir bundle y mejorar SSR
- [ ] Modularizar páginas monolíticas: `personal`, `plano-mesas`, `comandas`, `promociones`, `productos`
- [ ] Unificar capa de datos (mocks + hooks) en un `src/services` o `src/data` coherente
- [ ] Limpiar hardcodeos de color (hex y estilos inline) y migrar a tokens
- [ ] Resolver placeholders de flujo: `pos`, `kds`, navegación lateral
- [ ] Normalizar tipados: activar `strict`, eliminar `any` en vistas críticas

## P1 - Calidad y mantenimiento

- [ ] Tests unitarios para helpers (`utils`, `role-colors`, helpers de plano/tiempos)
- [ ] Persistencia ligera de configuración de vistas (localStorage)
- [ ] Error boundaries por dominio o por página
- [ ] Revisión de accesibilidad (focus, labels, contraste AA)

## P2 - UX y polish

- [ ] Empty states consistentes en todas las tablas/listas
- [ ] Unificar menús de acciones por fila
- [ ] Reducir redundancia de datos mock (una sola fuente por dominio)

