import { loadSnippets } from "@/lib/content/load";
import { fillParams, installCommand } from "./lib/render";
import { gsapItems, GROUPS, snippets } from "./lib/data";

describe("snippets content", () => {
  it("loads all GSAP snippets in known groups", () => {
    expect(snippets.length).toBeGreaterThanOrEqual(18);
    for (const s of snippets) expect(GROUPS, s.id).toContain(s.group);
    expect(gsapItems.at(-1)?.id).toBe("ease-visualizer");
  });

  it("declares every {{param}} used in both code flavors", () => {
    for (const s of loadSnippets()) {
      const used = [...`${s.code}${s.codeReact ?? ""}`.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
      for (const key of used)
        expect(
          s.params?.some((p) => p.key === key),
          `${s.id}: ${key}`,
        ).toBe(true);
    }
  });

  it("ease params only offer valid GSAP eases", async () => {
    const gsap = (await import("gsap")).default;
    for (const s of snippets)
      for (const p of s.params ?? [])
        if (p.type === "ease")
          for (const e of p.options ?? [])
            expect(typeof gsap.parseEase(e), `${s.id}: ${e}`).toBe("function");
  });
});

describe("fillParams", () => {
  const s = snippets.find((x) => x.id === "gsap-fade-in")!;

  it("uses values and falls back to defaults", () => {
    const out = fillParams(s.code, s, { y: 100 });
    expect(out).toContain("y: 100,");
    expect(out).toContain('ease: "power3.out"');
  });

  it("builds the install command", () => {
    expect(installCommand(s)).toBe("npm install gsap @gsap/react");
  });
});

describe("snippet code quality", () => {
  it("every filled snippet is valid JS/TSX (parsed by Prettier)", async () => {
    const [prettier, babel, estree, typescript] = await Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/babel"),
      import("prettier/plugins/estree"),
      import("prettier/plugins/typescript"),
    ]);
    for (const s of snippets) {
      const values = Object.fromEntries((s.params ?? []).map((p) => [p.key, p.default]));
      await expect(
        prettier.format(fillParams(s.code, s, values), {
          parser: "babel",
          plugins: [babel, estree],
        }),
        s.id,
      ).resolves.toBeTypeOf("string");
      if (s.codeReact)
        await expect(
          prettier.format(fillParams(s.codeReact, s, values), {
            parser: "typescript",
            plugins: [typescript, estree],
          }),
          `${s.id} (React)`,
        ).resolves.toBeTypeOf("string");
    }
  });

  it("React components never shadow an imported name", () => {
    for (const s of snippets) {
      const name = /export function (\w+)/.exec(s.codeReact ?? "")?.[1];
      const imported = [...(s.codeReact ?? "").matchAll(/import \{([^}]+)\}/g)].flatMap((m) =>
        m[1]!.split(",").map((x) => x.trim()),
      );
      if (name) expect(imported, s.id).not.toContain(name);
    }
  });
});
