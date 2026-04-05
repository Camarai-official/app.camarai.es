import { ESCPosEncoder } from './escpos/encoder';
import type { TicketData } from './types';

export function buildThermalQRTicket(ticket: TicketData): Uint8Array {
  const encoder = new ESCPosEncoder();

  encoder.reset();

  encoder
    .align('center')
    .fontSize('normal')
    .bold(true)
    .text(ticket.establishmentName.toUpperCase())
    .newline(2);

  encoder
    .fontSize('normal')
    .bold(true)
    .text('TU PEOR Y MEJOR')
    .newline()
    .text('DECISION DEL DIA')
    .newline(2);

  encoder
    .bold(true)
    .text(`MESA [ ${ticket.mesaId} ] | #${ticket.orderId}`)
    .newline()
    .bold(false)
    .divider('=', 48)
    .newline();

  encoder
    .align('left')
    .fontSize('normal')
    .text('x2  Croquetas "No Hacemos Milagros"  9.00')
    .newline()
    .fontSize('normal')
    .text('    (pican, luego no llores)')
    .newline(2);

  encoder
    .text('x1  Jarra "Olvido de Jefe"          7.50')
    .newline()
    .text('    (cerveza artesana muy fria)')
    .newline(2);

  encoder
    .text('x1  Ensalada "Me Obligo"           11.00')
    .newline()
    .text('    (para disimular un poco)')
    .newline()
    .divider('=', 48);

  encoder
    .newline()
    .bold(true)
    .text('RECOMENDACIONES QUE NO HAS PEDIDO:')
    .newline()
    .bold(false)
    .text('-  Chuleton "Cura Lunes"          28.00')
    .newline()
    .text('-  Tiramisu "Se me fue la pinza"   8.50')
    .newline()
    .divider('=', 48)
    .newline();

  encoder
    .align('center')
    .text('Tu estomago nos lo agradecera.')
    .newline()
    .text('Tu cuenta corriente... ya veremos.')
    .newline(3)
    .divider('-', 48)
    .newline(2);

  encoder
    .bold(true)
    .fontSize('double')
    .text('CANSADO DE ESPERAR')
    .newline()
    .text('COMO UN REHEN?')
    .newline(2)
    .fontSize('normal')
    .bold(false)
    .text('Escanea y olvidate de los humanos')
    .newline()
    .text('(o al menos de nosotros)')
    .newline(3);

  encoder
    .align('center')
    .qrCode(ticket.qrUrl, 0x03)
    .newline(2)
    .bold(true)
    .text(`MESA ${ticket.mesaId}`)
    .newline(2)
    .bold(false);

  encoder
    .fontSize('large')
    .bold(true)
    .text('PIDE. PAGA. VETE.')
    .newline(2)
    .fontSize('normal')
    .text('SIN ESPERAS. SIN PERMISO.')
    .newline()
    .text('SIN DRAMAS. TODO DESDE AQUI.')
    .newline(3);

  encoder
    .divider('-', 48)
    .newline()
    .align('center')
    .fontSize('normal')
    .text(`Toma el control, Mesa [${ticket.mesaId}].`)
    .newline()
    .text('El camarero esta ocupado... de verdad.')
    .newline(4);

  encoder.cut(true);

  return encoder.getBuffer();
}

export function buildMultipleThermalTickets(tickets: TicketData[]): Uint8Array {
  const allBuffers: number[] = [];
  
  tickets.forEach((ticket, index) => {
    const ticketBuffer = buildThermalQRTicket(ticket);
    allBuffers.push(...Array.from(ticketBuffer));
    
    if (index < tickets.length - 1) {
      const spacer = new ESCPosEncoder();
      spacer.feed(3);
      allBuffers.push(...Array.from(spacer.getBuffer()));
    }
  });

  return new Uint8Array(allBuffers);
}
