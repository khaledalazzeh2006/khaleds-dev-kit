import { arbitrary, classes, spacing } from "./tailwind";

export interface CssResult {
  css: string;
  tailwind: string;
}

const px = (n: number) => (n === 0 ? "0" : `${n}px`);

// ---------- Box shadow ----------
export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export function shadowValue(layers: ShadowLayer[]): string {
  return layers
    .map((l) =>
      [l.inset && "inset", px(l.x), px(l.y), px(l.blur), px(l.spread), l.color]
        .filter(Boolean)
        .join(" "),
    )
    .join(", ");
}

export function boxShadow(layers: ShadowLayer[]): CssResult {
  if (!layers.length) return { css: "box-shadow: none;", tailwind: "shadow-none" };
  const value = shadowValue(layers);
  return { css: `box-shadow: ${value};`, tailwind: `shadow-[${arbitrary(value)}]` };
}

// ---------- Gradient ----------
export interface GradientStop {
  color: string;
  position: number; // %
}
export type GradientType = "linear" | "radial" | "conic";

export function gradientValue(type: GradientType, angle: number, stops: GradientStop[]): string {
  const list = [...stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");
  if (type === "linear") return `linear-gradient(${angle}deg, ${list})`;
  if (type === "radial") return `radial-gradient(circle, ${list})`;
  return `conic-gradient(from ${angle}deg, ${list})`;
}

export function gradient(type: GradientType, angle: number, stops: GradientStop[]): CssResult {
  const value = gradientValue(type, angle, stops);
  return { css: `background: ${value};`, tailwind: `bg-[${arbitrary(value)}]` };
}

// ---------- Border radius ----------
export interface Corners {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

export function borderRadius(c: Corners): CssResult {
  const same = c.tl === c.tr && c.tr === c.br && c.br === c.bl;
  if (same)
    return {
      css: `border-radius: ${px(c.tl)};`,
      tailwind: c.tl === 9999 ? "rounded-full" : `rounded-[${px(c.tl)}]`,
    };
  return {
    css: `border-radius: ${px(c.tl)} ${px(c.tr)} ${px(c.br)} ${px(c.bl)};`,
    tailwind: classes(
      `rounded-tl-[${px(c.tl)}]`,
      `rounded-tr-[${px(c.tr)}]`,
      `rounded-br-[${px(c.br)}]`,
      `rounded-bl-[${px(c.bl)}]`,
    ),
  };
}

// ---------- Flexbox ----------
export interface FlexOptions {
  direction: "row" | "row-reverse" | "column" | "column-reverse";
  wrap: "nowrap" | "wrap" | "wrap-reverse";
  justify: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
  align: "stretch" | "flex-start" | "center" | "flex-end" | "baseline";
  gap: number;
}

const twDirection = {
  row: "flex-row",
  "row-reverse": "flex-row-reverse",
  column: "flex-col",
  "column-reverse": "flex-col-reverse",
};
const twJustify = {
  "flex-start": "justify-start",
  center: "justify-center",
  "flex-end": "justify-end",
  "space-between": "justify-between",
  "space-around": "justify-around",
  "space-evenly": "justify-evenly",
};
const twAlign = {
  stretch: "items-stretch",
  "flex-start": "items-start",
  center: "items-center",
  "flex-end": "items-end",
  baseline: "items-baseline",
};

export function flexbox(o: FlexOptions): CssResult {
  const css = [
    "display: flex;",
    o.direction !== "row" && `flex-direction: ${o.direction};`,
    o.wrap !== "nowrap" && `flex-wrap: ${o.wrap};`,
    o.justify !== "flex-start" && `justify-content: ${o.justify};`,
    o.align !== "stretch" && `align-items: ${o.align};`,
    o.gap > 0 && `gap: ${o.gap}px;`,
  ].filter(Boolean);
  const tailwind = classes(
    "flex",
    o.direction !== "row" && twDirection[o.direction],
    o.wrap === "wrap" && "flex-wrap",
    o.wrap === "wrap-reverse" && "flex-wrap-reverse",
    o.justify !== "flex-start" && twJustify[o.justify],
    o.align !== "stretch" && twAlign[o.align],
    o.gap > 0 && `gap-${spacing(o.gap)}`,
  );
  return { css: css.join("\n"), tailwind };
}

// ---------- Grid ----------
export interface GridOptions {
  mode: "fixed" | "auto-fit";
  columns: number; // fixed mode
  minWidth: number; // auto-fit mode, px
  rows: number; // 0 = auto
  gap: number;
}

export function grid(o: GridOptions): CssResult {
  const cols =
    o.mode === "fixed"
      ? `repeat(${o.columns}, minmax(0, 1fr))`
      : `repeat(auto-fit, minmax(${o.minWidth}px, 1fr))`;
  const css = [
    "display: grid;",
    `grid-template-columns: ${cols};`,
    o.rows > 0 && `grid-template-rows: repeat(${o.rows}, minmax(0, 1fr));`,
    o.gap > 0 && `gap: ${o.gap}px;`,
  ].filter(Boolean);
  const tailwind = classes(
    "grid",
    o.mode === "fixed" ? `grid-cols-${o.columns}` : `grid-cols-[${arbitrary(cols)}]`,
    o.rows > 0 && `grid-rows-${o.rows}`,
    o.gap > 0 && `gap-${spacing(o.gap)}`,
  );
  return { css: css.join("\n"), tailwind };
}

// ---------- Glassmorphism ----------
export interface GlassOptions {
  blur: number;
  tint: string; // rgb color, e.g. "255 255 255"
  opacity: number; // 0–100
  saturation: number; // %
  border: number; // border opacity 0–100
  radius: number;
}

export function glass(o: GlassOptions): CssResult {
  const bg = `rgb(${o.tint} / ${o.opacity / 100})`;
  const border = `rgb(${o.tint} / ${o.border / 100})`;
  const filter = `blur(${o.blur}px) saturate(${o.saturation}%)`;
  const css = [
    `background: ${bg};`,
    `backdrop-filter: ${filter};`,
    `-webkit-backdrop-filter: ${filter};`,
    o.border > 0 && `border: 1px solid ${border};`,
    o.radius > 0 && `border-radius: ${o.radius}px;`,
  ].filter(Boolean);
  const tailwind = classes(
    `bg-[${arbitrary(bg)}]`,
    `backdrop-blur-[${o.blur}px]`,
    o.saturation !== 100 && `backdrop-saturate-[${o.saturation}%]`,
    o.border > 0 && `border border-[${arbitrary(border)}]`,
    o.radius > 0 && `rounded-[${o.radius}px]`,
  );
  return { css: css.join("\n"), tailwind };
}

// ---------- Transition ----------
export type Bezier = [number, number, number, number];

export const easings: Record<string, Bezier> = {
  ease: [0.25, 0.1, 0.25, 1],
  "ease-in": [0.42, 0, 1, 1],
  "ease-out": [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
  "ease-out-quart": [0.25, 1, 0.5, 1],
  "ease-out-expo": [0.16, 1, 0.3, 1],
  "ease-in-out-cubic": [0.65, 0, 0.35, 1],
  "back-out": [0.34, 1.56, 0.64, 1],
};

export const bezierValue = (b: Bezier) =>
  `cubic-bezier(${b.map((n) => Number(n.toFixed(3))).join(", ")})`;

export interface TransitionOptions {
  property: string; // "all", "transform", "opacity"...
  duration: number; // ms
  delay: number; // ms
  bezier: Bezier;
}

export function transition(o: TransitionOptions): CssResult {
  const easing = bezierValue(o.bezier);
  const value = [o.property, `${o.duration}ms`, easing, o.delay > 0 && `${o.delay}ms`]
    .filter(Boolean)
    .join(" ");
  const twProp = {
    all: "transition-all",
    opacity: "transition-opacity",
    transform: "transition-transform",
    colors: "transition-colors",
  }[o.property];
  return {
    css: `transition: ${value};`,
    tailwind: classes(
      twProp ?? `transition-[${arbitrary(o.property)}]`,
      `duration-${o.duration}`,
      `ease-[${arbitrary(easing)}]`,
      o.delay > 0 && `delay-${o.delay}`,
    ),
  };
}

/** Point on a cubic-bezier easing curve at parameter t (for drawing the curve). */
export function bezierPoint([x1, y1, x2, y2]: Bezier, t: number): [number, number] {
  const u = 1 - t;
  const x = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t;
  const y = 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t;
  return [x, y];
}

// ---------- Clip path ----------
export type Point = [number, number]; // % x, % y

export const clipShapes: Record<string, Point[]> = {
  triangle: [
    [50, 0],
    [100, 100],
    [0, 100],
  ],
  rhombus: [
    [50, 0],
    [100, 50],
    [50, 100],
    [0, 50],
  ],
  pentagon: [
    [50, 0],
    [100, 38],
    [82, 100],
    [18, 100],
    [0, 38],
  ],
  hexagon: [
    [25, 0],
    [75, 0],
    [100, 50],
    [75, 100],
    [25, 100],
    [0, 50],
  ],
  "arrow right": [
    [0, 20],
    [60, 20],
    [60, 0],
    [100, 50],
    [60, 100],
    [60, 80],
    [0, 80],
  ],
  chevron: [
    [75, 0],
    [100, 50],
    [75, 100],
    [0, 100],
    [25, 50],
    [0, 0],
  ],
  message: [
    [0, 0],
    [100, 0],
    [100, 75],
    [75, 75],
    [75, 100],
    [50, 75],
    [0, 75],
  ],
  slant: [
    [0, 0],
    [100, 0],
    [100, 85],
    [0, 100],
  ],
};

export const clipPathValue = (points: Point[]) =>
  `polygon(${points.map(([x, y]) => `${Math.round(x)}% ${Math.round(y)}%`).join(", ")})`;

export function clipPath(points: Point[]): CssResult {
  const value = clipPathValue(points);
  return { css: `clip-path: ${value};`, tailwind: `[clip-path:${arbitrary(value)}]` };
}
