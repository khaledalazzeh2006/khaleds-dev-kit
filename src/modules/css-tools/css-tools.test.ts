import { arbitrary, spacing } from "./lib/tailwind";
import {
  bezierPoint,
  borderRadius,
  boxShadow,
  clipPath,
  flexbox,
  glass,
  gradient,
  grid,
  transition,
} from "./lib/css";

describe("tailwind helpers", () => {
  it("encodes arbitrary values", () => {
    expect(arbitrary("0 4px 8px rgb(0 0 0 / 0.2), inset 0 1px red")).toBe(
      "0_4px_8px_rgb(0_0_0_/_0.2),inset_0_1px_red",
    );
  });
  it("maps px to the spacing scale", () => {
    expect(spacing(12)).toBe("3");
    expect(spacing(10)).toBe("2.5");
    expect(spacing(13)).toBe("3.25");
    expect(spacing(1.5)).toBe("[1.5px]");
  });
});

describe("css generators", () => {
  it("box-shadow with layers and inset", () => {
    const r = boxShadow([
      { x: 0, y: 4, blur: 12, spread: 0, color: "rgb(0 0 0 / 0.15)", inset: false },
      { x: 0, y: 1, blur: 0, spread: 0, color: "#fff", inset: true },
    ]);
    expect(r.css).toBe("box-shadow: 0 4px 12px 0 rgb(0 0 0 / 0.15), inset 0 1px 0 0 #fff;");
    expect(r.tailwind).toBe("shadow-[0_4px_12px_0_rgb(0_0_0_/_0.15),inset_0_1px_0_0_#fff]");
  });

  it("gradient sorts stops", () => {
    expect(
      gradient("linear", 135, [
        { color: "#000", position: 100 },
        { color: "#fff", position: 0 },
      ]).css,
    ).toBe("background: linear-gradient(135deg, #fff 0%, #000 100%);");
  });

  it("radius: uniform vs per corner", () => {
    expect(borderRadius({ tl: 12, tr: 12, br: 12, bl: 12 })).toEqual({
      css: "border-radius: 12px;",
      tailwind: "rounded-[12px]",
    });
    expect(borderRadius({ tl: 0, tr: 24, br: 0, bl: 24 }).css).toBe(
      "border-radius: 0 24px 0 24px;",
    );
  });

  it("flexbox only emits non-defaults", () => {
    const r = flexbox({
      direction: "column",
      wrap: "nowrap",
      justify: "space-between",
      align: "center",
      gap: 16,
    });
    expect(r.css).toBe(
      "display: flex;\nflex-direction: column;\njustify-content: space-between;\nalign-items: center;\ngap: 16px;",
    );
    expect(r.tailwind).toBe("flex flex-col justify-between items-center gap-4");
  });

  it("grid fixed and auto-fit", () => {
    expect(grid({ mode: "fixed", columns: 3, minWidth: 0, rows: 0, gap: 24 }).tailwind).toBe(
      "grid grid-cols-3 gap-6",
    );
    expect(grid({ mode: "auto-fit", columns: 0, minWidth: 200, rows: 0, gap: 0 }).tailwind).toBe(
      "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]",
    );
  });

  it("glass", () => {
    const r = glass({
      blur: 12,
      tint: "255 255 255",
      opacity: 10,
      saturation: 180,
      border: 20,
      radius: 16,
    });
    expect(r.css).toContain("backdrop-filter: blur(12px) saturate(180%);");
    expect(r.tailwind).toBe(
      "bg-[rgb(255_255_255_/_0.1)] backdrop-blur-[12px] backdrop-saturate-[180%] border border-[rgb(255_255_255_/_0.2)] rounded-[16px]",
    );
  });

  it("transition", () => {
    const r = transition({
      property: "transform",
      duration: 300,
      delay: 0,
      bezier: [0.16, 1, 0.3, 1],
    });
    expect(r.css).toBe("transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);");
    expect(r.tailwind).toBe("transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]");
  });

  it("bezier endpoints", () => {
    expect(bezierPoint([0.42, 0, 0.58, 1], 0)).toEqual([0, 0]);
    expect(bezierPoint([0.42, 0, 0.58, 1], 1)).toEqual([1, 1]);
  });

  it("clip-path", () => {
    expect(
      clipPath([
        [50, 0],
        [100, 100],
        [0, 100],
      ]).css,
    ).toBe("clip-path: polygon(50% 0%, 100% 100%, 0% 100%);");
  });
});
