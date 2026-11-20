import type { ParamValue, Snippet } from "@/lib/content/schema";

export type ParamValues = Record<string, ParamValue>;

/** Defaults for every param of a snippet. */
export function defaultParams(snippet: Snippet): ParamValues {
  return Object.fromEntries((snippet.params ?? []).map((p) => [p.key, p.default]));
}

/** Replace {{key}} with the current value (falls back to the param default). Unknown keys stay as-is. */
export function fillParams(code: string, snippet: Snippet, values: ParamValues): string {
  const defaults = defaultParams(snippet);
  return code.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const v = key in values ? values[key] : defaults[key];
    return v === undefined ? match : String(v);
  });
}

/** npm install line for a snippet's dependencies. */
export function installCommand(snippet: Snippet): string | null {
  return snippet.dependencies?.length ? `npm install ${snippet.dependencies.join(" ")}` : null;
}
