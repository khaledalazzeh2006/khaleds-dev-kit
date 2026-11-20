import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeInput, type CodeLanguage } from "@/components/tool/code-input";
import { OutputCode } from "@/components/tool/output-code";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useAsyncResult } from "@/lib/hooks/use-async-result";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import {
  byteSize,
  formatCode,
  minifiable,
  minifyCode,
  type FormatLang,
  type Indent,
  type KeywordCase,
  type SqlDialect,
} from "../lib/format";

export interface FormatterConfig {
  lang: FormatLang;
  title: string;
  description: string;
  editor: CodeLanguage;
  sample: string;
}

type Mode = "format" | "minify";

/** One component for every formatter: paste on the left, formatted (or minified) on the right. */
export function FormatterTool({ config }: { config: FormatterConfig }) {
  const { lang } = config;
  const [input, setInput] = usePersistentState(`fmt:${lang}:input`, config.sample);
  const [mode, setMode] = usePersistentState<Mode>(`fmt:${lang}:mode`, "format");
  const [indent, setIndent] = usePersistentState<Indent>("fmt:indent", "2");
  const [dialect, setDialect] = usePersistentState<SqlDialect>("fmt:sql:dialect", "postgresql");
  const [keywordCase, setKeywordCase] = usePersistentState<KeywordCase>("fmt:sql:case", "upper");

  const canMinify = !!minifiable[lang];
  const activeMode: Mode = canMinify ? mode : "format";
  const { data, error } = useAsyncResult(
    () =>
      activeMode === "minify"
        ? minifyCode(lang, input)
        : formatCode(lang, input, { indent, sqlDialect: dialect, keywordCase }),
    [lang, input, activeMode, indent, dialect, keywordCase],
  );
  const output = error ? "" : (data ?? "");

  return (
    <ToolLayout
      title={config.title}
      description={config.description}
      actions={
        <Button variant="ghost" size="sm" onClick={() => setInput(config.sample)}>
          <RotateCcw /> Sample
        </Button>
      }
      input={
        <>
          <div className="flex flex-wrap items-center gap-2">
            {canMinify && (
              <Segmented
                label="Mode"
                value={activeMode}
                onChange={setMode}
                options={[
                  { value: "format", label: "Format" },
                  { value: "minify", label: "Minify" },
                ]}
              />
            )}
            {activeMode === "format" && (
              <Segmented
                label="Indent"
                value={indent}
                onChange={setIndent}
                options={[
                  { value: "2", label: "2 spaces" },
                  { value: "4", label: "4 spaces" },
                  { value: "tab", label: "Tab" },
                ]}
              />
            )}
          </div>
          {lang === "sql" && (
            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                label="SQL dialect"
                value={dialect}
                onChange={setDialect}
                options={[
                  { value: "postgresql", label: "PostgreSQL" },
                  { value: "mysql", label: "MySQL" },
                  { value: "sqlite", label: "SQLite" },
                  { value: "transactsql", label: "SQL Server" },
                ]}
              />
              <Segmented
                label="Keyword case"
                value={keywordCase}
                onChange={setKeywordCase}
                options={[
                  { value: "upper", label: "UPPER" },
                  { value: "lower", label: "lower" },
                  { value: "preserve", label: "Keep" },
                ]}
              />
            </div>
          )}
          <CodeInput
            value={input}
            onChange={setInput}
            language={config.editor}
            label={`${config.title} input`}
            placeholder={`Paste ${config.title} here`}
            invalid={!!error}
            className="min-h-72 flex-1"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </>
      }
      output={
        <OutputCode
          label={activeMode === "minify" ? "Minified" : "Formatted"}
          meta={output ? `${byteSize(input)} → ${byteSize(output)}` : undefined}
          code={output}
          language={config.editor}
          className="flex-1"
        />
      }
    />
  );
}
