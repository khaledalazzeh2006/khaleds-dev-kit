export interface Breakpoint {
  name: string;
  min: number; // px
}

export const breakpointSets: Record<
  string,
  { label: string; source: string; items: Breakpoint[] }
> = {
  tailwind: {
    label: "Tailwind CSS v4",
    source: "https://tailwindcss.com/docs/responsive-design",
    items: [
      { name: "sm", min: 640 },
      { name: "md", min: 768 },
      { name: "lg", min: 1024 },
      { name: "xl", min: 1280 },
      { name: "2xl", min: 1536 },
    ],
  },
  bootstrap: {
    label: "Bootstrap 5",
    source: "https://getbootstrap.com/docs/5.3/layout/breakpoints/",
    items: [
      { name: "sm", min: 576 },
      { name: "md", min: 768 },
      { name: "lg", min: 992 },
      { name: "xl", min: 1200 },
      { name: "xxl", min: 1400 },
    ],
  },
};

/** Tailwind v4 container query sizes (@3xs … @7xl). */
export const tailwindContainers: Breakpoint[] = [
  ["@3xs", 256],
  ["@2xs", 288],
  ["@xs", 320],
  ["@sm", 384],
  ["@md", 448],
  ["@lg", 512],
  ["@xl", 576],
  ["@2xl", 672],
  ["@3xl", 768],
  ["@4xl", 896],
  ["@5xl", 1024],
  ["@6xl", 1152],
  ["@7xl", 1280],
].map(([name, min]) => ({ name: name as string, min: min as number }));

/** Name of the breakpoint active at a width (largest min ≤ width), or "base". */
export function activeBreakpoint(items: Breakpoint[], width: number): string {
  return [...items].reverse().find((b) => width >= b.min)?.name ?? "base";
}

export interface Device {
  id: string;
  name: string;
  width: number;
  height: number;
  kind: "phone" | "tablet" | "laptop" | "desktop";
}

export const devices: Device[] = [
  { id: "iphone-se", name: "iPhone SE", width: 375, height: 667, kind: "phone" },
  { id: "iphone-15", name: "iPhone 15", width: 393, height: 852, kind: "phone" },
  { id: "pixel-8", name: "Pixel 8", width: 412, height: 915, kind: "phone" },
  { id: "ipad-mini", name: "iPad mini", width: 768, height: 1024, kind: "tablet" },
  { id: "ipad-air", name: "iPad Air", width: 820, height: 1180, kind: "tablet" },
  { id: "laptop", name: "Laptop", width: 1366, height: 768, kind: "laptop" },
  { id: "desktop", name: "Desktop", width: 1920, height: 1080, kind: "desktop" },
];
