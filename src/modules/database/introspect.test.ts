import fixtures from "./fixtures/introspection.json";
import {
  engineOfUrl,
  introspectionSql,
  normalizeUrl,
  previewSql,
  rowsToSchema,
  toObjects,
} from "./lib/introspect";
import { templates, type Column, type Schema } from "./lib/schema";

// Real output of introspectionSql() from PostgreSQL 16, MariaDB and SQLite, each loaded with
// the DDL this app generates for the Shop / Auth / Blog templates (see PROGRESS.md, Phase 9).
const fx = fixtures as Record<string, { columns: string[]; rows: (string | null)[][] }>;

const shape = (s: Schema, loose: boolean) =>
  Object.fromEntries(
    s.tables.map((t) => [
      t.name,
      {
        timestamps: t.timestamps,
        columns: t.columns.map((c: Column) => ({
          name: c.name,
          ...(loose ? {} : { type: c.type, length: c.type === "string" ? c.length : undefined }),
          primary: c.primary,
          nullable: c.nullable,
          unique: c.unique,
          references: c.references,
        })),
      },
    ]),
  );

describe("database introspection", () => {
  it.each(["Shop", "Auth", "Blog"])(
    "%s reads back like the template it was created from",
    (name) => {
      const original = templates[name]!();
      for (const engine of ["postgresql", "mysql", "sqlite"]) {
        const data = fx[`${name}.${engine}`]!;
        const schema = rowsToSchema(toObjects(data.columns, data.rows));
        // SQLite has no real column types (everything is TEXT / INTEGER), so only structure counts.
        expect(shape(schema, engine === "sqlite"), engine).toEqual(
          shape(original, engine === "sqlite"),
        );
      }
    },
  );

  it("keeps defaults", () => {
    const pg = rowsToSchema(toObjects(fx["Shop.postgresql"]!.columns, fx["Shop.postgresql"]!.rows));
    const orders = pg.tables.find((t) => t.name === "orders")!;
    expect(orders.columns.find((c) => c.name === "status")!.default).toBe("'pending'");
    const blog = rowsToSchema(toObjects(fx["Blog.mysql"]!.columns, fx["Blog.mysql"]!.rows));
    const published = blog.tables
      .find((t) => t.name === "posts")!
      .columns.find((c) => c.name === "published")!;
    expect(published).toMatchObject({ type: "boolean", default: "false" });
  });

  it("normalizes URLs and builds queries", () => {
    expect(normalizeUrl("file:./dev.db")).toBe("sqlite:./dev.db");
    expect(normalizeUrl("postgresql://u:p@h:5432/db?schema=public&sslmode=require")).toBe(
      "postgresql://u:p@h:5432/db?sslmode=require",
    );
    expect(engineOfUrl("mariadb://x")).toBe("mysql");
    expect(engineOfUrl("mssql://x")).toBeNull();
    expect(previewSql("mysql", "my`table")).toBe("SELECT * FROM `my``table` LIMIT 100;");
    expect(previewSql("postgresql", "users", "app")).toBe('SELECT * FROM "app"."users" LIMIT 100;');
    expect(introspectionSql("postgresql", "o'x")).toContain("table_schema = 'o''x'");
  });

  it("skips tool tables like _prisma_migrations", () => {
    const s = rowsToSchema([
      { table_name: "_prisma_migrations", column_name: "id" } as never,
      {
        table_name: "users",
        column_name: "id",
        data_type: "integer",
        is_pk: "yes",
        is_identity: "YES",
      } as never,
    ]);
    expect(s.tables.map((t) => t.name)).toEqual(["users"]);
    expect(s.tables[0]!.columns[0]!.type).toBe("id");
  });
});
