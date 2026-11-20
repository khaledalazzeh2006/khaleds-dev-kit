import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CssOutput } from "@/components/tool/css-output";
import { Preview } from "@/components/tool/preview";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { grid, type GridOptions } from "../lib/css";

const DEFAULT: GridOptions & { items: number } = {
  mode: "fixed",
  columns: 3,
  minWidth: 160,
  rows: 0,
  gap: 16,
  items: 6,
};

export default function GridTool() {
  const [o, setO] = usePersistentState("css:grid", DEFAULT);
  const set = (patch: Partial<typeof o>) => setO({ ...o, ...patch });
  const result = grid(o);
  const columns =
    o.mode === "fixed"
      ? `repeat(${o.columns}, minmax(0, 1fr))`
      : `repeat(auto-fit, minmax(${o.minWidth}px, 1fr))`;

  return (
    <ToolLayout
      title="Grid"
      description="Fixed columns, or responsive auto-fit cards without media queries."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setO(DEFAULT)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <Segmented
            label="Columns mode"
            value={o.mode}
            onChange={(mode) => set({ mode })}
            options={[
              { value: "fixed", label: "Fixed columns" },
              { value: "auto-fit", label: "Auto-fit (responsive)" },
            ]}
          />
          {o.mode === "fixed" ? (
            <RangeField
              label="Columns"
              value={o.columns}
              onChange={(columns) => set({ columns })}
              min={1}
              max={12}
            />
          ) : (
            <RangeField
              label="Min card width"
              value={o.minWidth}
              onChange={(minWidth) => set({ minWidth })}
              min={80}
              max={400}
              step={10}
              unit="px"
            />
          )}
          <RangeField
            label="Rows (0 = auto)"
            value={o.rows}
            onChange={(rows) => set({ rows })}
            min={0}
            max={6}
          />
          <RangeField
            label="Gap"
            value={o.gap}
            onChange={(gap) => set({ gap })}
            min={0}
            max={64}
            unit="px"
          />
          <RangeField
            label="Preview items"
            value={o.items}
            onChange={(items) => set({ items })}
            min={1}
            max={24}
          />
        </>
      }
      output={
        <>
          <Preview className="items-stretch justify-stretch p-3">
            <div
              className="grid w-full rounded-md border border-dashed border-primary/50 p-2"
              style={{
                gridTemplateColumns: columns,
                gridTemplateRows: o.rows ? `repeat(${o.rows}, minmax(0, 1fr))` : undefined,
                gap: o.gap,
              }}
            >
              {Array.from({ length: o.items }, (_, i) => (
                <div
                  key={i}
                  className="flex h-14 items-center justify-center rounded-md bg-primary/80 font-mono text-xs text-primary-foreground"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </Preview>
          <CssOutput {...result} />
        </>
      }
    />
  );
}
