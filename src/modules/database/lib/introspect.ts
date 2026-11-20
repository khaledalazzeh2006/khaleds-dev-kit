// Read the tables of a live database and turn them into a designer Schema.
// One query per engine returns one row per column, with the same column names everywhere.

import {
  column,
  table,
  uid,
  type Column,
  type ColumnType,
  type OnDelete,
  type Schema,
} from "./schema";

export type LiveEngine = "postgresql" | "mysql" | "sqlite";

export function engineOfUrl(url: string): LiveEngine | null {
  const scheme = url.trim().split(":")[0]?.toLowerCase();
  if (scheme === "postgres" || scheme === "postgresql") return "postgresql";
  if (scheme === "mysql" || scheme === "mariadb") return "mysql";
  if (scheme === "sqlite" || scheme === "file") return "sqlite";
  return null;
}

/** Prisma-style URL options the Rust driver doesn't know; `file:` (Prisma SQLite) → `sqlite:`. */
const PRISMA_ONLY = [
  "schema",
  "connection_limit",
  "pool_timeout",
  "pgbouncer",
  "socket_timeout",
  "connect_timeout",
  "sslaccept",
];

export function normalizeUrl(url: string): string {
  let u = url.trim();
  if (/^file:/i.test(u)) u = "sqlite:" + u.slice(5);
  const [base, query] = u.split("?");
  if (!query) return u;
  const kept = query
    .split("&")
    .filter((p) => !PRISMA_ONLY.includes(p.split("=")[0]!.toLowerCase()));
  return kept.length ? `${base}?${kept.join("&")}` : base!;
}

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

export function introspectionSql(engine: LiveEngine, pgSchema = "public"): string {
  if (engine === "postgresql") {
    const sch = q(pgSchema);
    return `SELECT c.table_name, c.column_name, c.data_type, c.udt_name, c.is_nullable, c.column_default,
  c.character_maximum_length, c.is_identity,
  (SELECT 'yes' FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage k ON k.constraint_name = tc.constraint_name AND k.table_schema = tc.table_schema
     WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = c.table_schema AND tc.table_name = c.table_name AND k.column_name = c.column_name LIMIT 1) AS is_pk,
  (SELECT 'yes' FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage k ON k.constraint_name = tc.constraint_name AND k.table_schema = tc.table_schema
     WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = c.table_schema AND tc.table_name = c.table_name AND k.column_name = c.column_name
       AND (SELECT count(*) FROM information_schema.key_column_usage k2 WHERE k2.constraint_name = tc.constraint_name AND k2.table_schema = tc.table_schema) = 1
     LIMIT 1) AS is_unique,
  fk.ref_table, fk.ref_column, fk.delete_rule
FROM information_schema.columns c
LEFT JOIN LATERAL (
  SELECT ccu.table_name AS ref_table, ccu.column_name AS ref_column, rc.delete_rule
  FROM information_schema.key_column_usage k
  JOIN information_schema.referential_constraints rc ON rc.constraint_name = k.constraint_name AND rc.constraint_schema = k.table_schema
  JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = rc.unique_constraint_name AND ccu.constraint_schema = rc.unique_constraint_schema
  WHERE k.table_schema = c.table_schema AND k.table_name = c.table_name AND k.column_name = c.column_name
  LIMIT 1
) fk ON true
WHERE c.table_schema = ${sch}
  AND c.table_name IN (SELECT table_name FROM information_schema.tables WHERE table_schema = ${sch} AND table_type = 'BASE TABLE')
ORDER BY c.table_name, c.ordinal_position;`;
  }
  if (engine === "mysql") {
    return `SELECT c.TABLE_NAME AS table_name, c.COLUMN_NAME AS column_name, c.DATA_TYPE AS data_type, c.COLUMN_TYPE AS udt_name,
  c.IS_NULLABLE AS is_nullable, c.COLUMN_DEFAULT AS column_default, c.CHARACTER_MAXIMUM_LENGTH AS character_maximum_length,
  IF(c.EXTRA LIKE '%auto_increment%', 'YES', 'NO') AS is_identity,
  IF(c.COLUMN_KEY = 'PRI', 'yes', NULL) AS is_pk,
  IF(c.COLUMN_KEY = 'UNI', 'yes', NULL) AS is_unique,
  k.REFERENCED_TABLE_NAME AS ref_table, k.REFERENCED_COLUMN_NAME AS ref_column, rc.DELETE_RULE AS delete_rule
FROM information_schema.COLUMNS c
JOIN information_schema.TABLES t ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME AND t.TABLE_TYPE = 'BASE TABLE'
LEFT JOIN information_schema.KEY_COLUMN_USAGE k ON k.TABLE_SCHEMA = c.TABLE_SCHEMA AND k.TABLE_NAME = c.TABLE_NAME
  AND k.COLUMN_NAME = c.COLUMN_NAME AND k.REFERENCED_TABLE_NAME IS NOT NULL
LEFT JOIN information_schema.REFERENTIAL_CONSTRAINTS rc ON rc.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND rc.CONSTRAINT_NAME = k.CONSTRAINT_NAME
WHERE c.TABLE_SCHEMA = DATABASE()
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;`;
  }
  return `SELECT m.name AS table_name, p.name AS column_name, p.type AS data_type, p.type AS udt_name,
  CASE WHEN p."notnull" = 1 OR p.pk > 0 THEN 'NO' ELSE 'YES' END AS is_nullable,
  p.dflt_value AS column_default, NULL AS character_maximum_length,
  CASE WHEN p.pk > 0 AND upper(p.type) = 'INTEGER' THEN 'YES' ELSE 'NO' END AS is_identity,
  CASE WHEN p.pk > 0 THEN 'yes' END AS is_pk,
  (SELECT 'yes' FROM pragma_index_list(m.name) il
     WHERE il."unique" = 1 AND il.origin = 'u'
       AND (SELECT count(*) FROM pragma_index_info(il.name)) = 1
       AND (SELECT name FROM pragma_index_info(il.name)) = p.name) AS is_unique,
  f."table" AS ref_table, f."to" AS ref_column, f.on_delete AS delete_rule
FROM sqlite_master m
JOIN pragma_table_info(m.name) p
LEFT JOIN pragma_foreign_key_list(m.name) f ON f."from" = p.name
WHERE m.type = 'table' AND m.name NOT LIKE 'sqlite_%'
ORDER BY m.name, p.cid;`;
}

