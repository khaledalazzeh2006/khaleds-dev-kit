import type { Faker } from "@faker-js/faker";
import { allColumns, type Column, type Table } from "./schema";
import type { Dialect } from "./sql";

type Gen = (f: Faker, i: number) => unknown;

/** Pick a realistic generator from the column's name first, then its type. */
export function generatorFor(c: Column): Gen {
  const n = c.name.toLowerCase();
  if (c.type === "uuid") return (f) => f.string.uuid();
  if (c.primary && (c.type === "id" || c.type === "int")) return (_, i) => i + 1;
  if (/email/.test(n)) return (f) => f.internet.email().toLowerCase();
  if (/^(full_?name|name)$/.test(n)) return (f) => f.person.fullName();
  if (/first_?name/.test(n)) return (f) => f.person.firstName();
  if (/last_?name/.test(n)) return (f) => f.person.lastName();
  if (/user_?name|login/.test(n)) return (f) => f.internet.username();
  if (/phone|mobile/.test(n)) return (f) => f.phone.number({ style: "international" });
  if (/password/.test(n)) return (f) => f.string.alphanumeric(60);
  if (/city/.test(n)) return (f) => f.location.city();
  if (/country/.test(n)) return (f) => f.location.country();
  if (/address|street/.test(n)) return (f) => f.location.streetAddress();
  if (/url|website|link/.test(n)) return (f) => f.internet.url();
  if (/avatar|image|photo/.test(n)) return (f) => f.image.url();
  if (/title|subject/.test(n))
    return (f) => f.lorem.sentence({ min: 3, max: 7 }).replace(/\.$/, "");
  if (/slug/.test(n)) return (f) => f.lorem.slug(3);
  if (/sku|code/.test(n)) return (f) => f.string.alphanumeric({ length: 8, casing: "upper" });
  if (/status/.test(n)) return (f) => f.helpers.arrayElement(["pending", "active", "done"]);
  if (/price|total|amount|cost/.test(n))
    return (f) => Number(f.commerce.price({ min: 1, max: 500 }));
  if (/qty|quantity|stock|count/.test(n)) return (f) => f.number.int({ min: 0, max: 100 });
  if (/(body|content|description|bio|text)/.test(n)) return (f) => f.lorem.paragraph();
  switch (c.type) {
    case "id":
    case "int":
    case "bigint":
      return (f) => f.number.int({ min: 1, max: 1000 });
    case "decimal":
    case "float":
      return (f) => f.number.float({ min: 0, max: 1000, fractionDigits: 2 });
    case "boolean":
      return (f) => f.datatype.boolean();
    case "date":
      return (f) => f.date.past({ years: 3 }).toISOString().slice(0, 10);
    case "datetime":
      return (f) => f.date.recent({ days: 90 }).toISOString();
    case "json":
      return (f) => ({ tags: f.lorem.words(2).split(" ") });
    default:
      return (f) => f.lorem.words(3);
  }
}

export type Row = Record<string, unknown>;

/** Key values already generated for a parent table's column ("table.column" → values). */
export type KeyPool = Map<string, unknown[]>;

/**
 * Fake rows for a table. Same seed → same data, so INSERT scripts are reproducible.
 * Foreign keys pick from `keys` (the parent's real generated values, so uuid keys match);
 * without a pool they fall back to ids 1…count.
 */
export function seedRows(
  f: Faker,
  t: Table,
  count: number,
  keys: KeyPool = new Map(),
  seed = 42,
): Row[] {
  f.seed(seed);
  // Dates are relative to today (midnight UTC), so the same seed gives the same rows all day.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  f.setDefaultRefDate(today);
  const cols = allColumns(t);
  return Array.from({ length: count }, (_, i) =>
    Object.fromEntries(
      cols.map((c) => {
        if (c.references) {
          if (c.nullable && f.number.int({ min: 0, max: 9 }) === 0) return [c.name, null];
          const pool = keys.get(`${c.references.table}.${c.references.column}`);
          if (pool?.length) return [c.name, f.helpers.arrayElement(pool)];
          return [
            c.name,
            c.type === "uuid" ? f.string.uuid() : f.number.int({ min: 1, max: Math.max(1, count) }),
          ];
        }
        if (c.nullable && f.number.int({ min: 0, max: 9 }) === 0) return [c.name, null];
        return [c.name, generatorFor(c)(f, i)];
      }),
    ),
  );
}

/**
 * Seed tables in dependency order (pass them sorted), remembering every generated column so child
 * foreign keys always point at rows that exist — int or uuid.
 */
export function seedTables(
  f: Faker,
  tables: Table[],
  count: number,
  seed = 42,
): { t: Table; rows: Row[] }[] {
  const keys: KeyPool = new Map();
  return tables.map((t, i) => {
    const rows = seedRows(f, t, count, keys, seed + i);
    for (const c of allColumns(t))
      keys.set(
        `${t.name}.${c.name}`,
        rows.map((r) => r[c.name]).filter((v) => v != null),
      );
    return { t, rows };
  });
}

const sqlValue = (v: unknown, d: Dialect): string => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean")
    return d === "postgresql" || d === "mysql" ? String(v).toUpperCase() : v ? "1" : "0";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return `${d === "sqlserver" ? "N" : ""}'${s.replace(/'/g, "''")}'`;
};

export function rowsToSql(t: Table, rows: Row[], d: Dialect): string {
  if (!rows.length) return "";
  const q =
    d === "mysql"
      ? (s: string) => `\`${s}\``
      : d === "sqlserver"
        ? (s: string) => `[${s}]`
        : (s: string) => `"${s}"`;
  const cols = Object.keys(rows[0]!).filter(
    (k) =>
      !(
        d === "postgresql" &&
        t.columns.find((c) => c.name === k)?.type === "id" &&
        t.columns.find((c) => c.name === k)?.primary
      ),
  );
  const values = rows.map((r) => `  (${cols.map((c) => sqlValue(r[c], d)).join(", ")})`);
  const identityOn = d === "sqlserver" && t.columns.some((c) => c.primary && c.type === "id");
  const insert = `INSERT INTO ${q(t.name)} (${cols.map(q).join(", ")}) VALUES\n${values.join(",\n")};`;
  return identityOn
    ? `SET IDENTITY_INSERT ${q(t.name)} ON;\n${insert}\nSET IDENTITY_INSERT ${q(t.name)} OFF;`
    : insert;
}
