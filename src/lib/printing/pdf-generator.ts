'use client';

import type { TicketData } from './types';
import { buildTicketStyles, buildTicketsBodyHtml } from './html-ticket-generator';

/**
 * Genera y descarga un PDF en formato A4 con las plantillas completas de
 * los tickets QR. Cada ticket ocupa una página completa centrada con
 * dos caras separadas por una línea de doblez en el centro exacto.
 */
export async function downloadTicketsPdf(
  tickets: TicketData[],
  filename = 'tickets-qr.pdf'
): Promise<void> {
  if (tickets.length === 0) return;

  // Importación dinámica para no penalizar el bundle inicial (SSR-safe)
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // ── 1. Inyectar fuente Space Mono ──────────────────────────────────────────
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href =
    'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap';
  document.head.appendChild(fontLink);

  // ── 2. Construir estilos adaptados a un contenedor A4 ─────────────────────
  // Un ticket centrado por página - eliminar reglas de @media print y @page
  let ticketStyles = buildTicketStyles();
  
  // Eliminar todo el bloque @media print (incluyendo contenido anidado)
  const mediaStart = ticketStyles.indexOf('@media print');
  if (mediaStart !== -1) {
    let braceCount = 0;
    let mediaEnd = mediaStart;
    let foundStart = false;
    
    for (let i = mediaStart; i < ticketStyles.length; i++) {
      if (ticketStyles[i] === '{') {
        braceCount++;
        foundStart = true;
      } else if (ticketStyles[i] === '}') {
        braceCount--;
        if (foundStart && braceCount === 0) {
          mediaEnd = i + 1;
          break;
        }
      }
    }
    
    ticketStyles = ticketStyles.substring(0, mediaStart) + ticketStyles.substring(mediaEnd);
  }
  
  // Eliminar @page
  ticketStyles = ticketStyles.replace(/@page[^}]+\}/g, '');

  const containerStyles = `
    .__ticket-pdf-root__ {
        font-family: 'Space Mono', monospace;
        background: #ffffff;
        color: #000000;
        width: 794px;
        height: 1123px;
        padding: 0;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
    }
    .__ticket-pdf-root__ * {
        color: #000000 !important;
    }
    .__ticket-pdf-root__ .ticket-container {
        width: 320px !important;
        height: 1051px !important;
        margin: 36px 0;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }
    .__ticket-pdf-root__ .ticket-side {
        height: 525px !important;
        flex-shrink: 0;
    }
    .__ticket-pdf-root__ .fold-separator {
        height: 1px !important;
        margin: 0 !important;
        flex-shrink: 0;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = '__ticket-pdf-styles__';
  styleEl.textContent = ticketStyles + containerStyles;
  document.head.appendChild(styleEl);

  // ── 3. Crear contenedor con un ticket por página A4 ──────────────────────
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const A4_W_MM = 210;
  const A4_H_MM = 297;

  // Procesar cada ticket individualmente
  for (let i = 0; i < tickets.length; i++) {
    let container: HTMLDivElement | null = null;
    
    try {
      if (i > 0) pdf.addPage();

      container = document.createElement('div');
      container.className = '__ticket-pdf-root__';
      container.style.cssText =
        'position:fixed;top:0;left:-9999px;z-index:-9999;';
      container.innerHTML = buildTicketsBodyHtml([tickets[i]]);
      document.body.appendChild(container);

      // ── 4. Esperar imágenes y fuentes ─────────────────────────────────────────
      const images = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
      console.log(`[PDF] Ticket ${i + 1}: Esperando ${images.length} imágenes...`);
      
      await Promise.all(
        images.map(
          (img, idx) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalHeight !== 0) {
                console.log(`[PDF] Imagen ${idx + 1} ya cargada:`, img.src.substring(0, 50));
                resolve();
              } else {
                img.onload = () => {
                  console.log(`[PDF] Imagen ${idx + 1} cargada:`, img.src.substring(0, 50));
                  resolve();
                };
                img.onerror = () => {
                  console.error(`[PDF] Error cargando imagen ${idx + 1}:`, img.src);
                  resolve();
                };
                setTimeout(() => {
                  console.warn(`[PDF] Timeout imagen ${idx + 1}`);
                  resolve();
                }, 10000);
              }
            })
        )
      );
      
      try { await document.fonts.ready; } catch { /* ignorar en navegadores sin soporte */ }
      console.log(`[PDF] Ticket ${i + 1}: Esperando renderizado final...`);
      await new Promise((r) => setTimeout(r, 1000));

      // ── 5. Capturar el ticket ──────────────────────────────────────────────
      console.log(`[PDF] Ticket ${i + 1}: Capturando canvas...`);
      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: true,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        imageTimeout: 15000,
        removeContainer: false,
      });

      // Validar que el canvas se generó correctamente
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas generado incorrectamente');
      }
      
      console.log(`[PDF] Ticket ${i + 1}: Canvas generado ${canvas.width}x${canvas.height}px`);

      // ── 6. Agregar la imagen al PDF ────────────────────────────────────────
      const imgData = canvas.toDataURL('image/jpeg', 0.93);
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM);

    } catch (error) {
      console.error(`Error procesando ticket ${i + 1}:`, error);
      if (i > 0 || pdf.getNumberOfPages() > 0) {
        pdf.addPage();
      }
      pdf.setFontSize(12);
      pdf.text(`Error generando ticket ${i + 1}`, 20, 20);
    } finally {
      // ── 7. Limpiar DOM ──────────────────────────────────────────────────────
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  }

  // ── 8. Limpiar estilos y descargar ────────────────────────────────────────
  document.head.removeChild(styleEl);
  document.head.removeChild(fontLink);

  pdf.save(filename);
}
