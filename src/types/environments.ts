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
  shape?: 'rectangle' | 'round';
  rotation?: number;
  occupiedSince?: string;
  reservedFor?: string;
  reservedName?: string;
  maintenanceSince?: string;
  chairs?: {
    top: number[];
    bottom: number[];
    left: number[];
    right: number[];
    round?: number[];
  };
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
