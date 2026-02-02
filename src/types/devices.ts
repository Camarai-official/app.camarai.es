export type DeviceType = 'printer' | 'kds' | 'pos' | 'cash_register';
export type ConnectionMethod = 'wifi' | 'bluetooth' | 'cable';
export type DeviceRole = 'ticket' | 'kitchen' | 'control' | 'none';

export type Device = {
  id: string;
  name: string;
  model: string;
  type: DeviceType;
  connectionMethod: ConnectionMethod;
  ipAddress?: string;
  active: boolean;
  role?: DeviceRole;
  useForCashDrawer?: boolean;
  isControlPrinter?: boolean;
  printsKitchenTickets?: boolean;
  isMasterPrinter?: boolean;
  finalTicketCopies?: number;
  printsDeliveryTickets?: boolean;
};
