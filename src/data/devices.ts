import type { ConnectionMethod, Device, DeviceRole, DeviceType } from '@/types/devices';

export type { ConnectionMethod, Device, DeviceRole, DeviceType } from '@/types/devices';

export const initialDevices: Device[] = [
  {
    id: 'printer-1',
    name: 'Impresora de Barra',
    model: 'Epson TM-T20III',
    type: 'printer',
    connectionMethod: 'wifi',
    ipAddress: '192.168.1.101',
    active: true,
    role: 'ticket',
    useForCashDrawer: true,
    isControlPrinter: false,
    printsKitchenTickets: true,
    isMasterPrinter: true,
    finalTicketCopies: 2,
    printsDeliveryTickets: true,
  },
  {
    id: 'kds-1',
    name: 'KDS Cocina',
    model: 'Generic 15\" KDS',
    type: 'kds',
    connectionMethod: 'cable',
    active: true,
  },
];
