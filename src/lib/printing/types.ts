export interface TicketData {
  mesaId: string | number;
  orderId: string;
  qrUrl: string;
  logoUrl: string;
  establishmentName: string;
  environmentName: string;
}

export type PrintMode = 'thermal' | 'html';

export interface PrinterConfig {
  mode: PrintMode;
  thermalEnabled: boolean;
  htmlFallback: boolean;
}

export interface SerialPrinterConfig {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
  flowControl: 'none' | 'hardware';
}
