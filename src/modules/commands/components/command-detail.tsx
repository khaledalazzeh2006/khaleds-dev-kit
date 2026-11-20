import { useState } from "react";
import { ExternalLink, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/tool/field";
import { OutputCode } from "@/components/tool/output-code";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { openExternal } from "@/lib/open-url";
import { cn } from "@/lib/utils";
import type { DetailProps } from "@/app/module";
import { commandById, currentPlatform } from "../lib/data";
import { frameworkLabel } from "../lib/frameworks";
import { renderCommand, type Platform } from "../lib/render";
import { useCommandVars } from "../lib/store";

const platformLabel: Record<Platform, string> = { windows: "Windows", macos: "macOS" };

export default function CommandDetail({ item }: DetailProps) {
  const cmd = commandById.get(item.id);
  const { values, setValue, reset } = useCommandVars();
  const [flags, setFlags] = useState<string[]>([]);
  const [platform, setPlatform] = useState<Platform>(currentPlatform);
  if (!cmd) return null;

  const vars = cmd.vars ?? [];
  const output = renderCommand(cmd, { platform, values, flags });
  const toggleFlag = (flag: string) =>
    setFlags((f) => (f.includes(flag) ? f.filter((x) => x !== flag) : [...f, flag]));

  return (
    <ToolLayout
      title={cmd.title}
      description={`${frameworkLabel(cmd.framework)} · ${cmd.description}`}
      actions={
        <>
          {(vars.length > 0 || flags.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                reset(vars.map((v) => v.key));
                setFlags([]);
              }}
            >
              <RotateCcw /> Reset
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => void openExternal(cmd.source)}>
            <ExternalLink /> Docs
          </Button>
        </>
      }
      input={
        <>
          {cmd.danger && (
            <div
              role="alert"
              className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <p>This command can delete data or history. Double-check where you run it.</p>
            </div>
          )}
          {vars.map((v) => (
            <Field key={v.key} label={v.label ?? v.key}>
              {(id) => (
                <Input
                  id={id}
                  value={values[v.key] ?? ""}
                  placeholder={v.default}
                  onChange={(e) => setValue(v.key, e.target.value)}
                  spellCheck={false}
                  className="font-mono"
                />
              )}
            </Field>
          ))}
          {cmd.flags && cmd.flags.length > 0 && (
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-xs font-medium text-muted-foreground">Options</legend>
              {cmd.flags.map((f) => {
                const on = flags.includes(f.flag);
                return (
                  <button
                    key={f.flag}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleFlag(f.flag)}
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-2.5 py-1.5 text-left transition-colors hover:bg-accent",
                      on && "border-primary/60 bg-primary/10",
                    )}
                  >
                    <code className={cn("shrink-0 font-mono text-xs", on && "text-primary")}>
                      {f.flag}
                    </code>
                    <span className="truncate text-xs text-muted-foreground">{f.desc}</span>
                  </button>
                );
              })}
            </fieldset>
          )}
          {vars.length === 0 && !cmd.flags?.length && (
            <p className="text-muted-foreground">No options — copy it as is.</p>
          )}
        </>
      }
      output={
        <>
          {cmd.platforms && (
            <Segmented
              label="Platform"
              value={platform}
              onChange={setPlatform}
              options={(["windows", "macos"] as const).map((p) => ({
                value: p,
                label: platformLabel[p],
              }))}
            />
          )}
          <OutputCode label="Command" code={output} />
          <p className="text-xs text-muted-foreground">
            Verified against the official docs · {cmd.verified}
          </p>
        </>
      }
    />
  );
}
