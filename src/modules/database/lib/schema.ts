// The schema model every generator reads. Kept database-neutral on purpose.

export const COLUMN_TYPES = [
  "id",
  "uuid",
  "string",
  "text",
  "int",
  "bigint",
  "decimal",
  "float",
  "boolean",
  "date",
  "datetime",
  "json",
] as const;
export type ColumnType = (typeof COLUMN_TYPES)[number];
export type OnDelete = "cascade" | "set null" | "restrict";

export interface Reference {
  table: string; // table name
  column: string; // column name
  onDelete: OnDelete;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  primary: boolean;
  nullable: boolean;
  unique: boolean;
  /** Raw default: "now", "true", "0", "'draft'" (quoted string), etc. Empty = none. */
  default: string;
  length?: number; // for string
  references?: Reference;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  /** Adds created_at / updated_at. */
  timestamps: boolean;
}

export interface Schema {
  tables: Table[];
}

let counter = 0;
export const uid = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

export function column(name: string, type: ColumnType, extra: Partial<Column> = {}): Column {
  return {
    id: uid(),
    name,
    type,
    primary: false,
    nullable: false,
    unique: false,
    default: "",
    ...extra,
  };
}

export function table(name: string, columns: Column[], timestamps = true): Table {
  return { id: uid(), name, columns, timestamps };
}

export const idColumn = () => column("id", "id", { primary: true });

/** Tables ordered so every referenced table comes before the tables that point to it. */
export function sortByDependencies(tables: Table[]): Table[] {
  const byName = new Map(tables.map((t) => [t.name, t]));
  const done = new Set<string>();
  const out: Table[] = [];
  const visit = (t: Table, stack: Set<string>) => {
    if (done.has(t.name) || stack.has(t.name)) return;
    stack.add(t.name);
    for (const c of t.columns) {
      const ref = c.references && byName.get(c.references.table);
      if (ref && ref !== t) visit(ref, stack);
    }
    done.add(t.name);
    out.push(t);
  };
  tables.forEach((t) => visit(t, new Set()));
  return out;
}

/** Every relation in the schema, for diagrams and back-relations. */
export function relations(schema: Schema) {
  return schema.tables.flatMap((t) =>
    t.columns
      .filter((c) => c.references)
      .map((c) => ({
        from: t,
        column: c,
        to: schema.tables.find((x) => x.name === c.references!.table),
      })),
  );
}

/** Problems that would make generated code wrong. Empty = ok. */
export function validateSchema(schema: Schema): string[] {
  const errors: string[] = [];
  const names = new Set<string>();
  for (const t of schema.tables) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(t.name))
      errors.push(`Table "${t.name}": use letters, numbers and _ only.`);
    if (names.has(t.name)) errors.push(`Table "${t.name}" exists twice.`);
    names.add(t.name);
    if (!t.columns.some((c) => c.primary)) errors.push(`Table "${t.name}" has no primary key.`);
    const cols = new Set<string>();
    for (const c of t.columns) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(c.name))
        errors.push(`${t.name}.${c.name}: use letters, numbers and _ only.`);
      if (cols.has(c.name)) errors.push(`${t.name}.${c.name} exists twice.`);
      cols.add(c.name);
      if (c.references) {
        const target = schema.tables.find((x) => x.name === c.references!.table);
        if (!target)
          errors.push(`${t.name}.${c.name} points to a missing table "${c.references.table}".`);
        else if (!target.columns.some((x) => x.name === c.references!.column))
          errors.push(
            `${t.name}.${c.name} points to a missing column ${c.references.table}.${c.references.column}.`,
          );
      }
    }
  }
  return errors;
}

