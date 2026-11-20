import ts from "typescript";
import { compileTailwind } from "./lib/tailwind";
import {
  htmlDocument,
  htmlProject,
  nextProject,
  pageContext,
  pageHtml,
  viteProject,
} from "./lib/export";
import { htmlToJsx } from "./lib/jsx";
import { presets } from "./lib/presets";
import { sections } from "./lib/sections";
import { defaultTheme, entryCss, onBrand, type SiteTheme } from "./lib/theme";

const dark: SiteTheme = {
  ...defaultTheme,
  mode: "dark",
  brand: "#facc15",
  radius: "round",
  font: "serif",
};

/** Tailwind's selector escaping, enough for our class names. */
const sel = (cls: string) => "." + cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
const MARKERS = new Set(["group", "peer"]);

describe("templates: content", () => {
  it("has unique ids and component names, and presets only use real sections", () => {
    expect(new Set(sections.map((s) => s.id)).size).toBe(sections.length);
    expect(new Set(sections.map((s) => s.component)).size).toBe(sections.length);
    const ids = new Set(sections.map((s) => s.id));
    for (const p of presets)
      for (const id of p.sections) expect(ids, `${p.id} → ${id}`).toContain(id);
  });

  it.each(sections.map((s) => [s.id, s] as const))("%s is valid JSX after conversion", (_, s) => {
    const html = s.render(dark, pageContext(sections.map((x) => x.id)));
    expect(html).not.toMatch(/style=|<!--/);
    expect(html).not.toMatch(/<(input|img|br|hr|meta|link)\b(?![^>]*\/>)/);
    const src = `export default function X() { return (${htmlToJsx(html)}); }`;
    const out = ts.transpileModule(src, {
      reportDiagnostics: true,
      fileName: "x.tsx",
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
    });
    expect(
      out.diagnostics?.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")),
    ).toEqual([]);
  });

  it("every class name used by a section is a real Tailwind utility", async () => {
    const html = pageHtml(
      sections.map((s) => s.id),
      defaultTheme,
    );
    const css = await compileTailwind(entryCss(defaultTheme), html);
    const classes = new Set(
      [...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1]!.split(/\s+/)).filter(Boolean),
    );
    const missing = [...classes].filter((c) => !MARKERS.has(c) && !css.includes(sel(c)));
    expect(missing).toEqual([]);
  });
});

describe("templates: theme + export", () => {
  it("picks readable text on the brand color", () => {
    expect(onBrand("#6d28d9")).toBe("#ffffff");
    expect(onBrand("#facc15")).toBe("#111114");
    expect(entryCss(dark)).toContain("--color-on-brand: #111114;");
    expect(entryCss(dark)).toContain("--radius-btn: 9999px;");
  });

  it("navbar links to the sections on the page", () => {
    const portfolio = pageHtml(
      ["nav", "about", "projects", "skills", "contact", "footer"],
      defaultTheme,
    );
    expect(portfolio).toContain('href="#projects"');
    expect(portfolio).toContain('<section id="projects"');
    expect(portfolio).not.toContain('href="#pricing"');
    expect(portfolio).toContain("Get in touch");
    const landing = pageHtml(["nav", "features", "pricing"], defaultTheme);
    expect(landing).toContain("Sign in");
    // every anchor points at a real id
    const all = pageHtml(
      sections.map((s) => s.id),
      defaultTheme,
    );
    for (const a of pageContext(sections.map((s) => s.id)).anchors)
      expect(all).toContain(`id="${a.id}"`);
  });

  it("escapes the site name", () => {
    const html = pageHtml(["nav"], { ...defaultTheme, name: "<Tom & {Jerry}>" });
    expect(html).not.toContain("<Tom");
    expect(htmlToJsx(html)).not.toMatch(/\{Jerry\}/);
  });

  it("converts attributes for JSX", () => {
    expect(htmlToJsx('<label for="a" class="x"><input checked class="y" /></label>')).toBe(
      '<label htmlFor="a" className="x"><input defaultChecked className="y" /></label>',
    );
    expect(htmlToJsx('<svg stroke-width="2" stroke-linecap="round"></svg>')).toBe(
      '<svg strokeWidth="2" strokeLinecap="round"></svg>',
    );
    expect(htmlToJsx('<textarea rows="5"></textarea><input minlength="8" />')).toBe(
      "<textarea rows={5}></textarea><input minLength={8} />",
    );
    // text content is untouched
    expect(htmlToJsx("<p>class=x for you</p>")).toBe("<p>class=x for you</p>");
  });

  it("builds Vite, Next.js and HTML projects", () => {
    const ids = presets.find((p) => p.id === "landing")!.sections;
    const vite = viteProject(ids, defaultTheme, "My Landing");
    expect(Object.keys(vite)).toEqual(
      expect.arrayContaining([
        "package.json",
        "vite.config.ts",
        "src/App.tsx",
        "src/index.css",
        "src/components/Hero.tsx",
      ]),
    );
    expect(JSON.parse(vite["package.json"]!).name).toBe("my-landing");
    const next = nextProject(ids, defaultTheme, "My Landing");
    expect(next["app/page.tsx"]).toContain('import Hero from "@/components/Hero";');
    expect(JSON.parse(next["tsconfig.json"]!).include).toContain("next-env.d.ts");
    expect(next["components/Navbar.tsx"]).toContain("className=");
    const html = htmlProject(ids, defaultTheme, "My Landing", "/* css */");
    expect(html["index.html"]).toContain('<link rel="stylesheet" href="styles.css" />');
    expect(htmlDocument(ids, defaultTheme, "x", { inline: ".a{}" })).toContain("<style>\n.a{}");
  });
});
