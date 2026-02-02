# Guía de UX

## Para qué sirve este documento

Define reglas de experiencia y patrones de comportamiento para que todas las vistas
sean consistentes y predecibles. Debe usarse como checklist en cada iteración.

---

## Principios

1. **Reducir pasos**: Preferir acciones directas sobre modales extra.
2. **Mantener consistencia**: Mismos patrones y posiciones para acciones.
3. **Priorizar lectura**: Jerarquía clara y espacios amplios.
4. **WhatsApp-first**: El canal principal es WhatsApp, diseñar pensando en ello.

---

## Cabeceras y jerarquía

- Todas las vistas usan `PageHeader` como entrada visual.
- Títulos claros, accionables y consistentes.
- Sin iconos en títulos principales.
- Acciones secundarias van en `PageHeader.actions`.

---

## Listas y grids

- `CreateActionCard` **siempre al final** del grid/lista cuando haya CTA de creación.
- Filtros visibles (search + select) arriba a la derecha.
- Acciones por fila en menús (no botones dispersos).
- Empty states con acción principal visible.

---

## KPIs y métricas

- **Nunca con iconos** - usar `MetricCard`.
- Valor en `text-primary`.
- Badge para cambios porcentuales.
- Sin gradientes excesivos.

---

## Formularios

- Etiquetas siempre visibles.
- Mensajes de error cortos, en positivo cuando sea posible.
- Confirmaciones vía toast (no modales extra).
- Validación inline cuando sea posible.
- Colores y estados con tokens (evitar hex hardcodeado).

---

## Estados clave

| Estado | Comportamiento |
|--------|----------------|
| Loading | Skeleton o spinner corto, no bloquear toda la página |
| Empty | Explicar y ofrecer la acción principal |
| Error | Mensaje simple + opción de reintento |
| Success | Toast breve (no modal) |

---

## Tablas editables

- Edición inline (no abrir modal por cada campo).
- Confirmación modal antes de guardar cambios.
- Mostrar cambios pendientes visualmente.
- Permisos según rol (solo encargado/jefe pueden editar).

---

## Fichaje y control horario

- QR dinámico visible con countdown.
- Indicador de estado online/offline.
- Métodos de fichaje claros con iconos.
- Solicitudes de corrección con flujo simple.

---

## Integración WhatsApp

- Preview de mensajes antes de enviar.
- Botones de acción claros (Ver Menú, Reservar, etc).
- Estado de conexión visible (🟢 Online / 🔴 Offline).
- QR de mesa con opción de regenerar.

---

## Accesibilidad

| Requisito | Implementación |
|-----------|----------------|
| Contraste | AA mínimo en texto y fondos |
| Focus | Visible en botones y campos |
| Labels | En todos los inputs críticos |
| ARIA | En acciones y estados dinámicos |

---

## Checklist UX por vista

- [x] Cabecera consistente con `PageHeader`
- [ ] Acción "Crear" al final del grid/lista cuando aplica
- [ ] Estados vacíos y loading consistentes (pendiente de revisión global)
- [x] Acciones principales visibles sin scroll excesivo
- [ ] KPIs sin iconos (revisión pendiente en tarjetas informativas)
- [ ] Accesibilidad básica verificada (focus/labels/contraste)
- [x] Confirmaciones por toast (no modales extra)
- [ ] Colores por rol consistentes (pendiente de limpieza de hardcodeos)
