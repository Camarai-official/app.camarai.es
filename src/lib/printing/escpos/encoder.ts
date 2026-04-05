import * as CMD from './commands';

export class ESCPosEncoder {
  private buffer: number[] = [];

  reset(): this {
    this.buffer.push(...CMD.INIT_PRINTER);
    return this;
  }

  text(str: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    this.buffer.push(...Array.from(bytes));
    return this;
  }

  newline(count = 1): this {
    for (let i = 0; i < count; i++) {
      this.buffer.push(CMD.LF);
    }
    return this;
  }

  bold(enabled: boolean): this {
    this.buffer.push(...(enabled ? CMD.BOLD_ON : CMD.BOLD_OFF));
    return this;
  }

  align(alignment: 'left' | 'center' | 'right'): this {
    const cmd = alignment === 'left' ? CMD.ALIGN_LEFT :
                alignment === 'center' ? CMD.ALIGN_CENTER :
                CMD.ALIGN_RIGHT;
    this.buffer.push(...cmd);
    return this;
  }

  fontSize(size: 'normal' | 'double' | 'large'): this {
    const cmd = size === 'normal' ? CMD.FONT_SIZE_NORMAL :
                size === 'double' ? CMD.FONT_SIZE_DOUBLE :
                CMD.FONT_SIZE_LARGE;
    this.buffer.push(...cmd);
    return this;
  }

  qrCode(data: string, errorCorrection = 0x03): this {
    this.buffer.push(...CMD.generateQRCommand(data, errorCorrection));
    return this;
  }

  feed(lines: number): this {
    this.buffer.push(...CMD.feedLines(lines));
    return this;
  }

  cut(full = true): this {
    this.buffer.push(...(full ? CMD.CUT_FULL : CMD.CUT_PARTIAL));
    return this;
  }

  divider(char = '-', width = 48): this {
    this.text(char.repeat(width));
    this.newline();
    return this;
  }

  getBuffer(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  clear(): this {
    this.buffer = [];
    return this;
  }
}