/** List tables for the sidebar (fast, no columns). */
export function tablesSql(engine: LiveEngine, pgSchema = "public"): string {
  if (engine === "postgresql")
    return `SELECT table_name FROM information_schema.tables WHERE table_schema = ${q(pgSchema)} AND table_type = 'BASE TABLE' ORDER BY table_name;`;
  if (engine === "mysql")
    return "SELECT TABLE_NAME AS table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;";
  return "SELECT name AS table_name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;";
}

/** `SELECT * … LIMIT 100` with the right identifier quotes. */
export function previewSql(engine: LiveEngine, tableName: string, pgSchema = "public"): string {
  const id =
    engine === "mysql"
      ? `\`${tableName.replace(/`/g, "``")}\``
      : `"${tableName.replace(/"/g, '""')}"`;
  const full =
    engine === "postgresql" && pgSchema !== "public"
      ? `"${pgSchema.replace(/"/g, '""')}".${id}`
      : id;
  return `SELECT * FROM ${full} LIMIT 100;`;
}

export type IntrospectionRow = Record<
  | "table_name"
  | "column_name"
  | "data_type"
  | "udt_name"
  | "is_nullable"
  | "column_default"
  | "character_maximum_length"
  | "is_identity"
  | "is_pk"
  | "is_unique"
  | "ref_table"
  | "ref_column"
  | "delete_rule",
  string | null
>;

/** Turn the driver's columns + rows into objects keyed by column name. */
export function toObjects(columns: string[], rows: (string | null)[][]): IntrospectionRow[] {
  return rows.map(
    (r) =>
      Object.fromEntries(
        columns.map((c, i) => [c.toLowerCase(), r[i] ?? null]),
      ) as IntrospectionRow,
  );
}

/** Tables created by tools, not by you. */
const TOOL_TABLES =
  /^(_prisma_migrations|__efmigrationshistory|knex_migrations(_lock)?|schema_migrations|typeorm_metadata|migrations)$/i;

function columnType(r: IntrospectionRow, pk: boolean, autoId: boolean): ColumnType {
  const t = (r.data_type ?? "").toLowerCase();
  const full = (r.udt_name ?? "").toLowerCase();
  const isInt = /int|serial/.test(t) && !/interval|point/.test(t);
  if (pk && autoId && isInt) return "id";
  if (t === "uuid" || full === "uuid" || /^uuid\(\)$/i.test(r.column_default ?? "")) return "uuid";
  if (full === "tinyint(1)" || t === "boolean" || t === "bool" || t === "bit") return "boolean";
  if (/bigint|int8|bigserial/.test(t) || full === "int8") return "bigint";
  if (isInt) return "int";
  if (/char|varchar|character varying|nvarchar|citext/.test(t))
    return /^(n?text)$/.test(t) ? "text" : "string";
  if (/text|clob|enum|set/.test(t)) return "text";
  if (/numeric|decimal|money/.test(t)) return "decimal";
  if (/real|double|float/.test(t)) return "float";
  if (/timestamp|datetime/.test(t)) return "datetime";
  if (t === "date") return "date";
  if (/json/.test(t)) return "json";
  return "text";
}

