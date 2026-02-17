'use client';

/**
 * EJEMPLO DE USO DEL COMPONENTE ActionTile
 * 
 * Este archivo muestra todos los casos de uso posibles del componente ActionTile.
 * Puedes copiar y pegar estos ejemplos en tu código.
 */

import * as React from 'react';
import { ActionTile } from '@/components/ui/action-tile';
import { 
  Bell, 
  Globe, 
  Shield, 
  Download, 
  Palette, 
  Database,
  Info,
  Settings,
  Moon,
  Wifi,
  Volume2,
  MoreVertical,
  Edit,
  Trash,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ActionTileExamples() {
  // Estados para los ejemplos interactivos
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [autoSave, setAutoSave] = React.useState(true);
  const [language, setLanguage] = React.useState('es');
  const [theme, setTheme] = React.useState('default');
  const [volume, setVolume] = React.useState('medium');

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">ActionTile - Ejemplos de Uso</h1>
      <p className="text-muted-foreground mb-8">
        Todos los ejemplos posibles del componente universal ActionTile
      </p>

      {/* SECCIÓN 1: SWITCH VARIANTS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">1. Switch (Toggle)</h2>
        <div className="space-y-3">
          <ActionTile
            icon={Bell}
            iconColor="#3b82f6"
            title="Notificaciones Push"
            description="Recibe alertas en tiempo real sobre nuevos pedidos y reservas"
            rightContentType="switch"
            switchId="push-notifications"
            switchChecked={notifications}
            onSwitchChange={setNotifications}
          />

          <ActionTile
            icon={Moon}
            iconColor="#8b5cf6"
            title="Modo Oscuro"
            description="Activa el tema oscuro para reducir la fatiga visual"
            rightContentType="switch"
            switchId="dark-mode"
            switchChecked={darkMode}
            onSwitchChange={setDarkMode}
          />

          <ActionTile
            icon={Settings}
            iconColor="#10b981"
            title="Guardado Automático"
            description="Guarda tus cambios automáticamente cada 30 segundos"
            rightContentType="switch"
            switchId="auto-save"
            switchChecked={autoSave}
            onSwitchChange={setAutoSave}
          />
        </div>
      </section>

      {/* SECCIÓN 2: BADGE VARIANTS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">2. Badge (Estado)</h2>
        <div className="space-y-3">
          <ActionTile
            icon={Shield}
            iconColor="green-500"
            title="Estado de Seguridad"
            description="Nivel de protección actual del sistema"
            rightContentType="badge"
            badgeText="Activo"
            badgeVariant="success"
          />

          <ActionTile
            icon={Wifi}
            iconColor="blue-500"
            title="Conexión a Internet"
            description="Estado de la conexión de red"
            rightContentType="badge"
            badgeText="Conectado"
            badgeVariant="completed"
          />

          <ActionTile
            icon={Database}
            iconColor="amber-500"
            title="Sincronización"
            description="Última sincronización hace 5 minutos"
            rightContentType="badge"
            badgeText="En Progreso"
            badgeVariant="in-progress"
          />
        </div>
      </section>

      {/* SECCIÓN 3: SELECT VARIANTS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">3. Select (Selector)</h2>
        <div className="space-y-3">
          <ActionTile
            icon={Globe}
            iconColor="#f59e0b"
            title="Idioma de la Interfaz"
            description="Selecciona tu idioma preferido para la aplicación"
            rightContentType="select"
            selectValue={language}
            onSelectChange={setLanguage}
            selectOptions={[
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'Français' },
              { value: 'de', label: 'Deutsch' }
            ]}
            selectPlaceholder="Seleccionar idioma"
          />

          <ActionTile
            icon={Palette}
            iconColor="#ec4899"
            title="Tema de Color"
            description="Personaliza la apariencia de la aplicación"
            rightContentType="select"
            selectValue={theme}
            onSelectChange={setTheme}
            selectOptions={[
              { value: 'default', label: 'Predeterminado' },
              { value: 'ocean', label: 'Océano' },
              { value: 'sunset', label: 'Atardecer' },
              { value: 'forest', label: 'Bosque' }
            ]}
          />

          <ActionTile
            icon={Volume2}
            iconColor="#06b6d4"
            title="Volumen de Notificaciones"
            description="Ajusta el volumen de las alertas sonoras"
            rightContentType="select"
            selectValue={volume}
            onSelectChange={setVolume}
            selectOptions={[
              { value: 'muted', label: 'Silenciado' },
              { value: 'low', label: 'Bajo' },
              { value: 'medium', label: 'Medio' },
              { value: 'high', label: 'Alto' }
            ]}
          />
        </div>
      </section>

      {/* SECCIÓN 4: DROPDOWN VARIANTS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">4. Dropdown (Menú de Acciones)</h2>
        <div className="space-y-3">
          <ActionTile
            icon={Database}
            iconColor="#8b5cf6"
            title="Base de Datos Principal"
            description="PostgreSQL 14.2 - 2.4 GB utilizados"
            rightContentType="dropdown"
            dropdownTrigger={
              <Button variant="ghost" size="md" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            dropdownItems={[
              {
                label: 'Ver Detalles',
                icon: <Eye className="mr-2 h-4 w-4" />,
                onClick: () => alert('Ver detalles de la base de datos')
              },
              {
                label: 'Editar Configuración',
                icon: <Edit className="mr-2 h-4 w-4" />,
                onClick: () => alert('Editar configuración')
              },
              {
                label: 'Eliminar',
                icon: <Trash className="mr-2 h-4 w-4 text-destructive" />,
                onClick: () => alert('Eliminar base de datos')
              }
            ]}
          />

          <ActionTile
            icon={Settings}
            iconColor="#f59e0b"
            title="Configuración Avanzada"
            description="Opciones de configuración del sistema"
            rightContentType="dropdown"
            dropdownItems={[
              {
                label: 'Restablecer',
                onClick: () => alert('Restablecer configuración')
              },
              {
                label: 'Exportar',
                onClick: () => alert('Exportar configuración')
              },
              {
                label: 'Importar',
                onClick: () => alert('Importar configuración')
              }
            ]}
          />
        </div>
      </section>

      {/* SECCIÓN 5: BUTTON VARIANTS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">5. Button (Botón de Acción)</h2>
        <div className="space-y-3">
          <ActionTile
            icon={Download}
            iconColor="#06b6d4"
            title="Exportar Datos Completos"
            description="Descarga todos tus datos en formato CSV"
            rightContentType="button"
            buttonText="Descargar"
            onButtonClick={() => alert('Descargando datos...')}
            buttonVariant="outline"
            buttonSize="sm"
            buttonIcon={<Download className="h-4 w-4" />}
          />

          <ActionTile
            icon={Database}
            iconColor="#10b981"
            title="Respaldar Base de Datos"
            description="Crea una copia de seguridad de toda la información"
            rightContentType="button"
            buttonText="Crear Respaldo"
            onButtonClick={() => alert('Creando respaldo...')}
            buttonVariant="default"
            buttonSize="sm"
          />

          <ActionTile
            icon={Trash}
            iconColor="#ef4444"
            title="Limpiar Caché"
            description="Elimina archivos temporales para liberar espacio"
            rightContentType="button"
            buttonText="Limpiar"
            onButtonClick={() => alert('Limpiando caché...')}
            buttonVariant="destructive"
            buttonSize="sm"
          />
        </div>
      </section>

      {/* SECCIÓN 6: CUSTOM VARIANTS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">6. Custom (Contenido Personalizado)</h2>
        <div className="space-y-3">
          <ActionTile
            icon={Palette}
            iconColor="#ec4899"
            title="Color Personalizado"
            description="Elige tu color favorito para el tema"
            rightContentType="custom"
            customContent={
              <div className="flex gap-2">
                <button className="h-6 w-6 rounded-full bg-blue-500 hover:scale-110 transition-transform" />
                <button className="h-6 w-6 rounded-full bg-red-500 hover:scale-110 transition-transform" />
                <button className="h-6 w-6 rounded-full bg-green-500 hover:scale-110 transition-transform" />
                <button className="h-6 w-6 rounded-full bg-purple-500 hover:scale-110 transition-transform" />
              </div>
            }
          />

          <ActionTile
            icon={Volume2}
            iconColor="#f59e0b"
            title="Control de Volumen"
            description="Ajusta el volumen con precisión"
            rightContentType="custom"
            customContent={
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="w-32"
              />
            }
          />
        </div>
      </section>

      {/* SECCIÓN 7: EMPTY VARIANTS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">7. Empty (Solo Información)</h2>
        <div className="space-y-3">
          <ActionTile
            icon={Info}
            iconColor="#6366f1"
            title="Información del Sistema"
            description="Versión 2.0.1 - Última actualización: 17 de febrero de 2026"
            rightContentType="empty"
          />

          <ActionTile
            icon={Shield}
            iconColor="green-500"
            title="Certificado SSL"
            description="Válido hasta: 31 de diciembre de 2026"
            rightContentType="empty"
          />

          <ActionTile
            icon={Database}
            iconColor="#8b5cf6"
            title="Espacio de Almacenamiento"
            description="2.4 GB de 10 GB utilizados (24%)"
            rightContentType="empty"
          />
        </div>
      </section>

      {/* NOTA FINAL */}
      <div className="mt-12 p-6 bg-muted/50 rounded-xl border">
        <h3 className="text-lg font-bold mb-2">💡 Nota Importante</h3>
        <p className="text-sm text-muted-foreground">
          Todos estos ejemplos no requieren ninguna clase CSS adicional. 
          El componente ActionTile incluye todo el estilo necesario internamente.
          Solo necesitas especificar las props y el componente se encarga del resto.
        </p>
      </div>
    </div>
  );
}
