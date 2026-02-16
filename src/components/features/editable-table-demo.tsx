'use client';
import { H3 } from '@/components/ui/typography';

/**
 * Demo de EditableTable siguiendo el Design System
 * 
 * Este archivo muestra cómo usar EditableTable en diferentes contextos.
 * Para integrar en vistas existentes, copiar y adaptar estos ejemplos.
 */

import * as React from 'react';
import { EditableTable, createColumn, type EditableColumn, type EditableChange } from './editable-table';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Ejemplo 1: Tabla de Horas Trabajadas (para Reportes/Staff)
interface HorasTrabajadas {
  id: string;
  empleado: string;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  horasTotales: number;
  tipo: string;
}

const mockHorasTrabajadas: HorasTrabajadas[] = [
  { id: '1', empleado: 'Carlos M.', fecha: '2024-01-29', horaEntrada: '09:00', horaSalida: '17:00', horasTotales: 8, tipo: 'Regular' },
  { id: '2', empleado: 'Ana G.', fecha: '2024-01-29', horaEntrada: '10:00', horaSalida: '18:00', horasTotales: 8, tipo: 'Regular' },
  { id: '3', empleado: 'Luis P.', fecha: '2024-01-29', horaEntrada: '08:30', horaSalida: '20:30', horasTotales: 12, tipo: 'Extra' },
];

const horasColumns: EditableColumn<HorasTrabajadas>[] = [
  createColumn('empleado', 'Empleado', 'readonly'),
  createColumn('fecha', 'Fecha', 'date'),
  createColumn('horaEntrada', 'Entrada', 'time'),
  createColumn('horaSalida', 'Salida', 'time'),
  createColumn('horasTotales', 'Total', 'number'),
  createColumn('tipo', 'Tipo', 'select', {
    options: [
      { value: 'Regular', label: 'Regular' },
      { value: 'Extra', label: 'Extra' },
      { value: 'Festivo', label: 'Festivo' },
    ]
  }),
];

// Ejemplo 2: Tabla de Reservas Editable
interface ReservaEditable {
  id: string;
  cliente: string;
  telefono: string;
  comensales: number;
  hora: string;
  mesa: string;
  estado: string;
}

const mockReservas: ReservaEditable[] = [
  { id: '1', cliente: 'Carlos Sánchez', telefono: '600123456', comensales: 4, hora: '21:00', mesa: 'Mesa 5', estado: 'Confirmada' },
  { id: '2', cliente: 'Ana Martínez', telefono: '600654321', comensales: 2, hora: '21:30', mesa: 'Sin asignar', estado: 'Pendiente' },
  { id: '3', cliente: 'Luis García', telefono: '600789012', comensales: 6, hora: '22:00', mesa: 'Mesa 12', estado: 'Confirmada' },
];

const reservasColumns: EditableColumn<ReservaEditable>[] = [
  createColumn('cliente', 'Cliente', 'text'),
  createColumn('telefono', 'Teléfono', 'text'),
  createColumn('comensales', 'Comensales', 'number'),
  createColumn('hora', 'Hora', 'time'),
  createColumn('mesa', 'Mesa', 'text'),
  createColumn('estado', 'Estado', 'badge', {
    options: [
      { value: 'Pendiente', label: 'Pendiente' },
      { value: 'Confirmada', label: 'Confirmada' },
      { value: 'Cancelada', label: 'Cancelada' },
    ],
    badgeVariants: {
      'Pendiente': 'secondary',
      'Confirmada': 'default',
      'Cancelada': 'destructive' }
  }),
];

// Componente Demo
export function EditableTableDemo() {
  const { toast } = useToast();
  const [horas, setHoras] = React.useState(mockHorasTrabajadas);
  const [reservas, setReservas] = React.useState(mockReservas);

  const handleSaveHoras = async (changes: EditableChange[], reason?: string) => {
    // Aplicar cambios al estado local
    const updatedHoras = [...horas];
    changes.forEach(change => {
      const index = updatedHoras.findIndex(h => h.id === change.rowId);
      if (index !== -1) {
        (updatedHoras[index] as any)[change.field] = change.newValue;
      }
    });
    setHoras(updatedHoras);
    
    // Log para auditoría
    console.log('Cambios guardados en horas:', changes, 'Motivo:', reason);
  };

  const handleSaveReservas = async (changes: EditableChange[], reason?: string) => {
    const updatedReservas = [...reservas];
    changes.forEach(change => {
      const index = updatedReservas.findIndex(r => r.id === change.rowId);
      if (index !== -1) {
        (updatedReservas[index] as any)[change.field] = change.newValue;
      }
    });
    setReservas(updatedReservas);
    
    console.log('Cambios guardados en reservas:', changes, 'Motivo:', reason);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Demo 1: Horas Trabajadas */}
      <Card>
        <CardHeader>
          <H3 className="text-base font-bold text-muted-foreground">
            Ejemplo: Horas Trabajadas Editables
          </H3>
          <CardDescription>
            Doble clic en una celda para editar. Solo roles Encargado/Jefe pueden editar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditableTable
            data={horas}
            columns={horasColumns}
            editable={true}
            currentUserRole="encargado"
            onSave={handleSaveHoras}
            emptyMessage="No hay registros de horas"
          />
        </CardContent>
      </Card>

      {/* Demo 2: Reservas */}
      <Card>
        <CardHeader>
          <H3 className="text-base font-bold text-muted-foreground">
            Ejemplo: Reservas Editables
          </H3>
          <CardDescription>
            Las celdas modificadas se marcan en amarillo hasta guardar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditableTable
            data={reservas}
            columns={reservasColumns}
            editable={true}
            currentUserRole="admin"
            onSave={handleSaveReservas}
            emptyMessage="No hay reservas para este día"
          />
        </CardContent>
      </Card>
    </div>
  );
}

