/**
 * Tipos para el sistema de fichaje
 */

export type TipoIncidencia = 
  | 'entrada_tardia' 
  | 'salida_anticipada' 
  | 'olvido_fichaje' 
  | 'fichaje_duplicado' 
  | 'otro';

export type EstadoIncidencia = 'pendiente' | 'aprobada' | 'rechazada';

export type IncidenciaFichaje = {
  id: string;
  staffId: string;
  tipo: TipoIncidencia;
  fecha: string;
  hora: string;
  motivo?: string;
  estado: EstadoIncidencia;
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TipoDispositivo = 'tablet' | 'terminal' | 'movil';

export type EstadoDispositivo = 'online' | 'offline' | 'mantenimiento';

export type DispositivoFichaje = {
  id: string;
  nombre: string;
  tipo: TipoDispositivo;
  ubicacion?: string;
  intervalo_qr: number; // segundos (15-120)
  modo_offline: boolean;
  ultimo_heartbeat?: string;
  estado: EstadoDispositivo;
  establecimiento_id?: string;
};

export type MetodoFichaje = 'app' | 'whatsapp' | 'qr' | 'web';

// Mock data para incidencias
export const mockIncidencias: IncidenciaFichaje[] = [
  {
    id: 'inc-1',
    staffId: 'staff-1',
    tipo: 'entrada_tardia',
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:15',
    motivo: 'Tráfico intenso en la autopista',
    estado: 'pendiente',
  },
  {
    id: 'inc-2',
    staffId: 'staff-2',
    tipo: 'olvido_fichaje',
    fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    hora: '14:00',
    motivo: 'Olvidé fichar la salida',
    estado: 'aprobada',
  },
  {
    id: 'inc-3',
    staffId: 'staff-3',
    tipo: 'salida_anticipada',
    fecha: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    hora: '16:30',
    motivo: 'Cita médica',
    estado: 'aprobada',
  },
  {
    id: 'inc-4',
    staffId: 'staff-1',
    tipo: 'fichaje_duplicado',
    fecha: new Date().toISOString().split('T')[0],
    hora: '08:02',
    motivo: 'Sistema registró doble entrada',
    estado: 'pendiente',
  },
];

// Mock data para dispositivos
export const mockDispositivos: DispositivoFichaje[] = [
  {
    id: 'dev-1',
    nombre: 'Tablet Entrada Principal',
    tipo: 'tablet',
    ubicacion: 'Recepción',
    intervalo_qr: 30,
    modo_offline: true,
    ultimo_heartbeat: new Date().toISOString(),
    estado: 'online',
  },
  {
    id: 'dev-2',
    nombre: 'Terminal Cocina',
    tipo: 'terminal',
    ubicacion: 'Cocina',
    intervalo_qr: 60,
    modo_offline: false,
    ultimo_heartbeat: new Date(Date.now() - 300000).toISOString(),
    estado: 'online',
  },
  {
    id: 'dev-3',
    nombre: 'Tablet Terraza',
    tipo: 'tablet',
    ubicacion: 'Terraza',
    intervalo_qr: 30,
    modo_offline: true,
    ultimo_heartbeat: new Date(Date.now() - 3600000).toISOString(),
    estado: 'offline',
  },
];

// Labels para UI
export const tipoIncidenciaLabels: Record<TipoIncidencia, string> = {
  entrada_tardia: 'Entrada tardía',
  salida_anticipada: 'Salida anticipada',
  olvido_fichaje: 'Olvido de fichaje',
  fichaje_duplicado: 'Fichaje duplicado',
  otro: 'Otro',
};

export const estadoIncidenciaLabels: Record<EstadoIncidencia, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

export const tipoDispositivoLabels: Record<TipoDispositivo, string> = {
  tablet: 'Tablet',
  terminal: 'Terminal fijo',
  movil: 'Móvil',
};

export const estadoDispositivoLabels: Record<EstadoDispositivo, string> = {
  online: 'En línea',
  offline: 'Desconectado',
  mantenimiento: 'Mantenimiento',
};
