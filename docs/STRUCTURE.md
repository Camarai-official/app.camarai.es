# Estructura de Carpetas

## Para qué sirve este documento

Explica dónde vive cada pieza del proyecto y cómo escalar sin romper la jerarquía.
Sirve para que cualquier dev encuentre rápido pantallas, componentes y datos.

---

## Árbol completo

```
docs/
  AUDIT.md                    # Auditoría técnica y estado actual
  COMPONENT_CATALOG.md        # Catálogo de componentes reutilizables
  DESIGN_SYSTEM.md            # Tokens visuales y reglas de diseño
  OPTIMIZATION_TASKLIST.md    # Tasklist de optimización y QA
  README.md                   # Guía de entrada al repo
  STRUCTURE.md                # Este documento
  VIEW_AUDIT.md               # Auditoría por vista y componentes
  UX.md                       # Reglas UX y estados
  WHATSAPP_ARCHITECTURE.md    # Arquitectura WhatsApp y flujos
  contracts/
    api-interfaces.ts         # Contrato de datos para backend

.github/
  workflows/
    ci.yml                    # Pipeline básico (lint, typecheck, build, e2e)

.eslintrc.json                # Reglas de linting (ESLint)
.prettierrc.json              # Reglas de formato (Prettier)
next.config.js                # Config de Next.js
package.json                  # Scripts y dependencias
playwright.config.ts          # Configuración de Playwright
postcss.config.js             # Config de PostCSS
tailwind.config.js            # Config de Tailwind
tsconfig.json                 # Config de TypeScript

tests/
  smoke.spec.ts               # Smoke tests principales

public/
  ...                         # Assets estáticos

src/
  app/                        # Rutas y páginas (Next.js App Router)
    layout.tsx                # Layout raíz
    page.tsx                  # Dashboard principal
    globals.css               # Estilos globales y tokens
    
    ambientes/
      page.tsx                # Gestión de ambientes
    carta/
      page.tsx                # Cartas digitales
      [id]/
        page.tsx              # Detalle de menú
        edit/
          page.tsx            # Edición de menú
    categorias/
      page.tsx                # Gestión de categorías
    comandas/
      page.tsx                # Gestión de comandas
    ingredientes/
      page.tsx                # Gestión de ingredientes
    inventario/
      page.tsx                # Inventario y stock
    kds/
      page.tsx                # KDS (Kitchen Display System)
    personal/
      page.tsx                # Gestión de personal + fichaje
    plano-mesas/
      page.tsx                # Plano de mesas interactivo
    pos/
      page.tsx                # POS (Point of Sale)
    productos/
      page.tsx                # Productos
    promociones/
      page.tsx                # Promociones y campañas WhatsApp
    reportes/
      page.tsx                # Reportes y métricas
      _components/
        billing-tab.tsx
        cash-closing-tab.tsx
        inventory-tab.tsx
        movements-details-dialog.tsx
        order-details-dialog.tsx
        performance-tab.tsx
        staff-tab.tsx
    reservas/
      page.tsx                # Calendario de reservas
    settings/
      page.tsx                # Ajustes generales
      notifications/
        page.tsx              # Notificaciones
      profile/
        page.tsx              # Perfil y configuración
        _components/
          company-tab.tsx
          devices-tab.tsx
          establishment-tab.tsx
          integrations-tab.tsx
          profile-tab.tsx
          providers-tab.tsx
          taxes-tab.tsx
      taxes/
        page.tsx              # Impuestos

  components/
    charts/                   # Gráficos (Recharts)
      category-sales-chart.tsx
      chart-components.tsx
      cost-breakdown-chart.tsx
      monthly-revenue-chart.tsx
      occupancy-charts.tsx
      revenue-chart.tsx
      sales-chart.tsx
    
    features/                 # Componentes por dominio
      dynamic-qr-clock.tsx        # QR dinámico de fichaje
      dashboard/
        kpi-cards.tsx
        team-leaderboard.tsx
      reports/
        customer-reports.tsx
        financial-reports.tsx
        inventory-reports.tsx
      # Componentes reutilizables de features
      editable-table.tsx          # Tablas editables con confirmación
      editable-table-demo.tsx     # Demo de EditableTable
      evolution-api-config.tsx    # Config Evolution API
      export-modal.tsx            # Modal de exportación
      role-dashboard.tsx          # Dashboard por rol
      schedule-manager.tsx        # Gestión de horarios
      staff-card.tsx              # Cards de empleado
      staff-card-pro.tsx          # Cards de empleado (fichaje pro)
      whatsapp-login.tsx          # Login vía WhatsApp
      whatsapp-preview.tsx        # Preview de mensajes WhatsApp
    
    layout/                   # Layout global
      mobile-header.tsx
      page-header.tsx
      sidebar-nav.tsx
    
    ui/                       # Primitives (shadcn/ui)
      accordion.tsx
      alert.tsx
      alert-dialog.tsx
      avatar.tsx
      badge.tsx
      button.tsx
      calendar.tsx
      card.tsx
      carousel.tsx
      chart.tsx
      checkbox.tsx
      collapsible.tsx
      command.tsx
      dialog.tsx
      dropdown-menu.tsx
      form.tsx
      image-uploader.tsx
      input.tsx
      label.tsx
      menubar.tsx
      popover.tsx
      progress.tsx
      radio-group.tsx
      scroll-area.tsx
      select.tsx
      separator.tsx
      sheet.tsx
      sidebar.tsx
      skeleton.tsx
      slider.tsx
      switch.tsx
      table.tsx
      tabs.tsx
      textarea.tsx
      toast.tsx
      toaster.tsx
      tooltip.tsx
    
    widgets/                  # Bloques reutilizables
      create-action-card.tsx
      low-stock-alerts.tsx
      metric-card.tsx

  data/                       # Datos mock
    devices.ts
    environments.ts
    establishments.ts
    mock-data.ts
    reportes.ts

  hooks/                      # Hooks locales
    useEstablishments.ts
    useDevices.ts
    useEnvironments.ts
    use-mobile.ts
    use-toast.ts

  lib/                        # Helpers y utils
    role-colors.ts
    utils.ts

  types/
    fichaje.ts
```

