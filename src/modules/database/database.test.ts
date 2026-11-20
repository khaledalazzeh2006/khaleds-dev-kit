import { faker } from "@faker-js/faker";
import {
  effectiveOnDelete,
  modelName,
  singular,
  sortByDependencies,
  templates,
  validateSchema,
} from "./lib/schema";
import { toSql } from "./lib/sql";
import { toPrisma } from "./lib/prisma";
import { toEfCore, toMermaid, toMongoose, toTypeorm } from "./lib/orm";
import { importSql } from "./lib/import-sql";
import { rowsToSql, seedRows, seedTables } from "./lib/seed";
import { adoNetString, connectionUrl } from "./lib/connection";

const blog = templates.Blog!();
const shop = templates.Shop!();

describe("schema helpers", () => {
  it("names models", () => {
    expect(modelName("order_items")).toBe("OrderItem");
    expect(modelName("categories")).toBe("Category");
    expect(singular("addresses")).toBe("address");
    expect(singular("status")).toBe("status");
  });

  it("orders tables by dependency", () => {
    const reversed = { tables: [...shop.tables].reverse() };
    const order = sortByDependencies(reversed.tables).map((t) => t.name);
    expect(order.indexOf("orders")).toBeLessThan(order.indexOf("order_items"));
    expect(order.indexOf("customers")).toBeLessThan(order.indexOf("orders"));
  });

  it("templates are valid and validation catches mistakes", () => {
    for (const make of Object.values(templates)) expect(validateSchema(make())).toEqual([]);
    const bad = templates.Blog!();
    bad.tables[1]!.columns.at(-1)!.references!.table = "authors";
    expect(validateSchema(bad)[0]).toMatch(/missing table "authors"/);
  });
});

