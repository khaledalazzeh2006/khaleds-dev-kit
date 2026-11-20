import { formatNumber, parseNumber, pxToRem, remScale, remToPx } from "./lib/units";

describe("units", () => {
  it("converts px ↔ rem with the default 16px base", () => {
    expect(pxToRem(24)).toBe(1.5);
    expect(remToPx(1.5)).toBe(24);
  });

  it("respects a custom base", () => {
    expect(pxToRem(20, 10)).toBe(2);
    expect(remToPx(2, 10)).toBe(20);
  });

  it("formats without trailing zeros", () => {
    expect(formatNumber(1.5)).toBe("1.5");
    expect(formatNumber(0.8125)).toBe("0.8125");
    expect(formatNumber(1 / 3)).toBe("0.3333");
    expect(formatNumber(Number.NaN)).toBe("");
  });

  it("parses typed values with units", () => {
    expect(parseNumber("24px")).toBe(24);
    expect(parseNumber(" 1.5rem ")).toBe(1.5);
    expect(parseNumber("abc")).toBeNull();
  });

  it("builds a reference scale", () => {
    expect(remScale(16, [16, 24])).toBe("1rem /* 16px */\n1.5rem /* 24px */");
  });
});
