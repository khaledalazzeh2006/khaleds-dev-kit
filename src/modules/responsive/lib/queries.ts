import { arbitrary } from "@/lib/tailwind";

export type Unit = "px" | "rem" | "em";
export type QueryKind = "media" | "container";
export type Condition = "min" | "max" | "between";

export interface QueryOptions {
  kind: QueryKind;
  condition: Condition;
  min: number; // px
  max: number; // px
  unit: Unit;
  /** Modern range syntax: (width >= 768px) instead of (min-width: 768px). */
  rangeSyntax: boolean;
  containerName?: string;
}

const fmt = (px: number, unit: Unit) =>
  unit === "px" ? `${px}px` : `${Number((px / 16).toFixed(4))}${unit}`;

/** Build an @media / @container rule and the matching Tailwind variant. */
export function buildQuery(o: QueryOptions): { css: string; tailwind: string } {
  const lo = fmt(o.min, o.unit);
  // Upper bounds are exclusive, so a "max 768" and a "min 768" query never overlap.
  const hi = fmt(o.max, o.unit);
  const feature = "width";

  let condition: string;
  if (o.rangeSyntax) {
    condition =
      o.condition === "min"
        ? `(${feature} >= ${lo})`
        : o.condition === "max"
          ? `(${feature} < ${hi})`
          : `(${lo} <= ${feature} < ${hi})`;
  } else {
    const below = (px: number) => fmt(px - 0.02, o.unit); // classic syntax has no "<", so subtract a hair
    condition =
      o.condition === "min"
        ? `(min-width: ${lo})`
        : o.condition === "max"
          ? `(max-width: ${below(o.max)})`
          : `(min-width: ${lo}) and (max-width: ${below(o.max)})`;
  }

  const at =
    o.kind === "media" ? "@media" : `@container${o.containerName ? ` ${o.containerName}` : ""}`;
  const css = `${at} ${condition} {\n  /* styles */\n}`;

  const v = (px: number) => `[${arbitrary(fmt(px, o.unit))}]`;
  const prefix = o.kind === "media" ? "" : "@";
  const name = o.kind === "container" && o.containerName ? `/${o.containerName}` : "";
  const tailwind =
    o.condition === "min"
      ? `${prefix}min-${v(o.min)}${name}:`
      : o.condition === "max"
        ? `${prefix}max-${v(o.max)}${name}:`
        : `${prefix}min-${v(o.min)}${name}:${prefix}max-${v(o.max)}${name}:`;
  return { css, tailwind };
}

/** Feature queries worth knowing, with their Tailwind variant. */
export const featureQueries = [
  { label: "Dark mode", css: "@media (prefers-color-scheme: dark)", tailwind: "dark:" },
  {
    label: "Reduced motion",
    css: "@media (prefers-reduced-motion: reduce)",
    tailwind: "motion-reduce:",
  },
  {
    label: "Motion is OK",
    css: "@media (prefers-reduced-motion: no-preference)",
    tailwind: "motion-safe:",
  },
  { label: "Touch (coarse pointer)", css: "@media (pointer: coarse)", tailwind: "pointer-coarse:" },
  { label: "Mouse (fine pointer)", css: "@media (pointer: fine)", tailwind: "pointer-fine:" },
  {
    label: "Can hover",
    css: "@media (hover: hover)",
    tailwind: "hover: (v4 applies it automatically)",
  },
  { label: "Portrait", css: "@media (orientation: portrait)", tailwind: "portrait:" },
  { label: "Landscape", css: "@media (orientation: landscape)", tailwind: "landscape:" },
  { label: "Print", css: "@media print", tailwind: "print:" },
  { label: "High contrast", css: "@media (prefers-contrast: more)", tailwind: "contrast-more:" },
];
