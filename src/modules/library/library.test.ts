import type { DevKitModule } from "@/app/module";
import { useLibrary } from "@/lib/store/library";
import { makeBackup, parseBackup } from "./lib/backup";
import { favoriteItemId, favoriteKey, libraryItems } from "./lib/items";
import {
  escapeBody,
  fromVsCode,
  languageFromFileName,
  stripJsonc,
  toVsCode,
  unescapeBody,
} from "./lib/vscode";

beforeEach(() => {
  useLibrary.setState({ snippets: [], favorites: [], rev: 0 });
});

describe("library store", () => {
  it("adds, updates, removes and restores snippets", () => {
    const lib = useLibrary.getState();
    const s = lib.addSnippet({ code: "const a = 1;", title: "Box shadow (CSS)" });
    expect(s.prefix).toBe("box-shadow-css");
    expect(s.language).toBe("text");
    lib.updateSnippet(s.id, { language: "css" });
    expect(useLibrary.getState().snippets[0]!.language).toBe("css");
    const removed = lib.removeSnippet(s.id)!;
    expect(useLibrary.getState().snippets).toHaveLength(0);
    lib.restoreSnippet(removed);
    expect(useLibrary.getState().snippets[0]!.id).toBe(s.id);
    expect(useLibrary.getState().rev).toBe(4);
  });

  it("toggles favorites and skips duplicate imports", () => {
    const lib = useLibrary.getState();
    expect(lib.toggleFavorite("css-tools:shadow")).toBe(true);
    expect(lib.toggleFavorite("css-tools:shadow")).toBe(false);
    expect(
      lib.importSnippets([{ code: "x", title: "A" }, { code: "x", title: "A" }, { code: "y" }]),
    ).toBe(2);
    expect(lib.importSnippets([{ code: "x", title: "A" }])).toBe(0);
    expect(lib.importFavorites(["a:b", "a:b"])).toBe(1);
  });
});

describe("VS Code snippets", () => {
  it("escapes $ but keeps tab stops", () => {
    expect(escapeBody("`${name}` costs $5 and $1 ${2:x}")).toBe(
      "`\\${name}` costs $5 and $1 ${2:x}",
    );
    expect(escapeBody("$1 $x", false)).toBe("\\$1 \\$x");
    expect(escapeBody("a\\nb")).toBe("a\\\\nb");
    expect(unescapeBody(escapeBody("`${a}` \\n $1"))).toBe("`${a}` \\n $1");
  });

  it("exports unique names, scopes and body lines", () => {
    const lib = useLibrary.getState();
    lib.addSnippet({ code: "a\nb", title: "Same", language: "tsx", prefix: "same" });
    lib.addSnippet({ code: "c", title: "Same", language: "text", prefix: "other" });
    const out = toVsCode(useLibrary.getState().snippets);
    expect(Object.keys(out).sort()).toEqual(["Same", "Same (2)"]);
    const tsx = Object.values(out).find((v) => v.prefix === "same")!;
    expect(tsx.scope).toBe("typescriptreact,javascriptreact");
    expect(tsx.body).toEqual(["a", "b"]);
    expect(Object.values(out).find((v) => v.prefix !== "same")!.scope).toBeUndefined();
  });

  it("reads JSONC files with comments and trailing commas", () => {
    const text = `{
      // my snippets
      "Log": { "prefix": ["log", "cl"], "body": ["console.log('$1'); // \\"hi\\"", "/* not a comment */"], "scope": "javascript,typescript", },
      /* block */
      "Effect": { "prefix": "uef", "body": "useEffect(() => {\\n  \\\\$x\\n}, []);" },
    }`;
    expect(() => JSON.parse(stripJsonc(text))).not.toThrow();
    const list = fromVsCode(text, "tsx");
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ title: "Log", prefix: "log", language: "javascript" });
    expect(list[0]!.code).toBe(`console.log('$1'); // "hi"\n/* not a comment */`);
    expect(list[1]).toMatchObject({ language: "tsx", code: "useEffect(() => {\n  $x\n}, []);" });
    expect(languageFromFileName("typescriptreact.json")).toBe("tsx");
    expect(() => fromVsCode("[]")).toThrow(/object of snippets/);
    expect(() => fromVsCode("{nope")).toThrow(/valid/);
  });

  it("round-trips through export and import", () => {
    const lib = useLibrary.getState();
    lib.addSnippet({
      code: "const t = `${a} $1`;\nconst p = 'C:\\\\x';",
      title: "Tpl",
      language: "typescript",
    });
    const text = JSON.stringify(toVsCode(useLibrary.getState().snippets));
    const [back] = fromVsCode(text);
    expect(back!.code).toBe(useLibrary.getState().snippets[0]!.code);
    expect(back!.language).toBe("typescript");
  });
});

describe("backup + items", () => {
  it("backs up and restores", () => {
    const s = useLibrary.getState().addSnippet({ code: "x", title: "X", tags: ["a"] });
    const b = parseBackup(makeBackup([s], ["m:i"]));
    expect(b.snippets[0]!.tags).toEqual(["a"]);
    expect(b.favorites).toEqual(["m:i"]);
    expect(() => parseBackup('{"app":"other"}')).toThrow(/backup/);
  });

  it("lists manage page, live favorites and snippets", () => {
    const fake = {
      id: "css-tools",
      title: "CSS Tools",
      items: () => [{ id: "shadow", title: "Box shadow", copyValue: "x" }],
    } as unknown as DevKitModule;
    const lib = useLibrary.getState();
    lib.toggleFavorite("css-tools:shadow");
    lib.toggleFavorite("gone:item"); // module removed → skipped
    lib.addSnippet({ code: "c", title: "Mine", language: "css" });
    const items = libraryItems((id) => (id === fake.id ? fake : undefined));
    expect(items.map((i) => i.group)).toEqual(["Library", "Favorites", "My snippets"]);
    expect(items[1]).toMatchObject({
      id: "f-css-tools--shadow",
      title: "Box shadow",
      copyValue: "x",
    });
    expect(items[2]).toMatchObject({ title: "Mine", copyValue: "c", tags: ["css"] });
    expect(favoriteKey(favoriteItemId("a-b:c-d"))).toBe("a-b:c-d");
  });
});
