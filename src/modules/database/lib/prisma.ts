import {
  allColumns,
  camel,
  modelName,
  relations,
  type Column,
  type Schema,
  type Table,
  effectiveOnDelete,
  type EffectiveOnDelete,
} from "./schema";
import type { Dialect } from "./sql";

const provider: Record<Dialect, string> = {
  postgresql: "postgresql",
  mysql: "mysql",
  sqlite: "sqlite",
  sqlserver: "sqlserver",
};

const baseType: Record<Column["type"], string> = {
  id: "Int",
  uuid: "String",
  string: "String",
  text: "String",
  int: "Int",
  bigint: "BigInt",
  decimal: "Decimal",
  float: "Float",
  boolean: "Boolean",
  date: "DateTime",
  datetime: "DateTime",
  json: "Json",
};

const onDelete: Record<EffectiveOnDelete, string> = {
  cascade: "Cascade",
  "set null": "SetNull",
  restrict: "Restrict",
  "no action": "NoAction",
};

function defaultAttr(c: Column): string | null {
  if (c.primary && c.type === "id") return "@default(autoincrement())";
  if (c.primary && c.type === "uuid") return "@default(uuid())";
  const v = c.default.trim();
  if (!v) return null;
  if (v === "now") return "@default(now())";
  if (/^'.*'$/.test(v)) return `@default("${v.slice(1, -1).replace(/"/g, '\\"')}")`;
  return `@default(${v})`;
}

/** Prisma schema: models in PascalCase singular with @@map, fields in camelCase with @map, relations both ways. */
export function toPrisma(schema: Schema, d: Dialect): string {
  const rels = relations(schema);
  const sqlServer = d === "sqlserver";
  const actions = effectiveOnDelete(schema, sqlServer);
  // Name relations only when two FKs connect the same pair of tables (Prisma needs it then).
  const pairCount = new Map<string, number>();
  for (const r of rels) {
    const key = [r.from.name, r.column.references!.table].sort().join("|");
    pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
  }
  const relationName = (from: Table, col: Column) => {
    const key = [from.name, col.references!.table].sort().join("|");
    return (pairCount.get(key) ?? 0) > 1
      ? `"${modelName(from.name)}${modelName(col.name.replace(/_id$/, ""))}"`
      : null;
  };

  const models = schema.tables.map((t) => {
    const lines: string[] = [];
    for (const c of allColumns(t)) {
      const field = camel(c.name);
      const attrs: string[] = [];
      if (c.primary && t.columns.filter((x) => x.primary).length === 1) attrs.push("@id");
      const def =
        c.name === "updated_at" && c.default === "now" && t.timestamps ? null : defaultAttr(c);
      if (def) attrs.push(def);
      if (c.name === "updated_at" && t.timestamps) attrs.push("@updatedAt");
      if (c.unique && !c.primary) attrs.push("@unique");
      if (d === "postgresql" && c.type === "uuid") attrs.push("@db.Uuid");
      if (c.type === "string" && c.length && d !== "sqlite") attrs.push(`@db.VarChar(${c.length})`);
      if (c.type === "date" && d !== "sqlite") attrs.push("@db.Date");
      if (c.type === "decimal" && d !== "sqlite") attrs.push("@db.Decimal(12, 2)");
      if (field !== c.name) attrs.push(`@map("${c.name}")`);
      lines.push(
        `  ${field} ${baseType[c.type]}${c.nullable && !c.primary ? "?" : ""}${attrs.length ? " " + attrs.join(" ") : ""}`,
      );
    }
    // Relation fields (this table → others)
    for (const c of t.columns.filter((x) => x.references)) {
      const r = c.references!;
      const name = relationName(t, c);
      const field = camel(c.name.replace(/_id$/, "")) || camel(r.table);
      const args = [
        name,
        `fields: [${camel(c.name)}]`,
        `references: [${camel(r.column)}]`,
        `onDelete: ${onDelete[actions.get(`${t.name}.${c.name}`) ?? r.onDelete]}`,
        // SQL Server also counts ON UPDATE CASCADE as a path; ids never change, so NoAction is safe.
        sqlServer && "onUpdate: NoAction",
      ].filter(Boolean);
      lines.push(
        `  ${field} ${modelName(r.table)}${c.nullable ? "?" : ""} @relation(${args.join(", ")})`,
      );
    }
    // Back-relations (others → this table)
    for (const r of rels.filter((x) => x.column.references!.table === t.name)) {
      const name = relationName(r.from, r.column);
      const many = !r.column.unique;
      const base = camel(r.from.name);
      const field = name ? `${base}As${modelName(r.column.name.replace(/_id$/, ""))}` : base;
      lines.push(
        `  ${field} ${modelName(r.from.name)}${many ? "[]" : "?"}${name ? ` @relation(${name})` : ""}`,
      );
    }
    const pks = t.columns.filter((c) => c.primary);
    if (pks.length > 1) lines.push(`\n  @@id([${pks.map((c) => camel(c.name)).join(", ")}])`);
    if (modelName(t.name) !== t.name)
      lines.push(`${pks.length > 1 ? "" : "\n"}  @@map("${t.name}")`);
    return `model ${modelName(t.name)} {\n${lines.join("\n")}\n}`;
  });

  const header = `generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "${provider[d]}"\n}`;
  return `${header}\n\n${models.join("\n\n")}\n`;
}
