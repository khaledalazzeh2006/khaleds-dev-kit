import { OutputCode } from "@/components/tool/output-code";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { spacingCode, spacingScale } from "../lib/scale";

export default function SpacingTool() {
  const [unit, setUnit] = usePersistentState("design:spacing:unit", 4);
  const [format, setFormat] = usePersistentState<"css" | "tailwind">(
    "design:spacing:format",
    "css",
  );
  const scale = spacingScale(unit);

  return (
    <ToolLayout
      title="Spacing scale"
      description="A consistent spacing system from one base unit (Tailwind uses 4px)."
      input={
        <>
          <RangeField
            label="Base unit"
            value={unit}
            onChange={setUnit}
            min={2}
            max={12}
            unit="px"
          />
          <ul className="flex flex-col gap-1.5" aria-label="Spacing scale">
            {scale.map((s) => (
              <li key={s.step} className="flex items-center gap-3 text-xs">
                <span className="w-8 shrink-0 text-right font-mono text-muted-foreground">
                  {s.step}
                </span>
                <span
                  className="h-3 rounded-sm bg-primary/80"
                  style={{ width: Math.min(s.px, 320) }}
                />
                <span className="font-mono text-muted-foreground">
                  {s.px}px · {s.rem}
                </span>
              </li>
            ))}
          </ul>
        </>
      }
      output={
        <>
          <Segmented
            label="Export format"
            value={format}
            onChange={setFormat}
            options={[
              { value: "css", label: "CSS variables" },
              { value: "tailwind", label: "Tailwind @theme" },
            ]}
          />
          <OutputCode label="Spacing" code={spacingCode(unit, format)} language="css" />
        </>
      }
    />
  );
}