describe("SQL", () => {
  it("PostgreSQL: identity, FK constraint, index, timestamps", () => {
    const sql = toSql(blog, "postgresql");
    expect(sql).toContain('"id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY');
    expect(sql).toContain(
      'CONSTRAINT "fk_posts_author_id" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE',
    );
    expect(sql).toContain('CREATE INDEX "idx_posts_author_id" ON "posts" ("author_id");');
    expect(sql).toContain('"created_at" timestamptz NOT NULL DEFAULT now()');
    expect(sql.indexOf('CREATE TABLE "users"')).toBeLessThan(sql.indexOf('CREATE TABLE "posts"'));
  });

  it("dialect differences", () => {
    expect(toSql(blog, "mysql")).toContain("`id` INT AUTO_INCREMENT PRIMARY KEY");
    expect(toSql(blog, "sqlite")).toContain('"published" INTEGER NOT NULL DEFAULT 0');
    expect(toSql(blog, "sqlserver")).toContain("[email] NVARCHAR(255) NOT NULL UNIQUE");
    expect(toSql(templates.Auth!(), "postgresql")).toContain(
      '"id" uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    );
  });
});

describe("ORM generators", () => {
  it("Prisma: models, @map, relations both ways", () => {
    const p = toPrisma(blog, "postgresql");
    expect(p).toContain("model Post {");
    expect(p).toContain('authorId Int @map("author_id")');
    expect(p).toContain(
      "author User @relation(fields: [authorId], references: [id], onDelete: Cascade)",
    );
    expect(p).toContain("posts Post[]");
    expect(p).toContain('@@map("posts")');
    expect(p).toContain('updatedAt DateTime @updatedAt @map("updated_at")');
  });

  it("Prisma names relations when two FKs link the same tables", () => {
    const s = templates.Blank!();
    s.tables = [
      { ...templates.Blog!().tables[0]! },
      {
        id: "m",
        name: "messages",
        timestamps: false,
        columns: [
          {
            id: "1",
            name: "id",
            type: "id",
            primary: true,
            nullable: false,
            unique: false,
            default: "",
          },
          {
            id: "2",
            name: "sender_id",
            type: "int",
            primary: false,
            nullable: false,
            unique: false,
            default: "",
            references: { table: "users", column: "id", onDelete: "cascade" },
          },
          {
            id: "3",
            name: "receiver_id",
            type: "int",
            primary: false,
            nullable: false,
            unique: false,
            default: "",
            references: { table: "users", column: "id", onDelete: "cascade" },
          },
        ],
      },
    ];
    const p = toPrisma(s, "postgresql");
    expect(p).toContain('sender User @relation("MessageSender"');
    expect(p).toContain('messagesAsReceiver Message[] @relation("MessageReceiver")');
  });

  it("TypeORM, Mongoose, EF Core, Mermaid", () => {
    expect(toTypeorm(blog)).toContain(
      '@ManyToOne(() => User, (x) => x.posts, { onDelete: "CASCADE" })',
    );
    expect(toMongoose(blog)).toContain(
      'author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },',
    );
    expect(toEfCore(shop)).toContain("public DbSet<OrderItem> OrderItems => Set<OrderItem>();");
    expect(toMermaid(blog)).toContain('users ||--o{ posts : "author_id"');
    expect(toMermaid(blog)).toContain('users |o--o{ comments : "user_id"');
  });
});

describe("SQL import", () => {
  it("round-trips generated PostgreSQL", () => {
    const back = importSql(toSql(blog, "postgresql"));
    expect(back.tables.map((t) => t.name)).toEqual(["users", "posts", "comments"]);
    const posts = back.tables[1]!;
    expect(posts.timestamps).toBe(true);
    expect(posts.columns.find((c) => c.name === "id")?.type).toBe("id");
    expect(posts.columns.find((c) => c.name === "author_id")?.references).toEqual({
      table: "users",
      column: "id",
      onDelete: "cascade",
    });
    expect(posts.columns.find((c) => c.name === "published")?.default).toBe("FALSE");
  });

  it("reads MySQL with table-level keys", () => {
    const s = importSql(`CREATE TABLE \`tags\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`label\` VARCHAR(40) NOT NULL,
      \`post_id\` INT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE (\`label\`),
      CONSTRAINT fk FOREIGN KEY (\`post_id\`) REFERENCES \`posts\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB;`);
    const t = s.tables[0]!;
    expect(t.columns.map((c) => [c.name, c.type, c.primary, c.nullable, c.unique])).toEqual([
      ["id", "int", true, false, false],
      ["label", "string", false, false, true],
      ["post_id", "int", false, true, false],
    ]);
    expect(t.columns[2]!.references?.onDelete).toBe("set null");
  });

  it("errors when there is nothing to import", () => {
    expect(() => importSql("SELECT 1;")).toThrow(/No CREATE TABLE/);
  });
});

describe("seed + connections", () => {
  it("seeds reproducibly with realistic values", () => {
    const users = blog.tables[0]!;
    const a = seedRows(faker, users, 3);
    const b = seedRows(faker, users, 3);
    expect(a).toEqual(b);
    expect(String(a[0]!.email)).toMatch(/@/);
    expect(a.map((r) => r.id)).toEqual([1, 2, 3]);
    const sql = rowsToSql(users, a, "postgresql");
    expect(
      sql.startsWith('INSERT INTO "users" ("email", "name", "created_at", "updated_at") VALUES'),
    ).toBe(true);
  });

  it("foreign keys point at generated parent keys, including uuids", () => {
    const auth = templates.Auth!();
    const seeded = seedTables(faker, sortByDependencies(auth.tables), 5);
    const byName = Object.fromEntries(seeded.map(({ t, rows }) => [t.name, rows]));
    for (const { t, rows } of seeded)
      for (const c of t.columns.filter((x) => x.references)) {
        const parent = byName[c.references!.table]!.map((r) => r[c.references!.column]);
        for (const r of rows) if (r[c.name] != null) expect(parent).toContain(r[c.name]);
      }
  });

  it("SQL Server never gets RESTRICT or multiple cascade paths", () => {
    const shopSql = toSql(shop, "sqlserver");
    expect(shopSql).not.toContain("RESTRICT");
    const actions = effectiveOnDelete(blog, true);
    expect([...actions.values()]).toContain("no action");
    expect(effectiveOnDelete(blog, false).get("comments.user_id")).toBe("set null");
  });

  it("SQL Server seeds wrap IDENTITY_INSERT and escape quotes", () => {
    const users = blog.tables[0]!;
    const sql = rowsToSql(
      users,
      [{ id: 1, email: "o'neil@x.com", name: "O'Neil", created_at: null, updated_at: null }],
      "sqlserver",
    );
    expect(sql).toContain("SET IDENTITY_INSERT [users] ON;");
    expect(sql).toContain("N'o''neil@x.com'");
  });

  it("connection strings encode credentials", () => {
    const o = {
      engine: "postgresql" as const,
      host: "localhost",
      port: 5432,
      user: "app",
      password: "p@ss/w",
      database: "shop",
      ssl: false,
      file: "",
    };
    expect(connectionUrl(o)).toBe("postgresql://app:p%40ss%2Fw@localhost:5432/shop");
    expect(connectionUrl({ ...o, engine: "mongodb", port: 27017 })).toBe(
      "mongodb://app:p%40ss%2Fw@localhost:27017/shop?authSource=admin",
    );
    expect(adoNetString({ ...o, engine: "sqlserver", port: 1433 })).toContain(
      "Server=localhost,1433;Database=shop;",
    );
  });
});
