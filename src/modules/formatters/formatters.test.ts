import { byteSize, formatCode, formatJson, minifyCode, parseJson } from "./lib/format";
import { lineDiff, unifiedPatch } from "./lib/diff";

describe("json", () => {
  it("formats with 2, 4 or tab indent", () => {
    expect(formatJson('{"a":1}', "2")).toBe('{\n  "a": 1\n}');
    expect(formatJson('{"a":1}', "tab")).toBe('{\n\t"a": 1\n}');
  });

  it("reports line and column for invalid JSON", () => {
    expect(() => parseJson('{\n  "a": 1,\n}')).toThrow(/line 3, column 1/);
  });
});

describe("formatCode", () => {
  it("formats CSS with prettier", async () => {
    expect(await formatCode("css", "a{color:red}", { indent: "2" })).toBe(
      "a {\n  color: red;\n}\n",
    );
  });

  it("formats TypeScript", async () => {
    expect(await formatCode("typescript", "const a:number=1", { indent: "2" })).toBe(
      "const a: number = 1;\n",
    );
  });

  it("formats SQL with uppercase keywords", async () => {
    const out = await formatCode("sql", "select id from users where id=1", {
      indent: "2",
      sqlDialect: "postgresql",
    });
    expect(out).toBe("SELECT\n  id\nFROM\n  users\nWHERE\n  id = 1");
  });

  it("returns empty for empty input", async () => {
    expect(await formatCode("html", "   ", { indent: "2" })).toBe("");
  });
});

describe("minifyCode", () => {
  it("minifies CSS and JS", async () => {
    expect(await minifyCode("css", "a {\n  color: #ff0000;\n}")).toBe("a{color:red}");
    expect(await minifyCode("javascript", "export const answer = 40 + 2;")).toBe(
      "export const answer=42;",
    );
  });
});

describe("diff", () => {
  it("counts added and removed lines", () => {
    const { lines, added, removed } = lineDiff("a\nb\nc\n", "a\nB\nc\nd\n");
    expect(added).toBe(2);
    expect(removed).toBe(1);
    expect(lines.map((l) => l.type)).toEqual(["same", "remove", "add", "same", "add"]);
  });

  it("builds a unified patch", () => {
    expect(unifiedPatch("a\n", "b\n")).toContain("-a\n+b");
  });
});

it("byteSize", () => {
  expect(byteSize("abc")).toBe("3 B");
  expect(byteSize("x".repeat(2048))).toBe("2.0 KB");
});
