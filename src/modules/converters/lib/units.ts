/** Round to `precision` decimals and drop trailing zeros: 1.5000 → "1.5". */
export function formatNumber(n: number, precision = 4): string {
  if (!Number.isFinite(n)) return "";
  return String(Number(n.toFixed(precision)));
}

export function pxToRem(px: number, base = 16): number {
  return px / base;
}

export function remToPx(rem: number, base = 16): number {
  return rem * base;
}

/** Parse a user-typed number, accepting "24", "24px", "1.5rem", " 2 ". Null if not a number. */
export function parseNumber(input: string): number | null {
  const n = Number.parseFloat(input.trim());
  return Number.isFinite(n) ? n : null;
}

/** A small reference table around common UI sizes, as CSS comments. */
export function remScale(base = 16, sizes = [12, 14, 16, 18, 20, 24, 32, 40, 48, 64]): string {
  return sizes.map((px) => `${formatNumber(pxToRem(px, base))}rem /* ${px}px */`).join("\n");
}
