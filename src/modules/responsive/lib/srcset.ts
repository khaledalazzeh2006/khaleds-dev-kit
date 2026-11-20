export type Layout = "full" | "container" | "columns" | "fixed";

export interface SrcsetOptions {
  base: string; // e.g. "/images/hero"
  widths: number[];
  formats: ("avif" | "webp" | "jpg")[];
  layout: Layout;
  /** container: max content width (px). columns: number of columns from md up. fixed: rendered width (px). */
  value: number;
  alt: string;
  width: number; // intrinsic size of the largest image, for width/height attributes
  height: number;
}

/** sizes attribute: tells the browser how wide the image will be at each viewport. */
export function sizesFor(layout: Layout, value: number): string {
  switch (layout) {
    case "full":
      return "100vw";
    case "container":
      return `(min-width: ${value}px) ${value}px, 100vw`;
    case "columns":
      return `(min-width: 1024px) ${Math.round(100 / value)}vw, (min-width: 768px) 50vw, 100vw`;
    case "fixed":
      return `${value}px`;
  }
}

export function srcsetFor(base: string, widths: number[], ext: string): string {
  return [...widths]
    .sort((a, b) => a - b)
    .map((w) => `${base}-${w}.${ext} ${w}w`)
    .join(", ");
}

/** <picture> with modern formats first and a jpg <img> fallback. */
export function pictureMarkup(o: SrcsetOptions): string {
  const sizes = sizesFor(o.layout, o.value);
  const widths = [...new Set(o.widths)].filter((w) => w > 0).sort((a, b) => a - b);
  const largest = widths.at(-1) ?? o.width;
  const modern = o.formats.filter((f) => f !== "jpg");
  const sources = modern.map(
    (f) =>
      `  <source type="image/${f}" srcset="${srcsetFor(o.base, widths, f)}" sizes="${sizes}" />`,
  );
  const img = [
    `  <img`,
    `    src="${o.base}-${largest}.jpg"`,
    `    srcset="${srcsetFor(o.base, widths, "jpg")}"`,
    `    sizes="${sizes}"`,
    `    width="${o.width}"`,
    `    height="${o.height}"`,
    `    alt="${o.alt.replace(/"/g, "&quot;")}"`,
    `    loading="lazy"`,
    `    decoding="async"`,
    `  />`,
  ];
  return ["<picture>", ...sources, ...img, "</picture>"].join("\n");
}

/** Parse "480, 768 1024" → [480, 768, 1024]. */
export function parseWidths(text: string): number[] {
  return [
    ...new Set(
      text
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0),
    ),
  ].sort((a, b) => a - b);
}
