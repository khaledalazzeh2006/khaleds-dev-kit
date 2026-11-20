import {
  allColumns,
  effectiveOnDelete,
  sortByDependencies,
  type Column,
  type EffectiveOnDelete,
  type Schema,
  type Table,
} from "./schema";

export type Dialect = "postgresql" | "mysql" | "sqlite" | "sqlserver";

const quote: Record<Dialect, (s: string) => string> = {
  postgresql: (s) => `"${s}"`,
  sqlite: (s) => `"${s}"`,
  mysql: (s) => `\`${s}\``,
  sqlserver: (s) => `[${s}]`,
};

/** Column type for a dialect. FK columns pointing at an `id` use a plain integer type. */
export function sqlType(c: Column, d: Dialect): string {
  switch (c.type) {
    case "id":
      return d === "postgresql" ? "integer" : d === "sqlite" ? "INTEGER" : "INT";
    case "uuid":
      return {
        postgresql: "uuid",
        mysql: "CHAR(36)",
        sqlite: "TEXT",
        sqlserver: "UNIQUEIDENTIFIER",
      }[d];
    case "string":
      return d === "sqlite"
        ? "TEXT"
        : d === "sqlserver"
          ? `NVARCHAR(${c.length ?? 255})`
          : `VARCHAR(${c.length ?? 255})`;
    case "text":
      return d === "sqlserver" ? "NVARCHAR(MAX)" : "TEXT";
    case "int":
      return d === "sqlite" ? "INTEGER" : d === "postgresql" ? "integer" : "INT";
    case "bigint":
      return d === "sqlite" ? "INTEGER" : "BIGINT";
    case "decimal":
      return d === "sqlite" ? "NUMERIC" : "DECIMAL(12, 2)";
    case "float":
      return {
        postgresql: "double precision",
        mysql: "DOUBLE",
        sqlite: "REAL",
        sqlserver: "FLOAT",
      }[d];
    case "boolean":
      return { postgresql: "boolean", mysql: "BOOLEAN", sqlite: "INTEGER", sqlserver: "BIT" }[d];
    case "date":
      return d === "sqlite" ? "TEXT" : "DATE";
    case "datetime":
      return {
        postgresql: "timestamptz",
        mysql: "DATETIME",
        sqlite: "TEXT",
        sqlserver: "DATETIME2",
      }[d];
    case "json":
      return { postgresql: "jsonb", mysql: "JSON", sqlite: "TEXT", sqlserver: "NVARCHAR(MAX)" }[d];
  }
}

function defaultSql(c: Column, d: Dialect): string | null {
  const v = c.default.trim();
  if (!v) {
    if (c.type === "uuid" && c.primary)
      return {
        postgresql: "gen_random_uuid()",
        mysql: "(UUID())",
        sqlite: null,
        sqlserver: "NEWID()",
      }[d];
    return null;
  }
  if (v === "now")
    return {
      postgresql: "now()",
      mysql: "CURRENT_TIMESTAMP",
      sqlite: "CURRENT_TIMESTAMP",
      sqlserver: "SYSUTCDATETIME()",
    }[d];
  if (c.type === "boolean" && (v === "true" || v === "false")) {
    return d === "postgresql" || d === "mysql" ? v.toUpperCase() : v === "true" ? "1" : "0";
  }
  return v;
}

function columnSql(c: Column, d: Dialect, singlePk: boolean): string {
  const q = quote[d];
  const parts = [q(c.name)];
  if (c.type === "id" && c.primary && singlePk) {
    parts.push(
      {
        postgresql: "integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY",
        mysql: "INT AUTO_INCREMENT PRIMARY KEY",
        sqlite: "INTEGER PRIMARY KEY AUTOINCREMENT",
        sqlserver: "INT IDENTITY(1,1) PRIMARY KEY",
      }[d],
    );
    return parts.join(" ");
  }
  parts.push(sqlType(c, d));
  if (c.primary && singlePk) parts.push("PRIMARY KEY");
  else if (!c.nullable) parts.push("NOT NULL");
  if (c.unique && !c.primary) parts.push("UNIQUE");
  const def = defaultSql(c, d);
  if (def) parts.push(`DEFAULT ${def}`);
  return parts.join(" ");
}

const onDeleteSql: Record<EffectiveOnDelete, string> = {
  cascade: "CASCADE",
  "set null": "SET NULL",
  restrict: "RESTRICT",
  "no action": "NO ACTION",
};

function tableSql(t: Table, d: Dialect, actions: Map<string, EffectiveOnDelete>): string {
  const q = quote[d];
  const cols = allColumns(t);
  const pks = cols.filter((c) => c.primary);
  const single = pks.length === 1;
  const lines = cols.map((c) => `  ${columnSql(c, d, single)}`);
  if (!single && pks.length > 1)
    lines.push(`  PRIMARY KEY (${pks.map((c) => q(c.name)).join(", ")})`);
  for (const c of cols.filter((x) => x.references)) {
    const r = c.references!;
    lines.push(
      `  CONSTRAINT ${q(`fk_${t.name}_${c.name}`)} FOREIGN KEY (${q(c.name)}) REFERENCES ${q(r.table)} (${q(r.column)}) ON DELETE ${onDeleteSql[actions.get(`${t.name}.${c.name}`) ?? r.onDelete]}`,
    );
  }
  return `CREATE TABLE ${q(t.name)} (\n${lines.join(",\n")}\n);`;
}

/** Full DDL: tables in dependency order, then indexes on foreign keys (most databases don't add them for you). */
export function toSql(schema: Schema, d: Dialect): string {
  const q = quote[d];
  const tables = sortByDependencies(schema.tables);
  const actions = effectiveOnDelete(schema, d === "sqlserver");
  const indexes = tables.flatMap((t) =>
    t.columns
      .filter((c) => c.references && !c.unique)
      .map((c) => `CREATE INDEX ${q(`idx_${t.name}_${c.name}`)} ON ${q(t.name)} (${q(c.name)});`),
  );
  return (
    [
      ...tables.map((t) => tableSql(t, d, actions)),
      ...(indexes.length ? [indexes.join("\n")] : []),
    ].join("\n\n") + "\n"
  );
}
