import { ROBOT_CAMARAI_SVG } from './assets/robot-camarai';
import type { TicketData } from './types';

export interface TicketHtmlOptions {
  /** Si es true (por defecto) lanza window.print() al cargar. false para exportar PDF. */
  autoPrint?: boolean;
}

// ---------------------------------------------------------------------------
// CSS compartido — exportado para reutilizarlo en el generador de PDF
// ---------------------------------------------------------------------------
export function buildTicketStyles(): string {
  return `
    @page { margin: 0; }

    body {
        font-family: 'Space Mono', monospace;
        color: #000000;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .ticket-container {
        width: 320px;
        height: 1051px;
        margin: 36px 0;
        box-sizing: border-box;
        page-break-inside: avoid;
        break-inside: avoid;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }

    .page-break {
        page-break-after: always;
        break-after: page;
    }

    .ticket-side {
        width: 100%;
        height: 525px;
        padding: 15px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }

    .side-1 {
        transform: rotate(180deg);
        transform-origin: center center;
    }

    .fold-separator {
        width: 100%;
        border-top: 1px solid #ccc;
        margin: 0;
        height: 1px;
        flex-shrink: 0;
    }

    h1, h2, h3, p { margin: 0; padding: 0; }
    .text-center { text-align: center; }
    .text-bold { font-weight: 700; }
    .text-sm { font-size: 11px; line-height: 1.3; }
    .text-md { font-size: 14px; line-height: 1.4; }
    .text-lg { font-size: 18px; line-height: 1.2; }
    .mb-1 { margin-bottom: 6px; }
    .mb-2 { margin-bottom: 12px; }
    .mb-3 { margin-bottom: 18px; }
    .mt-auto { margin-top: auto; }
    .mt-1 { margin-top: 6px; }
    .spacer { flex: 1; }

    .divider {
        border-bottom: 2px dashed #000;
        width: 100%;
        margin: 8px 0;
    }
    .divider-thick {
        border-bottom: 3px solid #000;
        width: 100%;
        margin: 10px 0;
    }

    .ticket-header, .ticket-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 8px;
    }
    .logo-img { width: 80px; height: auto; margin-bottom: 6px; }
    .logo-img-small { width: 40px; height: auto; margin-bottom: 3px; }
    .robot-svg { width: 45%; height: auto; max-width: 110px; }

    .order-list { width: 100%; }
    .order-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 4px;
        font-size: 12px;
    }
    .item-qty { width: 20px; font-weight: bold; }
    .item-name { flex: 1; padding-right: 10px; }
    .item-price { width: 45px; text-align: right; }
    .item-note {
        font-size: 10px;
        margin-left: 20px;
        margin-bottom: 10px;
        font-style: italic;
    }

    .qr-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0;
        min-height: 0;
        flex: 1;
    }
    .qr-wrapper {
        width: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .qr-code {
        width: 100%;
        aspect-ratio: 1;
        border: 4px solid #000;
        box-sizing: border-box;
    }

    @media print {
        @page {
            margin: 0;
            size: A4 portrait;
        }
        body { 
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .ticket-container { 
            height: 1051px;
            margin: 36px 0;
            page-break-inside: avoid;
            break-inside: avoid;
            display: flex;
            flex-direction: column;
        }
        .ticket-side {
            height: 525px !important;
            flex-shrink: 0;
        }
        .fold-separator {
            height: 1px !important;
            margin: 0 !important;
            flex-shrink: 0;
        }
        .page-break {
            page-break-after: always;
            break-after: page;
        }
    }
  `;
}

