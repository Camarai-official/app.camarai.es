# Auditoría por Vista y Componentes

## Cómo leer este documento

- UI-only: no hay backend ni persistencia real.
- Cada vista resume propósito, datos/estado y fallos de lógica/UX.
- Componentes clave y de dominio se auditan al final.

## Observaciones transversales

- Todas las rutas son `use client` y mezclan UI + lógica.
- Mocks y datos duplicados entre `src/data/` y hooks locales.
- Tipado laxo con `any` en páginas y gráficos.
- Colores hardcodeados y estilos inline fuera de tokens.

## Vistas (App Router)

## `/`
- Propósito: dashboard operativo con métricas, tablas y gráficos.
- Datos/estado: `mock-data` + configuración local de widgets y paginación.
- Fallos de lógica: estado de rango de fechas y popover sin uso; config no persiste.
- Design/UX: KPIs correctos sin iconos, pero hay exceso de lógica en un solo archivo.

## `/ambientes`
- Propósito: gestionar ambientes, mesas y QR por ambiente.
- Datos/estado: estado local con `mockEnvironments`; IDs con `Math.random`.
- Fallos de lógica: QR y enlaces con APIs externas sin validación ni errores; copy usa `navigator.clipboard` sin fallback.
- Design/UX: colores hex hardcodeados e inline styles (border/iconos).

## `/carta`
- Propósito: gestión de cartas y menús con integración WhatsApp.
- Datos/estado: `mockCartas` + `mockMenuCombos`; edición local sin persistencia.
- Fallos de lógica: `as any` en tabs; acciones no validan datos mínimos.
- Design/UX: colores de identidad con hex inline; `Input type=color` sin tokens.

## `/carta/[id]`
- Propósito: detalle de menú/combos y rentabilidad.
- Datos/estado: carga desde mocks con `useEffect` y copia profunda.
- Fallos de lógica: no hay persistencia real ni manejo de errores al guardar.
- Design/UX: iconos con colores hardcodeados (blue/purple).

## `/carta/[id]/edit`
- Propósito: editar carta y reordenar elementos.
- Datos/estado: copia local; actualiza `mockCartas` en memoria.
- Fallos de lógica: cambios no se reflejan fuera del mock; sin validaciones.
- Design/UX: iconos de estado con colores hardcodeados.

## `/categorias`
- Propósito: librería de categorías con icono/color y asignación a productos.
- Datos/estado: estado local + `ColorPicker`/`IconPicker`.
- Fallos de lógica: `color` y `icono` sin validación; asignación de productos no persiste.
- Design/UX: colores inline (hex) en tabla y preview.

## `/comandas`
- Propósito: gestión de pedidos y edición de comandas.
- Datos/estado: `mockOrders` + `mockOrderDetails` locales.
- Fallos de lógica: exportación simulada; view config con `any`; sin persistencia de filtros.
- Design/UX: archivo excesivamente grande; difícil mantenimiento.

## `/ingredientes`
- Propósito: librería de ingredientes con stock, conversiones y precio histórico.
- Datos/estado: `mockIngredients` extendido con campos extra vía `any`.
- Fallos de lógica: conversiones y historial simulados; múltiples estados acoplados.
- Design/UX: badges de stock usan variantes forzadas; validación mínima.

## `/inventario`
- Propósito: stock operativo con ajustes y exportación.
- Datos/estado: `mockIngredients` con filtros y diálogos.
- Fallos de lógica: exportación simulada; `openStockDialog` acepta `any`.
- Design/UX: tarjetas informativas con variantes inconsistentes.

## `/kds`
- Propósito: configuración de KDS (Kitchen Display System).
- Datos/estado: `useEnvironments` + filtros locales.
- Fallos de lógica: placeholder sin navegación real al KDS.
- Design/UX: correcto para placeholder, pero falta flujo final.

## `/personal`
- Propósito: gestión de personal, fichaje, incidencias y dispositivos.
- Datos/estado: múltiples mocks y estados en un solo archivo.
- Fallos de lógica: `any` en inputs; FormData + `document.querySelector`; sin persistencia.
- Design/UX: vista muy densa; difícil escalar; tokens de rol parcialmente unificados.

## `/plano-mesas`
- Propósito: plano interactivo de mesas con drag/resize y QR.
- Datos/estado: `mockEnvironments` local + historial undo/redo.
- Fallos de lógica: uso intensivo de estado en un único archivo; colores y estados hardcodeados.
- Design/UX: inline styles y colores no tokenizados; mucha lógica en el render.

## `/pos`
- Propósito: configuración de POS.
- Datos/estado: `useDevices` + opciones locales.
- Fallos de lógica: placeholder sin app POS real.
- Design/UX: correcto para placeholder.

## `/productos`
- Propósito: librería de productos con receta y variantes.
- Datos/estado: `mockProducts` extendido; `any` para campos nuevos.
- Fallos de lógica: cálculo de margen en memoria; sin validaciones.
- Design/UX: formularios extensos sin separación por subcomponentes.

## `/promociones`
- Propósito: campañas WhatsApp y métricas.
- Datos/estado: campañas en memoria; `selectedProduct` como `any`.
- Fallos de lógica: segmentación simulada; programación sin persistencia.
- Design/UX: tarjetas informativas con iconos (revisar regla de KPIs).

