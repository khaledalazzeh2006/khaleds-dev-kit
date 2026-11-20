import {
  converter,
  formatHex,
  formatHex8,
  formatHsl,
  formatRgb,
  parse,
  wcagContrast,
  type Color,
} from "culori";

const toOklch = converter("oklch");
const round = (n: number | undefined, d: number) => Number((n ?? 0).toFixed(d));

export interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  /** Contrast ratio against white and black text (WCAG 2). */
  contrast: { white: number; black: number };
}

/** Parse any CSS color (hex, rgb(), hsl(), oklch(), names) into every common format. Null if invalid. */
export function convertColor(input: string): ColorFormats | null {
  const color: Color | undefined = parse(input.trim());
  if (!color) return null;
  const alpha = color.alpha ?? 1;
  const ok = toOklch(color);
  const a = alpha < 1 ? ` / ${round(alpha, 2)}` : "";
  return {
    hex: alpha < 1 ? formatHex8(color) : formatHex(color),
    rgb: formatRgb(color),
    hsl: formatHsl(color),
    oklch: `oklch(${round(ok.l, 3)} ${round(ok.c, 3)} ${round(ok.h, 1)}${a})`,
    contrast: {
      white: round(wcagContrast(color, "#ffffff"), 2),
      black: round(wcagContrast(color, "#000000"), 2),
    },
  };
}

/** WCAG level for normal text. */
export function contrastLevel(ratio: number): "AAA" | "AA" | "Fail" {
  return ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "Fail";
}
