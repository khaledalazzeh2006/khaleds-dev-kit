import { clampChroma, converter, formatHex, parse, wcagContrast, type Oklch } from "culori";

const toOklch = converter("oklch");

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Step = (typeof STEPS)[number];

// Target lightness per step (close to Tailwind v4's own palettes) and how much of the base chroma to keep.
const LIGHTNESS: Record<Step, number> = {
  50: 0.971,
  100: 0.936,
  200: 0.885,
  300: 0.808,
  400: 0.704,
  500: 0.627,
  600: 0.546,
  700: 0.484,
  800: 0.42,
  900: 0.37,
  950: 0.27,
};
const CHROMA: Record<Step, number> = {
  50: 0.12,
  100: 0.24,
  200: 0.42,
  300: 0.66,
  400: 0.88,
  500: 1,
  600: 1,
  700: 0.92,
  800: 0.8,
  900: 0.66,
  950: 0.5,
};

export interface Swatch {
  step: Step;
  oklch: string;
  hex: string;
  /** Text color that reads best on this swatch. */
  text: "white" | "black";
  isBase: boolean;
}

const fmt = (c: Oklch) => `oklch(${c.l.toFixed(3)} ${c.c.toFixed(3)} ${(c.h ?? 0).toFixed(1)})`;

/** 11-step scale (50–950) built around a base color. The step closest in lightness is the base itself. */
export function generatePalette(input: string): Swatch[] | null {
  const parsed = parse(input.trim());
  if (!parsed) return null;
  const base = toOklch(parsed);
  const baseStep = STEPS.reduce(
    (best, s) => (Math.abs(LIGHTNESS[s] - base.l) < Math.abs(LIGHTNESS[best] - base.l) ? s : best),
    STEPS[0],
  );

  return STEPS.map((step) => {
    const color: Oklch =
      step === baseStep
        ? base
        : (clampChroma(
            { mode: "oklch", l: LIGHTNESS[step], c: base.c * CHROMA[step], h: base.h },
            "oklch",
          ) as Oklch);
    const text = wcagContrast(color, "#fff") >= wcagContrast(color, "#000") ? "white" : "black";
    return { step, oklch: fmt(color), hex: formatHex(color), text, isBase: step === baseStep };
  });
}

export type PaletteFormat = "css" | "tailwind" | "json";

export function paletteCode(name: string, swatches: Swatch[], format: PaletteFormat): string {
  const id =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "brand";
  if (format === "json")
    return JSON.stringify(Object.fromEntries(swatches.map((s) => [s.step, s.hex])), null, 2);
  const lines = swatches.map((s) => `  --color-${id}-${s.step}: ${s.oklch};`).join("\n");
  return format === "tailwind" ? `@theme {\n${lines}\n}` : `:root {\n${lines}\n}`;
}
