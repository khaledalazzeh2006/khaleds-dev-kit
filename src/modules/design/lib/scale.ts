import { fluidClamp, rem } from "@/lib/fluid";

export { fluidClamp };

export const RATIOS: Record<string, number> = {
  "Minor second · 1.067": 1.067,
  "Major second · 1.125": 1.125,
  "Minor third · 1.2": 1.2,
  "Major third · 1.25": 1.25,
  "Perfect fourth · 1.333": 1.333,
  "Augmented fourth · 1.414": 1.414,
  "Perfect fifth · 1.5": 1.5,
  "Golden ratio · 1.618": 1.618,
};

export const TYPE_NAMES = [
  "xs",
  "sm",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
] as const;

export interface TypeStep {
  name: string;
  px: number;
  value: string; // rem or clamp()
}

/** Modular type scale. `base` is step "base"; two steps below it, the rest above. */
export function typeScale(opts: {
  base: number;
  ratio: number;
  steps?: number;
  fluid?: { maxBase: number; maxRatio: number; minVw: number; maxVw: number };
}): TypeStep[] {
  const count = opts.steps ?? TYPE_NAMES.length;
  return TYPE_NAMES.slice(0, count).map((name, i) => {
    const power = i - 2;
    const px = opts.base * opts.ratio ** power;
    const value = opts.fluid
      ? fluidClamp(
          px,
          opts.fluid.maxBase * opts.fluid.maxRatio ** power,
          opts.fluid.minVw,
          opts.fluid.maxVw,
        )
      : rem(px);
    return { name, px: Number(px.toFixed(2)), value };
  });
}

export function typeScaleCode(steps: TypeStep[], format: "css" | "tailwind"): string {
  const lines = steps.map((s) => `  --text-${s.name}: ${s.value};`).join("\n");
  return format === "tailwind" ? `@theme {\n${lines}\n}` : `:root {\n${lines}\n}`;
}

export const SPACING_STEPS = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];

export function spacingScale(unit: number): { step: number; px: number; rem: string }[] {
  return SPACING_STEPS.map((step) => ({ step, px: step * unit, rem: rem(step * unit) }));
}

export function spacingCode(unit: number, format: "css" | "tailwind"): string {
  if (format === "tailwind")
    return `@theme {\n  --spacing: ${rem(unit)}; /* 1 unit = ${unit}px → p-4 = ${unit * 4}px */\n}`;
  const lines = spacingScale(unit).map(
    (s) => `  --space-${String(s.step).replace(".", "_")}: ${s.rem};`,
  );
  return `:root {\n${lines.join("\n")}\n}`;
}
