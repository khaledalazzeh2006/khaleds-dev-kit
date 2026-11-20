import type { ReactNode } from "react";
import { ArrowLeftRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeInput, type CodeLanguage } from "@/components/tool/code-input";
import { Field } from "@/components/tool/field";
import { OutputCode } from "@/components/tool/output-code";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useAsyncResult } from "@/lib/hooks/use-async-result";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";

export type Options = Record<string, string>;

export interface Direction {
  id: string;
  label: string;
  inLang: CodeLanguage;
  /** Omit for plain text output (wraps between words). */
  outLang?: CodeLanguage;
  sample: string;
  run: (input: string, options: Options) => string | Promise<string>;
}

export interface ConvertConfig {
  id: string;
  title: string;
  description: string;
  directions: Direction[];
  /** Small exclusive choices shown above the input, e.g. delimiter or "URL-safe". */
  choices?: {
    key: string;
    label: string;
    default: string;
    options: { value: string; label: string }[];
  }[];
  /** Free-text options, e.g. a component name. */
  textOptions?: { key: string; label: string; default: string }[];
  /** Extra output under the result (e.g. a preview or a parsed table). */
  extraOutput?: (input: string, direction: Direction, options: Options) => ReactNode;
}

const inputKey = (configId: string, dirId: string) => `conv:${configId}:input:${dirId}`;

/** Generic text → text converter: direction switch, options, live output, swap. */
export function ConvertTool({ config }: { config: ConvertConfig }) {
  const first = config.directions[0]!;
  const [dirId, setDirId] = usePersistentState(`conv:${config.id}:dir`, first.id);
  const direction = config.directions.find((d) => d.id === dirId) ?? first;
  // Keyed by direction: each direction keeps its own input.
  return (
    <ConvertPanel key={direction.id} config={config} direction={direction} onDirection={setDirId} />
  );
}

function ConvertPanel({
  config,
  direction,
  onDirection,
}: {
  config: ConvertConfig;
  direction: Direction;
  onDirection: (id: string) => void;
}) {
  const [input, setInput] = usePersistentState(inputKey(config.id, direction.id), direction.sample);
  const defaults = Object.fromEntries([
    ...(config.choices ?? []).map((c) => [c.key, c.default]),
    ...(config.textOptions ?? []).map((t) => [t.key, t.default]),
  ]);
  const [options, setOptions] = usePersistentState<Options>(`conv:${config.id}:options`, defaults);
  const opts = { ...defaults, ...options };
  const setOption = (key: string, value: string) => setOptions({ ...opts, [key]: value });

  const { data, error } = useAsyncResult(
    async () => direction.run(input, opts),
    [direction.id, input, JSON.stringify(opts)],
  );
  const output = error ? "" : (data ?? "");

  const canSwap = config.directions.length === 2 && !!output;
  const swap = () => {
    const other = config.directions.find((d) => d.id !== direction.id)!;
    try {
      // Pre-fill the other direction's input with this output, then switch to it.
      localStorage.setItem(`devkit:${inputKey(config.id, other.id)}`, JSON.stringify(output));
    } catch {
      // storage unavailable: switching still works, just without carrying the text over
    }
    onDirection(other.id);
  };

  return (
    <ToolLayout
      title={config.title}
      description={config.description}
      actions={
        <Button variant="ghost" size="sm" onClick={() => setInput(direction.sample)}>
          <RotateCcw /> Sample
        </Button>
      }
      input={
        <>
          <div className="flex flex-wrap items-center gap-2">
            {config.directions.length > 1 && (
              <Segmented
                label="Direction"
                value={direction.id}
                onChange={onDirection}
                options={config.directions.map((d) => ({ value: d.id, label: d.label }))}
              />
            )}
            {canSwap && (
              <Button
                variant="ghost"
                size="sm"
                onClick={swap}
                aria-label="Use output as input and switch direction"
              >
                <ArrowLeftRight /> Swap
              </Button>
            )}
            {config.choices?.map((c) => (
              <Segmented
                key={c.key}
                label={c.label}
                value={opts[c.key] ?? c.default}
                onChange={(v) => setOption(c.key, v)}
                options={c.options}
              />
            ))}
          </div>
          {config.textOptions?.map((t) => (
            <Field key={t.key} label={t.label}>
              {(id) => (
                <Input
                  id={id}
                  value={opts[t.key] ?? ""}
                  placeholder={t.default}
                  onChange={(e) => setOption(t.key, e.target.value)}
                />
              )}
            </Field>
          ))}
          <CodeInput
            value={input}
            onChange={setInput}
            language={direction.inLang}
            label={`${config.title} input`}
            placeholder="Paste here"
            invalid={!!error}
            className="min-h-60 flex-1"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </>
      }
      output={
        <>
          <OutputCode label="Result" code={output} language={direction.outLang} />
          {config.extraOutput?.(input, direction, opts)}
        </>
      }
    />
  );
}
