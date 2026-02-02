# Catálogo de Componentes Reutilizables

## Para qué sirve este documento

Define los componentes reutilizables del sistema, sus props y reglas de uso.
Evita duplicados y mantiene consistencia visual en toda la aplicación.

---

## Widgets (`components/widgets/`)

### CreateActionCard

Tarjeta de acción para crear nuevos elementos. **Siempre al final del grid.**

```tsx
import { CreateActionCard } from '@/components/widgets/create-action-card';

<CreateActionCard
  label="Crear Nuevo Ambiente"
  onClick={handleAddEnvironment}
/>
```

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `label` | string | Sí | Texto visible y aria-label |
| `onClick` | function | No | Acción al crear |
| `className` | string | No | Clases adicionales |
| `icon` | ElementType | No | Icono (default: PlusCircle) |

### MetricCard

Tarjeta para mostrar KPIs. **Sin iconos.**

```tsx
import { MetricCard } from '@/components/widgets/metric-card';

<MetricCard
  title="Ventas Hoy"
  value="€1,234"
  change="+12%"
/>
```

### LowStockAlerts

Lista de alertas de stock bajo.

```tsx
import { LowStockAlerts } from '@/components/widgets/low-stock-alerts';

<LowStockAlerts items={lowStockItems} />
```

---

## Features (`components/features/`)

### WhatsAppPreview

Preview de mensajes WhatsApp para campañas y notificaciones.

```tsx
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';

<WhatsAppPreview
  businessName="Mi Restaurante"
  messages={[
    createWhatsAppMessage.text('¡Bienvenido! Escanea para ver el menú.'),
    createWhatsAppMessage.buttons('¿Qué deseas hacer?', [
      { id: 'menu', label: 'Ver menú' },
      { id: 'reservar', label: 'Reservar' },
    ]),
  ]}
/>
```

### EvolutionAPIConfigForm

Formulario de configuración de Evolution API.

```tsx
import { EvolutionAPIConfigForm } from '@/components/features/evolution-api-config';

<EvolutionAPIConfigForm
  config={config}
  onChange={setConfig}
  onSave={handleSaveConfig}
/>
```

### EditableTable

Tabla con edición inline y confirmación modal.

```tsx
import { EditableTable, createColumn } from '@/components/features/editable-table';

const columns = [
  createColumn('nombre', 'Nombre', 'text'),
  createColumn('email', 'Email', 'text'),
  createColumn('estado', 'Estado', 'badge', { options: ['Activo', 'Inactivo'] }),
];

<EditableTable
  data={staffData}
  columns={columns}
  onSave={handleSave}
  userRole="manager"
/>
```

### ScheduleManager

Gestión de horarios semanal/mensual con exportación.

```tsx
import { ScheduleManager } from '@/components/features/schedule-manager';

<ScheduleManager
  staffMembers={staff}
  initialSchedules={schedules}
  onSave={handleSaveSchedules}
/>
```

### StaffCard / StaffCardGrid

Tarjetas de empleado con colores por rol.

```tsx
import { StaffCard, StaffCardGrid } from '@/components/features/staff-card';

<StaffCardGrid>
  {staff.map(member => (
    <StaffCard
      key={member.id}
      staff={member}
      status={getStatus(member.id)}
      onEdit={() => handleEdit(member)}
    />
  ))}
</StaffCardGrid>
```

### StaffCardPro

Tarjeta avanzada para fichaje y seguimiento de horas (vista Personal).

```tsx
import { StaffCardPro } from '@/components/features/staff-card-pro';

<StaffCardPro
  staff={staffMember}
  status="active"
  onEdit={() => openEdit(staffMember)}
/>
```

### DynamicQRClock

QR dinámico para fichaje con countdown y modo offline.

```tsx
import { DynamicQRClock } from '@/components/features/dynamic-qr-clock';

<DynamicQRClock
  establecimientoId="est-001"
  establecimientoNombre="Restaurante Principal"
  intervaloSegundos={30}
/>
```

### WhatsAppLogin

Flujo de login/registro vía WhatsApp con QR.

```tsx
import { WhatsAppLogin } from '@/components/features/whatsapp-login';

<WhatsAppLogin
  restaurantName="Mi Restaurante"
  mode="employee"
  onLoginSuccess={handleLoginSuccess}
/>
```

### RoleDashboard

Panel personalizado según rol del usuario.

```tsx
import { RoleDashboard } from '@/components/features/role-dashboard';

<RoleDashboard
  role="waiter"
  userName="Juan"
  tasks={pendingTasks}
  notifications={notifications}
/>
```

### ExportModal

Modal para exportar datos en varios formatos.

```tsx
import { ExportModal } from '@/components/features/export-modal';

<ExportModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Exportar ventas"
  fields={[
    { id: 'total', label: 'Total', checked: true },
    { id: 'mesa', label: 'Mesa', checked: true },
  ]}
  showDateRange
  onExport={handleExport}
/>
```

---

## Layout (`components/layout/`)

### PageHeader

Cabecera principal de página. **Obligatorio en todas las vistas.**

```tsx
import { PageHeader } from '@/components/layout/page-header';

<PageHeader
  title="Gestión de Personal"
  actions={<Button variant="outline">Configurar</Button>}
/>
```

### SidebarNav

Navegación lateral del sistema.

### MobileHeader

Cabecera para vista móvil.

---

## Charts (`components/charts/`)

| Componente | Uso |
|------------|-----|
| `SalesChart` | Gráfico de ventas |
| `RevenueChart` | Gráfico de ingresos |
| `CategorySalesChart` | Ventas por categoría |
| `CostBreakdownChart` | Desglose de costes |
| `OccupancyChart` | Ocupación de mesas |
| `MonthlyRevenueChart` | Ingresos mensuales |

Todos usan `dynamic()` para carga diferida.

---

## Reglas de uso

### 1. CreateActionCard

- **Siempre al final** del grid/lista.
- No crear variantes locales.
- Si hay varias listas, cada una cierra con su CreateActionCard.

### 2. MetricCard

- **Nunca con iconos**.
- Valor en `text-primary`.
- Badge para cambios porcentuales.

### 3. EditableTable

- Requiere rol de usuario para permisos de edición.
- Confirmación modal antes de guardar.
- Soporta tipos: text, number, date, time, select, badge.

### 4. Colores por rol

Usar los colores definidos en `src/lib/role-colors.ts`:

```typescript
import { getRoleColors } from '@/lib/role-colors';

const roleStyles = getRoleColors(role);
```

---

## Checklist de consistencia

- [ ] `PageHeader` en todas las vistas
- [ ] `CreateActionCard` al final de cada grid
- [ ] `MetricCard` para KPIs (sin iconos)
- [ ] Colores por rol consistentes
- [ ] Componentes de features/ para lógica compleja
- [ ] No duplicar patrones existentes
