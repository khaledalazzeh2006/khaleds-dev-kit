import { contrastLevel, convertColor } from "./lib/color";
import { csvToJson, jsonToCsv, jsonToYaml, yamlToJson } from "./lib/data";
import { jsonToTs } from "./lib/json-to-ts";
import { base64Decode, base64Encode, parseUrl, urlDecode, urlEncode } from "./lib/encoding";
import { formatTime, parseTime, relativeTime } from "./lib/time";
import { svgToJsx } from "./lib/svg-to-jsx";

describe("color", () => {
  it("converts hex to every format", () => {
    const c = convertColor("#8b5cf6")!;
    expect(c.hex).toBe("#8b5cf6");
    expect(c.rgb).toBe("rgb(139, 92, 246)");
    expect(c.oklch).toBe("oklch(0.606 0.219 292.7)");
    expect(c.contrast.white).toBeGreaterThan(4);
  });

  it("accepts names and rgb(), rejects junk", () => {
    expect(convertColor("red")?.hex).toBe("#ff0000");
    expect(convertColor("rgb(0 0 0 / 50%)")?.hex).toBe("#00000080");
    expect(convertColor("not a color")).toBeNull();
  });

  it("grades contrast", () => {
    expect(contrastLevel(7.1)).toBe("AAA");
    expect(contrastLevel(4.6)).toBe("AA");
    expect(contrastLevel(3)).toBe("Fail");
  });
});

describe("data", () => {
  it("round-trips JSON ↔ YAML", () => {
    const yaml = jsonToYaml('{"name":"app","tags":["a","b"]}');
    expect(yaml).toBe("name: app\ntags:\n  - a\n  - b\n");
    expect(JSON.parse(yamlToJson(yaml))).toEqual({ name: "app", tags: ["a", "b"] });
  });

  it("JSON → CSV uses the union of keys", () => {
    expect(jsonToCsv('[{"id":1,"name":"A"},{"id":2,"tags":["x"]}]')).toBe(
      'id,name,tags\r\n1,A,\r\n2,,"[""x""]"',
    );
  });

  it("CSV → JSON detects numbers and booleans", () => {
    expect(JSON.parse(csvToJson("id;ok\n1;true\n2;false", ";"))).toEqual([
      { id: 1, ok: true },
      { id: 2, ok: false },
    ]);
  });

  it("rejects non-object rows for CSV", () => {
    expect(() => jsonToCsv("[1,2]")).toThrow(/array of objects/);
  });
});

describe("jsonToTs", () => {
  it("infers nested interfaces and optional keys", () => {
    const ts = jsonToTs(
      '{"id":1,"user":{"name":"K"},"items":[{"sku":"a","qty":1},{"sku":"b"}]}',
      "Order",
    );
    expect(ts).toContain(
      "export interface Order {\n  id: number;\n  user: User;\n  items: Item[];\n}",
    );
    expect(ts).toContain("export interface User {\n  name: string;\n}");
    expect(ts).toContain("export interface Item {\n  sku: string;\n  qty?: number;\n}");
  });

  it("handles root arrays and odd keys", () => {
    expect(jsonToTs('[{"first-name":"x"}]', "people")).toContain('"first-name": string;');
    expect(jsonToTs("[1, 2]", "nums")).toBe("export type Nums = number[];");
  });
});

describe("encoding", () => {
  it("Base64 handles UTF-8 and url-safe output", () => {
    expect(base64Encode("مرحبا")).toBe("2YXYsdit2KjYpw==");
    expect(base64Decode("2YXYsdit2KjYpw")).toBe("مرحبا");
    expect(base64Encode("??>", true)).toBe("Pz8-");
  });

  it("URL encode/decode and parse", () => {
    expect(urlEncode("a b&c")).toBe("a%20b%26c");
    expect(urlDecode("a+b%20c")).toBe("a b c");
    expect(() => urlDecode("%E0%A4%A")).toThrow();
    const u = parseUrl("https://example.com:8080/a%20b?q=react&page=2#top")!;
    expect(u).toMatchObject({
      protocol: "https",
      host: "example.com",
      port: "8080",
      path: "/a b",
      hash: "#top",
    });
    expect(u.params).toEqual([
      ["q", "react"],
      ["page", "2"],
    ]);
  });
});

describe("time", () => {
  it("detects seconds vs milliseconds", () => {
    expect(parseTime("1700000000")?.toISOString()).toBe("2023-11-14T22:13:20.000Z");
    expect(parseTime("1700000000000")?.toISOString()).toBe("2023-11-14T22:13:20.000Z");
    expect(parseTime("2026-11-20T10:00:00Z")?.getTime()).toBe(1795168800000);
    expect(parseTime("nope")).toBeNull();
  });

  it("formats and describes relative time", () => {
    const now = new Date("2026-11-20T12:00:00Z");
    expect(relativeTime(new Date("2026-11-20T09:00:00Z"), now)).toBe("3 hours ago");
    expect(relativeTime(new Date("2026-11-21T12:00:00Z"), now)).toBe("tomorrow");
    const f = formatTime(new Date("2026-11-20T10:00:00Z"), now, "UTC");
    expect(f.unixSeconds).toBe("1795168800");
    expect(f.iso).toBe("2026-11-20T10:00:00.000Z");
  });
});

describe("svgToJsx", () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon"><path fill="#000" stroke-width="2" d="M4 12h16"/></svg>`;

  it("converts attributes and wraps in a component", () => {
    const out = svgToJsx(svg, {
      componentName: "Minus",
      typescript: true,
      currentColor: true,
      removeSize: true,
    });
    expect(out).toContain('import type { SVGProps } from "react";');
    expect(out).toContain("export function Minus(props: SVGProps<SVGSVGElement>)");
    expect(out).toContain('className="icon" {...props}>');
    expect(out).toContain('<path fill="currentColor" strokeWidth="2" d="M4 12h16" />');
    expect(out).not.toContain('width="24"');
  });

  it("turns style strings into objects", () => {
    const out = svgToJsx('<svg><rect style="fill-opacity: .5; --x: 1"/></svg>', {
      componentName: "X",
      typescript: false,
      currentColor: false,
      removeSize: false,
    });
    expect(out).toContain('style={{ fillOpacity: ".5", "--x": "1" }}');
  });

  it("rejects non-SVG input", () => {
    expect(() =>
      svgToJsx("<div>", {
        componentName: "X",
        typescript: false,
        currentColor: false,
        removeSize: false,
      }),
    ).toThrow();
  });
});

import { fitSize, formatBytes, outputName, sizeChange } from "./lib/image";

describe("image helpers", () => {
  it("fits without upscaling", () => {
    expect(fitSize(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitSize(800, 600, 1600)).toEqual({ width: 800, height: 600 });
    expect(fitSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("names, sizes and change", () => {
    expect(outputName("hero.photo.png", "webp")).toBe("hero.photo.webp");
    expect(outputName("logo", "jpeg")).toBe("logo.jpg");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.00 MB");
    expect(sizeChange(1000, 370)).toBe("−63%");
    expect(sizeChange(1000, 1000)).toBe("0%");
  });
});
