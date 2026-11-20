import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutputCode } from "@/components/tool/output-code";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { SelectField } from "@/components/tool/select-field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { RATIOS, typeScale, typeScaleCode } from "../lib/scale";

const DEFAULT = {
  base: 16,
  ratio: "Major third · 1.25",
  fluid: false,
  maxBase: 18,
  maxRatio: "Perfect fourth · 1.333",
  format: "tailwind" as "css" | "tailwind",
};

export default function TypeScaleTool() {
  const [o, setO] = usePersistentState("design:type", DEFAULT);
  const set = (patch: Partial<typeof o>) => setO({ ...o, ...patch });
  const ratioOptions = Object.keys(RATIOS).map((k) => ({ value: k, label: k }));
  const steps = typeScale({
    base: o.base,
    ratio: RATIOS[o.ratio] ?? 1.25,
    fluid: o.fluid
      ? { maxBase: o.maxBase, maxRatio: RATIOS[o.maxRatio] ?? 1.333, minVw: 360, maxVw: 1280 }
      : undefined,
  });

  return (
    <ToolLayout
      title="Type scale"
      description="Modular font sizes, fixed or fluid with clamp() between 360px and 1280px screens."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setO(DEFAULT)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <Segmented
            label="Mode"
            value={o.fluid ? "fluid" : "fixed"}
            onChange={(v) => set({ fluid: v === "fluid" })}
            options={[
              { value: "fixed", label: "Fixed" },
              { value: "fluid", label: "Fluid (clamp)" },
            ]}
          />
          <RangeField
            label={o.fluid ? "Base size on mobile" : "Base size"}
            value={o.base}
            onChange={(base) => set({ base })}
            min={12}
            max={24}
            unit="px"
          />
          <SelectField
            label={o.fluid ? "Ratio on mobile" : "Ratio"}
            value={o.ratio}
            onChange={(ratio) => set({ ratio })}
            options={ratioOptions}
          />
          {o.fluid && (
            <>
              <RangeField
                label="Base size on desktop"
                value={o.maxBase}
                onChange={(maxBase) => set({ maxBase })}
                min={12}
                max={28}
                unit="px"
              />
              <SelectField
                label="Ratio on desktop"
                value={o.maxRatio}
                onChange={(maxRatio) => set({ maxRatio })}
                options={ratioOptions}
              />
            </>
          )}
        </>
      }
      output={
        <>
          <div className="flex flex-col gap-1 overflow-hidden rounded-lg border p-4">
            {[...steps].reverse().map((s) => (
              <div key={s.name} className="flex items-baseline gap-3 truncate">
                <span className="w-10 shrink-0 font-mono text-[11px] text-muted-foreground">
                  {s.name}
                </span>
                <span className="truncate font-semibold" style={{ fontSize: s.value }}>
                  The quick fox
                </span>
              </div>
            ))}
          </div>
          <Segmented
            label="Export format"
            value={o.format}
            onChange={(format) => set({ format })}
            options={[
              { value: "tailwind", label: "Tailwind @theme" },
              { value: "css", label: "CSS variables" },
            ]}
          />
          <OutputCode label="Type scale" code={typeScaleCode(steps, o.format)} language="css" />
        </>
      }
    />
  );
}
