import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyRows } from "@/components/tool/copy-rows";
import { Field } from "@/components/tool/field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { cn } from "@/lib/utils";
import { contrastLevel, convertColor } from "../lib/color";

const DEFAULT = "#8b5cf6";

export default function ColorTool() {
  const [input, setInput] = usePersistentState("conv:color:input", DEFAULT);
  const color = convertColor(input);

  return (
    <ToolLayout
      title="Color"
      description="Convert any CSS color to HEX, RGB, HSL and OKLCH, and check text contrast."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setInput(DEFAULT)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <Field
            label="Color"
            error={
              color
                ? undefined
                : "Try #8b5cf6, rgb(139 92 246), hsl(258 90% 66%), oklch(…) or a name."
            }
          >
            {(id) => (
              <div className="flex gap-2">
                <input
                  type="color"
                  aria-label="Pick a color"
                  value={color?.hex.slice(0, 7) ?? "#000000"}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-8 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
                />
                <Input
                  id={id}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  spellCheck={false}
                  className="font-mono"
                />
              </div>
            )}
          </Field>
          {color && (
            <div className="grid grid-cols-2 gap-2">
              {(["white", "black"] as const).map((text) => {
                const ratio = color.contrast[text];
                const level = contrastLevel(ratio);
                return (
                  <div key={text} className="overflow-hidden rounded-lg border">
                    <div
                      className="flex h-20 items-center justify-center text-lg font-semibold"
                      style={{ background: input, color: text }}
                    >
                      Aa
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 text-xs">
                      <span className="text-muted-foreground">
                        {text} text · {ratio}:1
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 font-medium",
                          level === "Fail"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-success/15 text-success",
                        )}
                      >
                        {level}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      }
      output={
        color ? (
          <CopyRows
            title="Formats"
            rows={[
              { label: "HEX", value: color.hex },
              { label: "RGB", value: color.rgb },
              { label: "HSL", value: color.hsl },
              { label: "OKLCH", value: color.oklch },
              { label: "CSS variable", value: `--color: ${color.oklch};` },
            ]}
          />
        ) : null
      }
    />
  );
}
