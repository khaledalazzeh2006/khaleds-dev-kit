import { useState } from "react";
import { toast } from "sonner";
import { FileUp, Maximize2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CodeInput } from "@/components/tool/code-input";
import { OutputCode } from "@/components/tool/output-code";
import { Segmented } from "@/components/tool/segmented";
import { SelectField } from "@/components/tool/select-field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { cn } from "@/lib/utils";
import { importSql } from "../lib/import-sql";
import { toEfCore, toMermaid, toMongoose, toTypeorm } from "../lib/orm";
import { toPrisma } from "../lib/prisma";
import {
  COLUMN_TYPES,
  column,
  idColumn,
  table,
  templates,
  validateSchema,
  type Column,
  type OnDelete,
  type Schema,
  type Table,
} from "../lib/schema";
import { toSql, type Dialect } from "../lib/sql";
import { useSchema } from "../lib/store";
import { ErDiagram } from "./er-diagram";

const FORMATS = [
  { value: "sql:postgresql", label: "PostgreSQL" },
  { value: "sql:mysql", label: "MySQL" },
  { value: "sql:sqlite", label: "SQLite" },
  { value: "sql:sqlserver", label: "SQL Server" },
  { value: "prisma", label: "Prisma" },
  { value: "typeorm", label: "TypeORM" },
  { value: "mongoose", label: "Mongoose" },
  { value: "efcore", label: "EF Core (C#)" },
  { value: "mermaid", label: "Mermaid ER" },
];

function generate(
  schema: Schema,
  format: string,
  prismaDialect: Dialect,
): { code: string; lang: "sql" | "typescript" | "text" } {
  if (format.startsWith("sql:"))
    return { code: toSql(schema, format.slice(4) as Dialect), lang: "sql" };
  switch (format) {
    case "prisma":
      return { code: toPrisma(schema, prismaDialect), lang: "text" };
    case "typeorm":
      return { code: toTypeorm(schema), lang: "typescript" };
    case "mongoose":
      return { code: toMongoose(schema), lang: "typescript" };
    case "efcore":
      return { code: toEfCore(schema), lang: "text" };
    default:
      return { code: toMermaid(schema), lang: "text" };
  }
}

/** Small on/off chip used for PK / Null / Unique. */
function Flag({
  on,
  label,
  title,
  onClick,
}: {
  on: boolean;
  label: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:bg-accent",
        on && "border-primary/60 bg-primary/15 text-primary",
      )}
    >
      {label}
    </button>
  );
}

