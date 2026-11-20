import { parse, wcagContrast } from "culori";

export interface ContrastResult {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  /** Icons, borders, focus rings (WCAG 1.4.11). */
  ui: boolean;
}

export function checkContrast(fg: string, bg: string): ContrastResult | null {
  const a = parse(fg.trim());
  const b = parse(bg.trim());
  if (!a || !b) return null;
  const ratio = Number(wcagContrast(a, b).toFixed(2));
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
    ui: ratio >= 3,
  };
}
