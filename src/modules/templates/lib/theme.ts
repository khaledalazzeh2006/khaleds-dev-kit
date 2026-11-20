import { formatHex, parse, wcagContrast } from "culori";

export type Mode = "light" | "dark";
export type Radius = "sharp" | "soft" | "round";
export type Font = "sans" | "serif" | "mono" | "rounded";

export interface SiteTheme {
  /** Brand / site name shown in navbars, footers and titles. */
  name: string;
  brand: string;
  mode: Mode;
  radius: Radius;
  font: Font;
}

export const defaultTheme: SiteTheme = {
  name: "Acme",
  brand: "#6d28d9",
  mode: "light",
  radius: "soft",
  font: "sans",
};

const palettes: Record<Mode, Record<string, string>> = {
  light: {
    surface: "#ffffff",
    soft: "#f5f5f7",
    card: "#ffffff",
    ink: "#111114",
    muted: "#62626d",
    line: "#e4e4e9",
  },
  dark: {
    surface: "#0b0b0f",
    soft: "#121218",
    card: "#17171e",
    ink: "#f3f3f6",
    muted: "#a0a0ac",
    line: "#2a2a33",
  },
};

const radii: Record<Radius, { card: string; btn: string }> = {
  sharp: { card: "0.25rem", btn: "0.25rem" },
  soft: { card: "1rem", btn: "0.625rem" },
  round: { card: "1.5rem", btn: "9999px" },
};

/** System font stacks only: exported sites work offline and need no font downloads. */
export const fonts: Record<Font, { label: string; stack: string }> = {
  sans: {
    label: "Sans (system)",
    stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  serif: { label: "Serif", stack: 'ui-serif, Georgia, Cambria, "Times New Roman", serif' },
  mono: { label: "Mono", stack: 'ui-monospace, "Cascadia Code", Menlo, Consolas, monospace' },
  rounded: {
    label: "Rounded",
    stack: 'ui-rounded, "SF Pro Rounded", "Segoe UI", system-ui, sans-serif',
  },
};

/** Readable text color on top of the brand color (white or near-black). */
export function onBrand(brand: string): string {
  const c = parse(brand);
  if (!c) return "#ffffff";
  return wcagContrast(c, "#ffffff") >= wcagContrast(c, "#111114") ? "#ffffff" : "#111114";
}

export function normalizeColor(value: string, fallback = defaultTheme.brand): string {
  const c = parse(value);
  return c ? (formatHex(c) ?? fallback) : fallback;
}

/**
 * The Tailwind v4 `@theme` block. Sections only use these names
 * (bg-surface, bg-soft, bg-card, text-ink, text-muted, border-line, bg-brand, text-on-brand,
 * rounded-card, rounded-btn, font-sans), so re-theming an exported site is one edit.
 */
export function themeCss(t: SiteTheme): string {
  const p = palettes[t.mode];
  const brand = normalizeColor(t.brand);
  const lines = [
    ...Object.entries(p).map(([k, v]) => `  --color-${k}: ${v};`),
    `  --color-brand: ${brand};`,
    `  --color-on-brand: ${onBrand(brand)};`,
    `  --radius-card: ${radii[t.radius].card};`,
    `  --radius-btn: ${radii[t.radius].btn};`,
    `  --font-sans: ${fonts[t.font].stack};`,
  ];
  return `@theme {\n${lines.join("\n")}\n}`;
}

/** Full CSS entry file for a Tailwind v4 project. */
export function entryCss(t: SiteTheme): string {
  return `@import "tailwindcss";\n\n${themeCss(t)}\n\nhtml {\n  scroll-behavior: smooth;\n  scroll-padding-top: 5rem;\n  color-scheme: ${t.mode};\n}\n`;
}

/** Classes for <body>. */
export const BODY_CLASS = "bg-surface text-ink font-sans antialiased";
