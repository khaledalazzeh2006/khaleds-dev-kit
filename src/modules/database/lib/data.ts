import { loadSnippets } from "@/lib/content/load";
import type { ModuleItem } from "@/app/module";

export const sqlSnippets = loadSnippets().filter((s) => s.category === "sql");
const GROUP_ORDER = ["Queries", "Writes", "Performance", "PostgreSQL"];
const FILE_ORDER = [
  "sql-joins",
  "sql-group-by",
  "sql-window",
  "sql-cte",
  "sql-pagination",
  "sql-upsert",
  "sql-transaction",
  "sql-returning",
  "sql-indexes",
  "sql-explain",
  "sql-jsonb",
  "sql-full-text",
  "sql-create-user",
];
sqlSnippets.sort(
  (a, b) =>
    GROUP_ORDER.indexOf(a.group ?? "") - GROUP_ORDER.indexOf(b.group ?? "") ||
    FILE_ORDER.indexOf(a.id) - FILE_ORDER.indexOf(b.id),
);

export const sqlSnippetById = new Map(sqlSnippets.map((s) => [s.id, s]));

export const databaseItems: ModuleItem[] = [
  {
    id: "designer",
    title: "Schema designer",
    description: "Tables → SQL, Prisma, TypeORM, EF Core",
    group: "Tools",
    tags: ["schema"],
    keywords: [
      "erd",
      "diagram",
      "create table",
      "prisma",
      "typeorm",
      "mongoose",
      "ef core",
      "migration",
    ],
  },
  {
    id: "seed",
    title: "Seed data",
    description: "Fake rows as INSERTs, JSON or CSV",
    group: "Tools",
    tags: ["data"],
    keywords: ["faker", "insert", "mock", "fixtures"],
  },
  {
    id: "connection",
    title: "Connection string",
    description: "DATABASE_URL for any database",
    group: "Tools",
    tags: ["config"],
    keywords: ["url", "env", "postgres", "mysql", "mongodb", "sql server"],
  },
  ...sqlSnippets.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    group: `SQL · ${s.group}`,
    tags: s.tags.slice(0, 1),
    keywords: [...s.tags, "sql"],
    copyValue: s.code,
  })),
];
