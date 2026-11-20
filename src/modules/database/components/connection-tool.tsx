import { Input } from "@/components/ui/input";
import { CopyRows } from "@/components/tool/copy-rows";
import { Field } from "@/components/tool/field";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import {
  adoNetString,
  connectionUrl,
  defaultPorts,
  type ConnectionOptions,
  type Engine,
} from "../lib/connection";
import { useDbSecrets } from "../lib/session";

const DEFAULT: ConnectionOptions = {
  engine: "postgresql",
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "",
  database: "app",
  ssl: false,
  file: "./dev.db",
};

export default function ConnectionTool() {
  // The password is kept in memory only — never saved to disk.
  const [saved, setSaved] = usePersistentState<Omit<ConnectionOptions, "password">>(
    "db:conn",
    DEFAULT,
  );
  const password = useDbSecrets((s) => s.password);
  const setPassword = useDbSecrets((s) => s.setPassword);
  const o: ConnectionOptions = { ...saved, password };
  const set = (patch: Partial<ConnectionOptions>) => {
    const { password: pw, ...rest } = patch;
    if (pw !== undefined) setPassword(pw);
    if (Object.keys(rest).length) setSaved({ ...saved, ...rest });
  };
  const url = connectionUrl(o);
  const rows = [
    { label: "URL", value: url },
    { label: ".env", value: `DATABASE_URL="${url}"` },
    ...(o.engine === "sqlserver" ? [{ label: "ADO.NET", value: adoNetString(o) }] : []),
    ...(o.engine === "postgresql" ? [{ label: "psql", value: `psql "${url}"` }] : []),
    ...(o.engine === "mysql"
      ? [
          {
            label: "mysql CLI",
            value: `mysql -h ${o.host} -P ${o.port} -u ${o.user} -p ${o.database}`,
          },
        ]
      : []),
    ...(o.engine === "mongodb" ? [{ label: "mongosh", value: `mongosh "${url}"` }] : []),
  ];

  return (
    <ToolLayout
      title="Connection string"
      description="Build a correct connection URL (special characters in the password are encoded for you)."
      input={
        <>
          <Segmented
            label="Database"
            value={o.engine}
            onChange={(engine: Engine) => set({ engine, port: defaultPorts[engine] || o.port })}
            options={[
              { value: "postgresql", label: "PostgreSQL" },
              { value: "mysql", label: "MySQL" },
              { value: "sqlserver", label: "SQL Server" },
              { value: "mongodb", label: "MongoDB" },
              { value: "sqlite", label: "SQLite" },
            ]}
          />
          {o.engine === "sqlite" ? (
            <Field label="Database file">
              {(id) => (
                <Input
                  id={id}
                  value={o.file}
                  onChange={(e) => set({ file: e.target.value })}
                  className="font-mono"
                />
              )}
            </Field>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_6rem] gap-2">
                <Field label="Host">
                  {(id) => (
                    <Input
                      id={id}
                      value={o.host}
                      onChange={(e) => set({ host: e.target.value })}
                      className="font-mono"
                    />
                  )}
                </Field>
                <Field label="Port">
                  {(id) => (
                    <Input
                      id={id}
                      inputMode="numeric"
                      value={o.port}
                      onChange={(e) =>
                        set({ port: Number(e.target.value.replace(/\D/g, "")) || 0 })
                      }
                      className="font-mono"
                    />
                  )}
                </Field>
              </div>
              <Field label="Database">
                {(id) => (
                  <Input
                    id={id}
                    value={o.database}
                    onChange={(e) => set({ database: e.target.value })}
                    className="font-mono"
                  />
                )}
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="User">
                  {(id) => (
                    <Input
                      id={id}
                      value={o.user}
                      onChange={(e) => set({ user: e.target.value })}
                      className="font-mono"
                    />
                  )}
                </Field>
                <Field label="Password" hint="Not saved.">
                  {(id) => (
                    <Input
                      id={id}
                      type="password"
                      value={password}
                      onChange={(e) => set({ password: e.target.value })}
                      className="font-mono"
                    />
                  )}
                </Field>
              </div>
              <Segmented
                label="SSL"
                value={o.ssl ? "on" : "off"}
                onChange={(v) => set({ ssl: v === "on" })}
                options={[
                  { value: "off", label: "Local (no SSL)" },
                  { value: "on", label: "SSL / TLS (cloud)" },
                ]}
              />
            </>
          )}
        </>
      }
      output={<CopyRows title="Copy" rows={rows} />}
    />
  );
}
