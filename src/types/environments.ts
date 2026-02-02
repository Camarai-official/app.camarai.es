export type TableStatus = 'Libre' | 'Ocupada' | 'Reservada' | 'Mantenimiento' | 'Inactiva';

export type Table = {
  id: number;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  status: TableStatus;
  occupiedSince?: string;
  reservedFor?: string;
  reservedName?: string;
  maintenanceSince?: string;
};

export type EnvironmentStatus = 'Abierto' | 'Cerrado';

export type Environment = {
  id: string;
  name: string;
  tables: Table[];
  status: EnvironmentStatus;
  icon: string;
  color: string;
};
