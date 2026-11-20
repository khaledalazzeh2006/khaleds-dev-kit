// Fluid (clamp) sizing shared by Design (type scale) and Responsive (clamp generator).

/** px → rem string, e.g. 24 → "1.5rem". */
export const rem = (px: number, base = 16) => `${Number((px / base).toFixed(4))}rem`;

/**
 * Fluid value with clamp(): `min` at `minVw` viewport width, growing linearly to `max` at `maxVw`.
 * Sizes in px, output in rem + vw (so it still respects the user's font-size setting).
 */
export function fluidClamp(minPx: number, maxPx: number, minVw = 360, maxVw = 1280): string {
  if (minPx === maxPx) return rem(minPx);
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const intercept = minPx - slope * minVw;
  const vw = Number((slope * 100).toFixed(4));
  const lo = Math.min(minPx, maxPx);
  const hi = Math.max(minPx, maxPx);
  return `clamp(${rem(lo)}, ${rem(intercept)} + ${vw}vw, ${rem(hi)})`;
}

/** The value fluidClamp() resolves to at a given viewport width (px), for previews. */
export function fluidValueAt(
  minPx: number,
  maxPx: number,
  minVw: number,
  maxVw: number,
  viewport: number,
): number {
  const lo = Math.min(minPx, maxPx);
  const hi = Math.max(minPx, maxPx);
  if (maxVw === minVw) return minPx;
  const v = minPx + ((maxPx - minPx) * (viewport - minVw)) / (maxVw - minVw);
  return Math.min(hi, Math.max(lo, v));
}
