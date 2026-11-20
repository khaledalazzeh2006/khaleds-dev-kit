import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/tool/color-field";
import { Field } from "@/components/tool/field";
import { OutputCode } from "@/components/tool/output-code";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { copyText } from "@/lib/clipboard";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { cn } from "@/lib/utils";
import { generatePalette, paletteCode, type PaletteFormat } from "../lib/palette";

const DEFAULT = { base: "#8b5cf6", name: "brand" };

export default function PaletteTool() {
  const [state, setState] = usePersistentState("design:palette", DEFAULT);
  const [format, setFormat] = usePersistentState<PaletteFormat>(
    "design:palette:format",
    "tailwind",
  );
  const swatches = generatePalette(state.base);

  return (
    <ToolLayout
      title="Palette"
      description="A full 50–950 scale from one color, in OKLCH (Tailwind v4 style)."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setState(DEFAULT)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <ColorField
            label="Base color"
            value={state.base}
            onChange={(base) => setState({ ...state, base })}
          />
          <Field label="Name" hint="Used in variable names, e.g. --color-brand-500.">
            {(id) => (
              <Input
                id={id}
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
              />
            )}
          </Field>
          {swatches && (
            <ul className="grid grid-cols-1 gap-1" aria-label="Palette">
              {swatches.map((s) => (
                <li key={s.step}>
                  <button
                    type="button"
                    onClick={() => void copyText(s.hex, `Copied ${s.hex}`)}
                    className={cn(
                      "flex h-9 w-full items-center justify-between rounded-md px-3 font-mono text-xs",
                      s.isBase && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                    )}
                    style={{ background: s.hex, color: s.text }}
                    aria-label={`${s.step}: ${s.hex}, copy`}
                  >
                    <span>
                      {s.step}
                      {s.isBase && " · base"}
                    </span>
                    <span>{s.hex}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      }
      output={
        swatches && (
          <div className="flex flex-col gap-2">
            <Segmented
              label="Export format"
              value={format}
              onChange={setFormat}
              options={[
                { value: "tailwind", label: "Tailwind @theme" },
                { value: "css", label: "CSS variables" },
                { value: "json", label: "JSON" },
              ]}
            />
            <OutputCode
              label="Palette"
              code={paletteCode(state.name, swatches, format)}
              language={format === "json" ? "json" : "css"}
            />
          </div>
        )
      }
    />
  );
}
