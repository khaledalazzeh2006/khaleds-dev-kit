import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CssOutput } from "@/components/tool/css-output";
import { Preview } from "@/components/tool/preview";
import { RangeField } from "@/components/tool/range-field";
import { SelectField } from "@/components/tool/select-field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { flexbox, type FlexOptions } from "../lib/css";

const DEFAULT: FlexOptions & { items: number } = {
  direction: "row",
  wrap: "nowrap",
  justify: "space-between",
  align: "center",
  gap: 12,
  items: 4,
};

const opt = <T extends string>(...values: T[]) => values.map((v) => ({ value: v, label: v }));

export default function FlexTool() {
  const [o, setO] = usePersistentState("css:flex", DEFAULT);
  const set = (patch: Partial<typeof o>) => setO({ ...o, ...patch });
  const result = flexbox(o);

  return (
    <ToolLayout
      title="Flexbox"
      description="Build a flex container visually."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setO(DEFAULT)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <SelectField
            label="Direction"
            value={o.direction}
            onChange={(direction) => set({ direction })}
            options={opt("row", "row-reverse", "column", "column-reverse")}
          />
          <SelectField
            label="Justify content"
            value={o.justify}
            onChange={(justify) => set({ justify })}
            options={opt(
              "flex-start",
              "center",
              "flex-end",
              "space-between",
              "space-around",
              "space-evenly",
            )}
          />
          <SelectField
            label="Align items"
            value={o.align}
            onChange={(align) => set({ align })}
            options={opt("stretch", "flex-start", "center", "flex-end", "baseline")}
          />
          <SelectField
            label="Wrap"
            value={o.wrap}
            onChange={(wrap) => set({ wrap })}
            options={opt("nowrap", "wrap", "wrap-reverse")}
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
            max={12}
          />
        </>
      }
      output={
        <>
          <Preview className="items-stretch justify-stretch p-3">
            <div
              className="flex min-h-48 w-full rounded-md border border-dashed border-primary/50 p-2"
              style={{
                flexDirection: o.direction,
                flexWrap: o.wrap,
                justifyContent: o.justify,
                alignItems: o.align,
                gap: o.gap,
              }}
            >
              {Array.from({ length: o.items }, (_, i) => (
                <div
                  key={i}
                  className="flex min-w-10 items-center justify-center rounded-md bg-primary/80 px-3 font-mono text-xs text-primary-foreground"
                  style={{ minHeight: 28 + (i % 3) * 14 }}
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
