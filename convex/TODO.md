# TODO - Event Logs Pendientes de Implementar

## Eventos del MockData que necesitan vistas con Convex

### 1. Nueva Reserva (Booking)
- **Estado**: Pendiente - La vista de reservas no está integrada con Convex
- **MockData**: `{ id: '4', event: 'Nueva Reserva', actor: 'Laura Wilson', detail: 'Reserva para 4 personas (Mesa 12)', type: 'booking', time: '13:40', status: 'info', icon: Calendar }`
- **Acción requerida**: Implementar mutations de reservas en Convex y conectar con la vista existente
- **Implementación sugerida**:
  ```typescript
  // En archivo reservations.ts
  export const createReservation = mutation({
    args: {
      establishmentId: v.id("establishments"),
      customerName: v.string(),
      customerPhone: v.string(),
      peopleCount: v.number(),
      reservationDate: v.string(),
      reservationTime: v.string(),
      tableId: v.optional(v.id("tables")),
      notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      // Crear reserva
      // Registrar evento en event_log
      await ctx.db.insert("event_log", {
        establishment_id: args.establishmentId,
        type: "operational",
        level: "info",
        actor: "system",
        action: "Nueva Reserva",
        entity_type: "reservation",
        entity_id: reservationId,
        after: {
          customer_name: args.customerName,
          people_count: args.peopleCount,
          table_number: args.tableId ? `Mesa ${args.tableId}` : "Sin asignar",
          reservation_time: `${args.reservationDate} ${args.reservationTime}`
        },
        timestamp: Date.now(),
      });
    },
  });
  ```

### 2. Incidencia Fichaje (Staff Incidents)
- **Estado**: Pendiente - La vista de incidencias no está completamente integrada con Convex
- **MockData**: `{ id: '8', event: 'Incidencia Fichaje', actor: 'Marcos Soto', detail: 'Olvidó fichar salida ayer (20:00)', type: 'staff', time: '11:30', status: 'critical', icon: Clock }`
- **Acción requerida**: Integrar mutations de incidencias existentes con event_log
- **Implementación sugerida**:
  ```typescript
  // Actualizar createClockIncident en staff.ts
  export const createClockIncident = mutation({
    // ... args existentes
    handler: async (ctx, args) => {
      // ... código existente
      
      // Agregar registro en event_log
      await ctx.db.insert("event_log", {
        establishment_id: args.establishmentId,
        type: "operational", 
        level: "critical",
        actor: args.staffId,
        action: "Incidencia Fichaje",
        entity_type: "clock_incident",
        entity_id: incidentId,
        after: {
          incident_type: args.type,
          description: args.description,
          staff_name: staffName,
          incident_time: args.incidentTime || Date.now()
        },
        timestamp: Date.now(),
      });
    },
  });
  ```

## Vistas que necesitan integración con Convex

### 1. Sistema de Reservas
- **Ubicación**: `/reservas` (si existe) o crear nueva vista
- **Tablas necesarias**: `reservations` (posiblemente ya existe en schema)
- **Estado**: Revisar si ya existe implementación parcial

### 2. Sistema de Incidencias 
- **Ubicación**: Ya existe en `/personal` pero puede necesitar más integración
- **Tablas**: `clock_incidents` (ya existe)
- **Estado**: Parcialmente implementado, solo falta conectar con event_log

## Prioridades de Implementación

### Alta Prioridad
1. **Incidencias Fichaje** - Ya existe la mutations, solo falta conectar con event_log
2. **Reservas** - Esencial para el funcionamiento completo del restaurante

### Media Prioridad  
3. **Eventos de dispositivos de fichaje** - Cuando se implemente gestión de dispositivos
4. **Eventos de proveedores** - Cuando se implemente gestión de proveedores

## Notas de Implementación

- Todos los eventos deben usar el formato estándar de `event_log`
- Los niveles de severidad deben ser consistentes:
  - `info`: Eventos informativos normales
  - `warning`: Alertas que requieren atención
  - `critical`: Problemas urgentes
- El campo `actor` debe ser el ID del staff cuando sea aplicable, o "system" para eventos automáticos
- El campo `after` debe contener información relevante para mostrar en la UI

## Tests Requeridos

Una vez implementados, probar que los eventos aparezcan correctamente en `/notificaciones`:
1. Crear una reserva y verificar que aparezca en notificaciones
2. Crear una incidencia de fichaje y verificar que aparezca
3. Verificar que los detalles mostrados sean correctos y útiles
