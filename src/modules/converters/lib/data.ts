import { dump, load } from "js-yaml";
import Papa from "papaparse";
import { parseJson } from "@/modules/formatters/lib/format";

export function jsonToYaml(json: string): string {
  if (!json.trim()) return "";
  return dump(parseJson(json), { lineWidth: 100, noRefs: true });
}

export function yamlToJson(text: string, indent = 2): string {
  if (!text.trim()) return "";
  return JSON.stringify(load(text), null, indent);
}

export type Delimiter = "," | ";" | "\t";

/** JSON array of objects → CSV (columns = union of keys, in first-seen order). */
export function jsonToCsv(json: string, delimiter: Delimiter = ","): string {
  if (!json.trim()) return "";
  const data = parseJson(json);
  const rows = Array.isArray(data) ? data : [data];
  if (!rows.every((r) => r !== null && typeof r === "object" && !Array.isArray(r))) {
    throw new Error('CSV needs an array of objects, e.g. [{"id": 1}].');
  }
  const columns = [...new Set(rows.flatMap((r) => Object.keys(r as object)))];
  const flat = rows.map((r) =>
    columns.map((c) => {
      const v = (r as Record<string, unknown>)[c];
      return v !== null && typeof v === "object" ? JSON.stringify(v) : v;
    }),
  );
  return Papa.unparse({ fields: columns, data: flat }, { delimiter });
}

/** CSV with a header row → JSON array of objects (numbers and booleans detected). */
export function csvToJson(csv: string, delimiter: Delimiter | "" = "", indent = 2): string {
  if (!csv.trim()) return "";
  const result = Papa.parse<Record<string, unknown>>(csv.trim(), {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    delimiter,
  });
  const first = result.errors[0];
  if (first) throw new Error(`CSV row ${(first.row ?? 0) + 2}: ${first.message}`);
  return JSON.stringify(result.data, null, indent);
}