function ColumnRow({
  col,
  schema,
  tableName,
  onChange,
  onRemove,
}: {
  col: Column;
  schema: Schema;
  tableName: string;
  onChange: (c: Column) => void;
  onRemove: () => void;
}) {
  const targets = schema.tables.flatMap((t) =>
    t.columns.filter((c) => c.primary || c.unique).map((c) => `${t.name}.${c.name}`),
  );
  const refValue = col.references ? `${col.references.table}.${col.references.column}` : "";
  return (
    <div className="flex flex-col gap-1.5 border-b py-2 last:border-0">
      <div className="flex items-center gap-1.5">
        <Input
          value={col.name}
          onChange={(e) => onChange({ ...col, name: e.target.value })}
          aria-label="Column name"
          className="h-7 font-mono text-xs"
          spellCheck={false}
        />
        <select
          value={col.type}
          aria-label={`${col.name} type`}
          onChange={(e) => onChange({ ...col, type: e.target.value as Column["type"] })}
          className="h-7 shrink-0 rounded-md border border-input bg-background px-1 font-mono text-xs"
        >
          {COLUMN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove column ${col.name}`}
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Flag
          on={col.primary}
          label="PK"
          title="Primary key"
          onClick={() => onChange({ ...col, primary: !col.primary, nullable: false })}
        />
        <Flag
          on={col.nullable}
          label="NULL"
          title="Allow empty (NULL)"
          onClick={() => onChange({ ...col, nullable: !col.nullable, primary: false })}
        />
        <Flag
          on={col.unique}
          label="UQ"
          title="Unique"
          onClick={() => onChange({ ...col, unique: !col.unique })}
        />
        <Input
          value={col.default}
          onChange={(e) => onChange({ ...col, default: e.target.value })}
          placeholder="default"
          aria-label={`${col.name} default`}
          title="Default: now, true, 0, 'text'…"
          className="h-6 w-20 font-mono text-[11px]"
        />
        <select
          value={refValue}
          aria-label={`${col.name} references`}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return onChange({ ...col, references: undefined });
            const [t, c] = v.split(".") as [string, string];
            onChange({
              ...col,
              references: { table: t, column: c, onDelete: col.references?.onDelete ?? "cascade" },
            });
          }}
          className="h-6 min-w-0 flex-1 rounded-md border border-input bg-background px-1 font-mono text-[11px]"
        >
          <option value="">→ no relation</option>
          {targets
            .filter((t) => !t.startsWith(`${tableName}.${col.name}`))
            .map((t) => (
              <option key={t} value={t}>
                → {t}
              </option>
            ))}
        </select>
        {col.references && (
          <select
            value={col.references.onDelete}
            aria-label="On delete"
            onChange={(e) =>
              onChange({
                ...col,
                references: { ...col.references!, onDelete: e.target.value as OnDelete },
              })
            }
            className="h-6 rounded-md border border-input bg-background px-1 text-[11px]"
          >
            <option value="cascade">on delete: cascade</option>
            <option value="set null">on delete: set null</option>
            <option value="restrict">on delete: restrict</option>
          </select>
        )}
      </div>
    </div>
  );
}

function TableCard({
  t,
  schema,
  onChange,
  onRemove,
}: {
  t: Table;
  schema: Schema;
  onChange: (t: Table) => void;
  onRemove: () => void;
}) {
  const setCol = (i: number, c: Column) =>
    onChange({ ...t, columns: t.columns.map((x, k) => (k === i ? c : x)) });
  return (
    <section className="rounded-lg border bg-card/50 p-3" aria-label={`Table ${t.name}`}>
      <div className="flex items-center gap-2">
        <Input
          value={t.name}
          onChange={(e) => onChange({ ...t, name: e.target.value })}
          aria-label="Table name"
          className="h-8 font-mono font-semibold"
          spellCheck={false}
        />
        <Flag
          on={t.timestamps}
          label="timestamps"
          title="Add created_at and updated_at"
          onClick={() => onChange({ ...t, timestamps: !t.timestamps })}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove table ${t.name}`}
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
      </div>
      <div className="mt-1">
        {t.columns.map((c, i) => (
          <ColumnRow
            key={c.id}
            col={c}
            schema={schema}
            tableName={t.name}
            onChange={(nc) => setCol(i, nc)}
            onRemove={() => onChange({ ...t, columns: t.columns.filter((_, k) => k !== i) })}
          />
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          onChange({
            ...t,
            columns: [...t.columns, column("new_column", "string", { length: 255 })],
          })
        }
      >
        <Plus /> Column
      </Button>
    </section>
  );
}

export default function SchemaDesigner() {
  const { schema, setSchema } = useSchema();
  const [format, setFormat] = usePersistentState("db:format", "sql:postgresql");
  const [prismaDialect, setPrismaDialect] = usePersistentState<Dialect>(
    "db:prisma-dialect",
    "postgresql",
  );
  const [view, setView] = usePersistentState<"code" | "diagram">("db:view", "code");
  const [importOpen, setImportOpen] = useState(false);
  const [diagramOpen, setDiagramOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const errors = validateSchema(schema);
  const out = errors.length ? null : generate(schema, format, prismaDialect);

  /** Replace the schema with an Undo toast (guidelines: no confirm dialogs). */
  const replace = (next: Schema, message: string) => {
    const prev = schema;
    setSchema(next);
    toast(message, { action: { label: "Undo", onClick: () => setSchema(prev) }, duration: 5000 });
  };
  const setTable = (i: number, t: Table) =>
    setSchema({ tables: schema.tables.map((x, k) => (k === i ? t : x)) });

  const runImport = () => {
    try {
      const next = importSql(importText);
      replace(next, `Imported ${next.tables.length} table${next.tables.length === 1 ? "" : "s"}`);
      setImportOpen(false);
      setImportText("");
      setImportError("");
    } catch (e) {
      setImportError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <>
      <ToolLayout
        title="Schema designer"
        description="Design tables and relations once, get SQL for any database plus Prisma, TypeORM, Mongoose and EF Core."
        actions={
          <Button variant="ghost" size="sm" onClick={() => setImportOpen(true)}>
            <FileUp /> Import SQL
          </Button>
        }
        input={
          <>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Start from:</span>
              {Object.keys(templates).map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => replace(templates[name]!(), `Loaded the ${name} template`)}
                >
                  {name}
                </Button>
              ))}
            </div>
            {errors.length > 0 && (
              <ul
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
              >
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            {schema.tables.map((t, i) => (
              <TableCard
                key={t.id}
                t={t}
                schema={schema}
                onChange={(nt) => setTable(i, nt)}
                onRemove={() =>
                  replace(
                    { tables: schema.tables.filter((_, k) => k !== i) },
                    `Removed table ${t.name}`,
                  )
                }
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() =>
                setSchema({
                  tables: [
                    ...schema.tables,
                    table(`table_${schema.tables.length + 1}`, [idColumn()]),
                  ],
                })
              }
            >
              <Plus /> Add table
            </Button>
          </>
        }
        output={
          <>
            <div className="flex items-center justify-between gap-2">
              <Segmented
                label="View"
                value={view}
                onChange={setView}
                options={[
                  { value: "code", label: "Code" },
                  { value: "diagram", label: "Diagram" },
                ]}
              />
              {view === "diagram" && (
                <Button variant="ghost" size="sm" onClick={() => setDiagramOpen(true)}>
                  <Maximize2 /> Expand
                </Button>
              )}
            </div>
            {view === "diagram" ? (
              <ErDiagram schema={schema} />
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <div className="min-w-40 flex-1">
                    <SelectField
                      label="Generate"
                      value={format}
                      onChange={setFormat}
                      options={FORMATS}
                    />
                  </div>
                  {format === "prisma" && (
                    <div className="min-w-32">
                      <SelectField
                        label="Prisma provider"
                        value={prismaDialect}
                        onChange={setPrismaDialect}
                        options={FORMATS.filter((f) => f.value.startsWith("sql:")).map((f) => ({
                          value: f.value.slice(4) as Dialect,
                          label: f.label,
                        }))}
                      />
                    </div>
                  )}
                </div>
                {out ? (
                  <OutputCode
                    label={FORMATS.find((f) => f.value === format)?.label}
                    code={out.code}
                    language={out.lang}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Fix the problems on the left to see the code.
                  </p>
                )}
              </>
            )}
          </>
        }
      />
      <Dialog open={diagramOpen} onOpenChange={setDiagramOpen}>
        <DialogContent className="top-[5%] flex max-h-[90vh] w-[92vw] max-w-[92vw] flex-col gap-3 p-4">
          <DialogTitle className="text-base font-semibold">Diagram</DialogTitle>
          <DialogDescription className="sr-only">
            Full-size view of the schema diagram.
          </DialogDescription>
          <div className="min-h-0 overflow-auto">
            <ErDiagram schema={schema} />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="flex max-w-2xl flex-col gap-3 p-4">
          <DialogTitle className="text-base font-semibold">Import SQL</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Paste CREATE TABLE statements (PostgreSQL, MySQL, SQLite or SQL Server). This replaces
            the current schema — you can undo.
          </DialogDescription>
          <CodeInput
            value={importText}
            onChange={setImportText}
            language="sql"
            label="SQL to import"
            placeholder="CREATE TABLE users (...);"
            invalid={!!importError}
            className="h-72"
          />
          {importError && <p className="text-xs text-destructive">{importError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={runImport} disabled={!importText.trim()}>
              Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