// ---------------------------------------------------------------------------
// HTML de los tickets sin el envoltorio de documento — exportado para PDF
// ---------------------------------------------------------------------------
export function buildTicketsBodyHtml(tickets: TicketData[]): string {
  return tickets
    .map(
      (ticket, index) => `
    <div class="ticket-container${index < tickets.length - 1 ? ' page-break' : ''}">

        <!-- CARA 1: COMANDA (ROTADA 180°) -->
        <div class="ticket-side side-1">

            <div class="ticket-header">
                <img src="${ticket.logoUrl}" class="logo-img" alt="Logo">
                <h1 class="text-lg text-bold">${ticket.establishmentName}</h1>
            </div>

            <p class="text-center text-md text-bold mb-2">
                TU PEOR Y MEJOR<br>DECISIÓN DEL DÍA
            </p>

            <div class="text-center text-sm mb-2" style="border: 1px solid #000; padding: 5px;">
                MESA [ <span class="text-bold text-md">${ticket.mesaId}</span> ] | #${ticket.orderId}
            </div>

            <div class="divider"></div>

            <div class="order-list">
                <div class="order-item">
                    <span class="item-qty">x2</span>
                    <span class="item-name">Croquetas "No Hacemos Milagros"</span>
                    <span class="item-price">9.00</span>
                </div>
                <div class="item-note">(pican, luego no llores)</div>

                <div class="order-item">
                    <span class="item-qty">x1</span>
                    <span class="item-name">Jarra "Olvido de Jefe"</span>
                    <span class="item-price">7.50</span>
                </div>
                <div class="item-note">(cerveza artesana muy fría)</div>

                <div class="order-item">
                    <span class="item-qty">x1</span>
                    <span class="item-name">Ensalada "Me Obligó"</span>
                    <span class="item-price">11.00</span>
                </div>
                <div class="item-note">(para disimular un poco)</div>
            </div>

            <div class="divider"></div>

            <p class="text-sm text-bold mb-1">RECOMENDACIONES QUE NO HAS PEDIDO:</p>

            <div class="order-list">
                <div class="order-item">
                    <span class="item-qty">-</span>
                    <span class="item-name">Chuletón "Cura Lunes"</span>
                    <span class="item-price">28.00</span>
                </div>
                <div class="order-item">
                    <span class="item-qty">-</span>
                    <span class="item-name">Tiramisú "Se me fue la pinza"</span>
                    <span class="item-price">8.50</span>
                </div>
            </div>

            <div class="spacer"></div>
            <div class="divider mt-auto"></div>

            <p class="text-center text-sm">
                Tu estómago nos lo agradecerá.<br>
                Tu cuenta corriente... ya veremos.
            </p>

        </div>

        <!-- Separador de doblez (sin texto) -->
        <div class="fold-separator"></div>

        <!-- CARA 2: ROBOT Y QR (NORMAL) -->
        <div class="ticket-side side-2">

            <p class="text-center text-md text-bold mb-2">
                ¿CANSADO DE ESPERAR<br>COMO UN REHÉN?
            </p>

            <p class="text-center text-sm mb-1">
                Escanea y olvídate de los humanos<br>(o al menos de nosotros).
            </p>

            <div class="qr-section">
                ${ROBOT_CAMARAI_SVG}
                <div class="qr-wrapper">
                    <img src="${ticket.qrUrl}" alt="QR Mesa ${ticket.mesaId}" class="qr-code">
                    <span class="text-sm mt-1 text-bold">MESA ${ticket.mesaId}</span>
                </div>
            </div>

            <p class="text-center text-lg text-bold mb-1">PIDE. PAGA. VETE.</p>

            <p class="text-center text-sm mb-2 text-bold">
                SIN ESPERAS. SIN PERMISO.<br>SIN DRAMAS. TODO DESDE AQUÍ.
            </p>

            <div class="divider mt-auto"></div>

            <div class="ticket-footer" style="margin-bottom: 0;">
                <img src="${ticket.logoUrl}" class="logo-img-small" alt="Logo">
                <p class="text-sm text-center">
                    Toma el control, Mesa [${ticket.mesaId}].<br>
                    El camarero está ocupado... de verdad.
                </p>
            </div>

        </div>

    </div>
    `
    )
    .join('');
}

// ---------------------------------------------------------------------------
// Documento HTML completo (para window.print() o nueva ventana)
// ---------------------------------------------------------------------------
export function generateTicketHtml(tickets: TicketData[], options: TicketHtmlOptions = {}): string {
  const { autoPrint = true } = options;

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tickets QR</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>${buildTicketStyles()}</style>
</head>
<body>
    ${buildTicketsBodyHtml(tickets)}
    <script>
        window.onload = function() {
            window.focus();
            ${autoPrint ? 'window.print();' : '/* autoPrint desactivado */'}
        };
    </script>
</body>
</html>`;
}
