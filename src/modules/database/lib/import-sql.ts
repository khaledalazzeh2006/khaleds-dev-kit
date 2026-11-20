import {
  column,
  table,
  type Column,
  type ColumnType,
  type OnDelete,
  type Schema,
  type Table,
} from "./schema";

const unquote = (s: string) => s.trim().replace(/^[`"[]|[`"\]]$/g, "");

/** Split on commas that are not inside parentheses. */
function splitTopLevel(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

function mapType(raw: string): { type: ColumnType; length?: number } {
  const t = raw.toLowerCase();
  const len = Number(/\((\d+)\)/.exec(t)?.[1]) || undefined;
  if (/uuid|uniqueidentifier/.test(t) || t === "char(36)") return { type: "uuid" };
  if (/bigint|bigserial|int8/.test(t)) return { type: "bigint" };
  if (/serial|int|integer|smallint|tinyint\b/.test(t) && !/point/.test(t)) {
    if (/^tinyint\(1\)/.test(t)) return { type: "boolean" };
    return { type: "int" };
  }
  if (/bool|bit\b/.test(t)) return { type: "boolean" };
  if (/decimal|numeric|money/.test(t)) return { type: "decimal" };
  if (/float|double|real/.test(t)) return { type: "float" };
  if (/timestamp|datetime/.test(t)) return { type: "datetime" };
  if (/^date\b/.test(t)) return { type: "date" };
  if (/json/.test(t)) return { type: "json" };
  if (/char|varchar|nvarchar/.test(t) && !/max/.test(t)) return { type: "string", length: len };
  return { type: "text" };
}

const onDeleteOf = (s: string | undefined): OnDelete =>
  /set null/i.test(s ?? "") ? "set null" : /cascade/i.test(s ?? "") ? "cascade" : "restrict";

/**
 * Read CREATE TABLE statements (PostgreSQL, MySQL, SQLite, SQL Server) into the designer's schema.
 * Understands column types, PRIMARY KEY, NOT NULL, UNIQUE, DEFAULT, inline and table-level FOREIGN KEYs.
 * Other statements are ignored. Throws if no table is found.
 */
export function importSql(sql: string): Schema {
  const clean = sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const tables: Table[] = [];
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?([`"[\]\w.]+)\s*\(/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean))) {
    // find the matching closing parenthesis
    let depth = 1;
    let i = re.lastIndex;
    for (; i < clean.length && depth > 0; i++) {
      if (clean[i] === "(") depth++;
      if (clean[i] === ")") depth--;
    }
    const body = clean.slice(re.lastIndex, i - 1);
    const name = unquote(m[1]!.split(".").pop()!);
    const columns: Column[] = [];
    const tableLevel: string[] = [];

    for (const part of splitTopLevel(body)) {
      if (
        /^(constraint\s+\S+\s+)?(primary\s+key|foreign\s+key|unique|check|key|index)\b/i.test(part)
      ) {
        tableLevel.push(part);
        continue;
      }
      const cm =
        /^([`"[\]\w]+)\s+([\w]+(?:\s*\([^)]*\))?(?:\s+(?:varying|precision|with(?:out)?\s+time\s+zone))*)(.*)$/is.exec(
          part,
        );
      if (!cm) continue;
      const rest = cm[3] ?? "";
      const { type, length } = mapType(cm[2]!);
      const isPk = /primary\s+key/i.test(rest);
      const auto = /identity|auto_?increment|serial/i.test(rest + cm[2]);
      const def = /default\s+(\([^)]*\)|'[^']*'|[^\s,]+)/i.exec(rest)?.[1] ?? "";
      const ref =
        /references\s+([`"[\]\w.]+)\s*\(\s*([`"[\]\w]+)\s*\)(?:\s+on\s+delete\s+(set\s+null|cascade|restrict|no\s+action))?/i.exec(
          rest,
        );
      columns.push(
        column(
          unquote(cm[1]!),
          isPk && auto && (type === "int" || type === "bigint") ? "id" : type,
          {
            length,
            primary: isPk,
            nullable: !isPk && !/not\s+null/i.test(rest),
            unique: /\bunique\b/i.test(rest),
            default: /now\(\)|current_timestamp|getdate|sysutcdatetime/i.test(def)
              ? "now"
              : /gen_random_uuid|uuid\(\)|newid/i.test(def)
                ? ""
                : def,
            references: ref
              ? {
                  table: unquote(ref[1]!.split(".").pop()!),
                  column: unquote(ref[2]!),
                  onDelete: onDeleteOf(ref[3]),
                }
              : undefined,
          },
        ),
      );
    }

    for (const tl of tableLevel) {
      const pk = /primary\s+key\s*\(([^)]+)\)/i.exec(tl);
      if (pk)
        for (const n of pk[1]!.split(",").map(unquote)) {
          const c = columns.find((x) => x.name === n);
          if (c) {
            c.primary = true;
            c.nullable = false;
          }
        }
      const fk =
        /foreign\s+key\s*\(([^)]+)\)\s*references\s+([`"[\]\w.]+)\s*\(([^)]+)\)(?:\s+on\s+delete\s+(set\s+null|cascade|restrict|no\s+action))?/i.exec(
          tl,
        );
      if (fk) {
        const c = columns.find((x) => x.name === unquote(fk[1]!));
        if (c)
          c.references = {
            table: unquote(fk[2]!.split(".").pop()!),
            column: unquote(fk[3]!),
            onDelete: onDeleteOf(fk[4]),
          };
      }
      const uq = /^(?:constraint\s+\S+\s+)?unique\s*\(([^)]+)\)/i.exec(tl);
      if (uq && !uq[1]!.includes(",")) {
        const c = columns.find((x) => x.name === unquote(uq[1]!));
        if (c) c.unique = true;
      }
    }

    // created_at/updated_at → the table's timestamps switch
    const hasTs = ["created_at", "updated_at"].every((n) => columns.some((c) => c.name === n));
    tables.push(
      table(
        name,
        hasTs ? columns.filter((c) => c.name !== "created_at" && c.name !== "updated_at") : columns,
        hasTs,
      ),
    );
    re.lastIndex = i;
  }
  if (!tables.length) throw new Error("No CREATE TABLE statements found.");
  return { tables };
}
