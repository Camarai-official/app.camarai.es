export const ESC = 0x1b;
export const GS = 0x1d;
export const LF = 0x0a;
export const CR = 0x0d;

export const INIT_PRINTER = [ESC, 0x40];

export const BOLD_ON = [ESC, 0x45, 0x01];
export const BOLD_OFF = [ESC, 0x45, 0x00];

export const ALIGN_LEFT = [ESC, 0x61, 0x00];
export const ALIGN_CENTER = [ESC, 0x61, 0x01];
export const ALIGN_RIGHT = [ESC, 0x61, 0x02];

export const FONT_SIZE_NORMAL = [GS, 0x21, 0x00];
export const FONT_SIZE_DOUBLE = [GS, 0x21, 0x11];
export const FONT_SIZE_LARGE = [GS, 0x21, 0x22];

export function generateQRCommand(data: string, errorCorrection = 0x03): number[] {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const length = dataBytes.length;
  return [
    ESC, 0x51, 0x52,
    errorCorrection,
    (length >> 8) & 0xff,
    length & 0xff,
    ...Array.from(dataBytes)
  ];
}

export const CUT_FULL = [GS, 0x56, 0x42, 0x00];
export const CUT_PARTIAL = [GS, 0x56, 0x42, 0x01];

export const BUZZER_ON = [0x1F, ESC, 0x1F, 0x50, 0x40];
export const BUZZER_OFF = [0x1F, ESC, 0x1F, 0x50, 0x42];

export function feedLines(lines: number): number[] {
  return [ESC, 0x64, lines];
}
