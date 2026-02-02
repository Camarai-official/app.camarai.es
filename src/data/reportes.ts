import type { Order, OrderDetailItem, OrderDetails } from '@/types/orders';
import type { ShiftLog, TimeReportEntry } from '@/types/staff';
import type { Movement } from '@/types/reports';

export type { Order, OrderDetailItem, OrderDetails } from '@/types/orders';
export type { ShiftLog, TimeReportEntry } from '@/types/staff';
export type { Movement } from '@/types/reports';

export const allOrders: Order[] = [
  { order: '42', time: '14:30', date: '2026-02-02', table: '07', name: 'Alice Smith', total: '\u20AC350', status: 'En Progreso' },
  { order: '18', time: '09:45', date: '2026-02-02', table: '12', name: 'Michael Johnson', total: '\u20AC150', status: 'Cancelado' },
  { order: '33', time: '11:15', date: '2026-02-02', table: '09', name: 'Emily Davis', total: '\u20AC500', status: 'Completado' },
  { order: '29', time: '16:00', date: '2026-02-02', table: '05', name: 'Chris Brown', total: '\u20AC250', status: 'Completado' },
  { order: '37', time: '13:00', date: '2026-02-02', table: '10', name: 'Sarah Wilson', total: '\u20AC400', status: 'Completado' },
  { order: '22', time: '17:30', date: '2026-02-02', table: '02', name: 'David Lee', total: '\u20AC600', status: 'Completado' },
  { order: '43', time: '14:35', date: '2026-02-02', table: '07', name: 'Jane Doe', total: '\u20AC320', status: 'En Progreso' },
  { order: '44', time: '15:00', date: '2026-02-02', table: '03', name: 'Laura White', total: '\u20AC120', status: 'Completado' },
  { order: '45', time: '18:00', date: '2026-02-02', table: '06', name: 'Peter Pan', total: '\u20AC120', status: 'Completado' },
  { order: '46', time: '19:00', date: '2026-02-02', table: '08', name: 'Bruce Wayne', total: '\u20AC120', status: 'Completado' },
];

export const mockReportOrderDetails: { [key: string]: OrderDetails } = {
  '42': { ...allOrders[0], items: [{ name: 'Solomillo de Ternera', quantity: 2, price: 28.00 }, { name: 'Ensalada César', quantity: 1, price: 14.50 }], subtotal: 70.50, tax: 14.81 },
  '18': { ...allOrders[1], items: [{ name: 'Café Expreso', quantity: 2, price: 1.80 }], subtotal: 3.60, tax: 0.76 },
  '33': { ...allOrders[2], items: [{ name: 'Paella de Mariscos (2 pers.)', quantity: 1, price: 38.00 }, { name: 'Agua Mineral', quantity: 2, price: 2.50 }], subtotal: 43.00, tax: 9.03 },
  '29': { ...allOrders[3], items: [{ name: 'Hamburguesa de Vacuno Clásica', quantity: 4, price: 14.50 }], subtotal: 58.00, tax: 12.18 },
};

export const mockStaffTotals = {
  'staff-1': { name: 'Laura García', regular: 160, extra: 8.5 },
  'staff-2': { name: 'Carlos Pérez', regular: 155, extra: 2 },
  'staff-3': { name: 'Ana Martínez', regular: 120, extra: 12 },
};

export const mockTimeReportData: TimeReportEntry[] = [
  { log: { id: 'log-mock-1', staffMemberId: 'staff-1', entrada: '2024-07-29T09:00:00Z', salida: '2024-07-29T17:30:00Z', duracion: 510 }, regularHours: 8, extraHours: 0.5 },
  { log: { id: 'log-mock-2', staffMemberId: 'staff-2', entrada: '2024-07-29T16:00:00Z', salida: '2024-07-30T00:15:00Z', duracion: 495 }, regularHours: 8, extraHours: 0.25 },
  { log: { id: 'log-mock-3', staffMemberId: 'staff-3', entrada: '2024-07-29T18:00:00Z', salida: '2024-07-30T00:00:00Z', duracion: 360 }, regularHours: 6, extraHours: 0 },
  { log: { id: 'log-mock-4', staffMemberId: 'staff-1', entrada: '2024-07-28T09:05:00Z', salida: '2024-07-28T17:00:00Z', duracion: 475 }, regularHours: 7.92, extraHours: 0 },
  { log: { id: 'log-mock-5', staffMemberId: 'staff-2', entrada: '2024-07-28T16:00:00Z', salida: '2024-07-28T23:30:00Z', duracion: 450 }, regularHours: 7.5, extraHours: 0 },
  { log: { id: 'log-mock-6', staffMemberId: 'staff-3', entrada: '2024-07-27T12:00:00Z', salida: '2024-07-27T18:00:00Z', duracion: 360 }, regularHours: 6, extraHours: 0 },
  { log: { id: 'log-mock-7', staffMemberId: 'staff-1', entrada: '2024-07-27T09:00:00Z', salida: '2024-07-27T18:00:00Z', duracion: 540 }, regularHours: 8, extraHours: 1 },
];

export const mockMovements: Movement[] = [
  { id: 'mov-1', concept: 'Total Ventas con Tarjeta', type: 'Ingreso', paymentMethod: 'Tarjeta', amount: 1625.25 },
  { id: 'mov-2', concept: 'Total Ventas en Efectivo', type: 'Ingreso', paymentMethod: 'Efectivo', amount: 1250.25 },
  { id: 'mov-3', concept: 'Retirada para pago proveedor', type: 'Gasto', paymentMethod: 'Efectivo', amount: -200.00 },
  { id: 'mov-4', concept: 'Ingreso cambio extra', type: 'Ingreso', paymentMethod: 'Efectivo', amount: 50.00 },
];
