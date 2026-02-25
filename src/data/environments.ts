import type { Environment, EnvironmentStatus, Table, TableStatus } from '@/types/environments';

export type { Environment, EnvironmentStatus, Table, TableStatus } from '@/types/environments';

export const calculateCapacity = (width: number, height: number): number => {
  const area = width * height;
  return Math.max(2, Math.floor(area / 6000));
};

const STABLE_NOW = new Date('2024-01-01T12:00:00Z').getTime();

const CHAIR_SPACING = 48;
const generateAllChairs = (width: number, height: number) => {
  const getIndices = (dim: number) => Array.from({ length: Math.floor(dim / CHAIR_SPACING) }, (_, i) => i);
  return {
    top: getIndices(width),
    bottom: getIndices(width),
    left: getIndices(height),
    right: getIndices(height),
  };
};

export const initialEnvironments: Environment[] = [
  {
    id: 'main-hall',
    name: 'Salón Principal',
    tables: [
      { id: 1, number: 1, x: 50, y: 50, width: 128, height: 96, capacity: calculateCapacity(128, 96), status: 'Ocupada', occupiedSince: new Date(STABLE_NOW - 45 * 60000).toISOString(), chairs: generateAllChairs(128, 96) },
      { id: 2, number: 2, x: 250, y: 80, width: 128, height: 96, capacity: calculateCapacity(128, 96), status: 'Libre', chairs: generateAllChairs(128, 96) },
      { id: 3, number: 3, x: 100, y: 200, width: 160, height: 96, capacity: calculateCapacity(160, 96), status: 'Reservada', reservedFor: new Date(STABLE_NOW + 30 * 60000).toISOString(), reservedName: 'García', chairs: generateAllChairs(160, 96) },
      { id: 4, number: 4, x: 350, y: 180, width: 128, height: 96, capacity: calculateCapacity(128, 96), status: 'Mantenimiento', maintenanceSince: new Date(STABLE_NOW - 120 * 60000).toISOString(), chairs: generateAllChairs(128, 96) },
    ],
    status: 'Abierto',
    icon: 'Utensils',
    color: 'blue-400',
  },
  {
    id: 'terrace',
    name: 'Terraza',
    tables: [
      { id: 5, number: 5, x: 50, y: 50, width: 128, height: 96, capacity: calculateCapacity(128, 96), status: 'Ocupada', occupiedSince: new Date(STABLE_NOW - 20 * 60000).toISOString(), chairs: generateAllChairs(128, 96) },
      { id: 6, number: 6, x: 250, y: 80, width: 128, height: 96, capacity: calculateCapacity(128, 96), status: 'Inactiva', chairs: generateAllChairs(128, 96) },
    ],
    status: 'Cerrado',
    icon: 'Sun',
    color: 'amber-500',
  },
  {
    id: 'bar',
    name: 'Barra',
    tables: [
      { id: 7, number: 7, x: 50, y: 50, width: 200, height: 80, capacity: calculateCapacity(200, 80), status: 'Ocupada', occupiedSince: new Date(STABLE_NOW - 65 * 60000).toISOString(), chairs: generateAllChairs(200, 80) },
      { id: 8, number: 8, x: 300, y: 50, width: 128, height: 96, capacity: calculateCapacity(128, 96), status: 'Libre', chairs: generateAllChairs(128, 96) },
    ],
    status: 'Abierto',
    icon: 'Beer',
    color: 'rose-500',
  },
];

export const mockEnvironments = initialEnvironments;
