import {
  allColumns,
  camel,
  modelName,
  pascal,
  relations,
  type Column,
  type Schema,
} from "./schema";

// ---------- TypeORM ----------
const tsType: Record<Column["type"], string> = {
  id: "number",
  uuid: "string",
  string: "string",
  text: "string",
  int: "number",
  bigint: "string",
  decimal: "string",
  float: "number",
  boolean: "boolean",
  date: "string",
  datetime: "Date",
  json: "unknown",
};
const ormColumnType: Partial<Record<Column["type"], string>> = {
  text: "text",
  int: "int",
  bigint: "bigint",
  decimal: "decimal",
  float: "float",
  boolean: "boolean",
  date: "date",
  datetime: "timestamp",
  json: "json",
};

export function toTypeorm(schema: Schema): string {
  const rels = relations(schema);
  const entities = schema.tables.map((t) => {
    const name = modelName(t.name);
    const imports = new Set(["Entity", "Column"]);
    const body: string[] = [];
    for (const c of allColumns(t)) {
      const prop = camel(c.name);
      const opt: string[] = [];
      if (prop !== c.name) opt.push(`name: "${c.name}"`);
      if (c.nullable) opt.push("nullable: true");
      if (c.unique) opt.push("unique: true");
      if (c.type === "string" && c.length) opt.push(`length: ${c.length}`);
      if (c.type === "decimal") opt.push("precision: 12", "scale: 2");
      const o = (extra: string[] = []) => {
        const all = [...extra, ...opt];
        return all.length ? `{ ${all.join(", ")} }` : "";
      };
      const decorator = (name: string, args: string) => {
        imports.add(name);
        return `@${name}(${args})`;
      };
      let deco: string;
      if (c.primary && c.type === "id") deco = decorator("PrimaryGeneratedColumn", o());
      else if (c.primary && c.type === "uuid")
        deco = decorator("PrimaryGeneratedColumn", `"uuid"${o() ? ", " + o() : ""}`);
      else if (c.name === "created_at" && t.timestamps) deco = decorator("CreateDateColumn", o());
      else if (c.name === "updated_at" && t.timestamps) deco = decorator("UpdateDateColumn", o());
      else
        deco = `@Column(${o(ormColumnType[c.type] ? [`type: "${ormColumnType[c.type]}"`] : [])})`;
      body.push(
        `  ${deco}\n  ${prop}${c.nullable ? "?" : "!"}: ${tsType[c.type]}${c.nullable ? " | null" : ""};`,
      );
    }
    for (const c of t.columns.filter((x) => x.references)) {
      imports.add("ManyToOne").add("JoinColumn");
      const target = modelName(c.references!.table);
      const back = camel(t.name);
      body.push(
        `  @ManyToOne(() => ${target}, (x) => x.${back}, { onDelete: "${c.references!.onDelete.toUpperCase()}" })\n  @JoinColumn({ name: "${c.name}" })\n  ${camel(c.name.replace(/_id$/, ""))}!: ${target};`,
      );
    }
    for (const r of rels.filter((x) => x.column.references!.table === t.name)) {
      imports.add("OneToMany");
      const src = modelName(r.from.name);
      body.push(
        `  @OneToMany(() => ${src}, (x) => x.${camel(r.column.name.replace(/_id$/, ""))})\n  ${camel(r.from.name)}!: ${src}[];`,
      );
    }
    const otherEntities = [
      ...new Set([
        ...t.columns.filter((c) => c.references).map((c) => modelName(c.references!.table)),
        ...rels
          .filter((x) => x.column.references!.table === t.name)
          .map((r) => modelName(r.from.name)),
      ]),
    ].filter((n) => n !== name);
    const head = [
      `import { ${[...imports].sort().join(", ")} } from "typeorm";`,
      ...otherEntities.map((n) => `import { ${n} } from "./${n}";`),
    ];
    return `// ${name}.ts\n${head.join("\n")}\n\n@Entity("${t.name}")\nexport class ${name} {\n${body.join("\n\n")}\n}`;
  });
  return entities.join("\n\n") + "\n";
}

// ---------- Mongoose ----------
const mongooseType: Record<Column["type"], string> = {
  id: "Number",
  uuid: "String",
  string: "String",
  text: "String",
  int: "Number",
  bigint: "Number",
  decimal: "Schema.Types.Decimal128",
  float: "Number",
  boolean: "Boolean",
  date: "Date",
  datetime: "Date",
  json: "Schema.Types.Mixed",
};

