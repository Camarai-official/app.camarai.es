export * from './types';

export * from './escpos/commands';
export { ESCPosEncoder } from './escpos/encoder';

export { buildThermalQRTicket, buildMultipleThermalTickets } from './thermal-ticket-builder';
export { generateTicketHtml, buildTicketStyles, buildTicketsBodyHtml } from './html-ticket-generator';
export { downloadTicketsPdf } from './pdf-generator';

export { SerialPrinterService, printerService, CITAQ_H10_CONFIG } from './serial-printer-service';

export { ROBOT_CAMARAI_SVG } from './assets/robot-camarai';
