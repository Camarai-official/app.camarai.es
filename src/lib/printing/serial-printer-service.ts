import type { SerialPrinterConfig } from './types';

export const CITAQ_H10_CONFIG: SerialPrinterConfig = {
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: 'hardware',
};

export class SerialPrinterService {
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter | null = null;

  async isSupported(): Promise<boolean> {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  async connect(config: SerialPrinterConfig = CITAQ_H10_CONFIG): Promise<void> {
    if (!await this.isSupported()) {
      throw new Error('Web Serial API no soportada en este navegador');
    }

    try {
      this.port = await navigator.serial.requestPort();
      
      await this.port.open({
        baudRate: config.baudRate,
        dataBits: config.dataBits,
        stopBits: config.stopBits,
        parity: config.parity,
        flowControl: config.flowControl,
      });

      this.writer = this.port.writable.getWriter();
    } catch (error) {
      throw new Error(`Error al conectar con la impresora: ${error}`);
    }
  }

  async print(data: Uint8Array): Promise<void> {
    if (!this.writer) {
      throw new Error('Impresora no conectada');
    }

    try {
      await this.writer.write(data);
    } catch (error) {
      throw new Error(`Error al imprimir: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.writer) {
      this.writer.releaseLock();
      this.writer = null;
    }

    if (this.port) {
      await this.port.close();
      this.port = null;
    }
  }

  isConnected(): boolean {
    return this.port !== null && this.writer !== null;
  }
}

export const printerService = new SerialPrinterService();
