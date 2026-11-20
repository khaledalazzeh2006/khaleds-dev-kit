import { parseJson } from "@/modules/formatters/lib/format";

/**
 * Infer TypeScript interfaces from a JSON sample.
 * - nested objects become their own interface (named from the key)
 * - arrays of objects are merged; keys missing in some items become optional
 */
export function jsonToTs(json: string, rootName = "Root"): string {
  if (!json.trim()) return "";
  const value = parseJson(json);
  const interfaces = new Map<string, string>();
  const used = new Set<string>();

  const pascal = (key: string) =>
    key
      .replace(/[^a-zA-Z0-9]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ""))
      .replace(/^./, (c) => c.toUpperCase())
      .replace(/^(\d)/, "_$1") || "Item";

  const uniqueName = (base: string) => {
    let name = base;
    for (let i = 2; used.has(name); i++) name = `${base}${i}`;
    used.add(name);
    return name;
  };

  const safeKey = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));

  function typeOf(v: unknown, nameHint: string): string {
    if (v === null) return "null";
    if (Array.isArray(v)) return arrayType(v, nameHint);
    if (typeof v === "object") return objectType([v as Record<string, unknown>], nameHint);
    return typeof v; // string | number | boolean
  }

  function arrayType(arr: unknown[], nameHint: string): string {
    if (arr.length === 0) return "unknown[]";
    const objects = arr.filter(
      (x): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x),
    );
    const others = arr.filter((x) => !(x && typeof x === "object" && !Array.isArray(x)));
    const types = new Set(others.map((x) => typeOf(x, nameHint)));
    if (objects.length) types.add(objectType(objects, singular(nameHint)));
    const union = [...types].join(" | ");
    return types.size > 1 ? `(${union})[]` : `${union}[]`;
  }

  function objectType(samples: Record<string, unknown>[], nameHint: string): string {
    const name = uniqueName(pascal(nameHint));
    const keys = [...new Set(samples.flatMap((s) => Object.keys(s)))];
    const lines = keys.map((k) => {
      const present = samples.filter((s) => k in s);
      const optional = present.length < samples.length ? "?" : "";
      const types = new Set(present.map((s) => typeOf(s[k], k)));
      return `  ${safeKey(k)}${optional}: ${[...types].join(" | ")};`;
    });
    interfaces.set(name, `export interface ${name} {\n${lines.join("\n")}\n}`);
    return name;
  }

  const root = typeOf(value, rootName);
  const blocks = [...interfaces.values()].reverse();
  if (!interfaces.has(root)) blocks.push(`export type ${pascal(rootName)} = ${root};`);
  return blocks.join("\n\n");
}

function singular(word: string): string {
  if (/ies$/i.test(word)) return word.replace(/ies$/i, "y");
  if (/s$/i.test(word) && !/ss$/i.test(word)) return word.slice(0, -1);
  return `${word}Item`;
}
