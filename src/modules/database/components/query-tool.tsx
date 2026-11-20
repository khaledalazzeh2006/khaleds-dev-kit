import { useMemo, useState } from "react";
import {
  Database,
  FileDown,
  FolderOpen,
  Loader2,
  Play,
  PlugZap,
  Search,
  Table2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/kbd";
import { CodeInput } from "@/components/tool/code-input";
import { Field } from "@/components/tool/field";
import { Segmented } from "@/components/tool/segmented";
import { SelectField } from "@/components/tool/select-field";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { copyText } from "@/lib/clipboard";
import { DESKTOP_ONLY, dbQuery, isDesktop, type QueryResult } from "@/lib/native";
import { cn } from "@/lib/utils";
import { defaultPorts, driverUrl, type ConnectionOptions } from "../lib/connection";
import {
  engineOfUrl,
  introspectionSql,
  normalizeUrl,
  previewSql,
  rowsToSchema,
  tablesSql,
  toObjects,
  type LiveEngine,
} from "../lib/introspect";
import { useDbSecrets } from "../lib/session";
import { useSchema } from "../lib/store";

const LIVE: { value: LiveEngine; label: string }[] = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "sqlite", label: "SQLite" },
];

const DEFAULT: Omit<ConnectionOptions, "password"> = {
  engine: "postgresql",
  host: "localhost",
  port: 5432,
  user: "postgres",
  database: "app",
  ssl: false,
  file: "./dev.db",
};

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export default function QueryTool() {
  // Same saved fields as "Connection string" (password and pasted URLs stay in memory only).
  const [saved, setSaved] = usePersistentState<Omit<ConnectionOptions, "password">>(
    "db:conn",
    DEFAULT,
  );
  const { password, setPassword, url: pastedUrl, setUrl } = useDbSecrets();
  const [mode, setMode] = usePersistentState<"fields" | "url">("db:query:mode", "fields");
  const [pgSchema, setPgSchema] = usePersistentState("db:query:schema", "public");
  const [sql, setSql] = usePersistentState("db:query:sql", "SELECT 1;");
  const [maxRows, setMaxRows] = usePersistentState("db:query:max", "500");
  const [readOnly, setReadOnly] = useState(true);
  const [tables, setTables] = useState<string[] | null>(null);
  const [filter, setFilter] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"" | "connect" | "run" | "import">("");
  const setSchema = useSchema((s) => s.setSchema);

  const engineOk = LIVE.some((e) => e.value === saved.engine);
  const url =
    mode === "url" ? normalizeUrl(pastedUrl) : engineOk ? driverUrl({ ...saved, password }) : "";
  const engine = engineOfUrl(url);
  const shownTables = useMemo(
    () => (tables ?? []).filter((t) => t.toLowerCase().includes(filter.toLowerCase())),
    [tables, filter],
  );

  if (!isDesktop()) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
        <div className="flex max-w-sm flex-col items-center gap-2">
          <Database className="size-8" />
          <p className="font-medium text-foreground">Connect & query</p>
          <p>Runs SQL on your real database. {DESKTOP_ONLY}</p>
        </div>
      </div>
    );
  }

  const set = (patch: Partial<ConnectionOptions>) => {
    const { password: pw, ...rest } = patch;
    if (pw !== undefined) setPassword(pw);
    if (Object.keys(rest).length) setSaved({ ...saved, ...rest });
  };

  const connect = async () => {
    if (!engine) return setError("Use a postgresql://, mysql:// or sqlite: connection.");
    setBusy("connect");
    setError("");
    try {
      const r = await dbQuery(url, tablesSql(engine, pgSchema), { maxRows: 5000 });
      setTables(r.rows.map((row) => row[0] ?? ""));
      toast.success(
        `Connected · ${r.rows.length} table${r.rows.length === 1 ? "" : "s"} · ${r.elapsedMs} ms`,
      );
    } catch (e) {
      setTables(null);
      setError(message(e));
    } finally {
      setBusy("");
    }
  };

  const run = async (text = sql) => {
    if (!engine || !text.trim()) return;
    setBusy("run");
    setError("");
    try {
      setResult(await dbQuery(url, text, { maxRows: Number(maxRows), readOnly }));
    } catch (e) {
      setResult(null);
      setError(message(e));
    } finally {
      setBusy("");
    }
  };

  const openTable = (t: string) => {
    if (!engine) return;
    const q = previewSql(engine, t, pgSchema);
    setSql(q);
    void run(q);
  };

  const importSchema = async () => {
    if (!engine) return;
    setBusy("import");
    try {
      const r = await dbQuery(url, introspectionSql(engine, pgSchema), { maxRows: 10000 });
      const schema = rowsToSchema(toObjects(r.columns, r.rows));
      const prev = useSchema.getState().schema;
      setSchema(schema);
      toast(`Imported ${schema.tables.length} tables into the Schema designer`, {
        action: { label: "Undo", onClick: () => setSchema(prev) },
        cancel: { label: "Open", onClick: () => (window.location.hash = "#/database/designer") },
        duration: 8000,
      });
    } catch (e) {
      toast.error(message(e));
    } finally {
      setBusy("");
    }
  };

  const copyAs = async (kind: "csv" | "json") => {
    if (!result) return;
    let text: string;
    if (kind === "json") {
      text = JSON.stringify(
        result.rows.map((r) => Object.fromEntries(result.columns.map((c, i) => [c, r[i]]))),
        null,
        2,
      );
    } else {
      const Papa = (await import("papaparse")).default;
      text = Papa.unparse({ fields: result.columns, data: result.rows });
    }
    if (await copyText(text))
      toast.success(`Copied ${result.rows.length} rows as ${kind.toUpperCase()}`);
  };

  return (
    <div className="@container flex h-full flex-col">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Connect & query</h2>
          <p className="text-xs text-muted-foreground">
            Browse tables and run SQL on PostgreSQL, MySQL or SQLite. The password is never saved.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!tables || busy !== ""}
          onClick={() => void importSchema()}
          title="Read every table into the Schema designer"
        >
          <FileDown /> Import into designer
        </Button>
      </header>

      <section aria-label="Connection" className="flex flex-col gap-3 border-b p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Segmented
            label="Connect with"
            value={mode}
            onChange={setMode}
            options={[
              { value: "fields", label: "Fields" },
              { value: "url", label: "URL" },
            ]}
          />
          {mode === "fields" && (
            <Segmented
              label="Database"
              value={(engineOk ? saved.engine : "postgresql") as LiveEngine}
              onChange={(e) => set({ engine: e, port: defaultPorts[e] })}
              options={LIVE}
            />
          )}
          {engine === "postgresql" && (
            <div className="w-28">
              <Field label="Schema">
                {(id) => (
                  <Input id={id} value={pgSchema} onChange={(e) => setPgSchema(e.target.value)} />
                )}
              </Field>
            </div>
          )}
        </div>
        {mode === "url" ? (
          <Field
            label="Connection URL"
            hint="Paste DATABASE_URL, e.g. postgresql://user:pass@host:5432/db (kept in memory only)."
          >
            {(id) => (
              <Input
                id={id}
                type="password"
                value={pastedUrl}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void connect()}
                spellCheck={false}
                className="font-mono"
                placeholder="postgresql://…"
              />
            )}
          </Field>
        ) : saved.engine === "sqlite" ? (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label="Database file">
                {(id) => (
                  <Input
                    id={id}
                    value={saved.file}
                    onChange={(e) => set({ file: e.target.value })}
                    className="font-mono"
                  />
                )}
              </Field>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const { open } = await import("@tauri-apps/plugin-dialog");
                const f = await open({
                  title: "SQLite database",
                  filters: [{ name: "SQLite", extensions: ["db", "sqlite", "sqlite3", "db3"] }],
                });
                if (typeof f === "string") set({ file: f });
              }}
            >
              <FolderOpen /> Browse
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 @min-[700px]:grid-cols-[2fr_6rem_1.5fr_1.5fr_1.5fr_auto]">
            <Field label="Host">
              {(id) => (
                <Input id={id} value={saved.host} onChange={(e) => set({ host: e.target.value })} />
              )}
            </Field>
            <Field label="Port">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  value={saved.port}
                  onChange={(e) => set({ port: Number(e.target.value) })}
                />
              )}
            </Field>
            <Field label="Database">
              {(id) => (
                <Input
                  id={id}
                  value={saved.database}
                  onChange={(e) => set({ database: e.target.value })}
                />
              )}
            </Field>
            <Field label="User">
              {(id) => (
                <Input id={id} value={saved.user} onChange={(e) => set({ user: e.target.value })} />
              )}
            </Field>
            <Field label="Password">
              {(id) => (
                <Input
                  id={id}
                  type="password"
                  value={password}
                  onChange={(e) => set({ password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && void connect()}
                  autoComplete="off"
                />
              )}
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={saved.ssl}
                onChange={(e) => set({ ssl: e.target.checked })}
                className="size-4 accent-primary"
              />
              SSL
            </label>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => void connect()} disabled={busy !== ""}>
            {busy === "connect" ? <Loader2 className="animate-spin" /> : <PlugZap />}{" "}
            {tables ? "Reconnect" : "Connect"}
          </Button>
          {tables && (
            <span className="text-xs text-success">
              Connected · {tables.length} table{tables.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto @min-[760px]:grid-cols-[14rem_1fr] @min-[760px]:overflow-hidden">
        <aside
          aria-label="Tables"
          className="flex min-h-0 flex-col gap-2 border-b p-3 @min-[760px]:border-r @min-[760px]:border-b-0"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Tables"
              className="pl-8"
              aria-label="Filter tables"
            />
          </div>
          <ul className="min-h-0 flex-1 overflow-auto">
            {tables === null ? (
              <li className="p-2 text-xs text-muted-foreground">Connect to see tables.</li>
            ) : shownTables.length === 0 ? (
              <li className="p-2 text-xs text-muted-foreground">No tables.</li>
            ) : (
              shownTables.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => openTable(t)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs hover:bg-accent"
                  >
                    <Table2 className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{t}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col gap-3 p-4">
          <div
            className="flex h-40 shrink-0 flex-col"
            onKeyDownCapture={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                void run();
              }
            }}
          >
            <CodeInput
              value={sql}
              onChange={setSql}
              language="sql"
              label="SQL"
              className="min-h-0 flex-1"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={() => void run()} disabled={busy !== "" || !engine}>
              {busy === "run" ? <Loader2 className="animate-spin" /> : <Play />} Run{" "}
              <Kbd keys={["mod", "↵"]} className="ml-1" />
            </Button>
            <label
              className="flex items-center gap-2 text-sm"
              title="The database itself blocks INSERT, UPDATE, DELETE and schema changes"
            >
              <input
                type="checkbox"
                checked={readOnly}
                onChange={(e) => setReadOnly(e.target.checked)}
                className="size-4 accent-primary"
              />
              Read-only
            </label>
            {!readOnly && (
              <span className="text-xs font-medium text-destructive">
                Changes will be written to the database
              </span>
            )}
            <div className="ml-auto w-28">
              <SelectField
                label="Max rows"
                value={maxRows}
                onChange={setMaxRows}
                options={["100", "500", "1000", "5000"].map((v) => ({ value: v, label: v }))}
              />
            </div>
          </div>

          {error && (
            <pre
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs whitespace-pre-wrap text-destructive"
            >
              {error}
            </pre>
          )}

          {result && (
            <div className="flex min-h-48 flex-1 flex-col overflow-hidden rounded-lg border">
              <div className="flex h-9 shrink-0 items-center gap-3 border-b bg-muted/40 px-3 text-xs text-muted-foreground">
                <span>
                  {result.columns.length
                    ? `${result.rows.length}${result.truncated ? "+" : ""} row${result.rows.length === 1 ? "" : "s"}`
                    : "Done"}
                  {result.rowsAffected > 0 && ` · ${result.rowsAffected} changed`} ·{" "}
                  {result.elapsedMs} ms
                </span>
                {result.truncated && (
                  <span className="text-warning">Showing the first {maxRows}</span>
                )}
                {result.columns.length > 0 && (
                  <span className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => void copyAs("csv")}>
                      Copy CSV
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => void copyAs("json")}>
                      Copy JSON
                    </Button>
                  </span>
                )}
              </div>
              {result.columns.length > 0 && (
                <div className="min-h-0 flex-1 overflow-auto">
                  <table className="w-max min-w-full border-collapse font-mono text-xs">
                    <thead className="sticky top-0 bg-background">
                      <tr>
                        {result.columns.map((c, i) => (
                          <th
                            key={i}
                            className="border-b border-r px-2.5 py-1.5 text-left font-semibold whitespace-nowrap"
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, r) => (
                        <tr key={r} className="hover:bg-accent/50">
                          {row.map((v, c) => (
                            <td
                              key={c}
                              title={v ?? "NULL"}
                              className={cn(
                                "max-w-80 truncate border-r border-b px-2.5 py-1 whitespace-nowrap",
                                v === null && "text-muted-foreground italic",
                              )}
                            >
                              {v ?? "NULL"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
