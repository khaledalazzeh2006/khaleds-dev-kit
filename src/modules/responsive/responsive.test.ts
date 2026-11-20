import { fluidClamp, fluidValueAt } from "@/lib/fluid";
import { activeBreakpoint, breakpointSets } from "./lib/breakpoints";
import { buildQuery } from "./lib/queries";
import { parseWidths, pictureMarkup, sizesFor } from "./lib/srcset";

describe("breakpoints", () => {
  const tw = breakpointSets.tailwind!.items;
  it("finds the active one", () => {
    expect(activeBreakpoint(tw, 500)).toBe("base");
    expect(activeBreakpoint(tw, 768)).toBe("md");
    expect(activeBreakpoint(tw, 1300)).toBe("xl");
  });
});

describe("fluid", () => {
  it("clamp and the value it resolves to", () => {
    expect(fluidClamp(32, 64, 360, 1280)).toBe("clamp(2rem, 1.2174rem + 3.4783vw, 4rem)");
    expect(fluidValueAt(32, 64, 360, 1280, 360)).toBe(32);
    expect(fluidValueAt(32, 64, 360, 1280, 820)).toBe(48);
    expect(fluidValueAt(32, 64, 360, 1280, 2000)).toBe(64);
  });
});

describe("queries", () => {
  const base = {
    kind: "media" as const,
    min: 768,
    max: 1024,
    unit: "px" as const,
    rangeSyntax: true,
  };
  it("range syntax", () => {
    expect(buildQuery({ ...base, condition: "between" }).css).toContain(
      "@media (768px <= width < 1024px)",
    );
    expect(buildQuery({ ...base, condition: "min" }).tailwind).toBe("min-[768px]:");
  });
  it("classic syntax subtracts a hair on max", () => {
    expect(buildQuery({ ...base, condition: "max", rangeSyntax: false }).css).toContain(
      "(max-width: 1023.98px)",
    );
  });
  it("container queries with rem and a name", () => {
    const q = buildQuery({
      ...base,
      kind: "container",
      condition: "min",
      min: 400,
      unit: "rem",
      containerName: "card",
    });
    expect(q.css).toContain("@container card (width >= 25rem)");
    expect(q.tailwind).toBe("@min-[25rem]/card:");
  });
});

describe("srcset", () => {
  it("parses widths", () => {
    expect(parseWidths("1600, 480 768,768 x")).toEqual([480, 768, 1600]);
  });
  it("sizes per layout", () => {
    expect(sizesFor("container", 1200)).toBe("(min-width: 1200px) 1200px, 100vw");
    expect(sizesFor("columns", 3)).toBe("(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw");
  });
  it("picture markup has sources, fallback and dimensions", () => {
    const html = pictureMarkup({
      base: "/img/hero",
      widths: [480, 960],
      formats: ["avif", "webp", "jpg"],
      layout: "full",
      value: 0,
      alt: 'A "big" hero',
      width: 1920,
      height: 1080,
    });
    expect(html).toContain(
      '<source type="image/avif" srcset="/img/hero-480.avif 480w, /img/hero-960.avif 960w" sizes="100vw" />',
    );
    expect(html).toContain('src="/img/hero-960.jpg"');
    expect(html).toContain('alt="A &quot;big&quot; hero"');
    expect(html).toContain('width="1920"');
  });
});