function defaultValue(raw: string | null, type: ColumnType): string {
  if (raw == null) return "";
  const d = raw.trim();
  if (/^nextval\(/i.test(d) || /^NULL$/i.test(d)) return "";
  if (
    /^(now\(\)|current_timestamp(\(\))?|localtimestamp|datetime\('now'\)|\(datetime\('now'\)\))$/i.test(
      d,
    )
  )
    return "now";
  if (/^(gen_random_uuid|uuid_generate_v4|uuid)\(\)$/i.test(d))
    return type === "uuid" ? "uuid" : "";
  if (/^(true|false)$/i.test(d)) return d.toLowerCase();
  if (type === "boolean" && /^'?[01]'?$/.test(d)) return d.includes("1") ? "true" : "false";
  // 'text'::character varying → 'text'
  const quoted = d.match(/^('(?:[^']|'')*')(::[\w\s]+)?$/);
  if (quoted) return quoted[1]!;
  if (/^-?\d+(\.\d+)?$/.test(d)) return d;
  // MySQL returns plain strings without quotes
  if (/^[\w\s.-]+$/.test(d) && (type === "string" || type === "text")) return `'${d}'`;
  return d.replace(/^\((.*)\)$/, "$1");
}

const onDelete = (rule: string | null): OnDelete => {
  const r = (rule ?? "").toUpperCase();
  if (r === "CASCADE") return "cascade";
  if (r === "SET NULL") return "set null";
  return "restrict";
};

export function rowsToSchema(rows: IntrospectionRow[]): Schema {
  const byTable = new Map<string, IntrospectionRow[]>();
  for (const r of rows) {
    if (!r.table_name || TOOL_TABLES.test(r.table_name)) continue;
    byTable.set(r.table_name, [...(byTable.get(r.table_name) ?? []), r]);
  }
  const tables = [...byTable.entries()].map(([name, cols]) => {
    const pkCount = cols.filter((c) => c.is_pk === "yes").length;
    const columns: Column[] = cols.map((r) => {
      const pk = r.is_pk === "yes";
      const autoId =
        r.is_identity === "YES" ||
        /^nextval\(/i.test(r.column_default ?? "") ||
        /serial/.test(r.data_type ?? "");
      const type = columnType(r, pk && pkCount === 1, autoId);
      const length = r.character_maximum_length ? Number(r.character_maximum_length) : undefined;
      const lengthFromType = (r.udt_name ?? "").match(/\((\d+)\)/)?.[1];
      return column(r.column_name ?? "column", type, {
        primary: pk,
        nullable: r.is_nullable === "YES" && !pk,
        unique: r.is_unique === "yes" && !pk,
        default: defaultValue(r.column_default, type),
        ...(type === "string"
          ? { length: length ?? (lengthFromType ? Number(lengthFromType) : 255) }
          : {}),
        ...(r.ref_table && r.ref_column
          ? {
              references: {
                table: r.ref_table,
                column: r.ref_column,
                onDelete: onDelete(r.delete_rule),
              },
            }
          : {}),
      });
    });
    // created_at + updated_at → the designer's "timestamps" switch (it adds them back on export).
    // (SQLite stores datetimes as TEXT, so a "now" default counts too.)
    const isTs = (c: Column) =>
      (c.name === "created_at" || c.name === "updated_at") &&
      (c.type === "datetime" || c.default === "now");
    const timestamps = columns.filter(isTs).length === 2;
    const t = table(name, timestamps ? columns.filter((c) => !isTs(c)) : columns, timestamps);
    return { ...t, id: uid() };
  });
  // MySQL stores UUIDs as CHAR(36): a foreign key to a uuid column is a uuid too.
  const typeOf = (tableName: string, col: string) =>
    tables.find((t) => t.name === tableName)?.columns.find((c) => c.name === col)?.type;
  for (const t of tables)
    for (const c of t.columns)
      if (
        c.references &&
        c.type === "string" &&
        typeOf(c.references.table, c.references.column) === "uuid"
      ) {
        c.type = "uuid";
        delete c.length;
      }
  return { tables };
}
