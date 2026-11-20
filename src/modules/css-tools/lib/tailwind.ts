/** Tailwind arbitrary value: spaces become underscores, e.g. `shadow-[0_4px_8px_rgb(0_0_0/0.2)]`. */
export function arbitrary(value: string): string {
  return value
    .trim()
    .replace(/\s*,\s*/g, ",")
    .replace(/\s+/g, "_");
}

/**
 * Spacing utility value. Tailwind v4 spacing takes multiples of 0.25 (1 = 4px), so any whole
 * pixel value maps to a scale number: 12px → "3", 10px → "2.5", 13px → "3.25".
 */
export function spacing(px: number): string {
  return Number.isInteger(px) ? String(px / 4) : `[${px}px]`;
}

/** Join class names, skipping empty ones. */
export function classes(...list: (string | false | undefined | null)[]): string {
  return list.filter(Boolean).join(" ");
}
