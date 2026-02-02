# Restaurante SaaS UI - Camarero AI

## Para qué sirve este repositorio

Template UI completo para sistema de gestión de restaurantes con integración WhatsApp.
Incluye panel de administración, sistema de fichaje profesional, plano de mesas interactivo
y componentes reutilizables para handoff a backend.

**Arquitectura central**: WhatsApp como canal principal mediante Evolution API + n8n.

## Para quién es

- **Equipo frontend**: Base de UI, componentes y patrones consistentes.
- **Equipo backend**: Contratos de datos y estructura de integración.
- **Producto/UX**: Reglas de experiencia y consistencia visual.

## Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 14+ | App Router, SSR |
| React | 18+ | UI Components |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Estilos |
| shadcn/ui | latest | Componentes base |
| Recharts | 2+ | Gráficos |
| Lucide React | latest | Iconos |

## Alcance y límites

- **Solo frontend**. No hay backend, DB ni Convex.
- Datos mock en `src/data/`.
- La navegación y layout global ya están definidos.
- Integración WhatsApp preparada (UI + contratos).
 - POS y KDS son placeholders con configuración local.

## Arranque rápido

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Verificar linting |
| `npm run format` | Formatear código |
| `npm run typecheck` | Verificar tipos |

## Índice de documentación

| Documento | Descripción |
|-----------|-------------|
| `docs/AUDIT.md` | Auditoría técnica e inventario actual |
| `docs/COMPONENT_CATALOG.md` | Catálogo de componentes reutilizables |
| `docs/DESIGN_SYSTEM.md` | Tokens, colores y reglas visuales |
| `docs/STRUCTURE.md` | Estructura real del repo |
| `docs/VIEW_AUDIT.md` | Auditoría por vista y componentes |
| `docs/UX.md` | Guías UX, reglas de acciones y estados |
| `docs/WHATSAPP_ARCHITECTURE.md` | Arquitectura WhatsApp y flujos |
| `docs/OPTIMIZATION_TASKLIST.md` | Tasklist de optimización y QA |
| `docs/contracts/api-interfaces.ts` | Contrato de datos para backend |

## Vistas principales

| Ruta | Vista | Estado |
|------|-------|--------|
| `/` | Dashboard | Completo |
| `/plano-mesas` | Plano de mesas interactivo | Completo |
| `/comandas` | Gestión de comandas | Completo |
| `/reservas` | Calendario de reservas | Completo |
| `/personal` | Gestión de personal + fichaje | En desarrollo |
| `/carta` | Cartas y menús digitales | Completo |
| `/promociones` | Campañas WhatsApp | Completo |
| `/reportes` | Reportes y métricas | Completo |
| `/inventario` | Control de stock | Completo |
| `/settings` | Configuración del sistema | Completo |

## Roles del sistema

| Rol | Código | Descripción |
|-----|--------|-------------|
| Cliente | `customer` | Usuario final (pedidos vía WhatsApp) |
| Camarero | `waiter` | Personal de sala |
| Bartender | `bartender` | Personal de barra (acceso POS) |
| Cocinero | `cook` | Personal de cocina (acceso KDS) |
| Encargado | `manager` | Supervisor de turno |
| Jefe/Admin | `admin` | Acceso total |

## Handoff checklist

- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin errores
- [ ] `npm run typecheck` sin errores
- [ ] `docs/AUDIT.md` actualizado
- [ ] `docs/VIEW_AUDIT.md` actualizado
- [ ] Evolution API configurada
- [ ] Variables de entorno documentadas
- [ ] Contratos de datos revisados con backend
