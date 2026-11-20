import {
  SNIPPET_LANGUAGES,
  type LibrarySnippet,
  type NewSnippet,
  type SnippetLanguage,
} from "@/lib/store/library";

/**
 * VS Code treats `$` as a tab stop or variable, so a literal `$` must be written `\$`.
 * With `keepTabStops`, `$1`, `$0` and `${1:name}` stay live; every other `$` (template
 * literals, jQuery, PHP…) is escaped.
 */
export function escapeBody(code: string, keepTabStops = true): string {
  const escaped = code.replace(/\\/g, "\\\\");
  return keepTabStops ? escaped.replace(/\$(?!\d|\{\d)/g, "\\$") : escaped.replace(/\$/g, "\\$");
}

export function unescapeBody(body: string): string {
  return body.replace(/\\([$\\}])/g, "$1");
}

export interface VsCodeSnippet {
  prefix: string;
  body: string[];
  description?: string;
  scope?: string;
}

/** A `.code-snippets` file (global snippets, works for every language via `scope`). */
export function toVsCode(
  snippets: LibrarySnippet[],
  keepTabStops = true,
): Record<string, VsCodeSnippet> {
  const out: Record<string, VsCodeSnippet> = {};
  for (const s of snippets) {
    let name = s.title;
    for (let n = 2; name in out; n++) name = `${s.title} (${n})`;
    const scope = SNIPPET_LANGUAGES[s.language].scope;
    out[name] = {
      prefix: s.prefix,
      ...(scope ? { scope } : {}),
      body: escapeBody(s.code, keepTabStops).split(/\r?\n/),
      description: s.description || s.source || s.title,
    };
  }
  return out;
}

export const toVsCodeText = (snippets: LibrarySnippet[], keepTabStops = true) =>
  JSON.stringify(toVsCode(snippets, keepTabStops), null, 2) + "\n";

/** Strip // and /* *\/ comments and trailing commas (VS Code snippet files are JSONC). */
export function stripJsonc(text: string): string {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    const next = text[i + 1];
    if (inString) {
      out += c;
      if (c === "\\") out += text[++i] ?? "";
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (c === "/" && next === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i++;
    } else out += c;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}

const SCOPE_TO_LANGUAGE: Record<string, SnippetLanguage> = {
  typescript: "typescript",
  typescriptreact: "tsx",
  javascriptreact: "tsx",
  javascript: "javascript",
  html: "html",
  vue: "html",
  css: "css",
  scss: "css",
  less: "css",
  json: "json",
  jsonc: "json",
  sql: "sql",
  yaml: "yaml",
  shellscript: "shell",
  powershell: "shell",
  bat: "shell",
};

/**
 * Read a VS Code snippets file. `fallback` = language for files without `scope`
 * (e.g. `typescript.json` from the user snippets folder).
 */
export function fromVsCode(text: string, fallback: SnippetLanguage = "text"): NewSnippet[] {
  let data: unknown;
  try {
    data = JSON.parse(stripJsonc(text));
  } catch (e) {
    throw new Error("This isn't a valid VS Code snippets file (JSON).", { cause: e });
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Expected an object of snippets, like VS Code's .code-snippets files.");
  const list: NewSnippet[] = [];
  for (const [title, raw] of Object.entries(data as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object") continue;
    const v = raw as Record<string, unknown>;
    const body = Array.isArray(v.body)
      ? v.body.map(String).join("\n")
      : typeof v.body === "string"
        ? v.body
        : null;
    if (body === null) continue;
    const prefix = Array.isArray(v.prefix) ? String(v.prefix[0] ?? "") : String(v.prefix ?? "");
    const scope = typeof v.scope === "string" ? v.scope.split(",")[0]!.trim() : "";
    list.push({
      title,
      code: unescapeBody(body),
      prefix,
      description: typeof v.description === "string" ? v.description : "",
      language: SCOPE_TO_LANGUAGE[scope] ?? fallback,
      source: "Imported from VS Code",
    });
  }
  if (!list.length) throw new Error("No snippets found in this file.");
  return list;
}

/** Guess the language from a user-snippets file name like `typescriptreact.json`. */
export function languageFromFileName(name: string): SnippetLanguage {
  const base = name.toLowerCase().replace(/\.(code-snippets|json)$/, "");
  return SCOPE_TO_LANGUAGE[base] ?? "text";
}
