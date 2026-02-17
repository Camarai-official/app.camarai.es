# SettingRow Component - Guía de Uso

El componente `SettingRow` es un componente universal y flexible para crear filas de configuración en toda la aplicación. Todo el estilo está incluido, no necesitas agregar clases CSS.

## Importación

```tsx
import { SettingRow } from '@/components/ui/settings-modal';
// o
import { SettingRow } from '@/components/ui/setting-row';
```

## Estructura

**Lado Izquierdo:**
- Icono (con color opcional)
- Título
- Descripción (opcional)

**Lado Derecho (7 variantes):**
1. `switch` - Switch/Toggle
2. `badge` - Badge de estado
3. `select` - Selector dropdown
4. `dropdown` - Menú dropdown con acciones
5. `button` - Botón de acción
6. `custom` - Contenido personalizado
7. `empty` - Sin contenido (solo título e icono)

---

## Ejemplos de Uso

### 1. Switch (Toggle)

```tsx
import { Settings } from 'lucide-react';

<SettingRow
  icon={Settings}
  iconColor="#3b82f6"
  title="Notificaciones Push"
  description="Recibe alertas en tiempo real"
  rightContentType="switch"
  switchId="push-notifications"
  switchChecked={isPushEnabled}
  onSwitchChange={setIsPushEnabled}
/>
```

### 2. Badge (Estado)

```tsx
import { Shield } from 'lucide-react';

<SettingRow
  icon={Shield}
  iconColor="green-500"
  title="Estado de Seguridad"
  description="Nivel de protección actual"
  rightContentType="badge"
  badgeText="Activo"
  badgeVariant="success"
/>
```

### 3. Select (Selector)

```tsx
import { Globe } from 'lucide-react';

<SettingRow
  icon={Globe}
  iconColor="#f59e0b"
  title="Idioma"
  description="Selecciona tu idioma preferido"
  rightContentType="select"
  selectValue={language}
  onSelectChange={setLanguage}
  selectOptions={[
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' }
  ]}
  selectPlaceholder="Seleccionar idioma"
/>
```

### 4. Dropdown (Menú de Acciones)

```tsx
import { MoreVertical, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

<SettingRow
  icon={Database}
  iconColor="#8b5cf6"
  title="Base de Datos"
  description="Gestiona tu información"
  rightContentType="dropdown"
  dropdownTrigger={
    <Button variant="ghost" size="md" className="h-8 w-8">
      <MoreVertical className="h-4 w-4" />
    </Button>
  }
  dropdownItems={[
    {
      label: 'Editar',
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: () => console.log('Editar')
    },
    {
      label: 'Eliminar',
      icon: <Trash className="mr-2 h-4 w-4" />,
      onClick: () => console.log('Eliminar')
    }
  ]}
/>
```

### 5. Button (Botón de Acción)

```tsx
import { Download } from 'lucide-react';

<SettingRow
  icon={Download}
  iconColor="#06b6d4"
  title="Exportar Datos"
  description="Descarga tu información"
  rightContentType="button"
  buttonText="Descargar"
  onButtonClick={() => handleExport()}
  buttonVariant="outline"
  buttonSize="sm"
  buttonIcon={<Download className="h-4 w-4" />}
/>
```

### 6. Custom (Contenido Personalizado)

```tsx
import { Palette } from 'lucide-react';

<SettingRow
  icon={Palette}
  iconColor="#ec4899"
  title="Color del Tema"
  description="Personaliza tu experiencia"
  rightContentType="custom"
  customContent={
    <div className="flex gap-2">
      <button className="h-6 w-6 rounded-full bg-blue-500" />
      <button className="h-6 w-6 rounded-full bg-red-500" />
      <button className="h-6 w-6 rounded-full bg-green-500" />
    </div>
  }
/>
```

### 7. Empty (Solo Información)

```tsx
import { Info } from 'lucide-react';

<SettingRow
  icon={Info}
  iconColor="#6366f1"
  title="Información del Sistema"
  description="Versión 2.0.1 - Última actualización: 17/02/2026"
  rightContentType="empty"
/>
```

---

## Props Comunes

