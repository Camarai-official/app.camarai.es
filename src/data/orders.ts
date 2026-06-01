import type { Order, OrderDetailItem } from '@/types/orders';

export type { Order, OrderDetailItem } from '@/types/orders';

export const mockOrders: Order[] = [
  { order: '42', time: '14:30', date: '2026-05-27', table: 'T1', name: 'Alice Smith', total: '\u20ac70.50', status: 'En Progreso' },
  { order: '18', time: '09:45', date: '2026-05-26', table: 'T2', name: 'Michael Johnson', total: '\u20ac18.00', status: 'Cancelado' },
  { order: '33', time: '11:15', date: '2026-05-25', table: 'T3', name: 'Emily Davis', total: '\u20ac43.00', status: 'Completado' },
  { order: '29', time: '16:00', date: '2026-05-24', table: 'T4', name: 'Chris Brown', total: '\u20ac14.50', status: 'Completado' },
  { order: '37', time: '13:00', date: '2026-05-22', table: 'T5', name: 'Sarah Wilson', total: '\u20ac40.00', status: 'Completado' },
] as any as Order[];

export type OrderProduct = {
  id: string;
  name: string;
  price: number;
};

export const mockOrderDetails: Record<string, OrderDetailItem[]> = {
  '42': [
    { name: 'Solomillo de Ternera', quantity: 2, price: 28.0 },
    { name: 'Ensalada César', quantity: 1, price: 14.5 },
  ],
  '18': [{ name: 'Café Expreso', quantity: 2, price: 1.8 }],
  '33': [
    { name: 'Paella de Mariscos (2 pers.)', quantity: 1, price: 38.0 },
    { name: 'Agua Mineral', quantity: 2, price: 2.5 },
  ],
  '29': [{ name: 'Hamburguesa de Vacuno Clásica', quantity: 4, price: 14.5 }],
};

export const mockOrderProducts: OrderProduct[] = [
  { id: 'p1', name: 'Hamburguesa Clásica', price: 14.5 },
  { id: 'p2', name: 'Ensalada César', price: 12.0 },
  { id: 'p3', name: 'Solomillo de Ternera', price: 28.0 },
  { id: 'p4', name: 'Paella de Mariscos', price: 38.0 },
  { id: 'p5', name: 'Café Expreso', price: 1.8 },
  { id: 'p6', name: 'Agua Mineral', price: 2.5 },
  { id: 'p7', name: 'Copa de Vino', price: 5.0 },
  { id: 'p8', name: 'Postre del Día', price: 6.5 },
];

export const mockOrderTables = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'Barra 1', 'Barra 2', 'Terraza 1', 'Terraza 2',
];
