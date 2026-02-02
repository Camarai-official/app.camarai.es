# Sistema de Diseño

## Para qué sirve este documento

Centraliza los tokens visuales y las reglas de estilo. Es el contrato entre UI y
producto para mantener consistencia. Todo cambio de tokens debe reflejarse aquí.

## Fuente de verdad

- Tokens definidos en `src/app/globals.css`.
- Mapeo a Tailwind en `tailwind.config.js` (`colors.primary`, `colors.brand.*`, `colors.chart.*`).

## Dirección visual

- Limpio y funcional.
- Prioriza lectura rápida y estados claros.
- Evitar gradientes fuertes salvo en usos controlados.

## Tipografía

- **Inter** para todo el sistema.
- Evitar mezclar familias sin necesidad.

## Tokens de marca

| Token | Hex | Uso |
|-------|-----|-----|
| `--primary` | `#9B6EFD` | Acciones principales, valores destacados |
| `--brand-blue` | `#78A3ED` | Rol camarero, énfasis secundarios |
| `--brand-pink` | `#F0768C` | Destacados suaves |
| `--brand-yellow` | `#F7B731` | Alertas suaves, badges |
| `--brand-green` | `#4CAF50` | Estados positivos |
| `--brand-whatsapp` | `#25D366` | Integraciones WhatsApp |

## Tokens de gráficas

`--chart-1` a `--chart-5` en `src/app/globals.css` para Recharts y KPIs gráficos.

## Colores por rol (empleados)

Fuente: `src/lib/role-colors.ts`.

```tsx
import { getRoleColors } from '@/lib/role-colors';

const roleStyles = getRoleColors(rol);
return (
  <div className={`${roleStyles.bg} ${roleStyles.text} ${roleStyles.border}`} />
);
```

Regla: fondos sutiles al 10% y texto con el color base del rol.

## Reglas de KPIs y métricas

**IMPORTANTE: Los KPIs NUNCA llevan iconos.**

### Patrón correcto

```tsx
<Card className="border-none shadow-none rounded-lg p-4">
  <CardContent className="p-0">
    <p className="text-sm font-medium text-muted-foreground">Título</p>
    <p className="text-2xl font-bold text-primary mt-1">Valor</p>
    <Badge variant="secondary" className="text-xs mt-1">+12%</Badge>
  </CardContent>
</Card>
```

### Patrón incorrecto

```tsx
// NO HACER - KPIs con iconos
<Card>
  <TrendingUp className="h-5 w-5" />
  <p>Ventas</p>
  <p>€1,234</p>
</Card>
```

## Gradiente principal

- `brand-gradient-text` usa #78A3ED -> #9B6EFD -> #F0768C.
- Aplicar solo en elementos con ancho ajustado (`w-fit` o `inline-block`).
- Usar con moderación.

## PageHeader

Todas las vistas deben usar `PageHeader`. Acciones secundarias van en el slot
`actions` para consistencia de alineado.

## Estados de UI

| Estado | Estilo |
|--------|--------|
| Success | `bg-primary` o `text-primary` |
| Warning | `text-amber-600` (Tailwind) |
| Error | `bg-destructive` / `text-destructive` |
| Info | `text-brand-blue` |

## Reglas de consistencia

1. **Evitar hardcodear colores** fuera de tokens (`brand/*`, `primary`, `chart/*`).
2. **Evitar estilos inline** salvo datos dinámicos (ej: color elegido por usuario).
3. **Reusar componentes base** antes de crear variantes.
4. **KPIs sin iconos** - usar `MetricCard` o copiar su patrón.
5. **`CreateActionCard` al final** de grids cuando aplique.
6. **WhatsApp Preview** puede usar colores nativos de WhatsApp solo dentro del
   componente de preview.

## Checklist de diseño

- [ ] Colores usando tokens del sistema
- [ ] KPIs sin iconos
- [ ] `PageHeader` en todas las vistas
- [ ] `CreateActionCard` al final de grids
- [ ] Colores por rol centralizados en `role-colors`