export function toMongoose(schema: Schema): string {
  const models = schema.tables.map((t) => {
    const name = modelName(t.name);
    const fields = t.columns
      .filter((c) => !c.primary) // MongoDB adds _id
      .map((c) => {
        const opts: string[] = [];
        if (c.references)
          opts.push("type: Schema.Types.ObjectId", `ref: "${modelName(c.references.table)}"`);
        else opts.push(`type: ${mongooseType[c.type]}`);
        if (!c.nullable) opts.push("required: true");
        if (c.unique) opts.push("unique: true");
        if (c.type === "string" && c.length) opts.push(`maxlength: ${c.length}`);
        const v = c.default.trim();
        if (v === "now") opts.push("default: Date.now");
        else if (v) opts.push(`default: ${/^'.*'$/.test(v) ? JSON.stringify(v.slice(1, -1)) : v}`);
        if (c.references) opts.push("index: true");
        return `    ${camel(c.name.replace(/_id$/, ""))}: { ${opts.join(", ")} },`;
      });
    const options = t.timestamps
      ? `{ timestamps: true, collection: "${t.name}" }`
      : `{ collection: "${t.name}" }`;
    return `const ${camel(name)}Schema = new Schema(\n  {\n${fields.join("\n")}\n  },\n  ${options},\n);\nexport const ${name} = model("${name}", ${camel(name)}Schema);`;
  });
  return `import { Schema, model } from "mongoose";\n\n${models.join("\n\n")}\n`;
}

// ---------- EF Core ----------
const csType: Record<Column["type"], string> = {
  id: "int",
  uuid: "Guid",
  string: "string",
  text: "string",
  int: "int",
  bigint: "long",
  decimal: "decimal",
  float: "double",
  boolean: "bool",
  date: "DateOnly",
  datetime: "DateTime",
  json: "string",
};

export function toEfCore(schema: Schema, namespace = "App.Data"): string {
  const rels = relations(schema);
  const classes = schema.tables.map((t) => {
    const name = modelName(t.name);
    const props: string[] = [];
    for (const c of allColumns(t)) {
      const attrs: string[] = [];
      if (c.primary) attrs.push("[Key]");
      if (c.type === "string" && c.length) attrs.push(`[MaxLength(${c.length})]`);
      if (c.type === "decimal") attrs.push("[Precision(12, 2)]");
      attrs.push(`[Column("${c.name}")]`);
      const type = csType[c.type];
      const isRef = type === "string";
      const nullable = c.nullable ? "?" : "";
      const init = isRef && !c.nullable ? " = string.Empty;" : "";
      props.push(
        `    ${attrs.join(" ")}\n    public ${type}${nullable} ${pascal(c.name)} { get; set; }${init}`,
      );
    }
    for (const c of t.columns.filter((x) => x.references))
      props.push(
        `    [ForeignKey(nameof(${pascal(c.name)}))]\n    public ${modelName(c.references!.table)}${c.nullable ? "?" : ""} ${pascal(c.name.replace(/_id$/, ""))} { get; set; }${c.nullable ? "" : " = null!;"}`,
      );
    for (const r of rels.filter((x) => x.column.references!.table === t.name))
      props.push(
        `    public List<${modelName(r.from.name)}> ${pascal(r.from.name)} { get; set; } = [];`,
      );
    return `[Table("${t.name}")]\npublic class ${name}\n{\n${props.join("\n\n")}\n}`;
  });
  const sets = schema.tables.map(
    (t) =>
      `    public DbSet<${modelName(t.name)}> ${pascal(t.name)} => Set<${modelName(t.name)}>();`,
  );
  const context = `public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)\n{\n${sets.join("\n")}\n}`;
  return `using System.ComponentModel.DataAnnotations;\nusing System.ComponentModel.DataAnnotations.Schema;\nusing Microsoft.EntityFrameworkCore;\n\nnamespace ${namespace};\n\n${[context, ...classes].join("\n\n")}\n`;
}

// ---------- Mermaid ER diagram (for READMEs and docs) ----------
const mermaidType = (c: Column) => (c.type === "id" ? "int" : c.type);

export function toMermaid(schema: Schema): string {
  const blocks = schema.tables.map((t) => {
    const cols = allColumns(t).map((c) => {
      const keys = [c.primary && "PK", c.references && "FK", c.unique && !c.primary && "UK"]
        .filter(Boolean)
        .join(", ");
      return `    ${mermaidType(c)} ${c.name}${keys ? ` ${keys}` : ""}`;
    });
    return `  ${t.name} {\n${cols.join("\n")}\n  }`;
  });
  const links = relations(schema).map((r) => {
    const card = r.column.unique ? "|o--o|" : r.column.nullable ? "|o--o{" : "||--o{";
    return `  ${r.column.references!.table} ${card} ${r.from.name} : "${r.column.name}"`;
  });
  return `erDiagram\n${[...links, ...blocks].join("\n")}\n`;
}
