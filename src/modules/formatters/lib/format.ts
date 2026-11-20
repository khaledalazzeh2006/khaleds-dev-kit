// Pure formatting helpers. Heavy libraries are imported on demand so they only load
// when a formatter is actually used.

import { parseJson } from "@/lib/json";

export { parseJson };

export type Indent = "2" | "4" | "tab";
export type SqlDialect = "postgresql" | "mysql" | "sqlite" | "transactsql" | "sql";
export type KeywordCase = "upper" | "lower" | "preserve";

export interface FormatOptions {
  indent: Indent;
  printWidth?: number;
  sqlDialect?: SqlDialect;
  keywordCase?: KeywordCase;
}

export type FormatLang = "json" | "html" | "css" | "javascript" | "typescript" | "sql";

const indentOf = (i: Indent) => ({ useTabs: i === "tab", tabWidth: i === "4" ? 4 : 2 });

export function formatJson(text: string, indent: Indent): string {
  return JSON.stringify(parseJson(text), null, indent === "tab" ? "\t" : Number(indent));
}

export function minifyJson(text: string): string {
  return JSON.stringify(parseJson(text));
}

async function prettierFormat(code: string, parser: string, opts: FormatOptions): Promise<string> {
  const [prettier, babel, estree, html, postcss, typescript] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/babel"),
    import("prettier/plugins/estree"),
    import("prettier/plugins/html"),
    import("prettier/plugins/postcss"),
    import("prettier/plugins/typescript"),
  ]);
  return prettier.format(code, {
    parser,
    plugins: [babel, estree, html, postcss, typescript],
    printWidth: opts.printWidth ?? 100,
    ...indentOf(opts.indent),
  });
}

export async function formatCode(
  lang: FormatLang,
  code: string,
  opts: FormatOptions,
): Promise<string> {
  if (!code.trim()) return "";
  switch (lang) {
    case "json":
      return formatJson(code, opts.indent);
    case "html":
      return prettierFormat(code, "html", opts);
    case "css":
      return prettierFormat(code, "css", opts);
    case "javascript":
      return prettierFormat(code, "babel", opts);
    case "typescript":
      return prettierFormat(code, "typescript", opts);
    case "sql": {
      const { format } = await import("sql-formatter");
      return format(code, {
        language: opts.sqlDialect ?? "postgresql",
        keywordCase: opts.keywordCase ?? "upper",
        ...(opts.indent === "tab" ? { useTabs: true } : { tabWidth: Number(opts.indent) }),
      });
    }
  }
}

/** Languages that support Minify. */
export const minifiable: Partial<Record<FormatLang, true>> = {
  json: true,
  css: true,
  javascript: true,
};

export async function minifyCode(lang: FormatLang, code: string): Promise<string> {
  if (!code.trim()) return "";
  switch (lang) {
    case "json":
      return minifyJson(code);
    case "css": {
      const { minify } = await import("csso");
      return minify(code).css;
    }
    case "javascript": {
      const { minify } = await import("terser");
      return (await minify(code, { module: true })).code ?? "";
    }
    default:
      throw new Error(`Minify isn't available for ${lang}.`);
  }
}

/** "1.2 KB" style size of a string in UTF-8. */
export function byteSize(text: string): string {
  const bytes = new TextEncoder().encode(text).length;
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}