## `/reportes`
- Propósito: facturación, ventas, personal, inventario y WhatsApp.
- Datos/estado: `_components` + mocks de reportes y métricas.
- Fallos de lógica: filtros en memoria; exportación simulada.
- Design/UX: tabs correctos, pero gráficos con colores hardcodeados.

## `/reservas`
- Propósito: calendario de reservas + notificaciones WhatsApp.
- Datos/estado: reservas en memoria; cálculo de mesas disponibles local.
- Fallos de lógica: no hay persistencia ni envío real de mensajes.
- Design/UX: correcto; modal de notificaciones es solo UI.

## `/settings`
- Propósito: hub de configuración.
- Datos/estado: navegación estática a secciones.
- Fallos de lógica: tarjetas “Facturación” deshabilitadas sin explicación adicional.
- Design/UX: correcto.

## `/settings/notifications`
- Propósito: gestión de notificaciones por canal.
- Datos/estado: estado local con toasts; sin persistencia.
- Fallos de lógica: cambios no se guardan fuera de memoria.
- Design/UX: correcto.

## `/settings/profile`
- Propósito: tabs de perfil, empresa, dispositivos e integraciones.
- Datos/estado: hooks locales + `FileReader` para imágenes.
- Fallos de lógica: búsquedas de dispositivos simuladas; sin persistencia.
- Design/UX: correcto, pero tabs concentran mucha lógica local.

## `/settings/taxes`
- Propósito: CRUD de impuestos.
- Datos/estado: `mockTaxes` en memoria.
- Fallos de lógica: sin persistencia y sin validaciones avanzadas.
- Design/UX: correcto.

## Componentes de dominio (features)

## `components/features/staff-card.tsx`
- Propósito: card de personal con colores por rol y acciones rápidas.
- Lógica: usa `getRoleColors`; acciones con `window.location`.
- Deuda: dependencia directa a tel/mail; no abstrae acciones.

## `components/features/staff-card-pro.tsx`
- Propósito: card avanzada con fichaje y progreso de horas.
- Lógica: calcula progreso local; usa `MetodoFichaje`.
- Deuda: colores de métodos hardcodeados; falta tokens para iconos.

## `components/features/dynamic-qr-clock.tsx`
- Propósito: QR dinámico con countdown y offline queue.
- Lógica: genera token local; usa `navigator.onLine` y fullscreen.
- Deuda: simulación sin persistencia ni sync real.

## `components/features/whatsapp-login.tsx`
- Propósito: flujo QR/login WhatsApp.
- Lógica: pasos locales con timers; usa QR API externa.
- Deuda: sin validación real ni endpoints.

## `components/features/whatsapp-preview.tsx`
- Propósito: vista previa de conversación WhatsApp.
- Lógica: renderiza mensajes con estados de entrega.
- Deuda: colores hardcodeados (aceptable como excepción de marca).

## `components/features/role-dashboard.tsx`
- Propósito: dashboard por rol.
- Lógica: renderiza tareas y notificaciones locales.
- Deuda: datos mock, sin contrato de roles central.

## `components/features/schedule-manager.tsx`
- Propósito: gestión de horarios.
- Lógica: edición local y exportación simulada.
- Deuda: tipos abiertos y validación mínima.

## `components/features/editable-table.tsx`
- Propósito: tabla editable con confirmación modal.
- Lógica: `any` en columnas, valores y cambios.
- Deuda: tipado genérico incompleto.

## `components/features/export-modal.tsx`
- Propósito: seleccionar campos/formato para exportar.
- Lógica: UI completa; exportación delegada al caller.
- Deuda: sin contratos para fechas/formatos.

## `components/features/evolution-api-config.tsx`
- Propósito: configuración UI de Evolution API.
- Lógica: formulario local con estado controlado.
- Deuda: sin validación ni test de conexión real (UI-only).

## `components/features/dashboard/*`
- Propósito: KPIs y leaderboard de equipo.
- Lógica: cálculos simulados a partir de mocks.
- Deuda: algunos `any` en tooltips de gráficos.

## `components/features/reports/*`
- Propósito: reportes específicos (cliente/finanzas/inventario).
- Lógica: datos simulados y colores hardcodeados.
- Deuda: tokens de color de gráficas no centralizados.

## Widgets y layout

## `components/widgets/metric-card.tsx`
- Propósito: KPI sin iconos.
- Lógica: render simple; correcto para design system.

## `components/widgets/create-action-card.tsx`
- Propósito: CTA de creación en grids.
- Lógica: visual consistente; revisar uso en todas las vistas.

## `components/layout/page-header.tsx`
- Propósito: cabecera de página con `actions`.
- Lógica: API simple y extensible.

## `components/layout/sidebar-nav.tsx`
- Propósito: navegación lateral.
- Deuda: rutas placeholder para POS/KDS y flujos incompletos.

## Charts

## `components/charts/*`
- Propósito: gráficos con Recharts y dynamic import.
- Deuda: `chart-components.tsx` vacío; `any` en tooltips.

## Data, hooks y tipos

## `src/data/*`
- Propósito: mocks y catálogos base.
- Deuda: duplicación de entidades y colores hardcodeados.

## `src/hooks/*`
- Propósito: wrappers locales de datos (devices/environments/establishments).
- Deuda: sin capa de servicios ni contratos unificados.

## `src/types/fichaje.ts`
- Propósito: tipos de fichaje y dispositivos.
- Deuda: separar contratos UI vs backend cuando exista API.