---

## Reglas de ubicación

| Carpeta | Contenido |
|---------|-----------|
| `app/` | Solo composición de páginas y layout local |
| `components/ui/` | Primitives sin lógica de negocio |
| `components/features/` | Lógica y UI de un dominio concreto |
| `components/widgets/` | Bloques reutilizables (cards, alertas) |
| `components/charts/` | Gráficos (Recharts) |
| `components/layout/` | Layout y navegación |
| `data/` | Datos mock para demo |
| `hooks/` | Hooks personalizados |
| `lib/` | Utilidades y helpers |

---

## Convenciones

1. **Nombre de carpeta** = dominio (ej: `inventario`, `promociones`).
2. **Una página por ruta** con `page.tsx`.
3. **Componentes internos** en `_components/` dentro de la carpeta de la ruta.
4. **Componentes reutilizables** en `widgets/` o `features/` antes de crear duplicados.
5. **Gráficos** siempre con `dynamic()` para carga diferida.

---

## Nuevos componentes (features/)

| Componente | Descripción |
|------------|-------------|
| `dynamic-qr-clock.tsx` | QR dinámico de fichaje |
| `editable-table.tsx` | Tablas con edición inline + confirmación |
| `schedule-manager.tsx` | Gestión de horarios semanal/mensual |
| `staff-card.tsx` | Cards de empleado con colores por rol |
| `staff-card-pro.tsx` | Cards de empleado (fichaje pro) |
| `whatsapp-login.tsx` | Flujo de login vía WhatsApp QR |
| `role-dashboard.tsx` | Dashboard personalizado por rol |
| `whatsapp-preview.tsx` | Preview de mensajes WhatsApp |
| `evolution-api-config.tsx` | Configuración de Evolution API |
| `export-modal.tsx` | Modal para exportar datos |
