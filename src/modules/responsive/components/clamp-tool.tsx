import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CssOutput } from "@/components/tool/css-output";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { fluidClamp, fluidValueAt } from "@/lib/fluid";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { arbitrary } from "@/lib/tailwind";

const DEFAULT = { property: "font-size", min: 32, max: 64, minVw: 360, maxVw: 1280, viewport: 820 };
const PROPS = [
  { value: "font-size", label: "font-size", tw: "text" },
  { value: "padding", label: "padding", tw: "p" },
  { value: "gap", label: "gap", tw: "gap" },
  { value: "width", label: "width", tw: "w" },
];

export default function ClampTool() {
  const [o, setO] = usePersistentState("resp:clamp", DEFAULT);
  const set = (patch: Partial<typeof o>) => setO({ ...o, ...patch });
  const value = fluidClamp(o.min, o.max, o.minVw, o.maxVw);
  const now = fluidValueAt(o.min, o.max, o.minVw, o.maxVw, o.viewport);
  const tw = PROPS.find((p) => p.value === o.property)?.tw ?? "text";

  return (
    <ToolLayout
      title="clamp() generator"
      description="A value that grows smoothly between two screen widths — no breakpoints needed."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setO(DEFAULT)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <Segmented
            label="Property"
            value={o.property}
            onChange={(property) => set({ property })}
            options={PROPS}
          />
          <RangeField
            label="Smallest value"
            value={o.min}
            onChange={(min) => set({ min })}
            min={4}
            max={200}
            unit="px"
          />
          <RangeField
            label="Largest value"
            value={o.max}
            onChange={(max) => set({ max })}
            min={4}
            max={300}
            unit="px"
          />
          <RangeField
            label="From screen width"
            value={o.minVw}
            onChange={(minVw) => set({ minVw })}
            min={280}
            max={1000}
            step={10}
            unit="px"
          />
          <RangeField
            label="To screen width"
            value={o.maxVw}
            onChange={(maxVw) => set({ maxVw })}
            min={600}
            max={2560}
            step={10}
            unit="px"
          />
        </>
      }
      output={
        <>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <RangeField
              label="Try a screen width"
              value={o.viewport}
              onChange={(viewport) => set({ viewport })}
              min={280}
              max={2560}
              step={10}
              unit="px"
            />
            <p className="text-xs text-muted-foreground">
              At {o.viewport}px the value is{" "}
              <span className="font-mono font-medium text-foreground">{now.toFixed(1)}px</span>
            </p>
            {o.property === "font-size" ? (
              <p className="truncate font-semibold" style={{ fontSize: now }}>
                Fluid heading
              </p>
            ) : (
              <div className="h-4 rounded-sm bg-primary/70" style={{ width: Math.min(now, 600) }} />
            )}
          </div>
          <CssOutput
            css={`
              ${o.property}: ${value};
            `}
            tailwind={`${tw}-[${arbitrary(value)}]`}
          />
        </>
      }
    />
  );
}
