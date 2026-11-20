import { generatePalette, paletteCode } from "./lib/palette";
import { fluidClamp, spacingCode, spacingScale, typeScale } from "./lib/scale";
import { checkContrast } from "./lib/contrast";

describe("palette", () => {
  const p = generatePalette("#8b5cf6")!;

  it("makes 11 steps from light to dark and keeps the base", () => {
    expect(p).toHaveLength(11);
    expect(p.filter((s) => s.isBase)).toHaveLength(1);
    expect(p.find((s) => s.isBase)?.hex).toBe("#8b5cf6");
    expect(p[0]!.text).toBe("black");
    expect(p[10]!.text).toBe("white");
  });

  it("exports CSS, Tailwind and JSON", () => {
    expect(paletteCode("Brand Violet", p, "tailwind")).toMatch(
      /^@theme \{\n {2}--color-brand-violet-50: oklch\(/,
    );
    expect(Object.keys(JSON.parse(paletteCode("x", p, "json")))).toHaveLength(11);
  });

  it("rejects invalid colors", () => {
    expect(generatePalette("nope")).toBeNull();
  });
});

describe("scales", () => {
  it("fluid clamp goes from min to max", () => {
    expect(fluidClamp(16, 20, 360, 1280)).toBe("clamp(1rem, 0.9022rem + 0.4348vw, 1.25rem)");
    expect(fluidClamp(16, 16)).toBe("1rem");
  });

  it("type scale centers on base", () => {
    const s = typeScale({ base: 16, ratio: 1.25, steps: 5 });
    expect(s.map((x) => x.name)).toEqual(["xs", "sm", "base", "lg", "xl"]);
    expect(s[2]).toEqual({ name: "base", px: 16, value: "1rem" });
    expect(s[3]!.px).toBe(20);
  });

  it("spacing", () => {
    expect(spacingScale(4).find((s) => s.step === 4)).toEqual({ step: 4, px: 16, rem: "1rem" });
    expect(spacingCode(4, "tailwind")).toContain("--spacing: 0.25rem;");
  });
});

describe("contrast", () => {
  it("black on white is 21:1", () => {
    expect(checkContrast("#000", "#fff")).toMatchObject({ ratio: 21, aaaNormal: true });
  });
  it("grades mid contrast", () => {
    const r = checkContrast("#777", "#fff")!;
    expect(r.aaNormal).toBe(false);
    expect(r.aaLarge).toBe(true);
  });
});
