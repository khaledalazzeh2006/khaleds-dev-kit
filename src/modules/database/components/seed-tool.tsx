import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutputCode } from "@/components/tool/output-code";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { SelectField } from "@/components/tool/select-field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useAsyncResult } from "@/lib/hooks/use-async-result";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { sortByDependencies } from "../lib/schema";
import { rowsToSql, seedTables } from "../lib/seed";
import type { Dialect } from "../lib/sql";
import { useSchema } from "../lib/store";

type Format = Dialect | "json" | "csv";

export default function SeedTool() {
  const schema = useSchema((s) => s.schema);
  const [target, setTarget] = usePersistentState("db:seed:target", "__all__");
  const [count, setCount] = usePersistentState("db:seed:count", 10);
  const [format, setFormat] = usePersistentState<Format>("db:seed:format", "postgresql");
  const [seed, setSeed] = usePersistentState("db:seed:seed", 42);

  const { data, error } = useAsyncResult(async () => {
    const { faker } = await import("@faker-js/faker");
    // Always seed the whole schema so one table's foreign keys match what "All tables" inserts.
    const all = seedTables(faker, sortByDependencies(schema.tables), count, seed);
    const seeded = target === "__all__" ? all : all.filter(({ t }) => t.name === target);
    if (format === "json")
      return JSON.stringify(
        Object.fromEntries(seeded.map(({ t, rows }) => [t.name, rows])),
        null,
        2,
      );
    if (format === "csv") {
      const Papa = (await import("papaparse")).default;
      return seeded.map(({ t, rows }) => `# ${t.name}\n${Papa.unparse(rows)}`).join("\n\n");
    }
    return seeded.map(({ t, rows }) => rowsToSql(t, rows, format)).join("\n\n");
  }, [schema, target, count, format, seed]);

  return (
    <ToolLayout
      title="Seed data"
      description="Realistic fake rows for the tables in your schema (names, emails, prices… picked from column names)."
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSeed(Math.floor(Math.random() * 100000))}
        >
          <RotateCcw /> New data
        </Button>
      }
      input={
        <>
          <SelectField
            label="Tables"
            value={target}
            onChange={setTarget}
            options={[
              { value: "__all__", label: "All tables (in dependency order)" },
              ...schema.tables.map((t) => ({ value: t.name, label: t.name })),
            ]}
          />
          <RangeField label="Rows per table" value={count} onChange={setCount} min={1} max={500} />
          <Segmented
            label="Format"
            value={format}
            onChange={setFormat}
            options={[
              { value: "postgresql", label: "PostgreSQL" },
              { value: "mysql", label: "MySQL" },
              { value: "sqlite", label: "SQLite" },
              { value: "sqlserver", label: "SQL Server" },
              { value: "json", label: "JSON" },
              { value: "csv", label: "CSV" },
            ]}
          />
          <p className="text-xs text-muted-foreground">
            Uses the tables from the Schema designer. Foreign keys always point at rows generated
            for the parent table (int or uuid keys), so run the “All tables” script in order.
          </p>
        </>
      }
      output={
        error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <OutputCode
            label="Seed"
            code={data ?? ""}
            language={format === "json" ? "json" : format === "csv" ? undefined : "sql"}
          />
        )
      }
    />
  );
}