| Prop | Tipo | Descripción |
|------|------|-------------|
| `icon` | `React.ElementType \| React.ReactNode` | Icono de Lucide o cualquier componente React |
| `iconColor` | `string` | Color del icono (hex: `"#3b82f6"` o tailwind: `"blue-500"`) |
| `title` | `React.ReactNode` | Título principal (requerido) |
| `description` | `React.ReactNode` | Texto descriptivo opcional |
| `rightContentType` | `'switch' \| 'badge' \| 'select' \| 'dropdown' \| 'button' \| 'custom' \| 'empty'` | Tipo de contenido del lado derecho |
| `disabled` | `boolean` | Deshabilita toda la fila |
| `onClick` | `() => void` | Handler para click en toda la fila |
| `className` | `string` | Clases CSS adicionales (usar con moderación) |

---

## Props Específicas por Variante

### Switch
- `switchId`: string (requerido)
- `switchChecked`: boolean (requerido)
- `onSwitchChange`: (checked: boolean) => void (requerido)

### Badge
- `badgeText`: string (requerido)
- `badgeVariant`: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | etc.

### Select
- `selectValue`: string (requerido)
- `onSelectChange`: (value: string) => void (requerido)
- `selectOptions`: { value: string; label: string }[] (requerido)
- `selectPlaceholder`: string

### Dropdown
- `dropdownTrigger`: React.ReactNode
- `dropdownItems`: { label: string; onClick: () => void; icon?: React.ReactNode }[] (requerido)

### Button
- `buttonText`: string (requerido)
- `onButtonClick`: () => void (requerido)
- `buttonVariant`: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'brand'
- `buttonSize`: 'sm' | 'md'
- `buttonIcon`: React.ReactNode

### Custom
- `customContent`: React.ReactNode (requerido)

---

## Ejemplo Completo en una Página

```tsx
'use client';

import { SettingRow } from '@/components/ui/settings-modal';
import { Bell, Globe, Shield, Download, Palette } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('es');

  return (
    <div className="space-y-3 p-6">
      <SettingRow
        icon={Bell}
        iconColor="#3b82f6"
        title="Notificaciones"
        description="Recibe alertas en tiempo real"
        rightContentType="switch"
        switchId="notifications"
        switchChecked={notifications}
        onSwitchChange={setNotifications}
      />

      <SettingRow
        icon={Globe}
        iconColor="#f59e0b"
        title="Idioma"
        description="Selecciona tu idioma preferido"
        rightContentType="select"
        selectValue={language}
        onSelectChange={setLanguage}
        selectOptions={[
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'English' }
        ]}
      />

      <SettingRow
        icon={Shield}
        iconColor="green-500"
        title="Seguridad"
        description="Estado de protección"
        rightContentType="badge"
        badgeText="Activo"
        badgeVariant="success"
      />

      <SettingRow
        icon={Download}
        iconColor="#06b6d4"
        title="Exportar Datos"
        rightContentType="button"
        buttonText="Descargar"
        onButtonClick={() => alert('Descargando...')}
        buttonVariant="outline"
      />
    </div>
  );
}
```

---

## Ventajas

✅ **Sin clases CSS necesarias** - Todo el estilo está incluido
✅ **Totalmente tipado** - TypeScript te guiará con autocompletado
✅ **Flexible** - 7 variantes diferentes para cualquier caso de uso
✅ **Consistente** - Mismo diseño en toda la aplicación
✅ **Fácil de usar** - Solo props, sin configuración compleja
✅ **Responsive** - Funciona perfectamente en móvil y desktop
✅ **Accesible** - Incluye aria-labels y semántica correcta

---

## Notas Importantes

1. **No uses `className`** a menos que sea absolutamente necesario. Todo el estilo ya está incluido.
2. **El color del icono** puede ser hex (`"#3b82f6"`) o nombre de Tailwind (`"blue-500"`).
3. **TypeScript te ayudará** - Si usas `rightContentType="switch"`, automáticamente te pedirá las props de switch.
4. **Combina con SettingsModal** - Este componente funciona perfectamente dentro de `SettingsModal` para crear interfaces de configuración completas.