// ---------- naming helpers ----------
export const camel = (s: string) =>
  s
    .replace(/[_-]+([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
export const pascal = (s: string) => camel(s).replace(/^./, (c) => c.toUpperCase());
export function singular(word: string): string {
  if (/ies$/i.test(word)) return word.replace(/ies$/i, "y");
  if (/(ss|us|is)$/i.test(word)) return word;
  if (/(ss|sh|ch|x|z)es$/i.test(word)) return word.slice(0, -2);
  if (/s$/i.test(word)) return word.slice(0, -1);
  return word;
}
export const modelName = (tableName: string) => pascal(singular(tableName));

/** The column that a timestamps table gets. */
export const timestampColumns = (): Column[] => [
  column("created_at", "datetime", { default: "now" }),
  column("updated_at", "datetime", { default: "now" }),
];

/** Columns including generated timestamps. */
export const allColumns = (t: Table): Column[] =>
  t.timestamps
    ? [
        ...t.columns,
        ...timestampColumns().filter((ts) => !t.columns.some((c) => c.name === ts.name)),
      ]
    : t.columns;

// ---------- templates ----------
export const templates: Record<string, () => Schema> = {
  Blank: () => ({
    tables: [table("items", [idColumn(), column("name", "string", { length: 255 })])],
  }),
  Blog: () => ({
    tables: [
      table("users", [
        idColumn(),
        column("email", "string", { unique: true, length: 255 }),
        column("name", "string", { length: 120 }),
      ]),
      table("posts", [
        idColumn(),
        column("title", "string", { length: 200 }),
        column("body", "text"),
        column("published", "boolean", { default: "false" }),
        column("author_id", "int", {
          references: { table: "users", column: "id", onDelete: "cascade" },
        }),
      ]),
      table("comments", [
        idColumn(),
        column("content", "text"),
        column("post_id", "int", {
          references: { table: "posts", column: "id", onDelete: "cascade" },
        }),
        column("user_id", "int", {
          nullable: true,
          references: { table: "users", column: "id", onDelete: "set null" },
        }),
      ]),
    ],
  }),
  Shop: () => ({
    tables: [
      table("customers", [
        idColumn(),
        column("email", "string", { unique: true, length: 255 }),
        column("full_name", "string", { length: 150 }),
      ]),
      table("products", [
        idColumn(),
        column("sku", "string", { unique: true, length: 64 }),
        column("name", "string", { length: 200 }),
        column("price", "decimal"),
        column("stock", "int", { default: "0" }),
      ]),
      table("orders", [
        idColumn(),
        column("status", "string", { length: 20, default: "'pending'" }),
        column("total", "decimal"),
        column("customer_id", "int", {
          references: { table: "customers", column: "id", onDelete: "restrict" },
        }),
      ]),
      table(
        "order_items",
        [
          idColumn(),
          column("quantity", "int", { default: "1" }),
          column("unit_price", "decimal"),
          column("order_id", "int", {
            references: { table: "orders", column: "id", onDelete: "cascade" },
          }),
          column("product_id", "int", {
            references: { table: "products", column: "id", onDelete: "restrict" },
          }),
        ],
        false,
      ),
    ],
  }),
  Auth: () => ({
    tables: [
      table("users", [
        column("id", "uuid", { primary: true }),
        column("email", "string", { unique: true, length: 255 }),
        column("password_hash", "string", { length: 255 }),
        column("email_verified_at", "datetime", { nullable: true }),
      ]),
      table("sessions", [
        column("id", "uuid", { primary: true }),
        column("expires_at", "datetime"),
        column("user_id", "uuid", {
          references: { table: "users", column: "id", onDelete: "cascade" },
        }),
      ]),
    ],
  }),
};

export type EffectiveOnDelete = OnDelete | "no action";

/**
 * SQL Server refuses "multiple cascade paths" (a row reachable by two cascading FKs) and has no RESTRICT.
 * For SQL Server, turn RESTRICT into NO ACTION and downgrade the cascades that would create a second
 * path to NO ACTION. Other databases keep what the user chose. Key: "table.column".
 */
export function effectiveOnDelete(
  schema: Schema,
  sqlServer: boolean,
): Map<string, EffectiveOnDelete> {
  const result = new Map<string, EffectiveOnDelete>();
  const edges = new Map<string, Set<string>>(); // parent → children over cascading FKs
  const reaches = (from: string, to: string, seen = new Set<string>()): boolean => {
    if (from === to) return true;
    if (seen.has(from)) return false;
    seen.add(from);
    return [...(edges.get(from) ?? [])].some((n) => reaches(n, to, seen));
  };
  for (const t of sortByDependencies(schema.tables)) {
    for (const c of t.columns.filter((x) => x.references)) {
      const key = `${t.name}.${c.name}`;
      const action = c.references!.onDelete;
      if (!sqlServer) {
        result.set(key, action);
        continue;
      }
      if (action === "restrict") {
        result.set(key, "no action");
        continue;
      }
      const parent = c.references!.table;
      // Conflict if some table that reaches `parent` (or parent itself) already reaches this table.
      const conflict =
        parent === t.name ||
        schema.tables.some((x) => reaches(x.name, parent) && reaches(x.name, t.name));
      if (conflict) result.set(key, "no action");
      else {
        result.set(key, action);
        if (!edges.has(parent)) edges.set(parent, new Set());
        edges.get(parent)!.add(t.name);
      }
    }
  }
  return result;
}
