import twIndexCss from "virtual:tailwind-index-css";

type Compiler = Awaited<ReturnType<typeof import("tailwindcss").compile>>;
const cache = new Map<string, Promise<Compiler>>();

/**
 * Compile Tailwind v4 for a piece of HTML, fully offline (the same engine Tailwind's own browser
 * build uses). `entry` is the CSS entry file (@import "tailwindcss" + @theme ...).
 */
export async function compileTailwind(entry: string, html: string): Promise<string> {
  let compiler = cache.get(entry);
  if (!compiler) {
    compiler = import("tailwindcss").then(({ compile }) =>
      compile(entry, {
        base: "/",
        loadStylesheet: async (id: string, base: string) => {
          if (id !== "tailwindcss") throw new Error(`Can't load ${id} offline`);
          return { path: "tailwindcss/index.css", base, content: twIndexCss };
        },
      }),
    );
    if (cache.size > 20) cache.clear();
    cache.set(entry, compiler);
  }
  return (await compiler).build(candidates(html));
}

/** Every token that could be a class name. Tailwind ignores the ones that aren't. */
export function candidates(html: string): string[] {
  return [...new Set(html.split(/[\s"'`<>=]+/).filter(Boolean))];
}
